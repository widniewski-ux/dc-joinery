import "server-only";

import { Resend } from "resend";
import { optionalEnv, requiredEnv } from "./env";
import { generateKitchenPdfReport } from "./pdf-report";
import {
  getKitchenDesignJob,
  setKitchenDesignStatus,
  updateKitchenDesignJob,
  uploadAssetToStorage,
} from "./supabase-rest";
import type { KitchenDesignJob } from "./types";

interface VisionAnalysis extends Record<string, unknown> {
  layoutSummary: string;
  constraints: string[];
  opportunities: string[];
  applianceNotes: string;
}

function isOpenAiQuotaErrorText(input: string): boolean {
  const text = input.toLowerCase();
  return (
    text.includes("insufficient_quota") ||
    text.includes("exceeded your current quota") ||
    (text.includes("429") && text.includes("openai"))
  );
}

function fallbackVisionAnalysis(job: KitchenDesignJob): VisionAnalysis {
  return {
    layoutSummary:
      "Existing room layout is retained and treated as fixed. Keep all windows, doors, and circulation paths unchanged.",
    constraints: [
      "Do not move or resize windows, doors, wall openings, or camera perspective.",
      "Keep appliance zones practical and consistent with existing utility points.",
      "Respect current room envelope and furniture clearances.",
    ],
    opportunities: [
      "Upgrade door fronts, colour palette, handles, and worktop finishes to match selected supplier options.",
      "Improve task lighting and storage accessories without changing structural layout.",
      "Use brochure-aligned finishes for a cohesive, quote-ready concept.",
    ],
    applianceNotes: `Selected style: ${job.style}. Preferred palette: ${job.color_palette.join(", ")}.`,
  };
}

function fallbackDescription(job: KitchenDesignJob, analysis: VisionAnalysis): string {
  return [
    `This kitchen concept follows the selected ${job.style} direction with a ${job.color_palette.join(
      ", "
    )} palette and brochure-aligned materials. The design approach keeps the existing room geometry fixed, including all window and door positions, while refreshing cabinetry, handles, worktops, and finish details. The proposal prioritises practical day-to-day use, clear work zones, and a cohesive visual style suitable for a quotation and site-survey discussion.`,
    `Selected options summary: ${job.customer_notes ?? "Supplier options captured in the project notes."}`,
    `Consultation notes: Confirm final dimensions on site, appliance integration clearances, and finish availability before installation scheduling. Layout openings and perspective are intended to remain unchanged.`,
    `Layout summary: ${analysis.layoutSummary}`,
  ].join("\n\n");
}

const openAiApiKey = () => requiredEnv("OPENAI_API_KEY");
const replicateToken = () => requiredEnv("REPLICATE_API_TOKEN");
const replicateModelVersion = () => requiredEnv("REPLICATE_MODEL_VERSION");

function isReplicateVersionHash(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

function resolveReplicatePredictionRequest(input: {
  image: string;
  prompt: string;
}): {
  url: string;
  body: Record<string, unknown>;
} {
  const modelConfig = replicateModelVersion().trim();

  if (isReplicateVersionHash(modelConfig)) {
    return {
      url: "https://api.replicate.com/v1/predictions",
      body: {
        version: modelConfig,
        input,
      },
    };
  }

  const [owner, model] = modelConfig.split("/");
  if (owner && model) {
    return {
      url: `https://api.replicate.com/v1/models/${owner}/${model}/predictions`,
      body: {
        input,
      },
    };
  }

  throw new Error(
    "REPLICATE_MODEL_VERSION must be a 64-char version hash or owner/model slug"
  );
}

function extractJson<T>(input: string): T {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON");
  }
  return JSON.parse(input.slice(start, end + 1)) as T;
}

async function analyzeKitchenPhoto(job: KitchenDesignJob): Promise<VisionAnalysis> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a professional UK kitchen designer. Analyze the kitchen image and output concise JSON only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this kitchen photo for DC Joinery and return JSON with keys:
layoutSummary (string),
constraints (string[]),
opportunities (string[]),
applianceNotes (string).
Focus on practical renovation decisions and installation constraints.`,
            },
            {
              type: "image_url",
              image_url: {
                url: job.input_image_url,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vision analysis failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  return extractJson<VisionAnalysis>(content);
}

function buildRenderPrompt(job: KitchenDesignJob, analysis: VisionAnalysis): string {
  return `Photorealistic kitchen redesign based on real room constraints.
