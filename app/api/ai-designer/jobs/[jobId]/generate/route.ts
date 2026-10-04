import { after } from "next/server";
import { runKitchenDesignPipeline } from "@/lib/ai-designer/ai-pipeline";
import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
import { claimJob } from "@/lib/ai-designer/supabase-rest";
import { apiError, assertSameOrigin, customerJob, ownedJob, privateHeaders } from "@/lib/security";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request, context: { params: Promise<{jobId: string}> }) {
  try {
    assertSameOrigin(request);
    const { jobId } = await context.params;
    const job = await ownedJob(jobId);
    if (job.status !== "uploaded" && job.status !== "failed") return Response.json({ job: await customerJob(job), processing: !["report_ready", "lead_submitted"].includes(job.status) }, { headers: privateHeaders });
    await assertRateLimit("generate:" + getRequestIdentifier(request), 3, 3_600_000);
    await assertRateLimit("generate-job:" + jobId, 3, 86_400_000);
    const claimed = await claimJob(jobId, ["uploaded", "failed"], { status: "analyzing", estimate_explanation: null });
    if (claimed) after(async () => {
      try { await runKitchenDesignPipeline(jobId); }
      catch { console.error("Kitchen generation failed", { jobId }); }
    });
    return Response.json({ job: await customerJob(claimed || job), processing: true }, { status: 202, headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
