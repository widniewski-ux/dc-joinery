import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/security";
import { listRecentLeadJobs, signJobAssets } from "@/lib/ai-designer/supabase-rest";
import Login from "./Login";
import { logoutAdmin, retryLeadEmail } from "./actions";

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

export default async function AiLeadsAdminPage({ searchParams }: Props) {
  if ((await searchParams).token) redirect("/admin/ai-leads");
  if (!await isAdmin()) return <main className="min-h-screen bg-black text-white px-6 py-16"><Login /></main>;
  let jobs: KitchenDesignJob[] = [];
  let errorMessage: string | null = null;
  try {
    jobs = await Promise.all((await listRecentLeadJobs(100)).map(signJobAssets));
  } catch {
    errorMessage = "Reports are temporarily unavailable. Please try again later.";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <form action={logoutAdmin}><button className="mb-6 underline">Sign out</button></form>
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

              {!job.lead_email_sent_at && <form action={retryLeadEmail} className="mt-4">
                <input type="hidden" name="jobId" value={job.id} />
                <p className="text-amber-300">Enquiry saved; email notification not confirmed.</p>
                <button className="underline">Retry notification (available after 5 minutes)</button>
              </form>}
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
