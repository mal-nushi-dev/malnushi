import type { Metadata } from "next";
import { PhotoFigure } from "@/components/entry/photo-figure";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
import { content } from "@/lib/content";

// The photo archive (/photography): every photograph, newest first, one at
// a time. The layout is provisional; see the design log, 2026-10-04.
export const metadata: Metadata = {
  title: "Photographs",
  description: "Photographs, newest first.",
};

export default async function PhotographyPage() {
  const photos = (await content()).list("photo");
  return (
    <>
      <main className="pb-(--space-block)">
        <PageHeader
          eyebrow={{ section: "Photography", category: "Archive" }}
          title="Photographs"
          standfirst="Newest first. Placeholder copy."
        />
        <PageSection as="ol" space="block" className="flex flex-col gap-(--space-block)">
          {photos.map((photo, i) => (
            // Numbered from the oldest, so a photograph keeps its number.
            <li key={photo.id} className={i % 2 === 1 ? "flex justify-end" : "flex"}>
              <PhotoFigure
                photo={photo}
                index={String(photos.length - i).padStart(2, "0")}
              />
            </li>
          ))}
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
