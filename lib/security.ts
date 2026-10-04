import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getKitchenDesignJob, signJobAssets } from "./ai-designer/supabase-rest";
import type { KitchenDesignJob } from "./ai-designer/types";

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const privateHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
export async function boundedBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RequestError("Request too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RequestError("Request too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") || "application/octet-stream" } });
}
export function safeEqual(a: string, b: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (request.headers.get("sec-fetch-site") === "cross-site" || !origin || new URL(expected).origin !== origin) {
    throw new RequestError("Please submit this request from our website.", 403);
  }
}
export function apiError(error: unknown) {
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status, headers: privateHeaders });
  console.error("Request failed", { type: error instanceof Error ? error.name : "Unknown" });
  return Response.json({ error: "This service is temporarily unavailable. Please try again later or contact us." }, { status: 503, headers: privateHeaders });
}
const ownerCookie = "dc-design-owner";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export async function ownerHash(create = false) {
  const jar = await cookies();
  let token = jar.get(ownerCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString("hex");
    jar.set(ownerCookie, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
  }
  return createHash("sha256").update(token).digest("hex");
}
export async function ownedJob(jobId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) throw new RequestError("Project not found.", 404);
  const owner = await ownerHash();
  if (!owner) throw new RequestError("Project not found. Please use the browser where you created it.", 404);
  const job = await getKitchenDesignJob(jobId);
  if (!job?.owner_hash || !safeEqual(job.owner_hash, owner)) throw new RequestError("Project not found.", 404);
  return job;
}
export async function customerJob(job: KitchenDesignJob) {
  // Explicit allowlist: never return lead contact details, ownership keys or provider responses.
  const assets = await signJobAssets(job);
  return {
    id: job.id, status: job.status, style: job.style, color_palette: job.color_palette,
    budget_min: job.budget_min, budget_max: job.budget_max,
    input_image_url: assets.input_image_url, generated_image_url: assets.generated_image_url,
    project_description: job.project_description, estimated_cost_min: job.estimated_cost_min,
    estimated_cost_max: job.estimated_cost_max, pdf_report_url: assets.pdf_report_url,
    estimate_explanation: job.status === "failed" ? "Generation could not be completed. Please try again or contact us." : null,
  };
}
const adminCookie = "dc-admin-session";
export function validAdminToken(token: string) {
  const configured = process.env.AI_DESIGNER_ADMIN_TOKEN;
  return !!configured && token.length <= 512 && safeEqual(token, configured);
}
function adminSignature(payload: string) {
  const secret = process.env.AI_DESIGNER_ADMIN_TOKEN;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`admin-session:${payload}`).digest("hex");
}
export async function startAdminSession() {
  const payload = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(16).toString("hex")}`;
  const signature = adminSignature(payload);
  if (!signature) throw new RequestError("Admin access is unavailable.", 503);
  (await cookies()).set(adminCookie, `${payload}.${signature}`, { ...cookieOptions, maxAge: 8 * 60 * 60 });
}
export async function isAdmin() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (!token || token.length > 200) return false;
  const [expiry, nonce, signature, extra] = token.split(".");
  if (extra || !nonce || !signature || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now()) return false;
  const expected = adminSignature(`${expiry}.${nonce}`);
  return !!expected && safeEqual(signature, expected);
}
export async function endAdminSession() { (await cookies()).delete(adminCookie); }
