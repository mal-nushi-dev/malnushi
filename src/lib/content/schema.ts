import { z } from "zod";
import { refPattern, type Kind } from "./refs";

/*
 * One schema per kind, each in its own shape: a photograph keeps its
 * exposure, a post its newsletter issue, a sighting its family. `Envelope` is
 * the part every entry shares, which is what the cross-kind views (the home
 * stream, backlinks, later search and feeds) read.
 */

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

/** A moment with the author's UTC offset: 2026-10-03T14:12-04:00. */
const stamp = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/,
    "use YYYY-MM-DDTHH:MM-04:00 (a time with its UTC offset)",
  );

const ref = z
  .string()
  .regex(refPattern, 'use a ref such as "photo:2026-10-02-wren"');

const refs = z.array(ref).default([]);
const draft = z.boolean().default(false);
/** Shown to readers and searched. The same field on every kind. */
const tags = z.array(z.string().min(1)).default([]);

const feature = z.strictObject({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "use a six-digit hex color"),
  hero: z.enum(["full-bleed", "color-field", "split-type", "type-only"]),
  headline: z.enum(["display-l", "display-xl", "sans-display"]),
});

export const postData = z
  .strictObject({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().optional(),
    date: day,
    updated: day.optional(),
    author: z.string().default("Mal Nushi"),
    type: z.enum(["article", "the-kernel", "dev-journal"]).default("article"),
    category: z.string().optional(),
    tags,
    issue: z.number().int().positive().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** A photograph from the archive as the hero. */
    cover: ref.optional(),
    related: refs,
    substack: z.url().optional(),
    draft,
    feature: feature.optional(),
  })
  .refine((p) => p.type !== "article" || p.category, {
    path: ["category"],
    message: "an article needs a category",
  })
  .refine((p) => p.type === "article" || !p.feature, {
    path: ["feature"],
    message: "a newsletter issue is never a feature",
  });

export const noteData = z.strictObject({
  date: stamp,
  tags,
  syndicated: z.array(z.url()).default([]),
  related: refs,
  draft,
});

/**
 * What a photo's `.yml` may say. Every field is optional: whatever is
 * written here wins over what the image file carries.
 */
export const photoOverrides = z.strictObject({
  alt: z.string().min(1).optional(),
  caption: z.string().optional(),
  title: z.string().optional(),
  date: z.union([stamp, day]).optional(),
  place: z.string().optional(),
  tags: z.array(z.string()).optional(),
  camera: z.string().optional(),
  lens: z.string().optional(),
  /** Millimetres. */
  focalLength: z.number().positive().optional(),
  /** The f-number: 5.6 for f/5.6. */
  aperture: z.number().positive().optional(),
  /** As it is read: "1/500" or "2s". */
  shutter: z.string().optional(),
  iso: z.number().int().positive().optional(),
  related: refs,
  draft,
});

/** A photograph once its file and its `.yml` are merged. */
export const photoData = z.object({
  /** The image's file name in content/photos/. */
  file: z.string(),
  alt: z.string().min(1),
  caption: z.string().optional(),
  title: z.string().optional(),
  date: z.union([stamp, day]),
  place: z.string().optional(),
  camera: z.string().optional(),
  lens: z.string().optional(),
  focalLength: z.number().optional(),
  aperture: z.number().optional(),
  shutter: z.string().optional(),
  iso: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const photoSeriesData = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  date: day,
  /** "Series 04". */
  number: z.number().int().positive().optional(),
  camera: z.string().optional(),
  /** The sequence, in order. */
  photos: z.array(ref).min(1),
  cover: ref.optional(),
  tags,
  related: refs,
  draft,
  feature: feature.optional(),
});

