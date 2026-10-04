export type NoteItem = {
  /** The file name; the note lives at /writing/notes/[id]. */
  id: string;
  /** ISO date, in the author's time zone. */
  day: string;
  /** 12-hour time with the zone, for example "2:12 PM EDT". */
  time: string;
  body: React.ReactNode;
};

/** One note: its text, then a mono date line that links to the note. */
export function Note({ note }: { note: NoteItem }) {
  return (
    <article className="flex flex-col gap-(--space-sm)">
      <p className="type-body text-ink">{note.body}</p>
      <a
        href={`/writing/notes/${note.id}`}
        className="type-meta text-ink-2 hover:text-ink"
      >
        {note.day} · {note.time}
      </a>
    </article>
  );
}

/**
 * Notes together, separated by a hairline. Where the list sits on the page
 * is the page's call.
 */
export function NoteList({ notes }: { notes: NoteItem[] }) {
  return (
    <ol>
      {notes.map((n) => (
        <li
          key={n.id}
          className="border-t border-line py-(--space-lg) first:border-t-0 first:pt-0"
        >
          <Note note={n} />
        </li>
      ))}
    </ol>
  );
}
