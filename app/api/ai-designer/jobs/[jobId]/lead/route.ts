import {
  getKitchenDesignJob,
  saveLead,
  updateKitchenDesignJob,
} from "@/lib/ai-designer/supabase-rest";
import {
  runKitchenDesignPipeline,
  sendAdminKitchenLeadReport,
} from "@/lib/ai-designer/ai-pipeline";
import { validateLeadInput } from "@/lib/ai-designer/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const lead = validateLeadInput(await request.json());

    const job = await getKitchenDesignJob(jobId);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    let updatedJob = await saveLead(jobId, lead);

    if (!updatedJob.pdf_report_url) {
      updatedJob = await runKitchenDesignPipeline(jobId);
      updatedJob = await saveLead(jobId, lead);
    }

    await sendAdminKitchenLeadReport(updatedJob);
    await updateKitchenDesignJob(jobId, { status: "lead_submitted" });

    return Response.json({ success: true, job: updatedJob });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit AI kitchen enquiry";
    return Response.json({ error: message }, { status: 400 });
  }
}
