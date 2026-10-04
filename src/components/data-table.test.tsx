import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DataTable,
  legoColumns,
  lifeListColumns,
  type LegoRow,
  type LifeListRow,
} from "./data-table";

const birds: LifeListRow[] = [
  {
    no: "001",
    species: { common: "Carolina Wren", scientific: "Thryothorus ludovicianus" },
    family: "Troglodytidae",
    firstSeen: "2026-09-27",
    where: "Charlotte",
  },
  {
    no: "002",
    species: { common: "Northern Cardinal", scientific: "Cardinalis cardinalis" },
    family: "Cardinalidae",
    firstSeen: "2026-09-28",
    where: "Davidson",
  },
];

const sets: LegoRow[] = [
  {
    no: "001",
    setName: "Skyline",
    setNumber: "21028",
    pieces: 1000,
    year: 2025,
    status: "Built",
  },
];

describe("DataTable", () => {
  it("is a table named by its caption", () => {
    render(
      <DataTable caption="Life list" columns={lifeListColumns} rows={birds} />,
    );
    expect(screen.getByRole("table", { name: "Life list" })).toBeInTheDocument();
  });

  it("has a column header for each column", () => {
    render(
      <DataTable caption="Life list" columns={lifeListColumns} rows={birds} />,
    );
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(lifeListColumns.map((c) => c.label));
  });

  it("renders one row per item, plus the header row", () => {
    render(
      <DataTable caption="Life list" columns={lifeListColumns} rows={birds} />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(birds.length + 1);
  });

  it("shows the common and scientific names in the species cell", () => {
    render(
      <DataTable caption="Life list" columns={lifeListColumns} rows={birds} />,
    );
    const row = screen.getAllByRole("row")[1];
    const cell = within(row).getByText("Carolina Wren").closest("td")!;
    expect(cell).toHaveTextContent("Thryothorus ludovicianus");
  });

  it("puts values in the column they belong to", () => {
    render(
      <DataTable caption="Life list" columns={lifeListColumns} rows={birds} />,
    );
    const cells = within(screen.getAllByRole("row")[2]).getAllByRole("cell");
    expect(cells.map((c) => c.textContent)).toEqual([
      "002",
      "Northern CardinalCardinalis cardinalis",
      "Cardinalidae",
      "2026-09-28",
      "Davidson",
    ]);
  });

  it("renders numbers as text and works with another column set", () => {
    render(<DataTable caption="Lego" columns={legoColumns} rows={sets} />);
    const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
    expect(cells.map((c) => c.textContent)).toEqual([
      "001",
      "Skyline",
      "21028",
      "1000",
      "2025",
      "Built",
    ]);
  });

  it("renders only the header when there are no rows", () => {
    render(<DataTable caption="Empty" columns={lifeListColumns} rows={[]} />);
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});
