import { cx } from "@/lib/site";

type CellKind = "mono" | "ui" | "species";

export type Column<Row> = {
  key: keyof Row & string;
  label: string;
  /** Column width in px at 1248, not counting the 24px gap. */
  width: number;
  kind: CellKind;
  /** Secondary columns are --ink-2. */
  muted?: boolean;
};

export type Species = { common: string; scientific: string };

const kindClass: Record<Exclude<CellKind, "species">, string> = {
  mono: "type-meta",
  ui: "type-ui",
};

function Cell({ value, kind }: { value: unknown; kind: CellKind }) {
  if (kind === "species") {
    const { common, scientific } = value as Species;
    return (
      <>
        <span className="block type-body text-ink">{common}</span>
        <span className="block type-body italic text-ink-2">{scientific}</span>
      </>
    );
  }
  return <>{String(value)}</>;
}

/**
 * Collection table: 1px --ink rule over label headers, then rows with
 * hairlines between them. Each collection passes its own columns.
 */
export function DataTable<Row extends Record<string, unknown>>({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
}) {
  const last = columns.length - 1;
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <colgroup>
        {columns.map((c, i) => (
          <col key={c.key} style={{ width: c.width + (i < last ? 24 : 0) }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-t border-b border-t-ink border-b-line">
          {columns.map((c, i) => (
            <th
              key={c.key}
              scope="col"
              className={cx(
                "py-(--space-sm) align-middle font-normal type-label text-ink-2",
                i < last && "pr-(--col-gap)",
              )}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-line">
            {columns.map((c, i) => (
              <td
                key={c.key}
                className={cx(
                  "py-(--space-row-table) align-middle",
                  c.kind !== "species" && kindClass[c.kind],
                  c.muted ? "text-ink-2" : "text-ink",
                  i < last && "pr-(--col-gap)",
                )}
              >
                <Cell value={row[c.key]} kind={c.kind} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type LifeListRow = {
  no: string;
  species: Species;
  family: string;
  firstSeen: string;
  where: string;
};

export const lifeListColumns: Column<LifeListRow>[] = [
  { key: "no", label: "No.", width: 82, kind: "mono" },
  { key: "species", label: "Species", width: 400, kind: "species" },
  { key: "family", label: "Family", width: 294, kind: "ui" },
  { key: "firstSeen", label: "First seen", width: 188, kind: "mono", muted: true },
  { key: "where", label: "Where", width: 188, kind: "ui", muted: true },
];

export type LegoRow = {
  no: string;
  setName: string;
  setNumber: string;
  pieces: number;
  year: number;
  status: string;
};

export const legoColumns: Column<LegoRow>[] = [
  { key: "no", label: "No.", width: 82, kind: "mono" },
  { key: "setName", label: "Set name", width: 400, kind: "ui" },
  { key: "setNumber", label: "Set number", width: 188, kind: "mono", muted: true },
  { key: "pieces", label: "Pieces", width: 188, kind: "mono", muted: true },
  { key: "year", label: "Year", width: 148, kind: "mono", muted: true },
  { key: "status", label: "Status", width: 122, kind: "ui", muted: true },
];
