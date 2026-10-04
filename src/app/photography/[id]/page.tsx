import type { Metadata } from "next";
import { toIndexItem } from "@/components/entry/mappers";
import { PhotoImage } from "@/components/entry/photo-figure";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList } from "@/components/index-list";
import { ArrowLink } from "@/components/links";
import { MetaItem, MetaRow } from "@/components/meta-row";
import { Nav } from "@/components/nav";
import { NextLink } from "@/components/next-link";
import { content, dayOf, exifLine } from "@/lib/content";

// One photograph: the image, its caption and facts, and every entry that
// points at it. Never art-directed, like a note.
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await content();
  return q.list("photo").map((photo) => ({ id: photo.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/photography/[id]">): Promise<Metadata> {
  const { id } = await params;
  const photo = (await content()).need("photo", id);
  return {
    title: photo.title ?? `Photograph, ${dayOf(photo.date)}`,
    description: photo.summary ?? photo.data.alt,
  };
}

export default async function PhotoPage({ params }: PageProps<"/photography/[id]">) {
  const { id } = await params;
  const q = await content();
  const photo = q.need("photo", id);
  const { data } = photo;
  const appearsIn = q.backlinks(photo.ref);
  const { older } = q.adjacent(photo);
  const facts = [dayOf(photo.date), data.place, data.camera, data.lens, ...exifLine(data)];
  return (
    <>
      <Nav active="Projects" />
      <main className="pb-(--space-block)">
        <article className="page flex flex-col gap-(--space-xl) pt-(--space-header-top)">
          <Eyebrow section="Photography" category={dayOf(photo.date)} />
          <figure className="flex flex-col gap-(--space-xl)">
            <PhotoImage photo={photo} aboveTheFold />
            <figcaption className="flex flex-col gap-(--space-xl)">
              {/* Untitled photographs are named by their date for screen readers. */}
              <h1 className={photo.title ? "type-h1" : "sr-only"}>
                {photo.title ?? `Photograph, ${dayOf(photo.date)}`}
              </h1>
              {data.caption && (
                <p className="type-standfirst max-w-(--measure) text-ink-2">{data.caption}</p>
              )}
              <MetaRow>
                {facts.filter(Boolean).map((fact) => (
                  <MetaItem key={fact}>{fact}</MetaItem>
                ))}
              </MetaRow>
            </figcaption>
          </figure>
          <div>
            <ArrowLink href="/photography">All photographs</ArrowLink>
          </div>
        </article>
        {appearsIn.length > 0 && (
          <div className="page pt-(--space-block)">
            <IndexList label="Appears in" items={appearsIn.map(toIndexItem)} />
          </div>
        )}
        {older && (
          <div className="page pt-(--space-block)">
            <NextLink
              label="Next photograph"
              title={older.title ?? older.summary ?? dayOf(older.date)}
              href={older.url}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
