import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { NoteList, type NoteItem } from "@/components/note";

// The note stream (/writing/notes): short posts in reading column, newest first.
export const metadata: Metadata = {
  title: "Notes",
  description: "Short posts, newest first.",
};

const notes: NoteItem[] = [
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

export default function NotesPage() {
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
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3 max-w-(--measure)">
              <NoteList notes={notes} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
