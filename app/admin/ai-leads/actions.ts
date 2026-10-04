"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endAdminSession, isAdmin, startAdminSession, validAdminToken } from "@/lib/security";
import { assertRateLimit, getRequestIdentifier } from "@/lib/ai-designer/rate-limit";
import { sendAdminKitchenLeadReport } from "@/lib/ai-designer/ai-pipeline";
import { claimLeadEmail, getKitchenDesignJob, updateKitchenDesignJob } from "@/lib/ai-designer/supabase-rest";
export async function loginAdmin(_state: { error: string } | null, data: FormData) {
  try {
    await assertRateLimit("admin-login:" + getRequestIdentifier({ headers: await headers() }), 5, 900_000);
    if (!validAdminToken(String(data.get("password") || ""))) return { error: "Invalid access code." };
    await startAdminSession();
  } catch { return { error: "Login is temporarily unavailable. Please try again later." }; }
  redirect("/admin/ai-leads");
}
export async function logoutAdmin() { await endAdminSession(); redirect("/admin/ai-leads"); }
export async function retryLeadEmail(data: FormData) {
  if (!await isAdmin()) redirect("/admin/ai-leads");
  const id = String(data.get("jobId") || "");
  if (!/^[a-f0-9-]{36}$/i.test(id)) return;
  await assertRateLimit("admin-email:" + id, 3, 3_600_000);
  const job = await getKitchenDesignJob(id);
  if (job?.status !== "lead_submitted" || job.lead_email_sent_at || !await claimLeadEmail(id)) return;
  try {
    await sendAdminKitchenLeadReport(job);
    await updateKitchenDesignJob(id, { lead_email_sent_at: new Date().toISOString() });
  } catch { console.error("Lead notification retry failed", { jobId: id }); }
  redirect("/admin/ai-leads");
}
