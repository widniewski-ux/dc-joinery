import { portfolioSections } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import ProjectGallery from "../components/ProjectGallery";

export const metadata = pageMetadata("Kitchen & Fitted Furniture Projects in Northern Ireland", "Explore photographs and descriptions of DC Joinery kitchens, wardrobes and built-in furniture projects.", "/projects");


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

          <ProjectGallery sections={portfolioSections} />
        </div>
      </section>
    </main>
  );
}