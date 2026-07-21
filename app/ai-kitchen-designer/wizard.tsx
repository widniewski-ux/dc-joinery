"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const STYLES = [
  "Modern Minimal",
  "Shaker",
  "Industrial",
  "Classic Luxury",
  "Scandinavian",
] as const;

const COLORS = [
  "Warm White",
  "Graphite",
  "Navy Blue",
  "Sage Green",
  "Natural Oak",
  "Walnut",
  "Stone Grey",
  "Black Matt",
];

type Job = {
  id: string;
  status: string;
  style: string;
  color_palette: string[];
  budget_min: number;
  budget_max: number;
  input_image_url: string;
  generated_image_url: string | null;
  project_description: string | null;
  estimated_cost_min: number | null;
  estimated_cost_max: number | null;
  estimate_explanation: string | null;
  pdf_report_url: string | null;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

export default function KitchenDesignerWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [style, setStyle] = useState<(typeof STYLES)[number]>("Modern Minimal");
  const [palette, setPalette] = useState<string[]>(["Warm White", "Natural Oak"]);
  const [budgetMin, setBudgetMin] = useState(8000);
  const [budgetMax, setBudgetMax] = useState(18000);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSuccess, setLeadSuccess] = useState(false);

  const previewUrl = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  function toggleColor(color: string) {
    setPalette((prev) => {
      if (prev.includes(color)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== color);
      }
      if (prev.length >= 6) return prev;
      return [...prev, color];
    });
  }

  async function handleGenerate() {
    if (!photo) {
      setError("Please upload a kitchen photo first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLeadSuccess(false);

      const createForm = new FormData();
      createForm.append("photo", photo);
      createForm.append("style", style);
      createForm.append("palette", palette.join(","));
      createForm.append("budgetMin", String(budgetMin));
      createForm.append("budgetMax", String(budgetMax));
      createForm.append("notes", notes);

      const createResponse = await fetch("/api/ai-designer/jobs", {
        method: "POST",
        body: createForm,
      });

      const createPayload = (await createResponse.json()) as { job?: Job; error?: string };
      if (!createResponse.ok || !createPayload.job) {
        throw new Error(createPayload.error || "Failed to create AI design job");
      }

      const generateResponse = await fetch(
        `/api/ai-designer/jobs/${createPayload.job.id}/generate`,
        {
          method: "POST",
        }
      );
      const generatePayload = (await generateResponse.json()) as {
        job?: Job;
        error?: string;
      };
      if (!generateResponse.ok || !generatePayload.job) {
        throw new Error(generatePayload.error || "Failed to generate AI concept");
      }

      setJob(generatePayload.job);
      setStep(5);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to generate concept";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead() {
    if (!job) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/ai-designer/jobs/${job.id}/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          message: leadMessage || null,
        }),
      });

      const payload = (await response.json()) as { job?: Job; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit enquiry");
      }
      if (payload.job) {
        setJob(payload.job);
      }
      setLeadSuccess(true);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to submit enquiry";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-5 mb-8">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-center ${
              step === item
                ? "border-amber-400 bg-amber-400/20 text-amber-200"
                : "border-white/10 bg-white/5 text-neutral-400"
            }`}
          >
            Step {item}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">1. Upload your kitchen photo</h2>
          <p className="text-neutral-300">
            Use a clear wide shot. JPG, PNG or WEBP, max 8MB.
          </p>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-white/15 bg-white/5 p-4"
          />
          {previewUrl && (
            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10">
              <Image src={previewUrl} alt="Kitchen preview" fill className="object-cover" />
            </div>
          )}
          <button
            type="button"
            disabled={!photo}
            onClick={() => setStep(2)}
            className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">2. Choose kitchen style</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {STYLES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStyle(item)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  style === item
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">3. Choose colors</h2>
          <p className="text-neutral-300">Select up to 6 colors.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  palette.includes(color)
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{color}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">4. Choose budget and preferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-neutral-300">Budget minimum (£)</span>
              <input
                type="number"
                min={2000}
                value={budgetMin}
                onChange={(event) => setBudgetMin(Number(event.target.value))}
                className="input bg-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-neutral-300">Budget maximum (£)</span>
              <input
                type="number"
                min={3000}
                value={budgetMax}
                onChange={(event) => setBudgetMax(Number(event.target.value))}
                className="input bg-white"
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-neutral-300">Extra notes (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input min-h-32 bg-white"
              placeholder="Tell us if you need integrated appliances, extra storage, timeline, etc."
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate AI Kitchen Concept"}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">5. Your AI kitchen concept</h2>
          {loading && <p className="text-neutral-300">Processing your concept...</p>}

          {job && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Style
                  </p>
                  <p className="font-semibold text-xl">{job.style}</p>
                  <p className="text-neutral-300 mt-3">
                    Palette: {job.color_palette.join(", ")}
                  </p>
                  <p className="text-neutral-300">
                    Budget target: £{job.budget_min.toLocaleString()} - £
                    {job.budget_max.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Project description
                  </p>
                  <p className="text-neutral-200 leading-relaxed">
                    {job.project_description ?? "Description not generated yet."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Indicative cost
                  </p>
                  <p className="text-2xl font-bold">
                    £{(job.estimated_cost_min ?? 0).toLocaleString()} - £
                    {(job.estimated_cost_max ?? 0).toLocaleString()}
                  </p>
                  <p className="text-neutral-300 mt-3">
                    {job.estimate_explanation ?? "Cost explanation pending."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/50 p-3">
                  {job.generated_image_url ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        src={job.generated_image_url}
                        alt="Generated kitchen concept"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-neutral-300 p-6">Generated image unavailable.</p>
                  )}
                </div>
                {job.pdf_report_url && (
                  <a
                    href={job.pdf_report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-xl bg-amber-400 px-6 py-3 font-bold text-black"
                  >
                    Download PDF Report
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <h3 className="text-xl font-bold">Send this concept to DC Joinery</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                className="input bg-white"
                placeholder="Full name"
              />
              <input
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                className="input bg-white"
                placeholder="Email"
                type="email"
              />
              <input
                value={leadPhone}
                onChange={(event) => setLeadPhone(event.target.value)}
                className="input bg-white md:col-span-2"
                placeholder="Phone number"
              />
              <textarea
                value={leadMessage}
                onChange={(event) => setLeadMessage(event.target.value)}
                className="input min-h-28 bg-white md:col-span-2"
                placeholder="Any extra details for your quote (optional)"
              />
            </div>
            <button
              type="button"
              onClick={submitLead}
              disabled={loading || !job}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Enquiry with Full Report"}
            </button>
            {leadSuccess && (
              <p className="text-emerald-300">
                Thank you. Your AI kitchen concept has been sent to DC Joinery.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
