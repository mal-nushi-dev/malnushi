import type { Metadata } from "next";
import { toNoteItem } from "@/components/entry/mappers";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { NoteList } from "@/components/note";
import { content } from "@/lib/content";

// The note stream (/writing/notes): short posts in reading column, newest first.
export const metadata: Metadata = {
  title: "Notes",
  description: "Short posts, newest first.",
};

export default async function NotesPage() {
  const q = await content();
  const notes = q.list("note").map(toNoteItem);
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
