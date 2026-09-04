import Link from "next/link";

const kpis = [
  { label: "Visitors", value: "—", hint: "GA4 dataset" },
  { label: "Channels", value: "—", hint: "Organic / Google / Meta / WhatsApp" },
  { label: "Leads", value: "—", hint: "Contact, quote, AI designer" },
  { label: "Cost / Lead", value: "—", hint: "Ads + CRM + attribution" },
];

const sourceBreakdown = [
  "Google Search",
  "Google Ads",
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Organic",
];

const reportSections = [
  {
    title: "What works",
    description: "High-intent landing pages, direct CTAs, WhatsApp engagement and lead forms are the primary conversion drivers.",
  },
  {
    title: "What needs tuning",
    description: "Attribution, UTM tagging, and conversion tracking must be tightened to compare campaign performance accurately.",
  },
  {
    title: "What to optimise next",
    description: "Improve landing-page intent, tighten ad copy, and measure quote conversion by source, not just website visits.",
  },
];

export default function MarketingDashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-white/10 bg-black/70 px-6 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400">Marketing dashboard</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">DC Joinery performance overview</h1>
          </div>
          <Link href="/" className="text-amber-400 hover:text-amber-300">← Back to site</Link>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">{item.label}</p>
              <p className="mt-4 text-4xl font-bold text-amber-400">{item.value}</p>
              <p className="mt-2 text-sm text-neutral-400">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-4">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Traffic sources</h2>
            <div className="mt-6 space-y-4">
              {sourceBreakdown.map((source, index) => (
                <div key={source}>
                  <div className="mb-2 flex items-center justify-between text-sm text-neutral-300">
                    <span>{source}</span>
                    <span>{index === 0 ? "—" : "—"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${20 + index * 13}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Conversion goals configured</h2>
            <ul className="mt-5 space-y-3 text-sm text-neutral-300">
              <li>• Contact form submit</li>
              <li>• Kitchen quote form submit</li>
              <li>• Fit & supply form submit</li>
              <li>• WhatsApp CTA clicks</li>
              <li>• Phone clicks</li>
              <li>• AI Designer start / lead submit</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          {reportSections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-white/10 bg-black/60 p-6">
              <h3 className="text-xl font-bold text-amber-300">{section.title}</h3>
              <p className="mt-3 text-neutral-300">{section.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
