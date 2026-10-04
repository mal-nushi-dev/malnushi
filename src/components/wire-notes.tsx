import type { NoteItem } from "@/components/note";
import { cx } from "@/lib/site";

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
