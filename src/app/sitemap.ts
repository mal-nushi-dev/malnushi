import type { MetadataRoute } from "next";
import { changedAt, content, type Kind } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Only routes that exist. Add a kind here when its page is built, so the
// sitemap never lists a page that returns 404.
const withPages: Kind[] = ["post", "note", "photo", "track"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = (await content()).stream({ kinds: withPages });
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/writing/notes`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/photography`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/music`, changeFrequency: "weekly", priority: 0.7 },
    ...entries.map((entry) => ({
      url: `${siteUrl}${entry.url}`,
      lastModified: changedAt(entry),
    })),
  ];
}
