import type { IndexItem } from "@/components/index-list";
import type { Issue } from "@/components/issue-stub";
import type { NoteItem } from "@/components/note";
import type { TileProps } from "@/components/tile";
import {
  dayOf,
  noteDateLine,
  yearOf,
  type Entry,
  type Kind,
  type NoteEntry,
  type PhotoEntry,
  type PostEntry,
  type Queries,
} from "@/lib/content";
import { EntryBody } from "./body";

/*
 * An entry as the existing components take it. Pages ask the content for
 * entries and pass them through these; the components stay unaware of where
 * their rows come from.
 */

export const newsletters = {
  "the-kernel": "The Kernel",
  "dev-journal": "Dev Journal",
} as const;

/** What a kind is called when an entry has no category of its own. */
const kindLabels: Record<Kind, string> = {
  post: "",
  note: "Note",
  photo: "Photograph",
  "photo-series": "Photography",
  "post-series": "Series",
  project: "",
  track: "Track",
  album: "Album",
  sighting: "Sighting",
  recommendation: "Recommendation",
  flight: "Flight",
  collection: "Collection",
  item: "Collection",
};

/** The sub-category in an eyebrow or an index row. */
export function categoryOf(entry: Entry): string {
  if (entry.kind === "post" && entry.data.type !== "article") {
    return newsletters[entry.data.type];
  }
  return entry.category ?? kindLabels[entry.kind];
}

/** A title for a row. A note or an untitled photograph is named by its words. */
export function titleOf(entry: Entry) {
  return entry.title ?? entry.summary ?? dayOf(entry.date);
}

export function toIndexItem(entry: Entry): IndexItem {
  return {
    href: entry.url,
    title: titleOf(entry),
    category: categoryOf(entry),
    year: yearOf(entry.date),
  };
}

export function toIssue(post: PostEntry): Issue {
  return {
    href: post.url,
    issue: post.data.issue ?? 0,
    title: post.data.title,
    date: post.data.date,
  };
}

/** A note's text sits inside the Note's own paragraph. */
export const noteComponents = { p: ({ children }: { children?: React.ReactNode }) => <>{children}</> };

export function toNoteItem(note: NoteEntry): NoteItem {
  return {
    id: note.id,
    ...noteDateLine(note.date),
    body: <EntryBody entry={note} components={noteComponents} />,
  };
}

/*
 * The gallery at /projects: projects, photo series and releases side by side.
 */

/** The kinds that are one discipline whatever their category says. */
const disciplines: Partial<Record<Kind, string>> = {
  "photo-series": "Photography",
  album: "Music",
};

/**
 * What sort of work an entry is, for a filter: a project's category, and
 * Photography or Music for a series or a release.
 */
export function disciplineOf(entry: Entry): string {
  return disciplines[entry.kind] ?? categoryOf(entry);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** A tile's label: what it is and, for a series or a release, how much is in it. */
export function tileLabel(entry: Entry, q: Queries): string {
  const held = q.members(entry).length;
  if (entry.kind === "photo-series") return `Photo series · ${held}`;
  if (entry.kind === "album") return `${categoryOf(entry)} · ${plural(held, "track", "tracks")}`;
  return categoryOf(entry);
}

/**
 * The photograph that stands for an entry: its `cover`, or for a photo series
 * without one, its first photograph.
 */
export function coverOf(entry: Entry, q: Queries): PhotoEntry | undefined {
  const named = entry.edges.find((edge) => edge.rel === "cover");
  const cover = named ? q.get(named.to) : undefined;
  if (cover?.kind === "photo") return cover;
  if (entry.kind !== "photo-series") return undefined;
  return q.members(entry).find((member) => member.kind === "photo");
}

/** An entry as a `Tile` takes it, without its cover or its size. */
export function toTile(entry: Entry, q: Queries): Omit<TileProps, "children" | "size"> {
  const status = entry.facets.status;
  return {
    href: entry.url,
    title: titleOf(entry),
    summary: entry.summary,
    label: tileLabel(entry, q),
    year: yearOf(entry.date),
    status: typeof status === "string" ? status : undefined,
  };
}
