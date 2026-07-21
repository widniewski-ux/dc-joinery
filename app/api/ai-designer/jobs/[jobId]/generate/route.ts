import { runKitchenDesignPipeline } from "@/lib/ai-designer/ai-pipeline";
import {
  assertRateLimit,
  getRequestIdentifier,
  RateLimitError,
} from "@/lib/ai-designer/rate-limit";
import { getKitchenDesignJob, updateKitchenDesignJob } from "@/lib/ai-designer/supabase-rest";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const identifier = getRequestIdentifier(request);
    assertRateLimit(`ai-designer:generate:${identifier}`, 10, 60_000);

    const { jobId } = await context.params;
    const existing = await getKitchenDesignJob(jobId);
    if (!existing) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    if (existing.status === "report_ready" || existing.status === "lead_submitted") {
      return Response.json({ job: existing, processing: false }, { status: 200 });
    }

    if (
      existing.status === "analyzing" ||
      existing.status === "rendering" ||
      existing.status === "describing" ||
      existing.status === "estimating"
    ) {
      return Response.json({ job: existing, processing: true }, { status: 202 });
    }

    const queuedJob = await updateKitchenDesignJob(jobId, {
      status: "analyzing",
      estimate_explanation: null,
    });

    void runKitchenDesignPipeline(jobId).catch((error) => {
      console.error("AI Kitchen Designer pipeline failed", {
        jobId,
        error: error instanceof Error ? error.message : error,
      });
    });

    return Response.json({ job: queuedJob, processing: true }, { status: 202 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to generate AI kitchen design";
    return Response.json({ error: message }, { status: 500 });
  }
}
