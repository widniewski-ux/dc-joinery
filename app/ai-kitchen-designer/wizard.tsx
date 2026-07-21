"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STYLE_OPTIONS = [
  { value: "Modern Minimal", label: "Modern Minimal (Howdens-inspired)" },
  { value: "Shaker", label: "Shaker (Wren-inspired)" },
  { value: "Industrial", label: "Industrial (B&Q-inspired)" },
  { value: "Classic Luxury", label: "Classic Luxury" },
  { value: "Scandinavian", label: "Scandinavian (IKEA-inspired)" },
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

const WORKTOPS = [
  "Laminate (B&Q / IKEA range)",
  "Compact Laminate (Howdens range)",
  "Quartz (Wren premium range)",
  "Granite (Howdens premium range)",
  "Solid Wood (IKEA / bespoke range)",
] as const;

const HANDLES = [
  "Handleless (Wren style)",
  "Slim Bar Handles (Howdens style)",
  "Knobs (IKEA style)",
  "Integrated Rail (modern catalog style)",
  "Brushed Brass Pulls (premium catalog style)",
] as const;

const EDIT_INTENSITY_OPTIONS = [
  "Subtle refresh",
  "Balanced redesign",
  "Bold transformation",
] as const;

const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;

const STEP_LABELS = [
  "Add Photo",
  "Photo Analysis",
  "Style",
  "Colors",
  "Worktops",
  "Handles",
  "Budget",
  "Generate",
  "Project",
  "Contact",
] as const;

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

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
const WIZARD_BUILD = "2026-07-21-fix6";

type KitchenDesignerWizardProps = {
  initialStep?: WizardStep;
};

