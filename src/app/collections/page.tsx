import type { Metadata } from "next";
import { Suspense } from "react";
import { toSpine } from "@/components/entry/mappers";
import { Footer } from "@/components/footer";
import { Shelf, UrlShelf, type ShelfItem } from "@/components/shelf";
import { content } from "@/lib/content";

// The collections index: every collection as a spine on one shelf. See the
// design log, 2026-10-10.
export const metadata: Metadata = {
  title: "Collections",
  description: "Lists I keep and numbers I keep counting.",
};

export default async function CollectionsPage() {
  const q = await content();
  // A collection with no rows has nothing to show and is left off the shelf.
  const items = q
    .list("collection")
    .map((collection) => toSpine(collection, q))
    .filter((item): item is ShelfItem => item !== undefined);

  return (
    <>
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <h1 className="type-h1">Collections</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Lists I keep and numbers I keep counting. None of them is finished.
          </p>
        </header>
        <div className="page pt-(--space-2xl)">
          {/* The arrangement is read from the address, which a prerendered
              page does not have: until it does, the shelf is all together. */}
          <Suspense fallback={<Shelf items={items} />}>
            <UrlShelf items={items} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
