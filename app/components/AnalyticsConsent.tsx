"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import AnalyticsTracker from "./AnalyticsTracker";

type ConsentState = "unknown" | "accepted" | "declined";

const CONSENT_KEY = "dc_joinery_analytics_consent";

function readConsent(): ConsentState {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") {
    return value;
  }

  return "unknown";
}

function writeConsent(value: ConsentState): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Best-effort persistence only.
  }
}

type AnalyticsConsentProps = {
  googleAnalyticsId: string;
};

export default function AnalyticsConsent({ googleAnalyticsId }: AnalyticsConsentProps) {
  const [consent, setConsent] = useState<ConsentState>(() => readConsent());
  const gaEnabled = consent === "accepted";

  useEffect(() => {
    const acceptButton = document.getElementById("analytics-accept");
    const declineButton = document.getElementById("analytics-decline");

    if (!acceptButton || !declineButton) {
      return;
    }

    const handleDecision = (value: ConsentState) => {
      const banner = document.getElementById("analytics-consent-banner");
      if (banner) {
        banner.remove();
      }
      writeConsent(value);
      setConsent(value);
    };

    const handleAccept = () => handleDecision("accepted");
    const handleDecline = () => handleDecision("declined");

    acceptButton.addEventListener("click", handleAccept);
    declineButton.addEventListener("click", handleDecline);

    return () => {
      acceptButton.removeEventListener("click", handleAccept);
      declineButton.removeEventListener("click", handleDecline);
    };
  }, []);

  return (
    <>
      {gaEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_path: window.location.pathname,
                page_title: document.title,
                send_page_view: false,
              });
            `}
          </Script>
          <AnalyticsTracker />
        </>
      )}

      {consent === "unknown" && (
        <div
          id="analytics-consent-banner"
          className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-5xl rounded-3xl border border-white/10 bg-black/95 p-4 shadow-2xl shadow-black/40 backdrop-blur md:flex md:items-center md:justify-between md:gap-6 md:p-5"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-white">Analytics cookies</p>
            <p className="mt-1 text-sm text-neutral-300">
              We use analytics to understand site performance and improve enquiries.
              Accept if you are happy for Google Analytics to run.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
            <button
              id="analytics-decline"
              type="button"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 cursor-pointer"
            >
              Decline
            </button>
            <button
              id="analytics-accept"
              type="button"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 cursor-pointer"
            >
              Accept analytics
            </button>
          </div>
        </div>
      )}

      {consent === "declined" && (
        <button
          type="button"
          onClick={() => setConsent("unknown")}
          className="fixed bottom-4 left-4 z-[60] rounded-full border border-white/10 bg-black/90 px-4 py-2 text-xs font-semibold text-neutral-200 shadow-2xl shadow-black/40 backdrop-blur transition hover:bg-black"
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
