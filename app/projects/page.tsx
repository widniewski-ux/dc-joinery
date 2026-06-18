import Image from "next/image";
import Link from "next/link";

const projects = [
  "/projects/kitchen1.jpg",
  "/projects/kitchen2.jpg",
  "/projects/kitchen3.jpg",
  "/projects/kitchen4.jpg",
  "/projects/kitchen5.jpg",
  "/projects/kitchen6.jpg",
  "/projects/kitchen7.jpg",
  "/projects/kitchen8.jpg",
  "/projects/kitchen9.jpg",
  "/projects/kitchen10.jpg",
  "/projects/kitchen11.jpg",
  "/projects/kitchen12.jpg",
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-6 py-10 border-b border-white/10 bg-black/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-semibold">
            ← Back to home
          </Link>

          <p className="text-sm text-neutral-400">
            DC Joinery
          </p>
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

          <p className="text-neutral-300 text-lg mb-12">
            Kitchens, bedrooms, utility rooms and bespoke joinery projects completed across Northern Ireland.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl"
              >
                <Image
                  src={project}
                  alt="DC Joinery Project"
                  fill
                  className="object-cover hover:scale-110 transition duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}