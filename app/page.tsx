import Image from "next/image";
import Link from "next/link";

const heroImages = [
  "/projects/kitchen1.jpg",
  "/projects/kitchen2.jpg",
  "/projects/kitchen3.jpg",
  "/projects/kitchen4.jpg",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="DC Joinery logo"
              width={160}
              height={80}
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-200">
            <Link href="/kitchen-fitting" className="hover:text-amber-400 transition">
              Kitchen Fitting
            </Link>
            <Link href="/fit-and-supply" className="hover:text-amber-400 transition">
              Fit & Supply
            </Link>
            <Link href="/projects" className="hover:text-amber-400 transition">
              Projects
            </Link>
            <Link href="/contact" className="hover:text-amber-400 transition">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {heroImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="DC Joinery project"
            fill
            priority={index === 0}
            className={`object-cover hero-image hero-delay-${index}`}
          />
        ))}

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/45" />

        <div className="relative z-10 max-w-5xl text-center pt-24">
          <p className="uppercase tracking-[0.35em] text-xs md:text-sm text-amber-400 mb-6">
            Northern Ireland
          </p>

          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="DC Joinery logo"
              width={520}
              height={260}
              className="w-auto h-40 md:h-56"
              priority
            />
          </div>

          <p className="text-xl md:text-2xl text-neutral-100 mb-4">
            Kitchens, Bedrooms & Interior Renovations
          </p>

          <p className="max-w-2xl mx-auto text-neutral-200 mb-10">
            From kitchen fitting to full supply and installation, one point of contact from first idea to final finish.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/kitchen-fitting"
              className="bg-amber-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-amber-300 transition"
            >
              Kitchen Fitting Quote
            </Link>

            <Link
              href="/fit-and-supply"
              className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-neutral-200 transition"
            >
              Fit & Supply
            </Link>

            <Link
              href="/projects"
              className="border border-white/40 px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}