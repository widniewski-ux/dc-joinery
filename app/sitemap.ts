import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { services } from "@/lib/service-content";
import { portfolioSections } from "@/lib/portfolio";
export default function sitemap(): MetadataRoute.Sitemap {
  const projectPaths = portfolioSections.flatMap(section => section.projects).flatMap(project => project.slug ? [`/projects/${project.slug}`] : []);
  return ["/", "/projects", "/contact", "/ai-kitchen-designer", "/privacy", ...services.map(service => service.path), ...projectPaths].map(route => ({ url: `${SITE_URL}${route}` }));
}
