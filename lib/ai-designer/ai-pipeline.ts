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

interface CostEstimate {
  min: number;
  max: number;
  explanation: string;
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
Budget range: £${job.budget_min}-${job.budget_max}
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
  analysis: VisionAnalysis
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
- Keep wall geometry, windows, ceiling lines, and camera perspective.
- Keep sink/cooker/fridge positions unless customer notes explicitly request changes.
- Redesign cabinetry, finishes, handles, worktops, and lighting only.
- Output must look like a real renovation of this exact room.`
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
  analysis: VisionAnalysis
): Promise<string> {
  const requestInput = {
    image: job.input_image_url,
    prompt: buildRenderPrompt(job, analysis),
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

async function generateKitchenRender(job: KitchenDesignJob, analysis: VisionAnalysis): Promise<string> {
  try {
    return await generateKitchenRenderWithOpenAi(job, analysis);
  } catch (openAiError) {
    console.warn("OpenAI image edit failed, falling back to Replicate", {
      jobId: job.id,
      error: openAiError instanceof Error ? openAiError.message : openAiError,
    });
  }

  return generateKitchenRenderWithReplicate(job, analysis);
}

async function generateDescriptionAndEstimate(
  job: KitchenDesignJob,
  analysis: VisionAnalysis
): Promise<{ description: string; estimate: CostEstimate }> {
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
            "You are a UK kitchen consultant preparing client-facing concept summaries and indicative cost ranges.",
        },
        {
          role: "user",
          content: `Return JSON with fields:
description (string, 120-220 words, professional UK tone),
estimateMin (number),
estimateMax (number),
estimateExplanation (string, include assumptions and exclusions).

Input:
Style: ${job.style}
Palette: ${job.color_palette.join(", ")}
Budget target: £${job.budget_min}-${job.budget_max}
Room analysis: ${JSON.stringify(analysis)}`,
        },
      ],
      temperature: 0.4,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Description/estimate generation failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson<{
    description: string;
    estimateMin: number;
    estimateMax: number;
    estimateExplanation: string;
  }>(content);

  return {
    description: parsed.description,
    estimate: {
      min: parsed.estimateMin,
      max: parsed.estimateMax,
      explanation: parsed.estimateExplanation,
    },
  };
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
    await setKitchenDesignStatus(jobId, "analyzing");
    const analysis = await analyzeKitchenPhoto(job);
    await updateKitchenDesignJob(jobId, {
      vision_analysis: analysis,
    });

    await setKitchenDesignStatus(jobId, "rendering");
    const generatedImageUrl = await generateKitchenRender(job, analysis);

    await setKitchenDesignStatus(jobId, "describing");
    const { description, estimate } = await generateDescriptionAndEstimate(job, analysis);

    await setKitchenDesignStatus(jobId, "estimating");
    const refreshed = await updateKitchenDesignJob(jobId, {
      generated_image_url: generatedImageUrl,
      project_description: description,
      estimated_cost_min: estimate.min,
      estimated_cost_max: estimate.max,
      estimate_explanation: estimate.explanation,
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

    return updateKitchenDesignJob(jobId, {
      pdf_report_url: pdfUrl,
      status: "report_ready",
      estimate_explanation:
        pdfErrorNote && refreshed.estimate_explanation
          ? `${refreshed.estimate_explanation}\n\nPDF note: ${pdfErrorNote}`
          : refreshed.estimate_explanation,
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
Budget: £${job.budget_min} - £${job.budget_max}
Estimated cost: £${job.estimated_cost_min ?? 0} - £${job.estimated_cost_max ?? 0}

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
