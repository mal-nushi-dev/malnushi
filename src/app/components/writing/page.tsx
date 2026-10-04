import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList, type IndexItem } from "@/components/index-list";
import { ArrowLink, InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { NoteList, type NoteItem } from "@/components/note";
import { SectionLabel } from "@/components/section-label";

// Mockup of the Writing index (/writing). Not linked from the site. Desktop
// only; the copy is placeholder. Delete once the real page is built.
export const metadata: Metadata = {
  title: "Writing index mockup",
  robots: { index: false },
};

const articles: IndexItem[] = [
  { href: "/writing/the-rise-of-gan", title: "The rise of GaN", category: "Technology", year: 2026 },
  { href: "/writing/can-you-rebrand-a-systemic-collapse", title: "Can you rebrand a systemic collapse?", category: "Politics", year: 2026 },
  { href: "/writing/right-to-repair-part-2", title: "Right to repair, part 2: the parts pairing problem", category: "Technology", year: 2025 },
  { href: "/writing/exile-on-main-st", title: "Exile on Main St.", category: "Music", year: 2025 },
  { href: "/writing/the-last-manual-gearbox", title: "The last manual gearbox", category: "Cars", year: 2025 },
];

const kernel: IndexItem[] = [
  { href: "/writing/the-kernel-12", title: "The Kernel 12: a clock that runs on gravity", category: "Issue 12", year: 2026 },
  { href: "/writing/the-kernel-11", title: "The Kernel 11: small web, big maps", category: "Issue 11", year: 2026 },
  { href: "/writing/the-kernel-10", title: "The Kernel 10: the quietest keyboard", category: "Issue 10", year: 2026 },
];

const devJournal: IndexItem[] = [
  { href: "/writing/dev-journal-8", title: "Dev Journal 8: teaching a DNS filter to forget", category: "Issue 8", year: 2026 },
  { href: "/writing/dev-journal-7", title: "Dev Journal 7: three rebuilds of one nav", category: "Issue 7", year: 2026 },
  { href: "/writing/dev-journal-6", title: "Dev Journal 6: the bug that only ran on Tuesdays", category: "Issue 6", year: 2026 },
];

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
        Spent the morning reading about tandem OLED. I wrote about where this
        was heading in{" "}
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
];

export default function WritingMockup() {
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Writing" category="Kodikion" />
          <h1 className="type-h1">Writing</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Articles and newsletters from my blog, Kodikion, and short notes in
            between. Kodikion also lives on{" "}
            <InlineLink href="https://kodikion.substack.com">Substack</InlineLink>
            , where you can subscribe.
          </p>
        </header>

        <section className="page flex flex-col gap-(--space-lg) pt-(--space-block)">
          <IndexList label="Articles" items={articles} />
        </section>

        <section className="page flex flex-col gap-(--space-block) pt-(--space-block)">
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="The Kernel" items={kernel} />
            <ArrowLink href="/writing/the-kernel">All of The Kernel</ArrowLink>
          </div>
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="Dev Journal" items={devJournal} />
            <ArrowLink href="/writing/dev-journal">All of Dev Journal</ArrowLink>
          </div>
        </section>

        <section className="page flex flex-col gap-(--space-xl) pt-(--space-block)">
          <SectionLabel>Notes</SectionLabel>
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3 max-w-(--measure)">
              <NoteList notes={notes} />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3">
              <ArrowLink href="/writing/notes">All notes</ArrowLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
