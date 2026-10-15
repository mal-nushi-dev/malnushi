import type { Metadata } from "next";
import { Suspense } from "react";
import { toSpine } from "@/components/entry/mappers";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { PageSection } from "@/components/page-section";
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
        <PageHeader
          title="Collections"
          standfirst="Lists I keep and numbers I keep counting. None of them is finished."
        />
        <PageSection as="div">
          {/* The arrangement is read from the address, which a prerendered
              page does not have: until it does, the shelf is all together. */}
          <Suspense fallback={<Shelf items={items} />}>
            <UrlShelf items={items} />
          </Suspense>
        </PageSection>
      </main>
      <Footer />
    </>
  );
}
