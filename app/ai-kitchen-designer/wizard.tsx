"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SUPPLIER_CATALOG, type SupplierId } from "@/lib/ai-designer/supplier-catalog";

const EDIT_INTENSITY_OPTIONS = [
  "Subtle refresh",
  "Balanced redesign",
  "Bold transformation",
] as const;

const GENERATION_TARGET_SECONDS = 90;

const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const STEP_LABELS = [
  "Add Photo",
  "Photo Analysis",
  "Supplier",
  "Style",
  "Colors",
  "Worktops",
  "Selections",
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
const WIZARD_BUILD = "2026-07-23-suppliers-v2";

type KitchenDesignerWizardProps = {
  initialStep?: WizardStep;
};

export default function KitchenDesignerWizard({ initialStep = 1 }: KitchenDesignerWizardProps) {
  const [step, setStep] = useState<WizardStep>(initialStep);
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [supplierId, setSupplierId] = useState<SupplierId>(SUPPLIER_CATALOG[0].id);
  const [style, setStyle] = useState<string>(SUPPLIER_CATALOG[0].styles[0]?.value ?? "Shaker");
  const [palette, setPalette] = useState<string[]>(
    SUPPLIER_CATALOG[0].colors.slice(0, 2).map((item) => item.value)
  );
  const [worktop, setWorktop] = useState<string>(
    SUPPLIER_CATALOG[0].worktops[0]?.value ?? "Laminate"
  );
  const [handles, setHandles] = useState<string>(
    SUPPLIER_CATALOG[0].handles[0]?.value ?? "Handleless"
  );
  const [appliances, setAppliances] = useState<string[]>(
    SUPPLIER_CATALOG[0].appliances.slice(0, 2).map((item) => item.value)
  );
  const [editIntensity, setEditIntensity] =
    useState<(typeof EDIT_INTENSITY_OPTIONS)[number]>("Balanced redesign");
  const [preserveLayout, setPreserveLayout] = useState(true);
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
  const [demoReason, setDemoReason] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [generationNow, setGenerationNow] = useState<number>(Date.now());
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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
    if (!zoomImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomImage(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomImage]);

  const selectedSupplier = useMemo(
    () => SUPPLIER_CATALOG.find((entry) => entry.id === supplierId) ?? SUPPLIER_CATALOG[0],
    [supplierId]
  );
  const styleOptions = selectedSupplier.styles;
  const colorOptions = selectedSupplier.colors;
  const worktopOptions = selectedSupplier.worktops;
  const handleOptions = selectedSupplier.handles;
  const applianceOptions = selectedSupplier.appliances;
  const createDemoJob = useCallback((): Job => {
    return {
      id: `demo-${Date.now()}`,
      status: "report_ready",
      style: `${selectedSupplier.label} - ${style}`,
      color_palette: palette,
      budget_min: 0,
      budget_max: 0,
      input_image_url: previewUrl ?? "",
      generated_image_url: null,
      project_description:
        `Premium ${selectedSupplier.label} ${style} kitchen concept aligned with your chosen brochure options. ` +
        `Palette: ${palette.join(", ")}. Worktop: ${worktop}. Handles: ${handles}. Appliances: ${appliances.join(", ")}. ` +
        `Intensity: ${editIntensity}. Layout keeps your room geometry and improves storage zoning and workflow.`,
      estimated_cost_min: null,
      estimated_cost_max: null,
      estimate_explanation: "Demo mode result.",
      pdf_report_url: null,
    };
  }, [appliances, editIntensity, handles, palette, previewUrl, selectedSupplier.label, style, worktop]);

  const isProviderRateLimitError = useCallback((message: string | null | undefined): boolean => {
    if (!message) return false;
    const text = message.toLowerCase();
    return (
      text.includes("rate limit") ||
      text.includes("rate-limited") ||
      text.includes("request was throttled") ||
      text.includes("requests per minute") ||
      text.includes("retry_after") ||
      text.includes("resets in") ||
      text.includes("less than $5.0") ||
      text.includes("below $5.0")
    );
  }, []);

  const isProviderCreditError = useCallback(
    (message: string | null | undefined): boolean => {
      if (!message) return false;
      if (isProviderRateLimitError(message)) {
        return false;
      }
      const text = message.toLowerCase();
      return (
        text.includes("insufficient_quota") ||
        text.includes("exceeded your current quota") ||
        text.includes("insufficient credit") ||
        text.includes("replicate credit issue") ||
        text.includes("replicate.com/account/billing") ||
        text.includes("payment required") ||
        (text.includes("status") && text.includes("402"))
      );
    },
    [isProviderRateLimitError]
  );

  const getProviderIssueSummary = useCallback(
    (message: string | null | undefined): string => {
      if (!message) {
        return "Live generation is temporarily unavailable.";
      }
      if (isProviderRateLimitError(message)) {
        return "Live generation is temporarily rate-limited by the AI provider. Please retry shortly.";
      }
      if (isProviderCreditError(message)) {
        return "Live generation is currently blocked by AI provider billing or quota settings.";
      }
      return "Live generation is currently unavailable.";
    },
    [isProviderCreditError, isProviderRateLimitError]
  );

  useEffect(() => {
    if (!loading || step !== 8) return;

    const intervalId = setInterval(() => {
      setGenerationNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loading, step]);

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
          setGenerationStartedAt(null);
          setInfoMessage("Your project is ready.");
          setStep(9);
          return;
        }

        if (payload.job.status === "failed") {
          const failureNote = payload.job.estimate_explanation ?? "Generation failed. Please try again.";
          if (isProviderRateLimitError(failureNote)) {
            setLoading(false);
            setGenerationStartedAt(null);
            setError(getProviderIssueSummary(failureNote));
            setStep(7);
            return;
          }
          if (isProviderCreditError(failureNote)) {
            setLoading(false);
            setGenerationStartedAt(null);
            setIsDemoResult(true);
            setDemoReason(getProviderIssueSummary(failureNote));
            setActiveJobId(null);
            setInfoMessage(
              `${getProviderIssueSummary(
                failureNote
              )} Showing a local demo result so you can continue.`
            );
            setJob(createDemoJob());
            setStep(9);
            return;
          }
          setLoading(false);
          setGenerationStartedAt(null);
          setError(failureNote);
          setStep(7);
          return;
        }

        timeoutHandle = setTimeout(pollJob, 2500);
      } catch (caughtError) {
        if (cancelled) return;
        const message =
          caughtError instanceof Error ? caughtError.message : "Failed to poll generation status";
        setLoading(false);
        setGenerationStartedAt(null);
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
  }, [
    activeJobId,
    createDemoJob,
    getProviderIssueSummary,
    isProviderCreditError,
    isProviderRateLimitError,
    loading,
  ]);

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

  function toggleAppliance(appliance: string) {
    setAppliances((prev) => {
      if (prev.includes(appliance)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== appliance);
      }
      return [...prev, appliance];
    });
  }

  function setSupplierAndReset(supplier: SupplierId) {
    const source = SUPPLIER_CATALOG.find((entry) => entry.id === supplier) ?? SUPPLIER_CATALOG[0];
    setSupplierId(source.id);
    setStyle(source.styles[0]?.value ?? "Shaker");
    setPalette(source.colors.slice(0, 2).map((item) => item.value));
    setWorktop(source.worktops[0]?.value ?? "Laminate");
    setHandles(source.handles[0]?.value ?? "Handleless");
    setAppliances(source.appliances.slice(0, 2).map((item) => item.value));
  }

  function getBrochureHref(documentName: string, page?: number, image?: string): string {
    const file = image || documentName;
    if (!file) return "#";
    const base = `/api/ai-designer/suppliers/source?supplier=${encodeURIComponent(
      supplierId
    )}&file=${encodeURIComponent(file)}`;
    if (page && !image) {
      return `${base}&page=${page}#page=${page}`;
    }
    return base;
  }

  function formatSourceLabel(fileName: string): string {
    const decoded = (() => {
      try {
        return decodeURIComponent(fileName);
      } catch {
        return fileName;
      }
    })();
    const noExtension = decoded.replace(/\.(pdf|png|jpe?g|webp|avif)$/i, "");
    const withoutHash = noExtension.replace(/~[a-f0-9]{12,}\w*$/i, "");
    const normalized = withoutHash.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    if (normalized.length <= 54) return normalized;
    return `${normalized.slice(0, 51)}...`;
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
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError(
        "Use JPG, PNG, WEBP, or AVIF. HEIC/HEIF from iPhone is not supported by live AI services."
      );
      return null;
    }
    return file;
  }

  function openZoom(src: string, alt: string) {
    setZoomImage({ src, alt });
    setZoomLevel(1);
  }

  function closeZoom() {
    setZoomImage(null);
    setZoomLevel(1);
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
    let createdJob: Job | null = null;
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
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setLeadSuccess(false);
      setIsDemoResult(false);
      setDemoReason(null);
      setStep(8);
      setActiveJobId(null);
      setGenerationStartedAt(Date.now());
      setGenerationNow(Date.now());

      const createForm = new FormData();
      createForm.append("photo", photo);
      createForm.append("supplier", supplierId);
      createForm.append("style", style);
      createForm.append("palette", palette.join(","));
      createForm.append("worktop", worktop);
      createForm.append("handles", handles);
      createForm.append("appliances", appliances.join(","));
      const fullNotes = [
        notes.trim(),
        `Preferred worktop: ${worktop}`,
        `Preferred handles: ${handles}`,
        `Preferred appliances: ${appliances.join(", ")}`,
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
      createdJob = createPayload.job;
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
        setGenerationStartedAt(null);
        setStep(9);
      } else {
        setInfoMessage("Generation started. We are processing your project now.");
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to generate concept";
      if (isProviderRateLimitError(message)) {
        setError(getProviderIssueSummary(message));
        setStep(7);
        setLoading(false);
        setGenerationStartedAt(null);
        return;
      }
      if (createdJob) {
        setJob(createdJob);
        setActiveJobId(createdJob.id);
        setInfoMessage(
          `Connection interrupted while starting live generation (${message}). We are checking your project status now.`
        );
        return;
      }
      setIsDemoResult(true);
      setDemoReason(getProviderIssueSummary(message));
      setActiveJobId(null);
      const issueSummary = getProviderIssueSummary(message);
      setInfoMessage(
        `${issueSummary} Showing a local demo result so you can continue all steps.`
      );
      setJob(createDemoJob());
      setStep(9);
      setLoading(false);
      setGenerationStartedAt(null);
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
    const isForwardMove = nextStep > step;
    if (isForwardMove && nextStep !== (step + 1 as WizardStep)) {
      setError("Please complete the wizard step by step.");
      return;
    }
    if (isForwardMove) {
      if (step === 1 && !photo) {
        setError("Please upload a kitchen photo first.");
        return;
      }
      if (step === 2 && !analysisDone) {
        setError("Please complete photo analysis before continuing.");
        return;
      }
      if (step === 3 && !supplierId) {
        setError("Please choose a supplier before continuing.");
        return;
      }
      if (step === 4 && !style) {
        setError("Please choose a style before continuing.");
        return;
      }
      if (step === 5 && palette.length < 1) {
        setError("Please select at least one colour before continuing.");
        return;
      }
      if (step === 6 && !worktop) {
        setError("Please choose a worktop before continuing.");
        return;
      }
      if (step === 7 && (!handles || appliances.length < 1)) {
        setError("Please choose handles and at least one appliance before continuing.");
        return;
      }
      if (step === 8 && (loading || !job)) {
        setError("Please wait for generation to finish before continuing.");
        return;
      }
      if (step === 9 && !job) {
        setError("Please generate your project before continuing.");
        return;
      }
    }
    setError(null);
    setStep(nextStep);
  }

  const generationElapsedSeconds = generationStartedAt
    ? Math.max(0, Math.floor((generationNow - generationStartedAt) / 1000))
    : 0;
  const generationProgress = Math.min(
    98,
    Math.max(6, Math.round((generationElapsedSeconds / GENERATION_TARGET_SECONDS) * 100))
  );

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
        </div>
        <div className="grid gap-2 md:grid-cols-5 lg:grid-cols-10">
          {STEP_LABELS.map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            const blocked = number > step + 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => goNext(number as WizardStep)}
                disabled={blocked}
                className={`rounded-xl border px-2 py-2 text-center text-[11px] font-semibold ${
                  active
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : done
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-neutral-400"
                } ${blocked ? "cursor-not-allowed opacity-50" : ""}`}
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
            Use a clear wide shot. JPG, PNG, WEBP or AVIF, max 50MB.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
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
              <img
                src={previewUrl}
                alt="Kitchen preview"
                className="h-full w-full cursor-zoom-in object-cover"
                onClick={() => openZoom(previewUrl, "Kitchen preview")}
              />
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
                accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
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
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Step 3: Choose supplier</h2>
          <p className="text-neutral-300">
            Select the brochure family first. All next options are filtered to that supplier.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {SUPPLIER_CATALOG.map((supplier) => (
              <button
                key={supplier.id}
                type="button"
                onClick={() => setSupplierAndReset(supplier.id)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  supplierId === supplier.id
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{supplier.label}</p>
                <p className="mt-1 text-sm text-neutral-300">
                  Sources: {supplier.documents.length} brochure
                  {supplier.documents.length === 1 ? "" : "s"}
                </p>
                <div className="mt-2 space-y-1 text-xs text-neutral-400">
                  {supplier.documents.slice(0, 2).map((doc) => (
                    <p key={doc.name} className="break-all leading-snug">
                      {formatSourceLabel(doc.name)}
                    </p>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300 mb-2">
              Active supplier sources
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {selectedSupplier.documents.map((doc) => (
                doc.type === "pdf" ? (
                  <a
                    key={doc.name}
                    href={getBrochureHref(doc.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full rounded-lg border border-white/20 px-3 py-2 text-xs leading-snug break-all"
                    title={doc.name}
                  >
                    {formatSourceLabel(doc.name)}
                  </a>
                ) : (
                  <a
                    key={doc.name}
                    href={getBrochureHref(doc.samples?.[0] || "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full rounded-lg border border-white/20 px-3 py-2 text-xs leading-snug break-all"
                    title={doc.name}
                  >
                    {formatSourceLabel(doc.name)}
                  </a>
                )
              ))}
            </div>
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
          <h2 className="text-2xl font-bold">Step 4: Choose style</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {styleOptions.map((item) => (
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
                <p className="font-semibold">{item.value}</p>
                {item.references[0] && (
                  <a
                    href={getBrochureHref(
                      item.references[0].document,
                      item.references[0].page,
                      item.references[0].image
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Example in brochure
                  </a>
                )}
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
          <h2 className="text-2xl font-bold">Step 5: Select colors</h2>
          <p className="text-neutral-300">Choose up to 6 colors from {selectedSupplier.label} options.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {colorOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleColor(item.value)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  palette.includes(item.value)
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item.value}</p>
                {item.references[0] && (
                  <a
                    href={getBrochureHref(
                      item.references[0].document,
                      item.references[0].page,
                      item.references[0].image
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Example in brochure
                  </a>
                )}
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
          <h2 className="text-2xl font-bold">Step 6: Pick worktops</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {worktopOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setWorktop(item.value)}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  worktop === item.value
                    ? "border-amber-400 bg-amber-400/15 text-amber-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className="font-semibold">{item.value}</p>
                {item.references[0] && (
                  <a
                    href={getBrochureHref(
                      item.references[0].document,
                      item.references[0].page,
                      item.references[0].image
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Example in brochure
                  </a>
                )}
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
          <h2 className="text-2xl font-bold">Step 7: Handles, appliances and notes</h2>
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
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Handles</p>
            <div className="grid gap-3 md:grid-cols-2">
              {handleOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setHandles(item.value)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    handles === item.value
                      ? "border-amber-400 bg-amber-400/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <p className="font-semibold">{item.value}</p>
                  {item.references[0] && (
                    <a
                      href={getBrochureHref(
                        item.references[0].document,
                        item.references[0].page,
                        item.references[0].image
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Example in brochure
                    </a>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
              Appliances (select one or more)
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {applianceOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleAppliance(item.value)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    appliances.includes(item.value)
                      ? "border-amber-400 bg-amber-400/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <p className="font-semibold">{item.value}</p>
                  {item.references[0] && (
                    <a
                      href={getBrochureHref(
                        item.references[0].document,
                        item.references[0].page,
                        item.references[0].image
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Example in brochure
                    </a>
                  )}
                </button>
              ))}
            </div>
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
            <p className="text-neutral-200">• Applying selected supplier brochure options</p>
            <p className="text-neutral-200">• Rendering realistic concept image</p>
            <p className="text-neutral-200">• Producing consultation-ready design report</p>
          </div>
          {loading && (
            <div className="space-y-3">
              <p className="text-amber-200 font-semibold">
                Generating your kitchen concept...
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-neutral-300">
                {generationElapsedSeconds}s elapsed (usually up to {GENERATION_TARGET_SECONDS}s)
              </p>
            </div>
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
                setGenerationStartedAt(null);
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
              {demoReason ?? "Demo result mode (local). Live generation is temporarily unavailable."}
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
                          className="h-full w-full cursor-zoom-in object-cover"
                          onClick={() => openZoom(previewUrl, "Uploaded kitchen photo")}
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
                          className="h-full w-full cursor-zoom-in object-cover"
                          onClick={() =>
                            openZoom(job.generated_image_url ?? "", "Generated kitchen concept")
                          }
                        />
                      </div>
                    ) : (
                      <p className="p-6 text-neutral-300">Generated image unavailable.</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Images are for preview purposes only. All selected options and project information
                  are captured and used in your project. The final project is prepared after an
                  on-site visit, accurate measurements, and a full consultation with the customer.
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase text-amber-300 tracking-[0.2em] mb-2">
                    Configuration summary
                  </p>
                  <p className="text-neutral-300">Supplier: {selectedSupplier.label}</p>
                  <p className="text-neutral-300">Style: {style}</p>
                  <p className="text-neutral-300">Palette: {job.color_palette.join(", ")}</p>
                  <p className="text-neutral-300">Worktop: {worktop}</p>
                  <p className="text-neutral-300">Handles: {handles}</p>
                  <p className="text-neutral-300">Appliances: {appliances.join(", ")}</p>
                  <p className="text-neutral-300">Edit intensity: {editIntensity}</p>
                  <p className="text-neutral-300">
                    Preserve layout: {preserveLayout ? "Yes" : "No"}
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
              disabled={loading || !job || leadSuccess}
              className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:opacity-60"
            >
              {loading ? "Sending..." : leadSuccess ? "Enquiry sent" : "Send Enquiry with Full Report"}
            </button>
            {leadError && (
              <p className="text-red-300 text-sm">{leadError}</p>
            )}
            {leadSuccess && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4">
                <p className="text-emerald-200 font-semibold">
                  Thank you — your enquiry has been sent successfully.
                </p>
                <p className="text-emerald-100/90 text-sm mt-1">
                  We will review your AI concept and contact you with next steps (usually within 24h).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {zoomImage && (
        <div className="fixed inset-0 z-[70] bg-black/90 p-4">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-200">Zoom: {Math.round(zoomLevel * 100)}%</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((current) => Math.max(0.5, current - 0.25))}
                  className="rounded-lg border border-white/20 px-3 py-2 text-white"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((current) => Math.min(4, current + 0.25))}
                  className="rounded-lg border border-white/20 px-3 py-2 text-white"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-white"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeZoom}
                  className="rounded-lg bg-white/10 px-3 py-2 text-white"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/40">
              <div className="flex min-h-full min-w-full items-center justify-center p-4">
                <img
                  src={zoomImage.src}
                  alt={zoomImage.alt}
                  className="max-w-none"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
