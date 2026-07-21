import { optionalEnv } from "@/lib/ai-designer/env";
import { listRecentLeadJobs } from "@/lib/ai-designer/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const configuredToken = optionalEnv("AI_DESIGNER_ADMIN_TOKEN");
  if (!configuredToken) {
    return Response.json(
      { error: "AI_DESIGNER_ADMIN_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const providedToken = request.headers.get("x-admin-token");
  if (providedToken !== configuredToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") || "25");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 25;
  const jobs = await listRecentLeadJobs(limit);

  return Response.json({ jobs });
}
