import { z } from "zod";
import { refPattern, type Kind } from "./refs";

/*
 * One schema per kind, each in its own shape: a photograph keeps its
 * exposure, a post its newsletter issue, a bird its family. `Envelope` is the
 * part every entry shares, which is what the cross-kind views (the home
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
    keywords: z.array(z.string()).default([]),
    series: z.string().optional(),
    part: z.number().int().positive().optional(),
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
  keywords: z.array(z.string()).default([]),
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

export const seriesData = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  date: day,
  /** "Series 04". */
  number: z.number().int().positive().optional(),
  camera: z.string().optional(),
  /** The sequence, in order. */
  photos: z.array(ref).min(1),
  cover: ref.optional(),
  related: refs,
  draft,
  feature: feature.optional(),
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
  links: z
    .array(z.strictObject({ label: z.string(), href: z.string() }))
    .default([]),
  cover: ref.optional(),
  related: refs,
  draft,
  feature: feature.optional(),
});

const cell = z.union([z.string(), z.number()]);

export const collectionFile = z.strictObject({
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
  draft,
});

export type PostData = z.infer<typeof postData>;
export type NoteData = z.infer<typeof noteData>;
export type PhotoData = z.infer<typeof photoData>;
export type SeriesData = z.infer<typeof seriesData>;
export type ProjectData = z.infer<typeof projectData>;
export type CollectionData = Omit<z.infer<typeof collectionFile>, "items"> & {
  /** Refs of the rows, in file order. */
  items: string[];
};
export type ItemData = {
  /** The collection's id. */
  collection: string;
  /** The collection's columns, by key. */
  fields: Record<string, z.infer<typeof cell>>;
};

export const cellValue = cell;

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
  tags: string[];
  draft: boolean;
  /** Refs this entry points at, from its frontmatter and its body. */
  links: string[];
  /** The file it came from, relative to the content folder. */
  source: string;
  /** The text under the frontmatter. Empty for kinds without one. */
  body: string;
};

type Of<K extends Kind, D> = Envelope & { kind: K; data: D };

export type PostEntry = Of<"post", PostData>;
export type NoteEntry = Of<"note", NoteData>;
export type PhotoEntry = Of<"photo", PhotoData>;
export type SeriesEntry = Of<"series", SeriesData>;
export type ProjectEntry = Of<"project", ProjectData>;
export type CollectionEntry = Of<"collection", CollectionData>;
export type ItemEntry = Of<"item", ItemData>;

export type Entry =
  | PostEntry
  | NoteEntry
  | PhotoEntry
  | SeriesEntry
  | ProjectEntry
  | CollectionEntry
  | ItemEntry;

export type EntryOf<K extends Kind> = Extract<Entry, { kind: K }>;
