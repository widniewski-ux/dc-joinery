"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import AnalyticsTracker from "./AnalyticsTracker";
const preferenceKey = "dc-analytics-consent-v1";
export default function CookiePreferences({ nonce }: { nonce: string }) {
  const [consent, setConsent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(preferenceKey); } catch { /* Storage can be disabled. */ }
    const timer = setTimeout(() => { setConsent(saved); setOpen(!saved); }, 0);
    return () => clearTimeout(timer);
  }, []);
  function choose(value: "accepted" | "rejected") {
    try { localStorage.setItem(preferenceKey, value); } catch { /* Choice still applies to this view. */ }
    const wasAccepted = consent === "accepted";
    setConsent(value); setOpen(false);
    if (value === "rejected") {
      // Remove GA cookies on this host and parent domains, then unload analytics.
      const domains = location.hostname.split(".").map((_, i, parts) => parts.slice(i).join("."));
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (!name.startsWith("_ga") && name !== "_gid" && !name.startsWith("_gat")) continue;
        document.cookie = `${name}=; Max-Age=0; path=/`;
        for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
      }
      if (wasAccepted) location.reload();
    }
  }
  const allowAnalytics = consent === "accepted" && !pathname.startsWith("/admin");
  return <>
    {allowAnalytics && <>
      <Script nonce={nonce} src="https://www.googletagmanager.com/gtag/js?id=G-9KQJMDZTE6" strategy="afterInteractive" />
      <Script nonce={nonce} id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-9KQJMDZTE6',{page_location:location.origin+location.pathname,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});`}</Script>
      <AnalyticsTracker />
    </>}
    <button type="button" onClick={() => setOpen(true)} className="bg-neutral-950 py-3 text-sm text-neutral-300 underline">Cookie preferences</button>
    {open && <section aria-label="Cookie preferences" className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/20 bg-neutral-950 p-6 text-white shadow-2xl">
      <div className="mx-auto max-w-4xl space-y-4">
        <p>We use essential storage to keep your project secure and remember your choice. Optional Google Analytics helps us understand website visits. <a href="/privacy" className="underline">Privacy and cookies</a>.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => choose("rejected")} className="rounded-lg border border-white/40 px-5 py-3">Reject optional cookies</button>
          <button onClick={() => choose("accepted")} className="rounded-lg border border-white/40 px-5 py-3">Accept analytics</button>
        </div>
      </div>
    </section>}
  </>;
}
