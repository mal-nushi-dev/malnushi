import type { Metadata } from "next";
import { PhotoFigure } from "@/components/entry/photo-figure";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
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
      <Nav active="Projects" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Photography" category="Archive" />
          <h1 className="type-h1">Photographs</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Newest first. Placeholder copy.
          </p>
        </header>
        <ol className="page flex flex-col gap-(--space-block) pt-(--space-block)">
          {photos.map((photo, i) => (
            // Numbered from the oldest, so a photograph keeps its number.
            <li key={photo.id} className={i % 2 === 1 ? "flex justify-end" : "flex"}>
              <PhotoFigure
                photo={photo}
                index={String(photos.length - i).padStart(2, "0")}
              />
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </>
  );
}
