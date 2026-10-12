import type { Metadata } from "next";
import { DataTable, type Column, type Species } from "@/components/data-table";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { content } from "@/lib/content";
import { regionName } from "@/lib/ebird/places";

// The life list's table: one row a species, the first time it was seen. The
// collection's own page is the map and the numbers; see the design log, 2026-10-11.
export const metadata: Metadata = {
  title: "Species log",
  description: "Every bird species I have identified, newest first.",
};

type Row = {
  id: string;
  no: string;
  species: Species;
  date: string;
  where: string;
  family: string;
};

const columns: Column<Row>[] = [
  { key: "no", label: "No.", width: 56, kind: "mono" },
  { key: "species", label: "Species", width: 330, kind: "species" },
  { key: "date", label: "First seen", width: 110, kind: "mono" },
  { key: "where", label: "Where", width: 330, kind: "ui", muted: true },
  { key: "family", label: "Family", width: 200, kind: "ui", muted: true },
];

export default async function LifeListLogPage() {
  const q = await content();
  const list = q.need("collection", "life-list");
  const first = q.members(list).filter((e) => e.kind === "sighting");
  const rows: Row[] = first
    .map((s, i) => ({
      id: s.id,
      // Numbered from the first species named.
      no: String(i + 1).padStart(3, "0"),
      species: { common: s.data.species, scientific: s.data.scientific },
      date: s.date.slice(0, 10),
      where: s.data.region?.includes("-")
        ? `${s.data.county ? `${s.data.county}, ` : ""}${regionName(s.data.region)}`
        : s.data.place,
      family: s.data.family ?? "",
    }))
    .reverse();

  return (
    <>
      <Nav active="Collections" />
      <main className="pb-(--space-block)">
        <header className="page flex flex-col gap-(--space-md) pt-(--space-header-top)">
          <Eyebrow section="Life list" category="Log" />
          <h1 className="type-h1">Species log</h1>
          <p className="type-standfirst max-w-150 text-ink-2">
            Every bird species I have identified, newest first.
          </p>
          <ArrowLink href="/collections/life-list">The map, and the list counted</ArrowLink>
        </header>
        <div className="page pt-(--space-2xl)">
          <DataTable caption="Species, newest first" columns={columns} rows={rows} rowId="id" />
        </div>
      </main>
      <Footer />
    </>
  );
}
