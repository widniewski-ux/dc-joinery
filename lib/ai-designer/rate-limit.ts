import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { consumeRateLimit } from "./supabase-rest";
import { RequestError } from "../security";
export class RateLimitError extends RequestError {
  constructor() { super("Too many requests. Please wait a few minutes and try again.", 429); }
}
export function getRequestIdentifier(request: Pick<Request, "headers">): string {
  // Only trust a header overwritten by the deployment ingress.
  const header = process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.TRUSTED_CLIENT_IP_HEADER;
  const value = header ? request.headers.get(header)?.split(",")[0].trim() : null;
  return value && isIP(value) ? value : "shared";
}
const local = new Map<string, { count: number; expiry: number }>();
export async function assertRateLimit(key: string, limit: number, windowMs: number) {
  const hash = createHash("sha256").update(key).digest("hex");
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!await consumeRateLimit(hash, limit, windowMs)) throw new RateLimitError();
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Rate limit service unavailable");
  const now = Date.now();
  for (const [id, value] of local) if (value.expiry <= now) local.delete(id);
  const value = local.get(hash) || { count: 0, expiry: now + windowMs };
  if (++value.count > limit) throw new RateLimitError();
  local.set(hash, value);
}
