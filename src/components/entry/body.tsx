import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import type { Entry } from "@/lib/content";

type Body = ComponentType<{ components?: MDXComponents }>;

/*
 * Each import names its folder and extension, so the bundler compiles only
 * the bodies in that folder and nothing else in content/.
 */
async function load(entry: Entry): Promise<Body | null> {
  switch (entry.kind) {
    case "post":
      return (await import(`@content/posts/${entry.id}.mdx`)).default;
    case "note":
      return (await import(`@content/notes/${entry.id}.md`)).default;
    case "project":
      return (await import(`@content/projects/${entry.id}.mdx`)).default;
    case "photo-series":
      return (await import(`@content/photo-series/${entry.id}.mdx`)).default;
    case "post-series":
      return (await import(`@content/post-series/${entry.id}.mdx`)).default;
    case "track":
      return (await import(`@content/tracks/${entry.id}.mdx`)).default;
    case "album":
      return (await import(`@content/albums/${entry.id}.mdx`)).default;
    case "sighting":
      return (await import(`@content/sightings/${entry.id}.md`)).default;
    case "recommendation":
      return (await import(`@content/recommendations/${entry.id}.md`)).default;
    default:
      return null;
  }
}

/** The text under an entry's frontmatter, rendered. */
export async function EntryBody({
  entry,
  components,
}: {
  entry: Entry;
  /** Overrides for this place, on top of src/mdx-components.tsx. */
  components?: MDXComponents;
}) {
  const Body = await load(entry);
  return Body ? <Body components={components} /> : null;
}
