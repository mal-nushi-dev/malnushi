import type { IndexItem } from "@/components/index-list";
import type { Issue } from "@/components/issue-stub";
import type { NoteItem } from "@/components/note";
import {
  dayOf,
  noteDateLine,
  yearOf,
  type Entry,
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

/** The sub-category in an eyebrow or an index row. */
export function categoryOf(entry: Entry): string {
  switch (entry.kind) {
    case "post":
      return entry.data.type === "article"
        ? (entry.data.category ?? "")
        : newsletters[entry.data.type];
    case "project":
      return entry.data.category;
    case "series":
      return "Photography";
    case "photo":
      return "Photograph";
    case "note":
      return "Note";
    case "collection":
      return "Collection";
    case "item":
      return "Collection";
  }
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
