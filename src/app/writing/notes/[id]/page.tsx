import type { Metadata } from "next";
import { toNoteItem } from "@/components/entry/mappers";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { Note } from "@/components/note";
import { content, noteDateLine } from "@/lib/content";

// One note alone, with a link back to the stream.
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await content();
  return q.list("note").map((note) => ({ id: note.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/writing/notes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const note = (await content()).need("note", id);
  return { title: `Note, ${noteDateLine(note.date).day}`, description: note.summary };
}

export default async function NotePage({ params }: PageProps<"/writing/notes/[id]">) {
  const { id } = await params;
  const note = (await content()).need("note", id);
  const { day, time } = noteDateLine(note.date);
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <div className="page grid grid-cols-12 gap-x-(--col-gap) pt-(--space-header-top)">
          <div className="col-span-7 col-start-3 flex max-w-(--measure) flex-col gap-(--space-xl)">
            <Eyebrow section="Writing" category="Notes" />
            {/* A note has no title; the heading names it for screen readers. */}
            <h1 className="sr-only">
              Note, {day}, {time}
            </h1>
            <Note note={toNoteItem(note)} />
            <div>
              <ArrowLink href="/writing/notes">All notes</ArrowLink>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