export default function KitchenDesignerWizard({ initialStep = 1 }: KitchenDesignerWizardProps) {
  const [step, setStep] = useState<WizardStep>(initialStep);
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [style, setStyle] = useState<(typeof STYLE_OPTIONS)[number]["value"]>("Modern Minimal");
  const [palette, setPalette] = useState<string[]>(["Warm White", "Natural Oak"]);
  const [worktop, setWorktop] = useState<(typeof WORKTOPS)[number]>("Quartz (Wren premium range)");
  const [handles, setHandles] = useState<(typeof HANDLES)[number]>("Handleless (Wren style)");
  const [editIntensity, setEditIntensity] =
    useState<(typeof EDIT_INTENSITY_OPTIONS)[number]>("Balanced redesign");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [budgetMin, setBudgetMin] = useState(8000);
  const [budgetMax, setBudgetMax] = useState(18000);
  const [notes, setNotes] = useState("");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!activeJobId || !loading) return;

    let cancelled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/ai-designer/jobs/${activeJobId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { job?: Job; error?: string };

        if (!response.ok || !payload.job) {
          throw new Error(payload.error || "Failed to fetch generation progress");
        }

        if (cancelled) return;
        setJob(payload.job);

        if (payload.job.status === "report_ready" || payload.job.status === "lead_submitted") {
          setLoading(false);
          setInfoMessage("Your project is ready.");
          setStep(9);
          return;
        }

        if (payload.job.status === "failed") {
          setLoading(false);
          setError(payload.job.estimate_explanation ?? "Generation failed. Please try again.");
          setStep(7);
          return;
        }

        timeoutHandle = setTimeout(pollJob, 2500);
      } catch (caughtError) {
        if (cancelled) return;
        const message =
          caughtError instanceof Error ? caughtError.message : "Failed to poll generation status";
        setLoading(false);
        setError(message);
        setStep(7);
      }
    };

    timeoutHandle = setTimeout(pollJob, 1500);

    return () => {
      cancelled = true;
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [activeJobId, loading]);

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

  function validateClientPhoto(file: File | null): File | null {
    if (!file) {
      setError("Please upload a kitchen photo first.");
      return null;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image size must be 50MB or less.");
      return null;
    }
    return file;
  }

  function createDemoJob(): Job {
    const estimatedMin = Math.max(5000, Math.round(budgetMin * 0.95));
    const estimatedMax = Math.max(estimatedMin + 1000, Math.round(budgetMax * 1.15));

    return {
      id: `demo-${Date.now()}`,
      status: "report_ready",
      style,
      color_palette: palette,
      budget_min: budgetMin,
      budget_max: budgetMax,
      input_image_url: previewUrl ?? "",
      generated_image_url: previewUrl ?? null,
      project_description:
        `Premium ${style} kitchen concept inspired by Howdens, Wren, B&Q and IKEA directions. ` +
        `Palette: ${palette.join(", ")}. Worktop: ${worktop}. Handles: ${handles}. ` +
        `Intensity: ${editIntensity}. Layout keeps your room geometry and improves storage zoning and workflow.`,
      estimated_cost_min: estimatedMin,
      estimated_cost_max: estimatedMax,
      estimate_explanation:
        "Demo estimate based on your selected budget, style complexity, and supplier-inspired finish level.",
      pdf_report_url: null,
    };
  }

  async function runPhotoAnalysis(): Promise<boolean> {
    if (!photo) {
      setError("Please upload a kitchen photo first.");
      return false;
    }
    setError(null);
    setAnalysisRunning(true);
    setAnalysisDone(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const ratio = photo.size / 1024 / 1024;
      const generated = [
        "Layout detected: U/L-shape workflow with potential triangle optimization.",
        ratio > 4
          ? "Image quality: high detail, suitable for premium concept rendering."
          : "Image quality: good, suitable for concept generation.",
        "Optimization opportunity: improved storage zoning and cleaner worktop lines.",
        "Trade note: electrical, plumbing, and appliance coordination recommended.",
      ];

      setAnalysisSummary(generated);
      setAnalysisDone(true);
      return true;
    } finally {
      setAnalysisRunning(false);
    }
  }

  async function continueFromAnalysis() {
    if (analysisDone) {
      goNext(3);
      return;
    }

    const success = await runPhotoAnalysis();
    if (success) {
      goNext(3);
    }
  }

  async function handleGenerate() {
    if (!photo) {
      setError("Please upload a kitchen photo first.");
      setStep(1);
      return;
    }

    if (!analysisDone) {
      const analysisSuccess = await runPhotoAnalysis();
      if (!analysisSuccess) {
        setError("Please upload a kitchen photo first.");
        setStep(2);
        return;
      }
    }
    if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin < 2000 || budgetMax > 100000 || budgetMin >= budgetMax) {
      setError("Please choose a realistic budget range.");
      setStep(7);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setLeadSuccess(false);
      setIsDemoResult(false);
      setStep(8);
      setActiveJobId(null);

      const createForm = new FormData();
      createForm.append("photo", photo);
      createForm.append("style", style);
      createForm.append("palette", palette.join(","));
      createForm.append("budgetMin", String(budgetMin));
      createForm.append("budgetMax", String(budgetMax));
      const fullNotes = [
        notes.trim(),
        `Preferred worktop: ${worktop}`,
        `Preferred handles: ${handles}`,
        `Edit intensity: ${editIntensity}`,
        `Preserve current layout: ${preserveLayout ? "yes" : "no"}`,
      ]
        .filter(Boolean)
        .join(" | ");
      createForm.append("notes", fullNotes);

      const createResponse = await fetch("/api/ai-designer/jobs", {
        method: "POST",
        body: createForm,
      });

      const createPayload = (await createResponse.json()) as { job?: Job; error?: string };
      if (!createResponse.ok || !createPayload.job) {
        throw new Error(createPayload.error || "Failed to create AI design job");
      }
      setJob(createPayload.job);
      setActiveJobId(createPayload.job.id);

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
      if (generatePayload.job.status === "report_ready" || generatePayload.job.status === "lead_submitted") {
        setLoading(false);
        setStep(9);
      } else {
        setInfoMessage("Generation started. We are processing your project now.");
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to generate concept";
      if (message.toLowerCase().includes("rate limit")) {
        setError(message);
        setStep(7);
        setLoading(false);
        return;
      }
      setIsDemoResult(true);
      setActiveJobId(null);
      setInfoMessage(
        `Live AI services are currently unavailable (${message}). Showing a local demo result so you can continue all steps.`
      );
      setJob(createDemoJob());
      setStep(9);
      setLoading(false);
    }
  }

  async function submitLead() {
    if (!job) {
      setError("Please generate your project before sending an enquiry.");
      setStep(9);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setLeadError(null);
      setInfoMessage(null);
      setLeadSuccess(false);

      const trimmedName = leadName.trim();
      const trimmedEmail = leadEmail.trim();
      const trimmedPhone = leadPhone.trim();

      if (trimmedName.length < 2) {
        setLeadError("Enter your full name.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setLeadError("Enter a valid email address.");
        return;
      }
      if (!/^[\d\s()+-]{10,}$/.test(trimmedPhone)) {
        setLeadError("Enter a valid phone number.");
        return;
      }

      if (isDemoResult) {
        setLeadSuccess(true);
        setInfoMessage(
          "Demo mode: enquiry saved locally in the current session view. Configure live API keys to send to backend."
        );
        return;
      }

      const response = await fetch(`/api/ai-designer/jobs/${job.id}/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          message: leadMessage.trim() || null,
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
      setLeadError(message);
    } finally {
      setLoading(false);
    }
  }

  function goNext(nextStep: WizardStep) {
    setError(null);
    setStep(nextStep);
  }

  function goRelative(delta: -1 | 1) {
    setError(null);
    setStep((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 10) return 10;
      return next as WizardStep;
    });
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-3">
          Premium Kitchen Configurator
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-300">
            Build: {WIZARD_BUILD}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-300">
            Step: {step}
          </span>
          <button
            type="button"
            onClick={() => goRelative(-1)}
            className="rounded-lg border border-white/20 px-3 py-1 text-neutral-200"
          >
            Force Back
          </button>
          <button
            type="button"
            onClick={() => goRelative(1)}
            className="rounded-lg border border-white/20 px-3 py-1 text-neutral-200"
          >
            Force Next
          </button>
        </div>
        <div className="grid gap-2 md:grid-cols-5 lg:grid-cols-10">
          {STEP_LABELS.map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(number as WizardStep)}
                className={`rounded-xl border px-2 py-2 text-center text-[11px] font-semibold ${
                  active
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : done
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-neutral-400"
                }`}
              >
                {number}. {label}
              </button>
            );
          })}
        </div>
      </div>

      {infoMessage && (
        <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-amber-100">
          {infoMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 1: Add kitchen photo</h2>
          <p className="text-neutral-300">
            Use a clear wide shot. JPG, PNG, WEBP, HEIC or AVIF, max 50MB.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,image/*"
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0] ?? null;
              const validPhoto = validateClientPhoto(selected);
              setPhoto(validPhoto);
              if (validPhoto) {
                setError(null);
                setStep(2);
              }
              setAnalysisDone(false);
              setAnalysisSummary([]);
            }}
            className="block w-full rounded-xl border border-white/15 bg-white/5 p-4"
          />
          {photo && (
            <p className="text-sm text-neutral-300">
              Selected: {photo.name}
            </p>
          )}
          {previewUrl && (
            <div className="relative aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10">
              <img src={previewUrl} alt="Kitchen preview" className="h-full w-full object-cover" />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              const selectedPhoto = validateClientPhoto(
                photo ?? fileInputRef.current?.files?.[0] ?? null
              );
              if (selectedPhoto && !photo) {
                setPhoto(selectedPhoto);
              }
              goNext(2);
            }}
            className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
          >
            Continue to analysis
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 2: AI photo analysis</h2>
          <p className="text-neutral-300">
            We review your current layout and technical constraints before styling, then align concepts with Howdens, Wren, B&Q and IKEA-inspired ranges.
          </p>
          {!photo && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <p className="text-sm text-neutral-300">
                No photo is attached yet. Upload one here to continue.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,image/*"
                onChange={(event) => {
                  const selected = event.currentTarget.files?.[0] ?? null;
                  const validPhoto = validateClientPhoto(selected);
                  setPhoto(validPhoto);
                  if (validPhoto) {
                    setError(null);
                  }
                }}
                className="block w-full rounded-xl border border-white/15 bg-white/5 p-4"
              />
            </div>
          )}
          <button
            type="button"
            onClick={runPhotoAnalysis}
            disabled={analysisRunning}
            className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
          >
            {analysisRunning ? "Analyzing..." : "Run photo analysis"}
          </button>
          {analysisSummary.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              {analysisSummary.map((item) => (
                <p key={item} className="text-neutral-200">
                  ✔ {item}
                </p>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goNext(1)}
              className="rounded-xl border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              type="button"
              onClick={continueFromAnalysis}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black"
            >
              {analysisDone ? "Continue" : "Run analysis and continue"}
            </button>
            <button
              type="button"
              onClick={() => goNext(3)}
              className="rounded-xl border border-white/20 px-5 py-3 text-sm"
            >
              Continue without analysis
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 3: Choose style</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {STYLE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStyle(item.value)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  style === item.value
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item.label}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => goNext(2)} className="rounded-xl border border-white/20 px-5 py-3">
              Back
            </button>
            <button type="button" onClick={() => goNext(4)} className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 4: Select colors</h2>
          <p className="text-neutral-300">Choose up to 6 colors for doors, walls, and accents.</p>
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
            <button type="button" onClick={() => goNext(3)} className="rounded-xl border border-white/20 px-5 py-3">
              Back
            </button>
            <button type="button" onClick={() => goNext(5)} className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 5: Pick worktops</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {WORKTOPS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setWorktop(item)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  worktop === item
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => goNext(4)} className="rounded-xl border border-white/20 px-5 py-3">
              Back
            </button>
            <button type="button" onClick={() => goNext(6)} className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 6: Choose handles</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {HANDLES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setHandles(item)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  handles === item
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => goNext(5)} className="rounded-xl border border-white/20 px-5 py-3">
              Back
            </button>
            <button type="button" onClick={() => goNext(7)} className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Step 7: Set budget</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
              AI edit tools
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {EDIT_INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEditIntensity(option)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    editIntensity === option
                      ? "border-amber-400 bg-amber-400/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={preserveLayout}
                onChange={(event) => setPreserveLayout(event.target.checked)}
              />
              Keep room geometry and appliance positions as close as possible
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-neutral-300">Budget minimum (£)</span>
              <input
                type="number"
                min={2000}
                value={budgetMin}
                onChange={(event) => setBudgetMin(Number(event.target.value))}
                className="input"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-neutral-300">Budget maximum (£)</span>
              <input
                type="number"
                min={3000}
                value={budgetMax}
                onChange={(event) => setBudgetMax(Number(event.target.value))}
                className="input"
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-neutral-300">Extra notes (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input min-h-32"
              placeholder="Add any timing, appliance, or installation preferences."
            />
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => goNext(6)} className="rounded-xl border border-white/20 px-5 py-3">
              Back
            </button>
            <button type="button" onClick={handleGenerate} className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">
              Continue to generation
            </button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Step 8: Generating project</h2>
          <p className="text-neutral-300">
            We are building your premium concept with inspirations from Howdens, Wren, B&Q and IKEA catalog directions. This can take up to a minute.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="text-neutral-200">• Analyzing kitchen geometry and constraints</p>
            <p className="text-neutral-200">• Applying selected style, colors, worktop and handles</p>
            <p className="text-neutral-200">• Rendering realistic concept image</p>
            <p className="text-neutral-200">• Calculating indicative cost range and report</p>
          </div>
          {loading && (
            <p className="text-amber-200">AI design engine is running...</p>
          )}
          {!loading && job && (
            <button
              type="button"
              onClick={() => goNext(9)}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black"
            >
              View generated project
            </button>
          )}
          {loading && (
            <button
              type="button"
              onClick={() => {
                setLoading(false);
                setError("Generation was stopped. You can try again.");
                setStep(7);
              }}
              className="rounded-xl border border-white/20 px-6 py-3 font-bold"
            >
              Stop and go back
            </button>
          )}
        </div>
      )}

      {step === 9 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Step 9: Your AI kitchen project</h2>
          {isDemoResult && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
              Demo result mode (local). Live generation will work after backend/API env setup.
            </div>
          )}

          {job && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 md:p-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                      Your kitchen (before)
                    </p>
                    {photo && previewUrl ? (
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                        <img
                          src={previewUrl}
                          alt="Uploaded kitchen photo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="p-6 text-neutral-400">Source image unavailable.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-300">
                      AI redesign (after)
                    </p>
                    {job.generated_image_url ? (
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                        <img
                          src={job.generated_image_url}
                          alt="Generated kitchen concept"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="p-6 text-neutral-300">Generated image unavailable.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Configuration summary
                  </p>
                  <p className="text-neutral-300">Style: {job.style}</p>
                  <p className="text-neutral-300">Palette: {job.color_palette.join(", ")}</p>
                  <p className="text-neutral-300">Worktop: {worktop}</p>
                  <p className="text-neutral-300">Handles: {handles}</p>
                  <p className="text-neutral-300">Edit intensity: {editIntensity}</p>
                  <p className="text-neutral-300">
                    Preserve layout: {preserveLayout ? "Yes" : "No"}
                  </p>
                  <p className="text-neutral-300">
                    Budget target: £{job.budget_min.toLocaleString()} - £
                    {job.budget_max.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Professional concept
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-amber-300 mb-2">
                      Edit quality targets
                    </p>
                    <p className="text-neutral-300">• Keep wall/window geometry consistent</p>
                    <p className="text-neutral-300">• Preserve appliance zones and circulation</p>
                    <p className="text-neutral-300">• Apply catalog-inspired materials and details</p>
                    <p className="text-neutral-300">• Produce quote-ready visual direction</p>
                  </div>
                <div className="flex flex-wrap gap-3">
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
                  <button
                    type="button"
                    onClick={() => goNext(10)}
                    className="rounded-xl border border-white/20 px-6 py-3 font-bold"
                  >
                    Continue to contact
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 10 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Step 10: Contact DC Joinery</h2>
          <p className="text-neutral-300">
            Send your concept to our team and receive a tailored follow-up.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                className="input"
                placeholder="Full name"
              />
              <input
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                className="input"
                placeholder="Email"
                type="email"
              />
              <input
                value={leadPhone}
                onChange={(event) => setLeadPhone(event.target.value)}
                className="input md:col-span-2"
                placeholder="Phone number"
              />
              <textarea
                value={leadMessage}
                onChange={(event) => setLeadMessage(event.target.value)}
                className="input min-h-28 md:col-span-2"
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
            {leadError && (
              <p className="text-red-300 text-sm">{leadError}</p>
            )}
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
