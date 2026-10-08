import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { expect } from "vitest";
import { ContentError, loadContent } from "./load";
import { kinds, parseRef, urlFor } from "./refs";
import { rels, type Entry } from "./schema";

/*
 * What the content tests share: throwaway content folders, a complete small
 * site to break one piece at a time, and the contract every entry keeps.
 */

type Files = Record<string, string | Uint8Array>;

/** A throwaway content folder holding the given files. */
export async function folder(files: Files) {
  const root = await mkdtemp(path.join(tmpdir(), "content-"));
  for (const [name, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), contents);
  }
  return root;
}

/** What the loader reports for a folder: nothing, if it loads. */
export async function problemsOf(root: string, options?: { drafts?: boolean }) {
  try {
    await loadContent(root, options);
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  return [];
}

/**
 * The start of a JPEG: whatever segments are given, then a frame header of
 * the given sort (0xc0 baseline, 0xc2 progressive).
 */
export function jpeg(frame: number, width: number, height: number, before: number[] = []) {
  return Uint8Array.from([
    0xff, 0xd8,
    ...before,
    0xff, frame, 0, 11, 8, height >> 8, height & 255, width >> 8, width & 255, 1, 1, 0x11, 0,
    0xff, 0xd9,
  ]);
}

/** An EXIF block that says only how the image is turned. */
export const exifOrientation = (value: number) => [
  0xff, 0xe1, 0, 34,
  0x45, 0x78, 0x69, 0x66, 0, 0,
  0x49, 0x49, 0x2a, 0, 8, 0, 0, 0,
  1, 0,
  0x12, 0x01, 3, 0, 1, 0, 0, 0, value, 0, 0, 0,
  0, 0, 0, 0,
];

/** A file with frontmatter, as an entry is written. */
export function doc(data: Record<string, unknown>, body = "") {
  return `---\n${stringify(data)}---\n\n${body}\n`;
}

/**
 * One valid entry of each kind that is a file with frontmatter, holding only
 * what its schema requires. Together with `support` they load cleanly.
 */
export const valid = {
  post: {
    path: "posts/essay.mdx",
    data: { title: "Essay", subtitle: "Sub", date: "2026-01-01", category: "Tech" },
    body: "Text.",
  },
  note: {
    path: "notes/2026-01-02-0900.md",
    data: { date: "2026-01-02T09:00-05:00" },
    body: "A note.",
  },
  project: {
    path: "projects/thing.mdx",
    data: { title: "Thing", subtitle: "Sub", date: "2026-01-03", category: "Code" },
    body: "",
  },
  "photo-series": {
    path: "photo-series/walk.mdx",
    data: { title: "Walk", date: "2026-01-04", photos: ["photo:2026-01-01-pic"] },
    body: "",
  },
  "post-series": {
    path: "post-series/run.mdx",
    data: { title: "Run", posts: ["post:essay"] },
    body: "",
  },
  track: {
    path: "tracks/song.mdx",
    data: { title: "Song", date: "2026-01-05", duration: "3:42" },
    body: "",
  },
  album: {
    path: "albums/record.mdx",
    data: { title: "Record", date: "2026-01-06", format: "ep", tracks: ["track:song"] },
    body: "",
  },
  sighting: {
    path: "sightings/2026-01-07-wren.md",
    data: {
      species: "Wren",
      scientific: "Troglodytes",
      family: "Troglodytidae",
      date: "2026-01-07",
      place: "Here",
    },
    body: "",
  },
  recommendation: {
    path: "recommendations/book.md",
    data: { title: "Book", medium: "Book", date: "2026-01-08" },
    body: "",
  },
} as const satisfies Record<string, { path: string; data: Record<string, unknown>; body: string }>;

export type Written = keyof typeof valid;
export const written = Object.keys(valid) as Written[];

/** Two flights, out and back, as scripts/flights.mjs writes them. */
export const flights = {
  csv: [
    "Date,From,To,Duration,Airline,Aircraft,Seat type,Flight class,Flight reason",
    "2026-01-10,Detroit / Detroit Metropolitan Wayne Co (DTW/KDTW),Vienna / Schwechat (VIE/LOWW),08:40:00,Delta Air Lines (DL/DAL),Airbus A330-300 (A333),1,1,1",
    "2026-01-20,Vienna / Schwechat (VIE/LOWW),Detroit / Detroit Metropolitan Wayne Co (DTW/KDTW),10:05:00, (/), (),0,0,0",
    "",
  ].join("\n"),
  airports: {
    KDTW: { lat: 42.2138, lon: -83.3538, countryCode: "US", country: "United States", continent: "North America" },
    LOWW: { lat: 48.1103, lon: 16.5697, countryCode: "AT", country: "Austria", continent: "Europe" },
  },
};

/**
 * The kinds that are not a file with frontmatter: a photograph, two flights
 * and the collections.
 */
const support: Files = {
  "photos/2026-01-01-pic.jpg": jpeg(0xc2, 300, 200),
  "photos/2026-01-01-pic.yml": stringify({ alt: "A picture.", date: "2026-01-01" }),
  "collections/life-list.yml": stringify({
    title: "Life list",
    from: "sighting",
    unique: "species",
    columns: [{ key: "species", label: "Species" }],
  }),
  "flights/flights.csv": flights.csv,
  "flights/airports.json": JSON.stringify(flights.airports),
  "collections/travels.yml": stringify({
    title: "Travels",
    from: "flight",
    columns: [{ key: "from", label: "From" }],
  }),
  "collections/shelf.yml": stringify({
    title: "Shelf",
    columns: [{ key: "pieces", label: "Pieces" }],
    items: [{ id: "set", title: "Set", date: "2026-01-09", pieces: 10 }],
  }),
};

/**
 * A whole small site, one entry of every kind, with some entries' frontmatter
 * changed: a key set to `undefined` is left out.
 */
export function site(changes: Partial<Record<Written, Record<string, unknown>>> = {}): Files {
  const files: Files = { ...support };
  for (const kind of written) {
    const { path: file, data, body } = valid[kind];
    const merged = Object.fromEntries(
      Object.entries({ ...data, ...changes[kind] }).filter(([, v]) => v !== undefined),
    );
    files[file] = doc(merged, body);
  }
  return files;
}

/** What every entry keeps, whatever its kind: the envelope's contract. */
export function expectEnvelope(entry: Entry) {
  const where = entry.source;
  expect(kinds, where).toContain(entry.kind);
  expect(entry.ref, where).toBe(`${entry.kind}:${entry.id}`);
  expect(parseRef(entry.ref), where).toEqual({ kind: entry.kind, id: entry.id });
  expect(entry.url, where).toMatch(/^\/[^\s]*$/);
  // A series of posts is sent to its first part.
  if (entry.kind !== "post-series") expect(entry.url, where).toBe(urlFor(entry.kind, entry.id));
  expect(Number.isNaN(Date.parse(entry.date)), `${where}: date ${entry.date}`).toBe(false);
  if (entry.updated !== undefined) {
    expect(Number.isNaN(Date.parse(entry.updated)), `${where}: updated`).toBe(false);
  }
  expect(typeof entry.draft, where).toBe("boolean");
  expect(typeof entry.body, where).toBe("string");
  expect(entry.source, where).not.toBe("");
  for (const text of [entry.title, entry.summary, entry.category]) {
    if (text !== undefined) expect(text.trim(), where).not.toBe("");
  }
  for (const tag of entry.tags) expect(tag.trim(), `${where}: tag`).not.toBe("");
  for (const [key, value] of Object.entries(entry.facets)) {
    const at = `${where}: facet ${key}`;
    if (Array.isArray(value)) {
      expect(value.length, at).toBeGreaterThan(0);
      for (const one of value) expect(typeof one, at).toBe("string");
    } else {
      expect(["string", "number"], at).toContain(typeof value);
      expect(value, at).not.toBe("");
    }
  }
  if (entry.category !== undefined) expect(entry.facets.category, where).toBe(entry.category);
  for (const edge of entry.edges) {
    expect(rels, where).toContain(edge.rel);
    expect(parseRef(edge.to), `${where}: ${edge.to}`).not.toBeNull();
  }
}
