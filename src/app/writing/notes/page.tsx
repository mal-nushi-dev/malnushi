import type { Metadata } from "next";
import { toNoteItem } from "@/components/entry/mappers";
import { Footer } from "@/components/footer";
import { NoteList } from "@/components/note";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
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
      <main className="pb-(--space-block)">
        <PageHeader
          eyebrow={{ section: "Writing", category: "Notes" }}
          title="Notes"
          standfirst="Short posts, newest first. Placeholder copy."
        />
        <PageSection space="block">
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3 max-w-(--measure)">
              <NoteList notes={notes} />
            </div>
          </div>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
