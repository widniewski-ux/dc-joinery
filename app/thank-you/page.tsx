import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
          Message Sent
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Thank you
        </h1>

        <p className="text-neutral-300 text-lg mb-10">
          Your message has been sent successfully. DC Joinery will get back to you shortly.
        </p>

        <Link
          href="/"
          className="inline-block bg-amber-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-amber-300 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}