Style: ${job.style}
Color palette: ${job.color_palette.join(", ")}
Layout summary: ${analysis.layoutSummary}
Constraints: ${analysis.constraints.join("; ")}
Opportunities: ${analysis.opportunities.join("; ")}
Appliance notes: ${analysis.applianceNotes}
Customer notes: ${job.customer_notes ?? "none"}

Create a realistic, premium UK kitchen outcome inspired by established catalog directions (Howdens, Wren, B&Q, IKEA) while preserving room geometry and perspective from the source image.
IMPORTANT: Keep this as the same kitchen photo edited in place, not a new unrelated room.`;
}

function generatedImageStoragePath(jobId: string): string {
  return `${jobId}/generated-${Date.now()}.png`;
}

async function downloadAndStoreImageFromUrl(imageUrl: string, jobId: string): Promise<string> {
  const imageResponse = await fetch(imageUrl, { cache: "no-store" });
  if (!imageResponse.ok) {
    const body = await imageResponse.text();
    throw new Error(`Generated image download failed: ${imageResponse.status} ${body}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  return uploadAssetToStorage(generatedImageStoragePath(jobId), imageBuffer, "image/png");
}

async function generateKitchenRenderWithOpenAi(
  job: KitchenDesignJob,
  analysis: VisionAnalysis,
  strictnessNote: string
): Promise<string> {
  const sourceImageResponse = await fetch(job.input_image_url, { cache: "no-store" });
  if (!sourceImageResponse.ok) {
    const body = await sourceImageResponse.text();
    throw new Error(`Failed to load source image for editing: ${sourceImageResponse.status} ${body}`);
  }

  const sourceImageBuffer = await sourceImageResponse.arrayBuffer();
  const sourceImageType = sourceImageResponse.headers.get("content-type") || "image/png";
  const imageBlob = new Blob([sourceImageBuffer], { type: sourceImageType });

  const formData = new FormData();
  formData.append("model", "gpt-image-1");
  formData.append(
    "prompt",
    `${buildRenderPrompt(job, analysis)}

Editing constraints:
- DO NOT move, resize, remove, add, or reshape any window, external/internal door, or wall opening.
- Keep wall geometry, windows, ceiling lines, and camera perspective pixel-consistent.
- Keep sink/cooker/fridge positions unless customer notes explicitly request changes.
- Redesign cabinetry, finishes, handles, worktops, and lighting only.
- Output must look like a real renovation of this exact room.
${strictnessNote}`
  );
  formData.append("size", "1536x1024");
  formData.append("quality", "high");
  formData.append("image", imageBlob, "kitchen-source.png");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey()}`,
    },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI image edit failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = payload.data?.[0];
  if (!first) {
    throw new Error("OpenAI image edit did not return an image");
  }

  if (first.b64_json) {
    const pngBytes = Buffer.from(first.b64_json, "base64");
    return uploadAssetToStorage(
      generatedImageStoragePath(job.id),
      pngBytes.buffer.slice(pngBytes.byteOffset, pngBytes.byteOffset + pngBytes.byteLength),
      "image/png"
    );
  }

  if (first.url) {
    return downloadAndStoreImageFromUrl(first.url, job.id);
  }

  throw new Error("OpenAI image edit response missing image payload");
}

async function generateKitchenRenderWithReplicate(
  job: KitchenDesignJob,
  analysis: VisionAnalysis,
  strictnessNote: string
): Promise<string> {
  const strictPrompt = `${buildRenderPrompt(job, analysis)}

