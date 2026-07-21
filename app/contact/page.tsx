import Link from "next/link";
import { sendContactForm } from "../actions";

export const metadata = {
  title: "Contact DC Joinery | Free Quote for Kitchen Fitting in Northern Ireland",
  description: "Contact DC Joinery for kitchen fitting, kitchen supply and bespoke joinery projects across Northern Ireland.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-6 py-10 border-b border-white/10 bg-black/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-semibold">
            ← Back to home
          </Link>

          <p className="text-sm text-neutral-400">DC Joinery</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
            Contact
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get In Touch for a Free UK Quote
          </h1>

          <p className="text-neutral-300 text-lg mb-10">
            Looking for a kitchen fitter, kitchen renovation, fitted bedroom or bespoke joinery project?
            Complete the form below and we&apos;ll get back to you, usually within 24 hours.
          </p>

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-10">
            <h2 className="text-2xl font-bold mb-4">A little about me</h2>
            <p className="text-neutral-600 leading-relaxed">
              I trained as a furniture joiner in Poland and worked in production and installation. After moving abroad, I built my experience step by step and returned to my real passion: kitchen fitting and full project coordination.
            </p>
            <p className="text-neutral-600 leading-relaxed mt-4">
              I have 7 years of experience in furniture production and installations, plus over 30 installations completed in the UK. I offer kitchen fitting and full project logistics from design and orders to electric, plumbing, gas and tiling coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-4">Contact Details</h2>

              <div className="space-y-3 text-neutral-300">
                <p>📞 Phone: 07500779126</p>
                <p>✉️ Email: info@dcjoinery.uk</p>
                <p>📍 Northern Ireland</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-4">Services</h2>

              <div className="space-y-3 text-neutral-300">
                <p>✔ Kitchen Fitting</p>
                <p>✔ Kitchen Supply & Installation</p>
                <p>✔ Kitchen Renovations</p>
                <p>✔ Fitted Bedrooms</p>
                <p>✔ Bespoke Joinery</p>
              </div>
            </div>
          </div>

          <form
            action={sendContactForm}
            className="form-container grid gap-5 bg-white text-black rounded-3xl p-8 md:p-10"
          >
            <input type="text" name="botField" autoComplete="off" className="hidden" />
            <input
              name="name"
              className="input"
              placeholder="Full name"
              required
            />

            <input
              name="phone"
              className="input"
              placeholder="Phone number"
              required
            />

            <input
              name="email"
              className="input"
              placeholder="Email address"
              type="email"
              required
            />

            <textarea
              name="message"
              className="input min-h-40"
              placeholder="Tell us about your project"
              required
            />

            <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}