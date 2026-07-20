import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dcjoineryni.uk",
      lastModified: new Date(),
    },
    {
      url: "https://dcjoineryni.uk/kitchen-fitting",
      lastModified: new Date(),
    },
    {
      url: "https://dcjoineryni.uk/fit-and-supply",
      lastModified: new Date(),
    },
    {
      url: "https://dcjoineryni.uk/projects",
      lastModified: new Date(),
    },
    {
      url: "https://dcjoineryni.uk/contact",
      lastModified: new Date(),
    },
  ];
}