Editing constraints:
- DO NOT move, resize, remove, add, or reshape any window, external/internal door, or wall opening.
- Keep wall geometry, windows, ceiling lines, and camera perspective pixel-consistent.
- Keep sink/cooker/fridge positions unless customer notes explicitly request changes.
- Redesign cabinetry, finishes, handles, worktops, and lighting only.
- Output must look like a real renovation of this exact room.
${strictnessNote}`;

  const requestInput = {
    image: job.input_image_url,
    prompt: strictPrompt,
  };
  const replicateRequest = resolveReplicatePredictionRequest(requestInput);

  const predictionResponse = await fetch(replicateRequest.url, {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(replicateRequest.body),
    cache: "no-store",
  });

  if (!predictionResponse.ok) {
    const body = await predictionResponse.text();
    throw new Error(`Image generation failed to start: ${predictionResponse.status} ${body}`);
  }

  const prediction = (await predictionResponse.json()) as { id: string; status: string };
  let status = prediction.status;
  let output: string | string[] | null = null;

  for (let attempt = 0; attempt < 45; attempt += 1) {
    if (status === "succeeded" || status === "failed" || status === "canceled") {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: {
          Authorization: `Token ${replicateToken()}`,
        },
        cache: "no-store",
      }
    );

    if (!pollResponse.ok) {
      const body = await pollResponse.text();
      throw new Error(`Image generation polling failed: ${pollResponse.status} ${body}`);
    }

    const polled = (await pollResponse.json()) as {
      status: string;
      output?: string | string[];
      error?: string;
    };
    status = polled.status;
    output = polled.output ?? null;

    if (status === "failed") {
      throw new Error(polled.error || "Image generation failed");
    }
  }

  if (status !== "succeeded") {
    throw new Error("Image generation timed out before completion");
  }

  const outputUrl = Array.isArray(output) ? output[0] : output;
  if (!outputUrl) {
    throw new Error("Image generation did not return an output URL");
  }
  return downloadAndStoreImageFromUrl(outputUrl, job.id);
}

async function validateGeometryConsistency(
  originalImageUrl: string,
  generatedImageUrl: string
): Promise<{ ok: boolean; reason: string }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You compare two photos and check whether room openings and geometry stayed unchanged.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Return JSON only: { ok: boolean, reason: string }. ok=true only if windows, doors, wall openings, room geometry, and camera perspective are preserved.",
            },
            { type: "image_url", image_url: { url: originalImageUrl } },
            { type: "image_url", image_url: { url: generatedImageUrl } },
          ],
        },
      ],
      temperature: 0,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    if (isOpenAiQuotaErrorText(body)) {
      return {
        ok: true,
        reason: "Geometry consistency check skipped due OpenAI quota limits.",
      };
    }
    return {
      ok: false,
      reason: `Geometry consistency check failed: ${response.status} ${body}`,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = extractJson<{ ok: boolean; reason: string }>(content);
    return parsed;
  } catch {
    return { ok: false, reason: "Geometry consistency parser could not read AI response" };
  }
}

async function generateKitchenRender(job: KitchenDesignJob, analysis: VisionAnalysis): Promise<string> {
  const strictnessNotes = [
    "CRITICAL: Any changed window/door position is a hard failure.",
    "CRITICAL: Keep every window and door in the exact same place and dimensions as source.",
    "CRITICAL: Preserve all openings and perspective exactly; change only kitchen finishes and units.",
  ];

  let openAiGenerationError: unknown = null;
  try {
    for (const strictnessNote of strictnessNotes) {
      const imageUrl = await generateKitchenRenderWithOpenAi(job, analysis, strictnessNote);
      const check = await validateGeometryConsistency(job.input_image_url, imageUrl);
      if (check.ok) {
        return imageUrl;
      }
      console.warn("Generated image rejected by geometry consistency check", {
        jobId: job.id,
        reason: check.reason,
      });
    }
  } catch (openAiError) {
    openAiGenerationError = openAiError;
    console.warn("OpenAI image edit failed, falling back to Replicate", {
      jobId: job.id,
      error: openAiError instanceof Error ? openAiError.message : openAiError,
    });
  }

  let replicateFailureReason = "Replicate render did not preserve room geometry.";
  for (const strictnessNote of strictnessNotes) {
    const imageUrl = await generateKitchenRenderWithReplicate(job, analysis, strictnessNote);
    const check = await validateGeometryConsistency(job.input_image_url, imageUrl);
    if (check.ok) {
      return imageUrl;
    }
    replicateFailureReason = check.reason;
    console.warn("Replicate image rejected by geometry consistency check", {
      jobId: job.id,
      reason: check.reason,
    });
  }

  const openAiMessage =
    openAiGenerationError instanceof Error ? openAiGenerationError.message : null;
  throw new Error(
    openAiMessage
      ? `Could not generate geometry-safe render. OpenAI error: ${openAiMessage}. Last check: ${replicateFailureReason}`
      : `Could not generate geometry-safe render. Last check: ${replicateFailureReason}`
  );
}

async function generateDescription(job: KitchenDesignJob, analysis: VisionAnalysis): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a UK kitchen consultant preparing client-facing concept summaries.",
        },
        {
          role: "user",
          content: `Return JSON with fields:
description (string, 140-260 words, professional UK tone),
selectionSummary (string, concise summary of selected brochure options),
consultationNotes (string, include what should be confirmed during site survey).

