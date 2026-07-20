"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/kitchen-fitting", label: "Kitchen Fitting" },
  { href: "/fit-and-supply", label: "Fit & Supply" },
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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          </div>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
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
