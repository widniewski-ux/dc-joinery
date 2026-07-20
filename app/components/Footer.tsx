import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="DC Joinery Logo"
              width={110}
              height={65}
              className="h-12 w-auto"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">
              DC Joinery
            </span>
          </div>
          <p className="max-w-lg text-neutral-300 leading-relaxed">
            Professional kitchen fitting and bespoke joinery in Northern Ireland. Over 7 years of UK kitchen experience and more than 30 kitchens installed with trusted trade coordination.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick links</h3>
          <div className="space-y-3 text-sm">
            <Link href="/" className="block transition hover:text-white">
              Home
            </Link>
            <Link href="/kitchen-fitting" className="block transition hover:text-white">
              Kitchen Fitting
            </Link>
            <Link href="/fit-and-supply" className="block transition hover:text-white">
              Fit & Supply
            </Link>
            <Link href="/projects" className="block transition hover:text-white">
              Projects
            </Link>
            <Link href="/contact" className="block transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>Phone: <a href="tel:+447500779126" className="text-white hover:text-amber-400">07500 779126</a></p>
            <p>Email: <a href="mailto:info@dcjoinery.uk" className="text-white hover:text-amber-400">info@dcjoinery.uk</a></p>
            <p>Location: Northern Ireland</p>
            <p className="mt-3 text-neutral-500">
              Ready to discuss your kitchen or joinery project? Send a quick message on WhatsApp or use the contact form.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} DC Joinery. Built for a professional customer experience.
      </div>
    </footer>
  );
}
