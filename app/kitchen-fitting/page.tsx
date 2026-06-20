import Link from "next/link";
import { sendKitchenFittingForm } from "../actions";

export default function KitchenFittingPage() {
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
              Kitchen Fitting
            </p>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Kitchen Fitting Quote
            </h1>

            <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
              For an accurate quote, please upload your kitchen plans, measurements or technical drawings where possible.
            </p>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">
                What helps with pricing?
              </h2>

              <div className="grid gap-3 text-neutral-300">
                <p>✔ Original supplier plans</p>
                <p>✔ Technical drawings with measurements</p>
                <p>✔ Flat pack or pre-built information</p>
                <p>✔ Worktop type and appliance details</p>
                <p>✔ Preferred installation date</p>
              </div>
            </div>

            <div className="bg-amber-400 text-black rounded-3xl p-6">
              <h3 className="font-bold text-xl mb-2">
                Dry fit installation
              </h3>
              <p className="text-black/80">
                Appliance fitting can be included, but electrical, gas and plumbing connections must be completed by qualified trades.
              </p>
            </div>
          </div>

          <form
            action={sendKitchenFittingForm}
            className="bg-white text-black rounded-[2rem] p-6 md:p-10 shadow-2xl border border-white/10"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-500 mb-3">
                Quote request
              </p>
              <h2 className="text-3xl font-bold mb-3">
                Kitchen Details
              </h2>
              <p className="text-neutral-600">
                The more information you add, the faster and more accurate the quote will be.
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
                <h3 className="text-xl font-bold mb-4">Kitchen Details</h3>

                <div className="grid gap-5">
                  <select name="kitchenType" className="input" required>
                    <option value="">Kitchen type</option>
                    <option>Pre-built kitchen</option>
                    <option>Flat pack kitchen</option>
                    <option>Not sure yet</option>
                  </select>

                  <select name="wasteRemoval" className="input" required>
                    <option value="">Flat pack waste removal?</option>
                    <option>Yes, remove packaging and waste (£80 additional service)</option>
                    <option>No, I will dispose of waste myself</option>
                    <option>Not applicable</option>
                  </select>

                  <select name="supplier" className="input" required>
                    <option value="">Kitchen supplier</option>
                    <option>Wren</option>
                    <option>Howdens</option>
                    <option>B&Q</option>
                    <option>IKEA</option>
                    <option>Local bespoke joiner</option>
                    <option>Other</option>
                    <option>Not sure yet</option>
                  </select>

                  <select name="worktop" className="input" required>
                    <option value="">Worktop type</option>
                    <option>Laminate</option>
                    <option>Solid wood</option>
                    <option>Stone / Quartz</option>
                    <option>Compact laminate</option>
                    <option>Other</option>
                  </select>

                  <select name="appliances" className="input">
                    <option value="">Appliances to be fitted?</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Some appliances only</option>
                    <option>Not sure yet</option>
                  </select>

                  <input
                    name="otherWorktop"
                    className="input"
                    placeholder="Anything unusual? Worktops, appliances, panels, changes etc."
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Documents</h3>

                <label className="block text-sm font-semibold mb-2">
                  Upload kitchen plans, measurements or drawings
                </label>

                <input
                  name="documents"
                  className="block w-full border border-neutral-300 rounded-xl p-4 bg-white"
                  type="file"
                  multiple
                />

                <p className="text-sm text-neutral-600 mt-3">
                  PDF, JPG or PNG plans are best. Please include measurements where possible.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Installation Date</h3>

                <input
                  name="installationDate"
                  className="input"
                  placeholder="When will the kitchen be ready for installation?"
                  required
                />
              </section>

              <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
                Send Kitchen Fitting Quote Request
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