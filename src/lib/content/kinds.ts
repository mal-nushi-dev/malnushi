import type { z } from "zod";
import type { Kind } from "./refs";
import {
  albumData,
  noteData,
  photoSeriesData,
  postData,
  postSeriesData,
  projectData,
  recommendationData,
  sightingData,
  trackData,
  type Edge,
  type Facet,
  type Rel,
} from "./schema";

/*
 * The kinds that are one file per entry. Each says where its files are, what
 * shape they take and how an entry of that kind fills the envelope: its
 * label, its tags, the fields a reader might search by (`facets`) and what it
 * points at (`edges`). The loader does the rest, so a new kind is one
 * declaration here and its views.
 *
 * Photographs (an image and a .yml) and collections (many rows in a file) are
 * read by their own code in load.ts.
 */

/** What an entry of a kind gives the envelope. */
export type Described = {
  date: string;
  updated?: string;
  title?: string;
  summary?: string;
  category?: string;
  tags: string[];
  facets: Record<string, Facet | undefined>;
  edges: Edge[];
  draft: boolean;
};

type Definition<S extends z.ZodType> = {
  kind: Kind;
  folder: string;
  extension: ".mdx" | ".md";
  schema: S;
  /** For a series or an album: the kind its members must be. */
  contains?: Kind;
  /**
   * Files that may sit beside an entry under its name, by the field that
   * records them: a track's audio.
   */
  assets?: Record<string, string[]>;
  describe: (data: z.infer<S>, body: string) => Described;
  /** Problems the schema cannot name. */
  check?: (id: string, data: z.infer<S>, body: string) => string[];
};

export type KindDefinition = Definition<z.ZodType>;

function define<S extends z.ZodType>(definition: Definition<S>) {
  return definition as unknown as KindDefinition;
}

/** Edges of one sort, skipping a field that was left out. */
export function edges(rel: Rel, ...to: (string | undefined)[]): Edge[] {
  return to.filter((ref) => ref !== undefined).map((ref) => ({ rel, to: ref }));
}

/** Slugs a post cannot take: they are routes under /writing. */
export const reservedPostSlugs = ["the-kernel", "dev-journal", "notes"];

/** A release's format as it is shown. */
export const albumFormats = {
  album: "Album",
  ep: "EP",
  single: "Single",
  compilation: "Compilation",
} as const;

export const definitions: KindDefinition[] = [
  define({
    kind: "post",
    folder: "posts",
    extension: ".mdx",
    schema: postData,
    check: (id) =>
      reservedPostSlugs.includes(id) ? [`"${id}" is reserved; rename the file`] : [],
    describe: (data) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: data.description ?? data.subtitle,
      category: data.category,
      tags: data.tags,
      facets: { type: data.type, author: data.author },
      edges: [...edges("cover", data.cover), ...edges("related", ...data.related)],
      draft: data.draft,
    }),
  }),
  define({
    kind: "note",
    folder: "notes",
    extension: ".md",
    schema: noteData,
    check: (_id, _data, body) => (body ? [] : ["a note needs its text"]),
    describe: (data, body) => ({
      date: data.date,
      summary: body,
      tags: data.tags,
      facets: {},
      edges: edges("related", ...data.related),
      draft: data.draft,
    }),
  }),
  define({
    kind: "project",
    folder: "projects",
    extension: ".mdx",
    schema: projectData,
    describe: (data) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: data.subtitle,
      category: data.category,
      tags: data.tags,
      facets: {
        role: data.role,
        medium: data.medium,
        stack: data.stack,
        materials: data.materials,
        status: data.status,
      },
      edges: [...edges("cover", data.cover), ...edges("related", ...data.related)],
      draft: data.draft,
    }),
  }),
  define({
    kind: "photo-series",
    folder: "photo-series",
    extension: ".mdx",
    schema: photoSeriesData,
    contains: "photo",
    describe: (data) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: data.subtitle,
      tags: data.tags,
      facets: { camera: data.camera },
      edges: [
        ...edges("contains", ...data.photos),
        ...edges("cover", data.cover),
        ...edges("related", ...data.related),
      ],
      draft: data.draft,
    }),
  }),
  define({
    kind: "post-series",
    folder: "post-series",
    extension: ".mdx",
    schema: postSeriesData,
    contains: "post",
    describe: (data) => ({
      // Its first part's date, once the parts are known: see load.ts.
      date: "1970-01-01",
      title: data.title,
      summary: data.subtitle,
      tags: data.tags,
      facets: {},
      edges: [...edges("contains", ...data.posts), ...edges("related", ...data.related)],
      draft: data.draft,
    }),
  }),
  define({
    kind: "track",
    folder: "tracks",
    extension: ".mdx",
    schema: trackData,
    assets: { audio: [".mp3", ".m4a"] },
    describe: (data) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: data.subtitle,
      tags: data.tags,
      facets: {
        artist: data.artist,
        composer: data.composer,
        bpm: data.bpm,
        key: data.key,
        instruments: data.instruments,
        credits: data.credits.map((credit) => credit.name),
      },
      edges: [...edges("cover", data.cover), ...edges("related", ...data.related)],
      draft: data.draft,
    }),
  }),
  define({
    kind: "album",
    folder: "albums",
    extension: ".mdx",
    schema: albumData,
    contains: "track",
    describe: (data) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: data.subtitle,
      category: albumFormats[data.format],
      tags: data.tags,
      facets: {
        format: albumFormats[data.format],
        artist: data.artist,
        tools: data.tools,
        status: data.status,
      },
      edges: [
        ...edges("contains", ...data.tracks),
        ...edges("cover", data.cover),
        ...edges("related", ...data.related),
      ],
      draft: data.draft,
    }),
  }),
  define({
    kind: "sighting",
    folder: "sightings",
    extension: ".md",
    schema: sightingData,
    describe: (data, body) => ({
      date: data.date,
      updated: data.updated,
      title: data.species,
      summary: body || undefined,
      tags: data.tags,
      facets: {
        species: data.species,
        scientific: data.scientific,
        family: data.family,
        place: data.place,
        habitat: data.habitat,
      },
      edges: edges("related", ...data.related),
      draft: data.draft,
    }),
  }),
  define({
    kind: "recommendation",
    folder: "recommendations",
    extension: ".md",
    schema: recommendationData,
    describe: (data, body) => ({
      date: data.date,
      updated: data.updated,
      title: data.title,
      summary: body || undefined,
      category: data.medium,
      tags: data.tags,
      facets: { medium: data.medium, creator: data.creator },
      edges: edges("related", ...data.related),
      draft: data.draft,
    }),
  }),
];
