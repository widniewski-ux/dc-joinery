import {
  assertRateLimit,
  getRequestIdentifier,
  RateLimitError,
} from "@/lib/ai-designer/rate-limit";
import {
  getKitchenDesignJob,
  saveLead,
  updateKitchenDesignJob,
} from "@/lib/ai-designer/supabase-rest";
import {
  sendAdminKitchenLeadReport,
} from "@/lib/ai-designer/ai-pipeline";
import { validateLeadInput } from "@/lib/ai-designer/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const identifier = getRequestIdentifier(request);
    assertRateLimit(`ai-designer:lead:${identifier}`, 10, 60_000);

    const { jobId } = await context.params;
    const lead = validateLeadInput(await request.json());

    const job = await getKitchenDesignJob(jobId);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.generated_image_url || !job.project_description) {
      return Response.json(
        { error: "Project is not fully generated yet. Complete generation before contact." },
        { status: 409 }
      );
    }

    const updatedJob = await saveLead(jobId, lead);
    await sendAdminKitchenLeadReport(updatedJob);
    await updateKitchenDesignJob(jobId, { status: "lead_submitted" });

    return Response.json({ success: true, job: updatedJob });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to submit AI kitchen enquiry";
    return Response.json({ error: message }, { status: 400 });
  }
}
