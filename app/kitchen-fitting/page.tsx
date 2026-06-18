import Link from "next/link";

export default function KitchenFittingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-6 py-10 border-b border-white/10 bg-black/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-semibold">
            ← Back to home
          </Link>

          <p className="text-sm text-neutral-400">
            DC Joinery
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
            Kitchen Fitting
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Kitchen Fitting Quote
          </h1>

          <p className="text-neutral-300 text-lg mb-10">
            Please complete the form below and upload your kitchen design and technical drawings with measurements. This helps us prepare an accurate fitting quote.
          </p>

          <form className="grid gap-8 bg-white text-black rounded-3xl p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-bold mb-5">Contact Details</h2>

              <div className="grid gap-5">
                <input className="input" placeholder="Full name" />
                <input className="input" placeholder="Address" />
                <input className="input" placeholder="Phone number" />
                <input className="input" placeholder="Email address" type="email" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-5">Kitchen Details</h2>

              <div className="grid gap-5">
                <select className="input">
                  <option>Kitchen type</option>
                  <option>Pre-built kitchen</option>
                  <option>Flat pack kitchen</option>
                </select>

                <select className="input">
                  <option>Flat pack waste removal?</option>
                  <option>Yes, remove packaging and waste (£80 additional service)</option>
                  <option>No, I will dispose of waste myself</option>
                  <option>Not applicable</option>
                </select>

                <input
                  className="input"
                  placeholder="Supplier, for example Wren, Howdens, B&Q, IKEA"
                />

                <select className="input">
                  <option>Worktop type</option>
                  <option>Laminate</option>
                  <option>Solid wood</option>
                  <option>Stone / Quartz</option>
                  <option>Compact laminate</option>
                  <option>Other</option>
                </select>

                <input
                  className="input"
                  placeholder="If other, please describe the worktop"
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-5">Documents</h2>

              <label className="block text-sm font-semibold mb-2">
                Upload kitchen design and technical drawings
              </label>

              <input
                className="block w-full border border-neutral-300 rounded-xl p-4"
                type="file"
                multiple
              />

              <p className="text-sm text-neutral-600 mt-3">
                Please include plans with measurements where possible.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-5">Installation Date</h2>

              <input
                className="input"
                placeholder="When will the kitchen be ready for installation?"
              />
            </div>

            <button className="bg-black text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition">
              Send Kitchen Fitting Quote Request
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}