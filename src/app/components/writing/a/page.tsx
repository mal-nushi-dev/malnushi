import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink, InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { ArticleFilter } from "../article-filter";
import { articles, devJournal, kernel, notes } from "../data";
import { ImageSlot, IssueStub, WireNotes } from "../parts";

// Writing index mockup A, "Broadsheet": a nameplate, then a front page of
// three zones divided by column rules, then the article index.
export const metadata: Metadata = {
  title: "Writing mockup A · Mal Nushi",
  robots: { index: false },
};

const zone = "border-l border-line pl-(--col-gap)";

export default function WritingMockupA() {
  const lead = articles[0];
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page pt-(--space-2xl)">
          <div className="flex items-baseline justify-between border-t border-ink pt-(--space-sm) type-meta text-ink-2">
            <span>Kodikion</span>
            <span>2026-10-04</span>
            <span>5 articles · 20 issues · 3 notes this week</span>
            <InlineLink href="https://kodikion.substack.com">
              Subscribe on Substack
            </InlineLink>
          </div>
          <h1 className="py-(--space-lg) text-center type-h1">Writing</h1>
          <div className="h-px bg-ink" />
        </header>

        <section className="page pt-(--space-lg)">
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <Link
              href={lead.href}
              className="group col-span-6 flex flex-col gap-(--space-md)"
            >
              <ImageSlot label="LEAD — 612 × 408" className="aspect-3/2" />
              <Eyebrow section="Writing" category={lead.category} />
              <h2 className="type-quote text-ink group-hover:text-link">
                {lead.title}
              </h2>
              <p className="type-body text-ink-2">{lead.subtitle}</p>
              <span className="type-meta text-ink-2">{lead.date}</span>
            </Link>

            <div className={`col-span-3 flex flex-col gap-(--space-lg) ${zone}`}>
              <h2 className="type-label text-ink-2">Latest issues</h2>
              <IssueStub
                name="The Kernel"
                href="/writing/the-kernel"
                issue={kernel[0]}
              />
              <div className="h-px bg-line" />
              <IssueStub
                name="Dev Journal"
                href="/writing/dev-journal"
                issue={devJournal[0]}
              />
            </div>

            <div className={`col-span-3 flex flex-col gap-(--space-lg) ${zone}`}>
              <h2 className="type-label text-ink-2">Notes</h2>
              <WireNotes notes={notes} />
              <div>
                <ArrowLink href="/writing/notes">All notes</ArrowLink>
              </div>
            </div>
          </div>
        </section>

        <div className="page pt-(--space-block)">
          <ArticleFilter label="Articles" items={articles} />
        </div>
      </main>
      <Footer />
    </>
  );
}
