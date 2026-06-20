import Image from "next/image";
import Link from "next/link";

const heroImages = [
  "/projects/kitchen1.jpg",
  "/projects/kitchen5.jpg",
  "/projects/kitchen10.jpg",
  "/projects/kitchen13.jpeg",
  "/projects/kitchen25.jpeg",
  "/projects/kitchen33.jpeg",
];

const featuredProjects = [
  "/projects/kitchen1.jpg",
  "/projects/kitchen5.jpg",
  "/projects/kitchen10.jpg",
  "/projects/kitchen25.jpeg",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <Image
              key={image}
              src={image}
              alt="DC Joinery project"
              fill
              priority={index === 0}
              className={`object-cover hero-slide hero-slide-${index + 1}`}
            />
          ))}

          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60" />
        </div>

        <nav className="relative z-20 px-6 py-6 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="DC Joinery Logo"
                width={110}
                height={60}
                className="h-12 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
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

            <Link
              href="/contact"
              className="hidden md:inline-block bg-amber-400 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-300 transition"
            >
              Get a Quote
            </Link>
          </div>
        </nav>

        <div className="relative z-10 px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.45em] text-amber-400 text-sm mb-6">
              Northern Ireland
            </p>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] max-w-5xl mb-8">
              Kitchens. Bedrooms. Bespoke Joinery.
            </h1>

            <p className="text-neutral-200 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              Professional kitchen fitting, supply & installation, fitted bedrooms and bespoke joinery across Northern Ireland.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/kitchen-fitting"
                className="bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-center hover:bg-amber-300 transition"
              >
                Kitchen Fitting Quote
              </Link>

              <Link
                href="/fit-and-supply"
                className="bg-white text-black px-8 py-4 rounded-full font-bold text-center hover:bg-neutral-200 transition"
              >
                Fit & Supply
              </Link>

              <Link
                href="/projects"
                className="border border-white/40 px-8 py-4 rounded-full font-bold text-center hover:bg-white hover:text-black transition"
              >
                View Projects
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-neutral-300">
              <a href="https://facebook.com" target="_blank" className="hover:text-amber-400 transition">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" className="hover:text-amber-400 transition">
                Instagram
              </a>
              <a href="tel:07500779126" className="hover:text-amber-400 transition">
                07500 779126
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-y border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            ["Professional Installation", "High quality fitting with attention to detail."],
            ["Reliable Service", "Clean, dependable and organised work."],
            ["One Point of Contact", "From first idea to final finish."],
            ["NI Based", "Local joinery services across Northern Ireland."],
          ].map(([title, text]) => (
            <div key={title} className="border border-white/10 rounded-3xl p-6 bg-white/[0.03]">
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
                Portfolio
              </p>
              <h2 className="text-4xl md:text-5xl font-bold">
                Recent Projects
              </h2>
            </div>

            <Link href="/projects" className="hidden md:block text-amber-400 font-bold hover:text-amber-300 transition">
              View all projects →
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {featuredProjects.map((image) => (
              <Link
                key={image}
                href="/projects"
                className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 group"
              >
                <Image
                  src={image}
                  alt="DC Joinery project"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}