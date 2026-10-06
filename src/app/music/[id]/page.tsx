import type { Metadata } from "next";
import { EntryBody } from "@/components/entry/body";
import { toIndexItem } from "@/components/entry/mappers";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList } from "@/components/index-list";
import { ArrowLink } from "@/components/links";
import { MetaItem, MetaRow } from "@/components/meta-row";
import { Nav } from "@/components/nav";
import { NextLink } from "@/components/next-link";
import { content, trackLine } from "@/lib/content";

// One track: its facts, its liner notes, the releases it is on and every
// entry that shows it. Never art-directed, like a photograph. There is no
// player yet.
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await content();
  return q.list("track").map((track) => ({ id: track.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/music/[id]">): Promise<Metadata> {
  const { id } = await params;
  const track = (await content()).need("track", id);
  return { title: track.data.title, description: track.summary };
}

export default async function TrackPage({ params }: PageProps<"/music/[id]">) {
  const { id } = await params;
  const q = await content();
  const track = q.need("track", id);
  const { data } = track;
  // A track can be on several releases; none of them owns it.
  const releases = q.partOf(track.ref, "album").map((part) => part.parent);
  const appearsIn = q.backlinks(track.ref, "embeds");
  const { older } = q.adjacent(track);
  const facts = [data.date, ...trackLine(data), data.composer?.join(", ")];
  return (
    <>
      <Nav active="Projects" />
      <main className="pb-(--space-block)">
        <article className="page flex flex-col gap-(--space-xl) pt-(--space-header-top)">
          <Eyebrow section="Music" category="Track" />
          <h1 className="type-h1">{data.title}</h1>
          {data.subtitle && (
            <p className="type-standfirst max-w-(--measure) text-ink-2">{data.subtitle}</p>
          )}
          <MetaRow>
            {facts.filter(Boolean).map((fact) => (
              <MetaItem key={fact}>{fact}</MetaItem>
            ))}
          </MetaRow>
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3 flex max-w-(--measure) flex-col gap-(--space-md)">
              <EntryBody entry={track} />
            </div>
          </div>
          <div>
            <ArrowLink href="/music">All tracks</ArrowLink>
          </div>
        </article>
        {releases.length > 0 && (
          <div className="page pt-(--space-block)">
            <IndexList label="Appears on" items={releases.map(toIndexItem)} />
          </div>
        )}
        {appearsIn.length > 0 && (
          <div className="page pt-(--space-block)">
            <IndexList label="Appears in" items={appearsIn.map(toIndexItem)} />
          </div>
        )}
        {older && (
          <div className="page pt-(--space-block)">
            <NextLink label="Next track" title={older.data.title} href={older.url} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
