import Link from "next/link";
import { ArrowLink } from "@/components/links";
import type { NoteItem } from "@/components/note";
import { cx } from "@/lib/site";
import type { Issue } from "./data";

// Pieces used only by the Writing index mockups. The chosen direction's
// pieces move to src/components; the rest are deleted with the mockups.

/** Stand-in image at any aspect ratio; the class sets the ratio. */
export function ImageSlot({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder, ${label}`}
      className={cx(
        "flex w-full items-center justify-center rounded-(--radius-img) bg-line",
        className,
      )}
    >
      <span className="type-meta text-ink-2">{label}</span>
    </div>
  );
}

/**
 * The newest issue of a newsletter: its number set large, then the title,
 * the date and a link to every issue.
 */
export function IssueStub({
  name,
  href,
  issue,
}: {
  name: string;
  /** The newsletter's own page. */
  href: string;
  issue: Issue;
}) {
  return (
    <div className="flex flex-col items-start gap-(--space-sm)">
      <h3 className="type-label text-ink-2">{name}</h3>
      <Link href={issue.href} className="group flex flex-col gap-2">
        <span className="flex items-start gap-2">
          <span className="type-meta text-ink-2">No.</span>
          <span className="type-stat text-accent">{issue.issue}</span>
        </span>
        <span className="type-index-title text-ink group-hover:text-link">
          {issue.title}
        </span>
        <span className="type-meta text-ink-2">{issue.date}</span>
      </Link>
      <ArrowLink href={href}>All of {name}</ArrowLink>
    </div>
  );
}

/** Notes set small for a narrow column, hairlines between. */
export function WireNotes({
  notes,
  type = "type-small",
}: {
  notes: NoteItem[];
  type?: "type-small" | "type-ui";
}) {
  return (
    <ol>
      {notes.map((n) => (
        <li
          key={n.id}
          className="flex flex-col gap-2 border-t border-line py-(--space-sm) first:border-t-0 first:pt-0"
        >
          <p className={cx(type, "text-ink")}>{n.body}</p>
          <a
            href={`/writing/notes/${n.id}`}
            className="type-meta text-ink-2 hover:text-ink"
          >
            {n.day} · {n.time}
          </a>
        </li>
      ))}
    </ol>
  );
}
