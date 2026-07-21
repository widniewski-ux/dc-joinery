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

interface VisionAnalysis {
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

Create a realistic, premium UK kitchen outcome that preserves room geometry and perspective from the source image.`;
}

async function generateKitchenRender(job: KitchenDesignJob, analysis: VisionAnalysis): Promise<string> {
  const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: replicateModelVersion(),
      input: {
        image: job.input_image_url,
        prompt: buildRenderPrompt(job, analysis),
      },
    }),
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
  return outputUrl;
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

  try {
    await setKitchenDesignStatus(jobId, "analyzing");
    const analysis = await analyzeKitchenPhoto(job);
    await updateKitchenDesignJob(jobId, {
      vision_analysis: analysis as unknown as Record<string, unknown>,
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

    const pdfBuffer = await generateKitchenPdfReport(refreshed);
    const pdfPath = `${jobId}/report-${Date.now()}.pdf`;
    const pdfUrl = await uploadAssetToStorage(pdfPath, pdfBuffer, "application/pdf");

    return updateKitchenDesignJob(jobId, {
      pdf_report_url: pdfUrl,
      status: "report_ready",
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
  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: "DC Joinery AI Designer <website@dcjoinery.uk>",
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
}
