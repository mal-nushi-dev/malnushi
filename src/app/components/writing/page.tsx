import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList, type IndexItem } from "@/components/index-list";
import { Nav } from "@/components/nav";

// Chooser for the three Writing index mockups. Not linked from the site.
export const metadata: Metadata = {
  title: "Writing mockups · Mal Nushi",
  robots: { index: false },
};

const directions: IndexItem[] = [
  { href: "/components/writing/a", title: "Broadsheet", category: "Nameplate and column rules", year: "A" },
  { href: "/components/writing/b", title: "Running rail", category: "Image-led, sticky notes rail", year: "B" },
  { href: "/components/writing/c", title: "Live index", category: "The image follows the list", year: "C" },
];

export default function WritingMockups() {
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Components" category="Writing index" />
          <h1 className="type-h1">Three front pages</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Three directions for the Writing index, on the same sample content.
            None is chosen yet.
          </p>
        </header>
        <div className="page pt-(--space-block)">
          <IndexList label="Directions" items={directions} />
        </div>
      </main>
      <Footer />
    </>
  );
}
