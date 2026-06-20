import Link from "next/link";
import { sendFitAndSupplyForm } from "../actions";

export default function FitAndSupplyPage() {
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
              Fit & Supply
            </p>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Supply & Installation Consultation
            </h1>

            <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
              Looking for a full kitchen, bedroom or bespoke joinery solution? Tell us what you need and we&apos;ll discuss design, supply and installation options.
            </p>

            <div className="grid gap-4">
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
                <h2 className="text-2xl font-bold mb-4">What can be included?</h2>
                <div className="grid gap-3 text-neutral-300">
                  <p>✔ Kitchen supply & fitting</p>
                  <p>✔ Bespoke joinery supply & fitting</p>
                  <p>✔ Removal of old kitchen if required</p>
                  <p>✔ Electrician, plumber or tiler coordination</p>
                  <p>✔ Worktop and finish options</p>
                </div>
              </div>

              <div className="bg-amber-400 text-black rounded-3xl p-6">
                <h3 className="font-bold text-xl mb-2">
                  Best for full projects
                </h3>
                <p className="text-black/80">
                  Use this form if you need help from idea and design through to supply, fitting and final finish.
                </p>
              </div>
            </div>
          </div>

          <form
            action={sendFitAndSupplyForm}
            className="bg-white text-black rounded-[2rem] p-6 md:p-10 shadow-2xl border border-white/10"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-500 mb-3">
                Consultation request
              </p>
              <h2 className="text-3xl font-bold mb-3">
                Project Details
              </h2>
              <p className="text-neutral-600">
                Add a few details and we&apos;ll contact you to discuss the next step.
              </p>
            </div>

            <div className="grid gap-8">
              <section>
                <h3 className="text-xl font-bold mb-4">Contact Details</h3>

                <div className="grid gap-5">
                  <input name="name" className="input" placeholder="Full name" required />
                  <input name="address" className="input" placeholder="Full address / postcode" required />
                  <input name="phone" className="input" placeholder="Phone number" required />
                  <input name="email" className="input" placeholder="Email address" type="email" required />
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Project Details</h3>

                <div className="grid gap-5">
                  <select name="projectType" className="input" required>
                    <option value="">Project type</option>
                    <option>Kitchen</option>
                    <option>Full kitchen renovation</option>
                    <option>Bedroom / fitted wardrobes</option>
                    <option>Utility room</option>
                    <option>Media wall</option>
                    <option>Bespoke joinery</option>
                    <option>Other</option>
                  </select>

                  <select name="hasDesign" className="input" required>
                    <option value="">Do you already have a design?</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Not sure yet</option>
                  </select>

                  <select name="supplier" className="input" required>
                    <option value="">Preferred supplier</option>
                    <option>Wren</option>
                    <option>Howdens</option>
                    <option>B&Q</option>
                    <option>IKEA</option>
                    <option>Local bespoke joiner</option>
                    <option>Not sure yet</option>
                  </select>

                  <select name="timeframe" className="input">
                    <option value="">Preferred timeframe</option>
                    <option>As soon as possible</option>
                    <option>Within 1 month</option>
                    <option>1-3 months</option>
                    <option>3+ months</option>
                    <option>Flexible</option>
                  </select>

                  <select name="trades" className="input">
                    <option value="">Do you need other trades organised?</option>
                    <option>Yes - electrician</option>
                    <option>Yes - plumber</option>
                    <option>Yes - tiler</option>
                    <option>Yes - multiple trades</option>
                    <option>No</option>
                    <option>Not sure yet</option>
                  </select>

                  <textarea
                    name="message"
                    className="input min-h-40"
                    placeholder="Briefly describe what you would like done, your budget range if known, and anything important"
                    required
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Photos / Inspiration</h3>

                <input
                  name="photos"
                  className="block w-full border border-neutral-300 rounded-xl p-4 bg-white"
                  type="file"
                  multiple
                />

                <p className="text-sm text-neutral-600 mt-3">
                  Upload room photos, existing kitchen/bedroom photos, drawings or inspiration images.
                </p>
              </section>

              <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
                Request Consultation
              </button>

              <p className="text-xs text-neutral-500 text-center">
                Your enquiry will be sent directly to DC Joinery.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}