/** A piece of writing in parts. It has no page: each part shows its place. */
export const postSeriesData = z
  .strictObject({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    /** The parts, in order. */
    posts: z.array(ref).min(1),
    /** How many parts there will be, while some are still unwritten. */
    total: z.number().int().positive().optional(),
    tags,
    related: refs,
    draft,
  })
  .refine((s) => s.total === undefined || s.total >= s.posts.length, {
    path: ["total"],
    message: "cannot be fewer than the parts listed",
  });

export const projectData = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  date: day,
  /** The discipline: Code, Hardware, Lego… */
  category: z.string().min(1),
  role: z.string().optional(),
  medium: z.string().optional(),
  stack: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  status: z.string().optional(),
  tags,
  links: z
    .array(z.strictObject({ label: z.string(), href: z.string() }))
    .default([]),
  cover: ref.optional(),
  related: refs,
  draft,
  feature: feature.optional(),
});

/** Minutes and seconds: "3:42", "12:05". A long piece runs past 59 minutes. */
const duration = z.string().regex(/^\d+:[0-5]\d$/, 'use minutes and seconds, such as "3:42"');

const artist = z.string().default("Mal Nushi");

/** One recording. The text under the frontmatter is the liner notes. */
export const trackData = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  date: day,
  duration,
  bpm: z.number().positive().optional(),
  /** The musical key: "A minor". */
  key: z.string().optional(),
  artist,
  /** Who wrote it. On a cover, the original writers. */
  composer: z.array(z.string().min(1)).optional(),
  credits: z
    .array(z.strictObject({ role: z.string().min(1), name: z.string().min(1) }))
    .default([]),
  instruments: z.array(z.string().min(1)).optional(),
  tags,
  cover: ref.optional(),
  related: refs,
  draft,
});

/** A release of any length. The text under the frontmatter is the release notes. */
export const albumData = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  date: day,
  format: z.enum(["album", "ep", "single", "compilation"]),
  /** The running order. */
  tracks: z.array(ref).min(1),
  artist,
  role: z.string().optional(),
  tools: z.array(z.string().min(1)).optional(),
  status: z.string().optional(),
  tags,
  cover: ref.optional(),
  related: refs,
  draft,
  feature: feature.optional(),
});

