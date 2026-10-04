import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolioSections } from "@/lib/portfolio";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import ProjectGallery from "../../components/ProjectGallery";
import JsonLd from "../../components/JsonLd";
import { projectStories } from "@/lib/project-stories";
const projects = portfolioSections.flatMap(section => section.projects).filter(project => project.slug);
function findProject(slug: string) { return projects.find(project => "slug" in project && project.slug === slug); }
export function generateStaticParams() { return projects.map(project => ({ slug: "slug" in project ? project.slug : "" })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();
  return pageMetadata(project.title, project.details, `/projects/${slug}`, project.images[0]);
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();
  return <main className="min-h-screen bg-neutral-950 text-white"><div className="max-w-7xl mx-auto px-6 py-16">
    <nav aria-label="Breadcrumb" className="text-sm text-amber-300"><Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / <span className="text-neutral-300">{project.title}</span></nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` }, { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/projects/${slug}` }] }} />
    <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-8 mb-6 max-w-4xl">{project.title}</h1><p className="text-lg text-neutral-300 leading-relaxed max-w-3xl mb-12">{project.details}</p>
    <div className="grid md:grid-cols-2 gap-8 mb-12">{projectStories[slug]?.map(section => <section key={section.heading}><h2 className="text-2xl font-bold mb-4">{section.heading}</h2><p className="text-neutral-300 leading-relaxed">{section.text}</p></section>)}</div>
    <ProjectGallery sections={[{ category: "Project photographs", description: "Explore the completed installation and its finishing details.", projects: [{ ...project, slug: undefined }] }]} />
    <section className="mt-14 border-t border-white/10 pt-10"><h2 className="text-3xl font-bold mb-4">Planning a similar project?</h2><p className="text-neutral-300 mb-6">Send your room photographs, plans and postcode. We can discuss the layout, preparation and installation requirements for your own project.</p><Link href="/contact" className="text-amber-300 underline">Discuss your project with DC Joinery</Link></section>
  </div></main>;
}
