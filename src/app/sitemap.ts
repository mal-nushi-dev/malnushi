import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only routes that exist. Add the sections here as they are built, so the
// sitemap never lists a page that returns 404.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/writing/notes`, changeFrequency: "daily", priority: 0.7 },
  ];
}
