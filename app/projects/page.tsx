import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Projects | DC Joinery Portfolio",
  description: "Browse DC Joinery project examples: kitchens, fitted furniture, wardrobes and bespoke kitchens across Northern Ireland.",
};

const portfolioSections = [
  {
    category: "Wren Kitchens",
    description: "Wren installations delivered with clean finishes, accurate scribing and practical handover.",
    projects: [
      {
        title: "Wren Kitchen - Precision Dry Fit",
        details: "Complete dry-fit installation with panel alignment, appliance housing checks and a tidy handover, prepared for quartz templating.",
        images: ["/projects/kitchen10.jpg", "/projects/kitchen11.jpg"],
      },
      {
        title: "Wren Kitchen - Fit + Tile Package",
        details: "Full install package including kitchen fit, splashback tiling, and LVT flooring for a seamless, ready-to-use finish.",
        images: ["/projects/kitchen13.jpeg", "/projects/kitchen14.jpeg", "/projects/kitchen15.jpeg"],
      },
    ],
  },
  {
    category: "Howdens Kitchens",
    description: "Howdens projects focused on storage efficiency, robust fittings and day-to-day practicality.",
    projects: [
      {
        title: "Large Howdens Kitchen with Walk-In Corner Pantry",
        details: "Large-format installation with walk-in corner storage, clean worktop joints and appliance spacing planned for easy daily workflow.",
        images: [
          "/projects/kitchen1.jpg",
          "/projects/kitchen2.jpg",
          "/projects/kitchen3.jpg",
          "/projects/kitchen4.jpg",
        ],
      },
    ],
  },
  {
    category: "Bespoke Kitchens",
    description: "Bespoke kitchens tailored to each room, client goals and supplier specification.",
    projects: [
      {
        title: "U-Shaped Bespoke Kitchen - Rental Renovation",
        details: "U-shaped kitchen fitted for a rental refurbishment with durable materials, practical storage and straightforward maintenance.",
        images: [
          "/projects/kitchen5.jpg",
          "/projects/kitchen6.jpg",
          "/projects/kitchen7.jpg",
          "/projects/kitchen8.jpg",
          "/projects/kitchen9.jpg",
        ],
      },
      {
        title: "Bespoke Kitchen Series - Installation Only",
        details: "Three bespoke kitchen installs completed with consistent finish standards, accurate panel fitting and coordinated appliance clearances.",
        images: [
          "/projects/kitchen12.jpg",
          "/projects/kitchen21.jpeg",
          "/projects/kitchen22.jpeg",
        ],
      },
      {
        title: "Bespoke Kitchen - HMO Renovation",
        details: "HMO-focused renovation with layout planning for multi-tenant durability, easy cleaning and reliable appliance access.",
        images: [
          "/projects/kitchen25.jpeg",
          "/projects/kitchen26.jpeg",
          "/projects/kitchen27.jpeg",
          "/projects/kitchen28.jpeg",
          "/projects/kitchen29.jpeg",
          "/projects/kitchen30.jpeg",
          "/projects/kitchen31.jpeg",
        ],
      },
    ],
  },
  {
    category: "IKEA / B&Q Kitchens & Utility Rooms",
    description: "Flat-pack kitchens and utility spaces installed for practical use and long-term reliability.",
    projects: [
      {
        title: "IKEA / B&Q Kitchen + Utility Programme",
        details:
          "Three projects delivered: two kitchens and one utility room, with careful fitting around existing services and consistent finishing detail.",
        images: [
          "/projects/kitchen16.jpg",
          "/projects/kitchen35.jpeg",
          "/projects/kitchen33.jpeg",
        ],
        video: "/projects/video.MOV",
      },
    ],
  },
  {
    category: "Bespoke Built-In Furniture, Wardrobes & Bedroom Joinery",
    description: "Custom fitted furniture and wardrobes designed to maximise awkward spaces and daily usability.",
    projects: [
      {
        title: "Bespoke Wall Feature",
        details: "Custom wall feature unit fitted to room dimensions for a clean focal point and integrated storage.",
        images: ["/projects/kitchen20.jpeg"],
      },
      {
        title: "Office Wardrobe",
        details: "Fitted office wardrobe with tailored shelving and hanging layout matched to client storage needs.",
        images: ["/projects/kitchen18.jpeg"],
      },
      {
        title: "Trophy Display Unit",
        details: "Purpose-built display unit engineered for safe presentation, visual balance and long-term durability.",
        images: ["/projects/kitchen19.JPG"],
      },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-6 py-10 border-b border-white/10 bg-black/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-semibold">
            ← Back to home
          </Link>

          <p className="text-sm text-neutral-400">DC Joinery</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-5">
            Portfolio
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Recent Projects
          </h1>

          <p className="text-neutral-300 text-lg mb-14 max-w-3xl">
            Browse recent kitchen and fitted furniture projects delivered across Northern Ireland, including HMO upgrades, rental refurbishments and private residential kitchens. Built on 7 years of production and installation experience with 30+ completed UK installations.
          </p>

          <div className="grid gap-16">
            {portfolioSections.map((section) => (
              <section key={section.category}>
                <div className="mb-8">
                  <p className="uppercase tracking-[0.25em] text-xs text-amber-400 mb-3">
                    DC Joinery Portfolio
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    {section.category}
                  </h2>

                  <p className="text-neutral-400 max-w-3xl">
                    {section.description}
                  </p>
                </div>

                <div className="grid gap-8">
                  {section.projects.map((project) => (
                    <article
                      key={project.title}
                      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                    >
                      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
                        <div className="relative min-h-[320px]">
                          <Image
                            src={project.images[0]}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="p-8 md:p-10 flex flex-col justify-center">
                          <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            {project.title}
                          </h3>

                          <p className="text-neutral-300 text-lg mb-8">
                            {project.details}
                          </p>

                          <Link
                            href="/contact"
                            className="inline-block w-fit bg-amber-400 text-black px-7 py-4 rounded-full font-semibold hover:bg-amber-300 transition"
                          >
                            Get a Quote
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 md:p-6 bg-black/30">
                        {project.images.map((image) => (
                          <a
                            key={image}
                            href={image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
                          >
                            <Image
                              src={image}
                              alt={project.title}
                              fill
                              className="object-cover hover:scale-110 transition duration-700"
                            />
                          </a>
                        ))}

                        {"video" in project && project.video && (
                          <a
                            href={project.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center aspect-square rounded-2xl border border-white/10 bg-neutral-900 text-center p-4 hover:bg-neutral-800 transition"
                          >
                            <span className="text-sm font-semibold">
                              ▶ View Utility Room Video
                            </span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}