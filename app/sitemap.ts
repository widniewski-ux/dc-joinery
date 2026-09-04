import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.dcjoineryni.uk",
      lastModified: new Date(),
    },
    {
      url: "https://www.dcjoineryni.uk/kitchen-fitting",
      lastModified: new Date(),
    },
    {
      url: "https://www.dcjoineryni.uk/fit-and-supply",
      lastModified: new Date(),
    },
    {
      url: "https://www.dcjoineryni.uk/projects",
      lastModified: new Date(),
    },
    {
      url: "https://www.dcjoineryni.uk/ai-kitchen-designer",
      lastModified: new Date(),
    },
    {
      url: "https://www.dcjoineryni.uk/contact",
      lastModified: new Date(),
    },
  ];
}