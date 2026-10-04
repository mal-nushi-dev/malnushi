import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFilter } from "@/components/article-filter";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ImageSlot } from "@/components/image-placeholder";
import type { IndexItem } from "@/components/index-list";
import { EarlierIssues, IssueStub, type Issue } from "@/components/issue-stub";
import { ArrowLink, InlineLink } from "@/components/links";
import { Masthead } from "@/components/masthead";
import { Nav } from "@/components/nav";
import type { NoteItem } from "@/components/note";
import { SectionLabel } from "@/components/section-label";
import { WireNotes } from "@/components/wire-notes";

// The Writing index (/writing): the Kodikion masthead, a lead article with
// two more beside it, newsletters, every article behind category filters, and
// a notes rail that stays put while the articles scroll.
export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles and newsletters from my blog, Kodikion, and short notes in between.",
};

// Placeholder copy until the content repo feeds this page (ADR 0006).
type Article = IndexItem & {
  /** The standfirst. Only the lead shows it. */
  subtitle: string;
  date: string;
};

const articles: Article[] = [
  {
    href: "/writing/the-rise-of-gan",
    title: "The rise of GaN",
    category: "Technology",
    year: 2026,
    date: "2026-09-28",
    subtitle:
      "Gallium nitride made the charger smaller than the cable. What it does next is more interesting.",
  },
  {
    href: "/writing/can-you-rebrand-a-systemic-collapse",
    title: "Can you rebrand a systemic collapse?",
    category: "Politics",
    year: 2026,
    date: "2026-08-14",
    subtitle: "A new name is cheaper than a new system, and it shows.",
  },
  {
    href: "/writing/right-to-repair-part-2",
    title: "Right to repair, part 2: the parts pairing problem",
    category: "Technology",
    year: 2025,
    date: "2025-11-02",
    subtitle: "The screw is no longer what keeps you out of your own phone.",
  },
  {
    href: "/writing/exile-on-main-st",
    title: "Exile on Main St.",
    category: "Music",
    year: 2025,
    date: "2025-07-19",
    subtitle: "A murky record that only works because nobody cleaned it up.",
  },
  {
    href: "/writing/the-last-manual-gearbox",
    title: "The last manual gearbox",
    category: "Cars",
    year: 2025,
    date: "2025-03-08",
    subtitle: "On the third pedal, and what goes when it goes.",
  },
];

const kernel: Issue[] = [
  { href: "/writing/the-kernel-12", issue: 12, title: "A clock that runs on gravity", date: "2026-09-30" },
  { href: "/writing/the-kernel-11", issue: 11, title: "Small web, big maps", date: "2026-09-16" },
  { href: "/writing/the-kernel-10", issue: 10, title: "The quietest keyboard", date: "2026-09-02" },
];

const devJournal: Issue[] = [
  { href: "/writing/dev-journal-8", issue: 8, title: "Teaching a DNS filter to forget", date: "2026-09-24" },
  { href: "/writing/dev-journal-7", issue: 7, title: "Three rebuilds of one nav", date: "2026-09-10" },
  { href: "/writing/dev-journal-6", issue: 6, title: "The bug that only ran on Tuesdays", date: "2026-08-27" },
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

export default function WritingPage() {
  const [lead, second, third] = articles;
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col items-center gap-(--space-lg) pt-(--space-2xl)">
          <div className="grid w-full grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-8 col-start-3">
              <Masthead />
            </div>
          </div>
          <p className="type-standfirst text-ink-2">
            A blog by Mal Nushi. Also on{" "}
            <InlineLink href="https://kodikion.substack.com">Substack</InlineLink>
            .
          </p>
          <div className="h-px w-full bg-ink" />
        </header>

        <div className="page grid grid-cols-12 items-start gap-x-(--col-gap) pt-(--space-xl)">
          <div className="col-span-8 flex flex-col gap-(--space-block)">
            <Link href={lead.href} className="group flex flex-col gap-(--space-md)">
              <ImageSlot label="LEAD — 824 × 549" className="aspect-3/2" />
              <Eyebrow section="Writing" category={lead.category} />
              <h2 className="type-quote text-ink group-hover:text-link">
                {lead.title}
              </h2>
              <p className="max-w-150 type-body text-ink-2">{lead.subtitle}</p>
              <span className="type-meta text-ink-2">{lead.date}</span>
            </Link>

            {/* Two more, deliberately unequal, as on Home's features. */}
            <div className="grid grid-cols-8 items-start gap-x-(--col-gap)">
              <Link href={second.href} className="group col-span-5 flex flex-col gap-(--space-md)">
                <ImageSlot label="IMAGE — 506 × 337" className="aspect-3/2" />
                <Eyebrow section="Writing" category={second.category} />
                <h3 className="type-index-title text-ink group-hover:text-link">
                  {second.title}
                </h3>
              </Link>
              <Link
                href={third.href}
                className="group col-span-3 mt-(--space-block) flex flex-col gap-(--space-md)"
              >
                <ImageSlot label="IMAGE — 294 × 392" className="aspect-3/4" />
                <Eyebrow section="Writing" category={third.category} />
                <h3 className="type-index-title text-ink group-hover:text-link">
                  {third.title}
                </h3>
              </Link>
            </div>

            <section className="flex flex-col gap-(--space-lg)">
              <SectionLabel>Newsletters</SectionLabel>
              <div className="grid grid-cols-8 gap-x-(--col-gap)">
                <div className="col-span-4 flex flex-col gap-(--space-lg)">
                  <IssueStub name="The Kernel" href="/writing/the-kernel" issue={kernel[0]} />
                  <EarlierIssues issues={kernel.slice(1)} />
                </div>
                <div className="col-span-4 flex flex-col gap-(--space-lg)">
                  <IssueStub name="Dev Journal" href="/writing/dev-journal" issue={devJournal[0]} />
                  <EarlierIssues issues={devJournal.slice(1)} />
                </div>
              </div>
            </section>

            <ArticleFilter label="All articles" items={articles} />
          </div>

          <aside
            aria-label="Notes"
            className="sticky top-(--space-lg) col-span-3 col-start-10 flex flex-col gap-(--space-lg)"
          >
            <SectionLabel>Notes</SectionLabel>
            <WireNotes notes={notes} type="type-ui" />
            <div>
              <ArrowLink href="/writing/notes">All notes</ArrowLink>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
