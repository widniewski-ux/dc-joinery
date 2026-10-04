import type { Metadata } from "next";

export const SITE_URL = "https://www.dcjoineryni.uk";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function pageMetadata(title: string, description: string, route: string, image = "/projects/kitchen51.jpeg"): Metadata {
  return {
    title, description, alternates: { canonical: route },
    openGraph: { title: `${title} | DC Joinery`, description, url: `${SITE_URL}${route}`, siteName: "DC Joinery", locale: "en_GB", type: "website", images: [{ url: `${SITE_URL}${image}`, alt: "DC Joinery completed project" }] },
    twitter: { card: "summary_large_image", title: `${title} | DC Joinery`, description, images: [`${SITE_URL}${image}`] },
  };
}

export const organization = {
  "@context": "https://schema.org", "@type": "Organization", "@id": ORGANIZATION_ID,
  name: "DC Joinery", url: SITE_URL, logo: `${SITE_URL}/logo.png`,
  telephone: "+447500779126", email: "info@dcjoinery.uk",
  areaServed: { "@type": "AdministrativeArea", name: "Northern Ireland" },
  sameAs: ["https://www.instagram.com/dawid_joinery__dc/", "https://maps.app.goo.gl/UFXHWJasoNFPNtvM7"],
};
