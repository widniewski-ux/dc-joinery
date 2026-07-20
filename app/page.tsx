import Image from "next/image";
import Link from "next/link";

const facebookUrl = "https://www.facebook.com/share/1Dfc738uhx/?mibextid=wwXIfr";
const instagramUrl = "https://www.instagram.com/dawid_joinery__dc?igsh=dnZrZG5xcnpmZ3Bl&utm_source=qr";
const whatsappUrl = "https://wa.me/447500779126";

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

const stats = [
  ["35+", "Project Photos"],
  ["6+", "Years Experience"],
  ["Free", "Quotes"],
  ["NI", "Based"],
];

const trustPoints = [
  ["Professional Installation", "High quality fitting with attention to detail."],
  ["Reliable Service", "Clean, dependable and on time, every time."],
  ["One Point Of Contact", "From first idea to final finish, we manage it all."],
  ["Northern Ireland Based", "Local, trusted and proud of our work."],
];

const suppliers = [
  { name: "Wren", logo: "/logos/Wren.jpeg" },
  { name: "Howdens", logo: "/logos/Howdens.png" },
  { name: "IKEA", logo: "/logos/Ikea.svg" },
  { name: "B&Q", logo: "/logos/bq.png" },
  { name: "Bespoke Joinery", logo: "/logo.png" },
];

const reviews = [
  {
    name: "Matthew Kelley",
    text: "Very professional and friendly. Installed a kitchen with no issues. Amazed with the results. Will recommend.",
  },
  {
    name: "Laura Bowker",
    text: "Very professional. Clean and tidy worker. Great time keeping, fast at what he does. Perfect, can’t fault him.",
  },
  {
    name: "Andrew Clarey",
    text: "Dawid does an amazing job on kitchen fittings. Incredible quality of work, excellent communication and a clean, tidy working environment.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-amber-400 text-black px-5 py-3 rounded-full font-bold shadow-2xl hover:bg-amber-300 transition"
      >
        <Image
          src="/logos/Whatsapp.png"
          alt="WhatsApp"
          width={26}
          height={26}
          className="h-6 w-6 object-contain"
        />
        WhatsApp
      </a>

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

              <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src="/logos/Facebook.png"
                  alt="Facebook"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain hover:scale-110 transition"
                />
              </a>

              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src="/logos/Instagram.png"
                  alt="Instagram"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain hover:scale-110 transition"
                />
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

            <div className="flex items-center gap-6 text-sm text-neutral-200">
              <span className="uppercase tracking-[0.4em] text-xs text-neutral-300">
                Follow us
              </span>

              <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src="/logos/Facebook.png"
                  alt="Facebook"
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain hover:scale-110 transition"
                />
              </a>

              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src="/logos/Instagram.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain hover:scale-110 transition"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-black border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map(([number, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                {number}
              </p>
              <p className="text-neutral-300 uppercase tracking-[0.2em] text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 bg-neutral-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {trustPoints.map(([title, text]) => (
            <div key={title} className="text-center border-r border-white/10 last:border-r-0 px-6">
              <div className="text-amber-400 text-3xl mb-5">◆</div>
              <h3 className="uppercase text-lg font-semibold tracking-wide mb-4">{title}</h3>
              <p className="text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
              Suppliers
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              Experienced With Leading Kitchen Suppliers
            </h2>

            <p className="text-neutral-400 mt-4 max-w-3xl">
              From popular high street kitchen brands to bespoke local joinery, DC Joinery can fit and coordinate the right solution for your project.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.name}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center hover:border-amber-400/60 transition"
              >
                <div className="relative mx-auto mb-4 h-16 w-32">
                  <Image
                    src={supplier.logo}
                    alt={`${supplier.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>

                <p className="font-bold text-lg">{supplier.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
                Portfolio
              </p>

              <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
                RECENT PROJECTS
              </h2>
            </div>

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

      <section className="px-6 py-16 bg-neutral-950 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
                Facebook Reviews
              </p>

              <h2 className="text-3xl md:text-4xl font-bold">
                Recommended By Clients
              </h2>
            </div>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-semibold hover:text-amber-300 transition"
            >
              View all reviews →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <p className="text-amber-400 text-xl mb-4">★★★★★</p>
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  “{review.text}”
                </p>
                <p className="font-bold">{review.name}</p>
                <p className="text-sm text-neutral-500 mt-1">Facebook recommendation</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-black border-t border-white/10">
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

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-center hover:bg-amber-300 transition"
            >
              <Image
                src="/logos/Whatsapp.png"
                alt="WhatsApp"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
              Message on WhatsApp
            </a>

            <Link
              href="/contact"
              className="border border-white/30 px-8 py-4 rounded-full font-bold text-center hover:bg-white hover:text-black transition"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-neutral-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
            Areas We Cover
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Kitchen Fitting Across Northern Ireland
          </h2>

          <p className="text-neutral-300 text-lg leading-8 max-w-4xl">
            DC Joinery provides kitchen fitting, kitchen supply & installation,
            fitted bedrooms and bespoke joinery services across Belfast,
            Craigavon, Lurgan, Portadown, Banbridge, Lisburn, Armagh, Newry and
            throughout Northern Ireland.
          </p>
        </div>
      </section>
    </main>
  );
}