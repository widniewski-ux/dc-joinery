import { apiError, isAdmin, privateHeaders, RequestError, validAdminToken } from "@/lib/security";
import { listRecentLeadJobs, signJobAssets } from "@/lib/ai-designer/supabase-rest";
import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    if (!await isAdmin() && !validAdminToken(request.headers.get("x-admin-token") || "")) throw new RequestError("Unauthorized", 401);
    await assertRateLimit("admin-reports:" + getRequestIdentifier(request), 30, 60_000);
    const raw = Number(new URL(request.url).searchParams.get("limit") || 25);
    const jobs = await listRecentLeadJobs(Number.isFinite(raw) ? Math.min(100, Math.max(1, Math.trunc(raw))) : 25);
    return Response.json({ jobs: await Promise.all(jobs.map(signJobAssets)) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
