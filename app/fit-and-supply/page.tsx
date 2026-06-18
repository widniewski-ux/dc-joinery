import Link from "next/link";
import { sendFitAndSupplyForm } from "../actions";

export default function FitAndSupplyPage() {
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
            Fit & Supply
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Supply & Installation Consultation
          </h1>

          <p className="text-neutral-300 text-lg mb-10">
            Tell us about your project. After submitting this form, Dawid from DC Joinery will contact you to arrange a site visit and discuss design, supply and installation options.
          </p>

          <form action={sendFitAndSupplyForm} className="grid gap-8 bg-white text-black rounded-3xl p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-bold mb-5">Contact Details</h2>

              <div className="grid gap-5">
                <input name="name" className="input" placeholder="Full name" required />
                <input name="address" className="input" placeholder="Address" required />
                <input name="phone" className="input" placeholder="Phone number" required />
                <input name="email" className="input" placeholder="Email address" type="email" required />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-5">Project Details</h2>

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

                <textarea
                  name="message"
                  className="input min-h-36"
                  placeholder="Briefly describe what you would like done"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-5">Photos / Inspiration</h2>

              <input
                name="photos"
                className="block w-full border border-neutral-300 rounded-xl p-4"
                type="file"
                multiple
              />

              <p className="text-sm text-neutral-600 mt-3">
                You can upload photos of the room, existing kitchen/bedroom, or inspiration images.
              </p>
            </div>

            <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
              Request Consultation
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}