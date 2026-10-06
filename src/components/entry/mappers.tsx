import type { IndexItem } from "@/components/index-list";
import type { Issue } from "@/components/issue-stub";
import type { NoteItem } from "@/components/note";
import {
  dayOf,
  noteDateLine,
  yearOf,
  type Entry,
  type Kind,
  type NoteEntry,
  type PostEntry,
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
  sighting: "Sighting",
  recommendation: "Recommendation",
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
const inline = { p: ({ children }: { children?: React.ReactNode }) => <>{children}</> };

export function toNoteItem(note: NoteEntry): NoteItem {
  return {
    id: note.id,
    ...noteDateLine(note.date),
    body: <EntryBody entry={note} components={inline} />,
  };
}
