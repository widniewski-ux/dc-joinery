import { runKitchenDesignPipeline } from "@/lib/ai-designer/ai-pipeline";
import { getKitchenDesignJob } from "@/lib/ai-designer/supabase-rest";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const existing = await getKitchenDesignJob(jobId);
    if (!existing) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    const completedJob = await runKitchenDesignPipeline(jobId);
    return Response.json({ job: completedJob });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate AI kitchen design";
    return Response.json({ error: message }, { status: 500 });
  }
}
