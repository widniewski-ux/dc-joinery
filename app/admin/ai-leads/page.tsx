import type { Metadata } from "next";
import { headers } from "next/headers";

import { optionalEnv } from "@/lib/ai-designer/env";
import type { KitchenDesignJob } from "@/lib/ai-designer/types";

export const metadata: Metadata = {
  title: "AI Kitchen Leads - Admin",
  description: "Internal dashboard for AI Kitchen Designer leads and reports.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

async function fetchLeads(token: string, origin: string): Promise<KitchenDesignJob[]> {
  const response = await fetch(
    `${origin}/api/admin/ai-kitchen-designer/reports?limit=100`,
    {
      headers: {
        "x-admin-token": token,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Failed to load admin reports");
  }

  const payload = (await response.json()) as { jobs: KitchenDesignJob[] };
  return payload.jobs;
}

export default async function AiLeadsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token || "";

  if (!token) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold mb-4">AI Leads Admin</h1>
          <p className="text-neutral-300">
            Access denied. Provide <code>?token=...</code> in URL.
          </p>
        </div>
      </main>
    );
  }

  let jobs: KitchenDesignJob[] = [];
  let errorMessage: string | null = null;
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host");
    if (!host && !optionalEnv("NEXT_PUBLIC_SITE_URL")) {
      throw new Error("Cannot resolve site origin for admin API request");
    }
    const protocol =
      requestHeaders.get("x-forwarded-proto") ??
      (host?.includes("localhost") ? "http" : "https");
    const origin = optionalEnv("NEXT_PUBLIC_SITE_URL") ?? `${protocol}://${host}`;
    jobs = await fetchLeads(token, origin);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load jobs";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">AI Kitchen Designer Leads</h1>
        <p className="text-neutral-300 mb-10">
          Internal report feed for follow-up calls and quotations.
        </p>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 mb-8">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
                    Lead details
                  </p>
                  <h2 className="text-2xl font-semibold">
                    {job.lead_name ?? "Unnamed lead"} - {job.style}
                  </h2>
                  <p className="text-neutral-300 mt-1">
                    {job.lead_email} | {job.lead_phone}
                  </p>
                </div>
                <p className="text-sm text-neutral-400">
                  Updated {new Date(job.updated_at).toLocaleString()}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mt-5 text-sm">
                <p>Palette: {job.color_palette.join(", ")}</p>
                <p className="md:col-span-2">Selections: {job.customer_notes ?? "N/A"}</p>
              </div>

              <p className="text-neutral-300 mt-4">
                {job.lead_message ?? "No additional message."}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                {job.generated_image_url && (
                  <a
                    href={job.generated_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm"
                  >
                    View generated image
                  </a>
                )}
                {job.pdf_report_url && (
                  <a
                    href={job.pdf_report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-black"
                  >
                    Open PDF report
                  </a>
                )}
              </div>
            </article>
          ))}
          {jobs.length === 0 && !errorMessage && (
            <p className="text-neutral-400">No AI leads yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
