import Image from "next/image";
import Link from "next/link";

const heroImages = [
  "/projects/kitchen25.jpeg",
  "/projects/kitchen1.jpg",
  "/projects/kitchen5.jpg",
  "/projects/kitchen10.jpg",
  "/projects/kitchen33.jpeg",
];

const recentProjects = [
  "/projects/kitchen1.jpg",
  "/projects/kitchen5.jpg",
  "/projects/kitchen25.jpeg",
  "/projects/kitchen33.jpeg",
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
              alt="DC Joinery kitchen project"
              fill
              priority={index === 0}
              className={`object-cover hero-slide hero-slide-${index + 1}`}
            />
          ))}

          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
        </div>

        <nav className="relative z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="DC Joinery Logo"
                width={110}
                height={65}
                className="h-12 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
              <Link href="/" className="text-amber-400 border-b border-amber-400 pb-2">
                Home
              </Link>
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

              <a href="https://facebook.com" target="_blank" className="hover:text-amber-400 transition">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" className="hover:text-amber-400 transition">
                Instagram
              </a>

              <Link
                href="/contact"
                className="bg-amber-400 text-black px-7 py-3 rounded-xl font-bold hover:bg-amber-300 transition"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 px-6 pt-14 pb-14">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.5em] text-amber-400 text-sm mb-7">
              Northern Ireland
            </p>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1] max-w-3xl mb-8">
              KITCHENS.<br />
              BEDROOMS.<br />
              BESPOKE JOINERY.
            </h1>

            <p className="text-neutral-100 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              From kitchen fitting to full supply and installation, one point of contact from first idea to final finish.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-14">
              <Link href="/kitchen-fitting" className="bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-center hover:bg-amber-300 transition">
                Kitchen Fitting Quote
              </Link>
              <Link href="/fit-and-supply" className="border border-white/40 px-8 py-4 rounded-full font-bold text-center hover:bg-white hover:text-black transition">
                Fit & Supply
              </Link>
              <Link href="/projects" className="border border-white/40 px-8 py-4 rounded-full font-bold text-center hover:bg-white hover:text-black transition">
                View Projects
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm text-neutral-200">
              <span className="uppercase tracking-[0.4em] text-xs text-neutral-300">Follow us</span>
              <a href="https://facebook.com" target="_blank" className="hover:text-amber-400 transition">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" className="hover:text-amber-400 transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-neutral-950 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            ["Professional Installation", "High quality fitting with attention to detail."],
            ["Reliable Service", "Clean, dependable and on time, every time."],
            ["One Point Of Contact", "From first idea to final finish, we manage it all."],
            ["Northern Ireland Based", "Local, trusted and proud of our work."],
          ].map(([title, text]) => (
            <div key={title} className="text-center border-r border-white/10 last:border-r-0 px-6">
              <div className="text-amber-400 text-3xl mb-5">◆</div>
              <h3 className="uppercase text-lg font-semibold tracking-wide mb-4">{title}</h3>
              <p className="text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
              RECENT PROJECTS
            </h2>

            <Link href="/projects" className="text-amber-400 font-semibold hover:text-amber-300 transition">
              View all projects →
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {recentProjects.map((image) => (
              <Link key={image} href="/projects" className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={image}
                  alt="Recent DC Joinery project"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-neutral-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400 mb-3">
              Quick contact
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Want to discuss your project?
            </h2>
            <p className="text-neutral-400 mt-3">
              Send a message on WhatsApp and I’ll get back to you as soon as possible.
            </p>
          </div>

          <a
            href="https://wa.me/447500779126"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-center hover:bg-amber-300 transition"
          >
            Message on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}