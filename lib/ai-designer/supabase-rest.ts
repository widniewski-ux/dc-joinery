import "server-only";

import { requiredEnv } from "./env";
import type {
  CreateKitchenDesignJobInput,
  KitchenDesignJob,
  KitchenDesignStatus,
} from "./types";

const getSupabaseUrl = () => requiredEnv("SUPABASE_URL");
const getSupabaseServiceRoleKey = () => requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const getRestBase = () => `${getSupabaseUrl()}/rest/v1`;

const DESIGN_BUCKET = "ai-designer";

function authHeaders(contentType?: string): HeadersInit {
  const serviceKey = getSupabaseServiceRoleKey();
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

async function parseResponse<T>(response: Response, errorLabel: string): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${errorLabel}: ${response.status} ${body}`);
  }
  return (await response.json()) as T;
}

export async function createKitchenDesignJob(
  input: CreateKitchenDesignJobInput
): Promise<KitchenDesignJob> {
  const payload = {
    owner_hash: input.ownerHash,
    status: "uploaded",
    input_image_url: input.inputImageUrl,
    style: input.style,
    color_palette: input.colorPalette,
    budget_min: input.budgetMin,
    budget_max: input.budgetMax,
    customer_notes: input.customerNotes,
  };

  const response = await fetch(`${getRestBase()}/ai_design_jobs`, {
    method: "POST",
    headers: {
      ...authHeaders("application/json"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });

  const rows = await parseResponse<KitchenDesignJob[]>(
    response,
    "Failed to create AI design job"
  );
  return rows[0];
}

export async function getKitchenDesignJob(jobId: string): Promise<KitchenDesignJob | null> {
  const params = new URLSearchParams({
    id: `eq.${jobId}`,
    select: "*",
    limit: "1",
  });

  const response = await fetch(`${getRestBase()}/ai_design_jobs?${params.toString()}`, {
    headers: authHeaders(),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });

  const rows = await parseResponse<KitchenDesignJob[]>(
    response,
    "Failed to fetch AI design job"
  );
  return rows[0] ?? null;
}

export async function updateKitchenDesignJob(
  jobId: string,
  patch: Partial<KitchenDesignJob>
): Promise<KitchenDesignJob> {
  const params = new URLSearchParams({
    id: `eq.${jobId}`,
    select: "*",
  });

  const response = await fetch(`${getRestBase()}/ai_design_jobs?${params.toString()}`, {
    method: "PATCH",
    headers: {
      ...authHeaders("application/json"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });

  const rows = await parseResponse<KitchenDesignJob[]>(
    response,
    "Failed to update AI design job"
  );
  const updated = rows[0];
  if (!updated) {
    throw new Error("AI design job not found while updating");
  }
  return updated;
}

export async function setKitchenDesignStatus(
  jobId: string,
  status: KitchenDesignStatus
): Promise<KitchenDesignJob> {
  return updateKitchenDesignJob(jobId, { status });
}

export async function listRecentLeadJobs(limit = 50): Promise<KitchenDesignJob[]> {
  const params = new URLSearchParams({
    status: "eq.lead_submitted",
    select: "*",
    order: "updated_at.desc",
    limit: String(limit),
  });

  const response = await fetch(`${getRestBase()}/ai_design_jobs?${params.toString()}`, {
    headers: authHeaders(),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });

  return parseResponse<KitchenDesignJob[]>(response, "Failed to list AI lead jobs");
}

// Compare-and-set prevents parallel requests from starting the same paid job twice.
export async function claimJob(jobId: string, status: string[], patch: Partial<KitchenDesignJob>): Promise<KitchenDesignJob | null> {
  const params = new URLSearchParams({ id: `eq.${jobId}`, status: `in.(${status.join(",")})`, select: "*" });
  const response = await fetch(`${getRestBase()}/ai_design_jobs?${params}`, {
    method: "PATCH", headers: { ...authHeaders("application/json"), Prefer: "return=representation" },
    body: JSON.stringify(patch), cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  return (await parseResponse<KitchenDesignJob[]>(response, "Failed to claim job"))[0] ?? null;
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const response = await fetch(`${getRestBase()}/rpc/consume_website_rate_limit`, {
    method: "POST", headers: authHeaders("application/json"),
    body: JSON.stringify({ p_key: key, p_limit: limit, p_window_ms: windowMs }),
    cache: "no-store", signal: AbortSignal.timeout(10_000),
  });
  return parseResponse<boolean>(response, "Rate limit service unavailable");
}

export async function claimLeadEmail(jobId: string): Promise<boolean> {
  const params = new URLSearchParams({ id: `eq.${jobId}`, lead_email_sent_at: "is.null",
    or: `(lead_email_claimed_at.is.null,lead_email_claimed_at.lt.${new Date(Date.now() - 300_000).toISOString()})`, select: "id" });
  const response = await fetch(`${getRestBase()}/ai_design_jobs?${params}`, {
    method: "PATCH", headers: { ...authHeaders("application/json"), Prefer: "return=representation" },
    body: JSON.stringify({ lead_email_claimed_at: new Date().toISOString() }),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  return (await parseResponse<{id: string}[]>(response, "Unable to claim notification")).length === 1;
}

export async function signAssetUrl(value: string): Promise<string> {
  const base = getSupabaseUrl().replace(/\/+$/, "");
  const url = new URL(value);
  if (url.origin !== new URL(base).origin) throw new Error("Unexpected asset origin");
  const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign)\/ai-designer\/(.+)$/);
  if (!match || match[1].split("/").some(part => [".", ".."].includes(decodeURIComponent(part)))) throw new Error("Invalid asset path");
  const response = await fetch(`${base}/storage/v1/object/sign/${DESIGN_BUCKET}/${match[1]}`, {
    method: "POST", headers: authHeaders("application/json"), body: JSON.stringify({ expiresIn: 3600 }),
    cache: "no-store", signal: AbortSignal.timeout(10_000),
  });
  const data = await parseResponse<{ signedURL: string }>(response, "Unable to open asset");
  return `${base}/storage/v1${data.signedURL}`;
}

export async function signJobAssets(job: KitchenDesignJob): Promise<KitchenDesignJob> {
  const [input, generated, pdf] = await Promise.all([
    signAssetUrl(job.input_image_url),
    job.generated_image_url ? signAssetUrl(job.generated_image_url) : null,
    job.pdf_report_url ? signAssetUrl(job.pdf_report_url) : null,
  ]);
  return { ...job, input_image_url: input, generated_image_url: generated, pdf_report_url: pdf };
}

export async function uploadAssetToStorage(
  filePath: string,
  fileBuffer: ArrayBuffer,
  contentType: string
): Promise<string> {
  const response = await fetch(
    `${getSupabaseUrl()}/storage/v1/object/${DESIGN_BUCKET}/${filePath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(contentType),
        "x-upsert": "false",
      },
      body: fileBuffer,
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Storage upload failed: ${response.status} ${body}`);
  }

  return `${getSupabaseUrl()}/storage/v1/object/public/${DESIGN_BUCKET}/${filePath}`;
}
