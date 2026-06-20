import Link from "next/link";
import { sendContactForm } from "../actions";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-6 py-8 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-semibold hover:text-amber-300 transition">
            ← Back to home
          </Link>

          <p className="text-sm text-neutral-400">DC Joinery</p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
              Contact
            </p>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Let&apos;s Talk About Your Project
            </h1>

            <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
              Whether you need a kitchen fitted, a full kitchen renovation, fitted bedroom furniture or bespoke joinery, send a few details and I&apos;ll get back to you.
            </p>

            <div className="grid gap-4">
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400 mb-2">
                  Phone
                </p>
                <a href="tel:07500779126" className="text-2xl font-bold hover:text-amber-400 transition">
                  07500 779126
                </a>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400 mb-2">
                  Email
                </p>
                <a href="mailto:info@dcjoinery.uk" className="text-2xl font-bold hover:text-amber-400 transition">
                  info@dcjoinery.uk
                </a>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400 mb-3">
                  Services
                </p>
                <div className="grid gap-2 text-neutral-300">
                  <p>✔ Kitchen Fitting</p>
                  <p>✔ Kitchen Supply & Installation</p>
                  <p>✔ Kitchen Renovations</p>
                  <p>✔ Fitted Bedrooms</p>
                  <p>✔ Bespoke Joinery</p>
                </div>
              </div>
            </div>
          </div>

          <form
            action={sendContactForm}
            className="bg-white text-black rounded-[2rem] p-6 md:p-10 shadow-2xl border border-white/10"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-500 mb-3">
                Enquiry form
              </p>
              <h2 className="text-3xl font-bold mb-3">
                Send a Message
              </h2>
              <p className="text-neutral-600">
                Add as much detail as possible. Photos, plans and drawings can be sent after first contact if needed.
              </p>
            </div>

            <div className="grid gap-5">
              <input name="name" className="input" placeholder="Full name" required />
              <input name="phone" className="input" placeholder="Phone number" required />
              <input name="email" className="input" placeholder="Email address" type="email" required />

              <textarea
                name="message"
                className="input min-h-44"
                placeholder="Tell us about your project, location and preferred timeframe"
                required
              />

              <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
                Send Message
              </button>

              <p className="text-xs text-neutral-500 text-center">
                Your details are used only to respond to your enquiry.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}