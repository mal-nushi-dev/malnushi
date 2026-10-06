import type { Metadata } from "next";
import { Suspense } from "react";
import { coverOf, disciplineOf, toTile } from "@/components/entry/mappers";
import { TileCover } from "@/components/entry/tile-cover";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { tileSizeAt } from "@/components/tile";
import { TileGallery, UrlTileGallery, type GalleryItem } from "@/components/tile-gallery";
import { content } from "@/lib/content";
import { filterKeys, filtersFrom } from "@/lib/filter";

// The projects gallery (/projects): everything made, as a tight wall of
// tiles, the last changed first. See the design log, 2026-10-06.
export const metadata: Metadata = {
  title: "Projects",
  description: "Code, design, hardware, Lego, photography and music by Mal Nushi.",
};

const noun = { one: "project", many: "projects" };

export default async function ProjectsPage() {
  const q = await content();
  const entries = q.stream({ kinds: ["project", "photo-series", "album"], by: "updated" });
  const filters = filtersFrom(entries.map(disciplineOf));
  const items: GalleryItem[] = entries.map((entry, i) => {
    const tile = toTile(entry, q);
    const size = tileSizeAt(i);
    return {
      ...tile,
      id: entry.ref,
      size,
      keys: filterKeys(disciplineOf(entry), entry.tags, filters),
      cover: <TileCover photo={coverOf(entry, q)} title={tile.title} size={size} />,
    };
  });
  return (
    <>
      <Nav active="Projects" />
      <main className="pb-(--space-block)">
        <h1 className="page pt-(--space-lg) pb-(--space-2xl) text-center type-feature-display">
          Projects
        </h1>
        <div className="page">
          {/* The filter is read from the address, which a prerendered page
              does not have: until it does, the whole gallery is shown. */}
          <Suspense fallback={<TileGallery items={items} filters={filters} noun={noun} />}>
            <UrlTileGallery items={items} filters={filters} noun={noun} />
          </Suspense>
        </div>
        <nav
          aria-label="Archives"
          className="page flex justify-center gap-(--space-xl) pt-(--space-2xl)"
        >
          <ArrowLink href="/photography">All photos</ArrowLink>
          <ArrowLink href="/music">All music</ArrowLink>
        </nav>
      </main>
      <Footer />
    </>
  );
}
