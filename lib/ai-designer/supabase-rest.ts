import "server-only";

import { requiredEnv } from "./env";
import type {
  CreateKitchenDesignJobInput,
  KitchenDesignJob,
  KitchenDesignStatus,
  LeadInput,
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
    cache: "no-store",
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
    cache: "no-store",
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
    cache: "no-store",
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

export async function saveLead(jobId: string, lead: LeadInput): Promise<KitchenDesignJob> {
  return updateKitchenDesignJob(jobId, {
    status: "lead_submitted",
    lead_name: lead.name,
    lead_email: lead.email,
    lead_phone: lead.phone,
    lead_message: lead.message,
  });
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
    cache: "no-store",
  });

  return parseResponse<KitchenDesignJob[]>(response, "Failed to list AI lead jobs");
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
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Storage upload failed: ${response.status} ${body}`);
  }

  return `${getSupabaseUrl()}/storage/v1/object/public/${DESIGN_BUCKET}/${filePath}`;
}
