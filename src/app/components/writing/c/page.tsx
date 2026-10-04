import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink, InlineLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { NoteList } from "@/components/note";
import { articles, devJournal, kernel, notes } from "../data";
import { LiveIndex } from "../live-index";
import { IssueStub } from "../parts";

// Writing index mockup C, "Live index": the article list leads, and an image
// beside it follows the row being pointed at. Newsletters and notes share one
// row beneath.
export const metadata: Metadata = {
  title: "Writing mockup C · Mal Nushi",
  robots: { index: false },
};

const zone = "border-l border-line pl-(--col-gap)";

export default function WritingMockupC() {
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Writing" category="Kodikion" />
          <h1 className="type-h1">Writing</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Articles and newsletters from my blog, Kodikion, and short notes in
            between. Also on{" "}
            <InlineLink href="https://kodikion.substack.com">Substack</InlineLink>
            , where you can subscribe.
          </p>
        </header>

        <div className="page pt-(--space-2xl)">
          <LiveIndex items={articles} />
        </div>

        <section className="page pt-(--space-block)">
          <div className="grid grid-cols-12 gap-x-(--col-gap) border-t border-ink pt-(--space-lg)">
            <div className="col-span-3">
              <IssueStub name="The Kernel" href="/writing/the-kernel" issue={kernel[0]} />
            </div>
            <div className={`col-span-3 ${zone}`}>
              <IssueStub name="Dev Journal" href="/writing/dev-journal" issue={devJournal[0]} />
            </div>
            <div className={`col-span-6 flex flex-col gap-(--space-lg) ${zone}`}>
              <h2 className="type-label text-ink-2">Notes</h2>
              <NoteList notes={notes} />
              <div>
                <ArrowLink href="/writing/notes">All notes</ArrowLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