Input:
Style: ${job.style}
Palette: ${job.color_palette.join(", ")}
Customer selections notes: ${job.customer_notes ?? "none"}
Room analysis: ${JSON.stringify(analysis)}`,
        },
      ],
      temperature: 0.4,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Description generation failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson<{
    description: string;
    selectionSummary: string;
    consultationNotes: string;
  }>(content);

  return `${parsed.description}\n\nSelected options summary: ${parsed.selectionSummary}\n\nConsultation notes: ${parsed.consultationNotes}`;
}

export async function runKitchenDesignPipeline(jobId: string): Promise<KitchenDesignJob> {
  const job = await getKitchenDesignJob(jobId);
  if (!job) {
    throw new Error("AI design job not found");
  }
  if (job.status === "report_ready" || job.status === "lead_submitted") {
    return job;
  }

  try {
    const pipelineNotes: string[] = [];
    await setKitchenDesignStatus(jobId, "analyzing");
    let analysis: VisionAnalysis;
    try {
      analysis = await analyzeKitchenPhoto(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isOpenAiQuotaErrorText(message)) {
        throw error;
      }
      analysis = fallbackVisionAnalysis(job);
      pipelineNotes.push(
        "OpenAI quota limit reached during photo analysis. Used fallback analysis summary."
      );
    }
    await updateKitchenDesignJob(jobId, {
      vision_analysis: analysis,
    });

    await setKitchenDesignStatus(jobId, "rendering");
    const generatedImageUrl = await generateKitchenRender(job, analysis);

    await setKitchenDesignStatus(jobId, "describing");
    let description: string;
    try {
      description = await generateDescription(job, analysis);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isOpenAiQuotaErrorText(message)) {
        throw error;
      }
      description = fallbackDescription(job, analysis);
      pipelineNotes.push(
        "OpenAI quota limit reached during text description. Used fallback consultation summary."
      );
    }

    await setKitchenDesignStatus(jobId, "estimating");
    const refreshed = await updateKitchenDesignJob(jobId, {
      generated_image_url: generatedImageUrl,
      project_description: description,
      estimated_cost_min: null,
      estimated_cost_max: null,
      estimate_explanation: pipelineNotes.length > 0 ? pipelineNotes.join(" | ") : null,
    });

    let pdfUrl: string | null = null;
    let pdfErrorNote: string | null = null;
    try {
      const pdfBuffer = await generateKitchenPdfReport(refreshed);
      const pdfPath = `${jobId}/report-${Date.now()}.pdf`;
      pdfUrl = await uploadAssetToStorage(pdfPath, pdfBuffer, "application/pdf");
    } catch (error) {
      pdfErrorNote =
        error instanceof Error ? error.message : "PDF report could not be generated";
    }

    const combinedNote = [refreshed.estimate_explanation, pdfErrorNote ? `PDF note: ${pdfErrorNote}` : null]
      .filter(Boolean)
      .join(" | ");

    return updateKitchenDesignJob(jobId, {
      pdf_report_url: pdfUrl,
      status: "report_ready",
      estimate_explanation: combinedNote || null,
    });
  } catch (error) {
    await updateKitchenDesignJob(jobId, {
      status: "failed",
      estimate_explanation:
        error instanceof Error ? error.message : "Unknown error while generating design",
    });
    throw error;
  }
}

export async function sendAdminKitchenLeadReport(job: KitchenDesignJob): Promise<void> {
  const resendKey = optionalEnv("RESEND_API_KEY");
  if (!resendKey) {
    throw new Error("Missing required environment variable: RESEND_API_KEY");
  }

  const adminEmail = optionalEnv("AI_DESIGNER_ADMIN_EMAIL") ?? "info@dcjoinery.uk";
  const fromEmail = optionalEnv("AI_DESIGNER_FROM_EMAIL") ?? "website@dcjoineryni.uk";
  const resend = new Resend(resendKey);

  const result = await resend.emails.send({
    from: `DC Joinery AI Designer <${fromEmail}>`,
    to: adminEmail,
    subject: `New AI Kitchen Designer lead - ${job.lead_name ?? "Unnamed client"}`,
    text: `
Lead details
------------
Name: ${job.lead_name ?? "N/A"}
Email: ${job.lead_email ?? "N/A"}
Phone: ${job.lead_phone ?? "N/A"}
Message: ${job.lead_message ?? "N/A"}

Design details
--------------
Job ID: ${job.id}
Style: ${job.style}
Palette: ${job.color_palette.join(", ")}
Selections: ${job.customer_notes ?? "N/A"}

Generated image: ${job.generated_image_url ?? "N/A"}
PDF report: ${job.pdf_report_url ?? "N/A"}
`,
  });

  if (result.error) {
    throw new Error(
      `Resend send failed: ${result.error.message || "Unknown email provider error"}`
    );
  }
}
