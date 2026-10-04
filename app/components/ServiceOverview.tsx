import Link from "next/link";
import JsonLd from "./JsonLd";
import { services } from "@/lib/service-content";
import { ORGANIZATION_ID, SITE_URL } from "@/lib/seo";

export default function ServiceOverview({ path }: { path: string }) {
  const service = services.find((item) => item.path === path);
  if (!service) return null;
  return <section className="px-6 py-16 border-t border-white/10"><div className="max-w-6xl mx-auto space-y-10">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", "@id": `${SITE_URL}${path}#service`, name: service.title, description: service.description, url: `${SITE_URL}${path}`, provider: { "@id": ORGANIZATION_ID }, areaServed: { "@type": "AdministrativeArea", name: "Northern Ireland" } }} />
    <div><h2 className="text-3xl font-bold mb-5">Planning your project</h2><p className="text-neutral-300 leading-relaxed max-w-3xl">{service.intro}</p></div>
    <div className="grid md:grid-cols-3 gap-8">{service.sections.map(([title, text]) => <div key={title}><h3 className="text-xl font-semibold mb-3">{title}</h3><p className="text-neutral-300 leading-relaxed">{text}</p></div>)}</div>
    <div><h2 className="text-3xl font-bold mb-5">Common questions</h2>{service.questions.map(([question, answer]) => <details key={question} className="border-b border-white/10 py-5"><summary className="cursor-pointer text-lg font-semibold">{question}</summary><p className="mt-3 text-neutral-300 leading-relaxed">{answer}</p></details>)}</div>
    <p className="text-neutral-300">We welcome enquiries across Northern Ireland, including Craigavon, Lurgan, Portadown, Belfast, Banbridge, Lisburn, Armagh and Newry. Send your postcode so we can confirm arrangements for your project.</p>
    <Link href={path === "/fitted-bedrooms" ? "/projects/fitted-office-wardrobe" : path === "/kitchen-renovations" ? "/projects/first-home-kitchen-renovation" : "/projects/kitchen-stone-finishes-herringbone-floor"} className="inline-block text-amber-300 underline">Explore a completed {path === "/fitted-bedrooms" ? "fitted furniture" : "kitchen"} project</Link>
    <nav aria-label="Related services" className="flex flex-wrap gap-x-6 gap-y-3">{services.filter((item) => item.path !== path).map((item) => <Link key={item.path} href={item.path} className="text-amber-300 underline">{item.title.replace(" in Northern Ireland", "")}</Link>)}<Link href="/projects" className="text-amber-300 underline">View completed projects</Link></nav>
  </div></section>;
}
