import type { Metadata } from "next";
import { ArticleFilter } from "@/components/article-filter";
import { toIndexItem, toIssue, toNoteItem } from "@/components/entry/mappers";
import { FeatureCard } from "@/components/feature-card";
import { Footer } from "@/components/footer";
import { ImageSlot } from "@/components/image-placeholder";
import { EarlierIssues, IssueStub } from "@/components/issue-stub";
import { ArrowLink, InlineLink } from "@/components/links";
import { Masthead } from "@/components/masthead";
import { SectionLabel } from "@/components/section-label";
import { WireNotes } from "@/components/wire-notes";
import { content } from "@/lib/content";

// The Writing index (/writing): the Kodikion masthead, a lead article with
// two more beside it, newsletters, every article behind category filters, and
// a notes rail that stays put while the articles scroll.
export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles and newsletters from my blog, Kodikion, and short notes in between.",
};

export default async function WritingPage() {
  const q = await content();
  const articles = q
    .list("post", { where: (p) => p.data.type === "article" })
    .map((p) => ({ ...toIndexItem(p), subtitle: p.data.subtitle, date: p.data.date }));
  const issuesOf = (type: "the-kernel" | "dev-journal") =>
    q.list("post", { where: (p) => p.data.type === type }).map(toIssue);
  const kernel = issuesOf("the-kernel");
  const devJournal = issuesOf("dev-journal");
  const notes = q.list("note", { limit: 3 }).map(toNoteItem);
  const [lead, second, third] = articles;
  return (
    <>
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
            <FeatureCard
              href={lead.href}
              size="lead"
              as="h2"
              image={<ImageSlot label="LEAD — 824 × 549" className="aspect-3/2" />}
              eyebrow={{ section: "Writing", category: lead.category }}
              title={lead.title}
              summary={lead.subtitle}
              meta={lead.date}
            />

            {/* Two more, deliberately unequal, as on Home's features. */}
            <div className="grid grid-cols-8 items-start gap-x-(--col-gap)">
              <FeatureCard
                href={second.href}
                size="small"
                className="col-span-5"
                image={<ImageSlot label="IMAGE — 506 × 337" className="aspect-3/2" />}
                eyebrow={{ section: "Writing", category: second.category }}
                title={second.title}
              />
              <FeatureCard
                href={third.href}
                size="small"
                className="col-span-3 mt-(--space-block)"
                image={<ImageSlot label="IMAGE — 294 × 392" className="aspect-3/4" />}
                eyebrow={{ section: "Writing", category: third.category }}
                title={third.title}
              />
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
