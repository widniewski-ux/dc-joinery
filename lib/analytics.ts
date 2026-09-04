export type CampaignParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function buildCampaignUrl(url: string, params: CampaignParams): string {
  try {
    const targetUrl = new URL(url, "https://www.dcjoineryni.uk");
    const entries: Array<[string, string]> = [
      ["utm_source", params.source],
      ["utm_medium", params.medium],
      ["utm_campaign", params.campaign],
    ];

    if (params.content) entries.push(["utm_content", params.content]);
    if (params.term) entries.push(["utm_term", params.term]);

    for (const [key, value] of entries) {
      targetUrl.searchParams.set(key, value);
    }

    return targetUrl.toString();
  } catch {
    return url;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params ?? {});
}

export function trackFormSubmit(formName: string, formType: "lead" | "quote" | "contact"): void {
  trackEvent("form_submit", {
    form_name: formName,
    form_type: formType,
    event_category: "lead_generation",
  });
}

export function trackLeadSuccess(formName: string): void {
  trackEvent("lead_generated", {
    form_name: formName,
    event_category: "lead_generation",
  });
}
