import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
import { claimLeadEmail, claimJob, updateKitchenDesignJob } from "@/lib/ai-designer/supabase-rest";
import { sendAdminKitchenLeadReport } from "@/lib/ai-designer/ai-pipeline";
import { validateLeadInput } from "@/lib/ai-designer/validation";
import { apiError, boundedBody, assertSameOrigin, customerJob, ownedJob, privateHeaders, RequestError } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{jobId: string}> }) {
  try {
    assertSameOrigin(request);
    const { jobId } = await context.params;
    const job = await ownedJob(jobId);
    await assertRateLimit("lead:" + getRequestIdentifier(request), 5, 60_000);
    if (Number(request.headers.get("content-length")) > 8192) throw new RequestError("Request too large.", 413);
    const lead = validateLeadInput(await (await boundedBody(request, 8192)).json().catch(() => { throw new RequestError("Invalid enquiry."); }));
    if (job.status === "lead_submitted") return Response.json({ success: true, job: await customerJob(job) }, { headers: privateHeaders });
    if (job.status !== "report_ready" || !job.generated_image_url || !job.project_description) throw new RequestError("Please wait until your project is ready.", 409);
    const claimed = await claimJob(jobId, ["report_ready"], { status: "lead_submitted", lead_name: lead.name, lead_email: lead.email, lead_phone: lead.phone, lead_message: lead.message });
    if (!claimed) throw new RequestError("Your enquiry is already being submitted. Please refresh the project.", 409);
    // The lead is safely saved even when email delivery is unavailable; admin shows delivery state.
    try {
      if (!await claimLeadEmail(jobId)) throw new Error("Notification is already sending");
      await sendAdminKitchenLeadReport(claimed);
      await updateKitchenDesignJob(jobId, { lead_email_sent_at: new Date().toISOString() });
    } catch { console.error("Lead saved; email delivery needs attention", { jobId }); }
    return Response.json({ success: true, job: await customerJob(claimed) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
