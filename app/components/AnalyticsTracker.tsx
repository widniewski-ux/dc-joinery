"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = () => {
      if (typeof window === "undefined") return;
      trackEvent("page_view", {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.origin + pathname,
      });
    };

    trackPageView();
    window.addEventListener("dc-analytics-ready", trackPageView);
    return () => window.removeEventListener("dc-analytics-ready", trackPageView);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest("[data-analytics]") as HTMLElement | null;

      if (!element) {
        return;
      }

      const eventName = element.dataset.analytics || "cta_click";
      const label = element.dataset.analyticsLabel || element.textContent?.trim() || eventName;
      const location = element.dataset.analyticsLocation || window.location.pathname;

      trackEvent(eventName, {
        cta_label: label,
        cta_location: location,
      });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
