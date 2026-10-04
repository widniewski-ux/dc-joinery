import { apiError, customerJob, ownedJob, privateHeaders } from "@/lib/security";
import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{jobId: string}> }) {
  try {
    const { jobId } = await context.params;
    const job = await ownedJob(jobId);
    await assertRateLimit("poll:" + getRequestIdentifier(request), 120, 60_000);
    return Response.json({ job: await customerJob(job) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
