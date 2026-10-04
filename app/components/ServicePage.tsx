import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/service-content";
import ServiceOverview from "./ServiceOverview";
export default function ServicePage({ path }: { path: string }) {
  const service = services.find(item => item.path === path);
  if (!service) notFound();
  return <main className="min-h-screen bg-neutral-950 text-white"><section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center"><div><Link href="/" className="text-amber-300">Home</Link><h1 className="text-4xl md:text-5xl font-bold leading-tight my-6">{service.title}</h1><p className="text-neutral-300 text-lg leading-relaxed">{service.intro}</p><Link href="/contact" className="inline-block mt-8 rounded-xl bg-amber-400 text-black px-6 py-4 font-semibold">Discuss your project</Link></div><Image src={service.image} alt={path === "/fitted-bedrooms" ? "DC Joinery fitted office wardrobe with shelving and hanging storage" : "Completed DC Joinery kitchen installation"} width={900} height={700} priority sizes="(max-width: 768px) 100vw, 50vw" className="rounded-2xl w-full h-auto" /></section><ServiceOverview path={path} /></main>;
}
