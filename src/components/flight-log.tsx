"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { DataTable, type Column } from "@/components/data-table";
import { FilterPill } from "@/components/filter-pill";

export type FlightRow = {
  id: string;
  no: string;
  date: string;
  from: string;
  to: string;
  airline: string;
  aircraft: string;
  distance: string;
  time: string;
};

// The widths and the 24px gaps between them come to the content width, 1248.
const columns: Column<FlightRow>[] = [
  { key: "no", label: "No.", width: 58, kind: "mono" },
  { key: "date", label: "Date", width: 112, kind: "mono" },
  { key: "from", label: "From", width: 196, kind: "ui" },
  { key: "to", label: "To", width: 196, kind: "ui" },
  { key: "airline", label: "Airline", width: 180, kind: "ui", muted: true },
  { key: "aircraft", label: "Aircraft", width: 190, kind: "ui", muted: true },
  { key: "distance", label: "Miles", width: 68, kind: "mono", muted: true },
  { key: "time", label: "Time", width: 80, kind: "mono", muted: true },
];

/**
 * Every flight in a table, with a pill for each year flown. One year is
 * shown at a time, or all of them. The choice is the caller's: see
 * `UrlFlightLog` for one kept in the address.
 */
export function FlightLog({
  rows,
  year,
  onChange,
}: {
  rows: FlightRow[];
  /** The year shown, or nothing for every year. */
  year?: string;
  onChange?: (year: string | undefined) => void;
}) {
  const years = [...new Set(rows.map((row) => row.date.slice(0, 4)))].sort().reverse();
  const shown = year ? rows.filter((row) => row.date.startsWith(year)) : rows;
  return (
    <div className="flex flex-col gap-(--space-lg)">
      <div role="group" aria-label="Year" className="flex flex-wrap gap-2">
        <FilterPill size="sm" active={!year} onClick={() => onChange?.(undefined)}>
          All
        </FilterPill>
        {years.map((y) => (
          <FilterPill key={y} size="sm" active={y === year} onClick={() => onChange?.(y)}>
            {y}
          </FilterPill>
        ))}
      </div>
      <p role="status" className="sr-only">
        {shown.length} {shown.length === 1 ? "flight" : "flights"}
      </p>
      <DataTable caption="Flights, newest first" columns={columns} rows={shown} rowId="id" />
    </div>
  );
}

/**
 * A `FlightLog` whose year lives in the address (`?y=2024`), so a year can
 * be linked to and survives a reload. It reads the address, so on a
 * prerendered page it needs a `Suspense` around it, with the plain
 * `FlightLog` as its fallback: see `UrlTileGallery`.
 */
export function UrlFlightLog({ rows }: { rows: FlightRow[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const asked = params.get("y") ?? undefined;
  // A year nothing was flown in is no filter at all.
  const year = rows.some((row) => asked && row.date.startsWith(asked)) ? asked : undefined;

  function change(next: string | undefined) {
    const query = new URLSearchParams(params.toString());
    if (next) query.set("y", next);
    else query.delete("y");
    const search = query.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }

  return <FlightLog rows={rows} year={year} onChange={change} />;
}
