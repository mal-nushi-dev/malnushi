import type { Metadata } from "next";
import { toIndexItem } from "@/components/entry/mappers";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList } from "@/components/index-list";
import { Nav } from "@/components/nav";
import { content } from "@/lib/content";

// Every track (/music), newest first. The layout is provisional; see the
// design log, 2026-10-05.
export const metadata: Metadata = {
  title: "Music",
  description: "Tracks, newest first.",
};

export default async function MusicPage() {
  const tracks = (await content()).list("track");
  return (
    <>
      <Nav active="Projects" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Music" category="Tracks" />
          <h1 className="type-h1">Music</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Newest first. Placeholder copy.
          </p>
        </header>
        <div className="page pt-(--space-block)">
          <IndexList label="Tracks" items={tracks.map(toIndexItem)} />
        </div>
      </main>
      <Footer />
    </>
  );
}
