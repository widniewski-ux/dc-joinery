"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const trackPageView = () => {
      if (typeof window === "undefined") return;
      trackEvent("page_view", {
        page_path: `${pathname}${search ? `?${search}` : ""}`,
        page_title: document.title,
        page_location: window.location.href,
      });
    };

    trackPageView();
  }, [pathname, search]);

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
