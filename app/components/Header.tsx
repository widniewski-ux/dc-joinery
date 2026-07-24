"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/kitchen-fitting", label: "Kitchen Fitting" },
  { href: "/fit-and-supply", label: "Fit & Supply" },
  { href: "/ai-kitchen-designer", label: "AI Kitchen Designer" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/share/1Dfc738uhx/?mibextid=wwXIfr",
    alt: "Facebook",
    icon: "/logos/Facebook.png",
  },
  {
    href: "https://www.instagram.com/dawid_joinery__dc?igsh=dnZrZG5xcnpmZ3Bl&utm_source=qr",
    alt: "Instagram",
    icon: "/logos/Instagram.png",
  },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
  { value: "ro", label: "Romana" },
  { value: "pt", label: "Portugues" },
  { value: "uk", label: "Ukrainska" },
] as const;

type LanguageCode = (typeof languageOptions)[number]["value"];
const DEFAULT_LANGUAGE: LanguageCode = "en";

function parseGoogTransCookie(raw: string | undefined): LanguageCode | null {
  if (!raw) return null;
  const match = raw.match(/\/[a-z-]+\/([a-z-]+)/i);
  if (!match) return null;
  const candidate = match[1].toLowerCase();
  return languageOptions.some((option) => option.value === candidate)
    ? (candidate as LanguageCode)
    : null;
}

function writeGoogTransCookie(value: string, expires: string, domain?: string): void {
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `googtrans=${value};path=/;expires=${expires}${domainPart}`;
}

function persistLanguageCookie(nextLanguage: LanguageCode): void {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  const cookieValue = `/en/${nextLanguage}`;
  writeGoogTransCookie(cookieValue, expires);
  writeGoogTransCookie(cookieValue, expires, window.location.hostname);
  writeGoogTransCookie(cookieValue, expires, `.${window.location.hostname}`);
}

function applyGoogleTranslateLanguage(nextLanguage: LanguageCode): boolean {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) {
    return false;
  }

  combo.value = nextLanguage === DEFAULT_LANGUAGE ? "" : nextLanguage;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const saved = window.localStorage.getItem("dcjoinery-language");
  const savedLanguage = languageOptions.some((option) => option.value === saved)
    ? (saved as LanguageCode)
    : null;
  if (savedLanguage) {
    return savedLanguage;
  }

  const cookieMatch = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("googtrans="))
    ?.split("=")[1];
  return parseGoogTransCookie(cookieMatch) ?? DEFAULT_LANGUAGE;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);

  function scheduleLanguageApply(nextLanguage: LanguageCode) {
    let attempts = 0;
    const maxAttempts = 20;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      if (applyGoogleTranslateLanguage(nextLanguage) || attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 200);
  }

  function handleLanguageChange(nextLanguage: LanguageCode) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("dcjoinery-language", nextLanguage);
    persistLanguageCookie(nextLanguage);

    if (!applyGoogleTranslateLanguage(nextLanguage)) {
      scheduleLanguageApply(nextLanguage);
    }
  }

  useEffect(() => {
    if (language === DEFAULT_LANGUAGE) {
      return;
    }
    if (!applyGoogleTranslateLanguage(language)) {
      scheduleLanguageApply(language);
    }
  }, [language]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="DC Joinery Logo"
            width={110}
            height={65}
            className="h-12 w-auto"
          />
          <span className="hidden text-sm font-semibold uppercase tracking-[0.35em] text-amber-400 sm:block">
            DC Joinery
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white transition hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3">
            {socialLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <Image src={item.icon} alt={item.alt} width={24} height={24} className="h-5 w-5 object-contain" />
              </Link>
            ))}

            <Link
              href="https://wa.me/447500779126"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
            >
              WhatsApp
            </Link>
            <label className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-neutral-200">
              <span className="uppercase tracking-[0.15em]">Lang</span>
              <select
                value={language}
                onChange={(event) => handleLanguageChange(event.target.value as LanguageCode)}
                className="bg-transparent text-sm text-white outline-none"
                aria-label="Select language"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-neutral-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <label className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-neutral-200">
            <span className="uppercase tracking-[0.15em]">Lang</span>
            <select
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value as LanguageCode)}
              className="bg-transparent text-sm text-white outline-none"
              aria-label="Select language"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-neutral-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="https://wa.me/447500779126"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-300"
          >
            WhatsApp
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-1/2 h-[2px] w-5 bg-current transition duration-300 ${menuOpen ? "rotate-45" : "-translate-y-1.5"}`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[2px] w-5 bg-current transition duration-300 ${menuOpen ? "opacity-0" : "translate-y-0"}`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[2px] w-5 bg-current transition duration-300 ${menuOpen ? "-rotate-45" : "translate-y-1.5"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${menuOpen ? "max-h-[400px]" : "max-h-0"}`}>
        <div className="px-6 pb-5">
          <div className="flex flex-col gap-4 pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            {socialLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <Image src={item.icon} alt={item.alt} width={22} height={22} className="h-5 w-5 object-contain" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
