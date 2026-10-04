import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";

// Mockup of the note stream (the layout Mal chose, 2026-10-03). Not linked
// from the site. Desktop only; the copy is placeholder. Delete once the real
// stream at /writing/notes is built.
export const metadata: Metadata = {
  title: "Note stream mockup",
  robots: { index: false },
};

type Note = { id: string; day: string; time: string; body: React.ReactNode };

const notes: Note[] = [
  {
    id: "2026-10-03-1412",
    day: "2026-10-03",
    time: "2:12 PM EDT",
    body: "A Carolina wren has been shouting at the window since seven. Loudest bird per gram I know of.",
  },
  {
    id: "2026-10-03-0931",
    day: "2026-10-03",
    time: "9:31 AM EDT",
    body: (
      <>
        Spent the morning reading about tandem OLED. Two emissive layers,
        roughly double the brightness for the same wear. I wrote about where
        this was heading in{" "}
        <InlineLink href="/writing/we-need-to-talk-about-displays">
          the displays piece
        </InlineLink>
        ; it got here sooner than I guessed.
      </>
    ),
  },
  {
    id: "2026-10-01-2204",
    day: "2026-10-01",
    time: "10:04 PM EDT",
    body: "Every charger I own is now smaller than the cable that goes with it.",
  },
  {
    id: "2026-09-29-1840",
    day: "2026-09-29",
    time: "6:40 PM EDT",
    body: "Rebuilt the nav three times this week. The version I kept is the one with the fewest moving parts, which is how it usually goes. The spring took an afternoon; deciding that the top edge should never move took two days and made the bigger difference.",
  },
];

const grid = "grid grid-cols-12 gap-x-(--col-gap)";

/** The essay's reading column. Text, then a mono date underneath. */
function ReadingColumn() {
  return (
    <div className={grid}>
      <ol className="col-span-7 col-start-3 max-w-(--measure)">
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex flex-col gap-(--space-sm) border-t border-line py-(--space-lg) first:border-t-0 first:pt-0"
          >
            <p className="type-body text-ink">{n.body}</p>
            <a
              href={`/writing/notes/${n.id}`}
              className="type-meta text-ink-2 hover:text-ink"
            >
              {n.day} · {n.time}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function NoteMockup() {
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Writing" category="Notes" />
          <h1 className="type-h1">Notes</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Short posts, newest first. Placeholder copy.
          </p>
        </header>
        <section className="page pt-(--space-block)">
          <ReadingColumn />
        </section>
      </main>
      <Footer />
    </>
  );
}
