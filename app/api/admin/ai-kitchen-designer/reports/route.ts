import { optionalEnv } from "@/lib/ai-designer/env";
import {
  assertRateLimit,
  getRequestIdentifier,
  RateLimitError,
} from "@/lib/ai-designer/rate-limit";
import { listRecentLeadJobs } from "@/lib/ai-designer/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const identifier = getRequestIdentifier(request);
    assertRateLimit(`ai-designer:admin-reports:${identifier}`, 30, 60_000);

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
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "Failed to list admin reports";
    return Response.json({ error: message }, { status: 500 });
  }
}
