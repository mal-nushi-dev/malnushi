import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink, InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { SectionLabel } from "@/components/section-label";
import { ArticleFilter } from "../article-filter";
import { Masthead } from "../masthead";
import { articles, devJournal, kernel, notes, type Issue } from "../data";
import { ImageSlot, IssueStub, WireNotes } from "../parts";

// Writing index mockup B, "Running rail": a large centered "Kodikion." masthead
// that is typed in monospace and springs into the serif, then
// image-led articles in columns 1–8 and a notes rail in columns 10–12 that
// stays put while they scroll.
export const metadata: Metadata = {
  title: "Writing mockup B · Mal Nushi",
  robots: { index: false },
};

function EarlierIssues({ issues }: { issues: Issue[] }) {
  return (
    <ol className="border-t border-line">
      {issues.map((i) => (
        <li key={i.href} className="border-b border-line">
          <Link
            href={i.href}
            className="group flex items-baseline gap-(--space-sm) py-(--space-sm)"
          >
            <span className="type-meta text-ink-2">
              {String(i.issue).padStart(2, "0")}
            </span>
            <span className="type-body text-ink group-hover:text-link">
              {i.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function WritingMockupB() {
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