/** One time a bird was seen. The text under the frontmatter is the field notes. */
export const sightingData = z.strictObject({
  /** The common name: "Carolina Wren". */
  species: z.string().min(1),
  scientific: z.string().min(1),
  family: z.string().min(1),
  date: z.union([stamp, day]),
  place: z.string().min(1),
  coordinates: z
    .strictObject({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  habitat: z.string().optional(),
  /** How many birds. */
  count: z.number().int().positive().optional(),
  tags,
  related: refs,
  draft,
});

/** Something worth passing on. The text under the frontmatter is why. */
export const recommendationData = z.strictObject({
  title: z.string().min(1),
  /** What it is: Book, Film, Album, Tool, Place… */
  medium: z.string().min(1),
  url: z.url().optional(),
  /** Who made it: the author, director or artist. */
  creator: z.string().optional(),
  date: day,
  tags,
  related: refs,
  draft,
});

const cell = z.union([z.string(), z.number()]);

/**
 * A collection is either a table, with its rows written in the file, or a
 * question asked of the entries of one kind (`from`).
 */
export const collectionFile = z
  .strictObject({
    title: z.string().min(1),
    description: z.string().optional(),
    /** What one row is called on the home page: "bird", "recommendation". */
    itemName: z.string().optional(),
    /** The fields that sum a row up in one line elsewhere, in order. */
    summary: z.array(z.string()).default(["date"]),
    columns: z
      .array(
        z.strictObject({
          key: z.string(),
          label: z.string(),
          optional: z.boolean().default(false),
        }),
      )
      .min(1),
    items: z
      .array(
        z.looseObject({
          id: z.string(),
          title: z.string().min(1),
          date: day,
          related: refs,
        }),
      )
      .default([]),
    /** The kind whose entries are the rows, instead of `items`. */
    from: z.enum(["sighting", "recommendation"]).optional(),
    /** With `from`: one row for each value of this field, the earliest. */
    unique: z.string().optional(),
    draft,
  })
  .refine((c) => !c.from || c.items.length === 0, {
    path: ["items"],
    message: "a collection has `items` or `from`, not both",
  })
  .refine((c) => c.from || !c.unique, {
    path: ["unique"],
    message: "`unique` needs `from`",
  });

export type PostData = z.infer<typeof postData>;
export type NoteData = z.infer<typeof noteData>;
export type PhotoData = z.infer<typeof photoData>;
export type PhotoSeriesData = z.infer<typeof photoSeriesData>;
export type PostSeriesData = z.infer<typeof postSeriesData>;
export type TrackData = z.infer<typeof trackData> & {
  /** The audio file beside it in content/tracks/, when there is one. */
  audio?: string;
};
export type AlbumData = z.infer<typeof albumData>;
export type SightingData = z.infer<typeof sightingData>;
export type RecommendationData = z.infer<typeof recommendationData>;
export type ProjectData = z.infer<typeof projectData>;
export type CollectionData = Omit<z.infer<typeof collectionFile>, "items"> & {
  /** Refs of the rows: in file order, or oldest first when asked `from` a kind. */
  items: string[];
};
export type ItemData = {
  /** The collection's id. */
  collection: string;
  /** The collection's columns, by key. */
  fields: Record<string, z.infer<typeof cell>>;
};

export const cellValue = cell;

/** How one entry points at another. */
export const rels = ["contains", "cover", "related", "embeds"] as const;
export type Rel = (typeof rels)[number];

/**
 * A pointer from the entry that holds it. Membership (`contains`) is written
 * once, on the series or collection; what an entry belongs to is worked out
 * from that, never written on the member.
 */
export type Edge = { rel: Rel; to: string };

export type Facet = string | number | string[];

export type Envelope = {
  kind: Kind;
  id: string;
  /** `kind:id`. */
  ref: string;
  /** Its own page, or for a collection row the collection page and anchor. */
  url: string;
  /** What streams sort by. A day, or a moment with its offset. */
  date: string;
  title?: string;
  summary?: string;
  /** The one label an eyebrow or a badge shows. */
  category?: string;
  tags: string[];
  /**
   * The fields a reader might search or filter by, flat, under names the
   * kinds share (`place`, `camera`, `medium`). A copy for search and filters:
   * a kind's own views read `data`.
   */
  facets: Record<string, Facet>;
  draft: boolean;
  /** What this entry points at, from its frontmatter and its body. */
  edges: Edge[];
  /** The file it came from, relative to the content folder. */
  source: string;
  /** The text under the frontmatter. Empty for kinds without one. */
  body: string;
};

type Of<K extends Kind, D> = Envelope & { kind: K; data: D };

export type PostEntry = Of<"post", PostData>;
export type NoteEntry = Of<"note", NoteData>;
export type PhotoEntry = Of<"photo", PhotoData>;
export type PhotoSeriesEntry = Of<"photo-series", PhotoSeriesData>;
export type PostSeriesEntry = Of<"post-series", PostSeriesData>;
export type TrackEntry = Of<"track", TrackData>;
export type AlbumEntry = Of<"album", AlbumData>;
export type SightingEntry = Of<"sighting", SightingData>;
export type RecommendationEntry = Of<"recommendation", RecommendationData>;
export type ProjectEntry = Of<"project", ProjectData>;
export type CollectionEntry = Of<"collection", CollectionData>;
export type ItemEntry = Of<"item", ItemData>;

export type Entry =
  | PostEntry
  | NoteEntry
  | PhotoEntry
  | PhotoSeriesEntry
  | PostSeriesEntry
  | TrackEntry
  | AlbumEntry
  | SightingEntry
  | RecommendationEntry
  | ProjectEntry
  | CollectionEntry
  | ItemEntry;

export type EntryOf<K extends Kind> = Extract<Entry, { kind: K }>;
