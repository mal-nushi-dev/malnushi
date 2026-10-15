import type { Metadata } from "next";
import { toIndexItem } from "@/components/entry/mappers";
import { Footer } from "@/components/footer";
import { IndexList } from "@/components/index-list";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
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
      <main className="pb-(--space-block)">
        <PageHeader
          eyebrow={{ section: "Music", category: "Tracks" }}
          title="Music"
          standfirst="Newest first. Placeholder copy."
        />
        <PageSection as="div" space="block">
          <IndexList label="Tracks" items={tracks.map(toIndexItem)} />
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
