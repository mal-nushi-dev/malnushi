import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { Tile, TileGrid, TileGridItem, tileSizeAt, type TileSize } from "./tile";

const tile = {
  href: "/projects/lamp",
  title: "A desk lamp",
  summary: "From salvaged parts.",
  label: "Hardware",
  year: 2025,
};

describe("Tile", () => {
  const plateOf = (container: HTMLElement) =>
    within(container.querySelector<HTMLElement>("[data-tile-plate]")!);

  it("is one link to the piece, named by its title and what it is", () => {
    render(
      <Tile {...tile} status="Finished">
        cover
      </Tile>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/lamp");
    expect(link).toHaveAccessibleName(
      "A desk lamp Hardware. 2025. From salvaged parts.. Finished",
    );
  });

  it("says the same on its plate, which is hidden from screen readers", () => {
    const { container } = render(<Tile {...tile}>cover</Tile>);
    expect(container.querySelector("[data-tile-plate]")).toHaveAttribute("aria-hidden", "true");
    const plate = plateOf(container);
    for (const text of ["A desk lamp", "Hardware", "2025", "From salvaged parts."]) {
      expect(plate.getByText(text)).toBeInTheDocument();
    }
  });

  it("titles the piece with a heading", () => {
    render(<Tile {...tile}>cover</Tile>);
    expect(screen.getByRole("heading", { level: 2, name: "A desk lamp" })).toBeInTheDocument();
  });

  it("draws its children as the cover", () => {
    render(
      <Tile {...tile}>
        <span role="img" aria-label="The lamp" />
      </Tile>,
    );
    expect(screen.getByRole("img", { name: "The lamp", hidden: true })).toBeInTheDocument();
    // The cover is decoration: it adds nothing to the link's name.
    expect(screen.getByRole("link")).toHaveAccessibleName(/^A desk lamp/);
  });

  it("shows a status only when there is one", () => {
    const { container, rerender } = render(<Tile {...tile}>cover</Tile>);
    expect(plateOf(container).queryByText("In progress")).not.toBeInTheDocument();
    rerender(
      <Tile {...tile} status="In progress">
        cover
      </Tile>,
    );
    expect(plateOf(container).getByText("In progress")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAccessibleName(/In progress$/);
  });

  it("leaves out the summary when there is none", () => {
    render(
      <Tile {...tile} summary={undefined}>
        cover
      </Tile>,
    );
    expect(screen.queryByText("From salvaged parts.")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAccessibleName("A desk lamp Hardware. 2025");
  });

  it("sets a larger title on a tile two columns wide", () => {
    const { container, rerender } = render(<Tile {...tile}>cover</Tile>);
    expect(plateOf(container).getByText("A desk lamp")).toHaveClass("type-index-title");
    for (const size of ["wide", "large"] as const) {
      rerender(
        <Tile {...tile} size={size}>
          cover
        </Tile>,
      );
      expect(plateOf(container).getByText("A desk lamp")).toHaveClass("type-quote");
    }
  });

  it("re-points the color tokens under its plate", () => {
    const { container } = render(<Tile {...tile}>cover</Tile>);
    expect(plateOf(container).getByText("A desk lamp").closest("[data-tile-plate]")).not.toBeNull();
  });
});

describe("TileGrid", () => {
  it("is a list with an item for each tile", () => {
    render(
      <TileGrid>
        <TileGridItem>
          <Tile {...tile}>cover</Tile>
        </TileGridItem>
        <TileGridItem size="large">
          <Tile {...tile} href="/projects/other" title="Other">
            cover
          </Tile>
        </TileGridItem>
      </TileGrid>,
    );
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2);
  });

  it.each<[TileSize, string[]]>([
    ["square", []],
    ["wide", ["col-span-2"]],
    ["tall", ["row-span-2"]],
    ["large", ["col-span-2", "row-span-2"]],
  ])("a %s item spans its cells", (size, classes) => {
    render(<TileGridItem size={size}>x</TileGridItem>);
    const item = screen.getByRole("listitem");
    for (const name of ["col-span-2", "row-span-2"]) {
      if (classes.includes(name)) expect(item).toHaveClass(name);
      else expect(item).not.toHaveClass(name);
    }
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <h1>Projects</h1>
        <TileGrid>
          <TileGridItem>
            <Tile {...tile} status="Finished">
              cover
            </Tile>
          </TileGridItem>
        </TileGrid>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("tileSizeAt", () => {
  const cells = { square: 1, wide: 2, tall: 2, large: 4 };

  it("repeats a run of twelve that fills four columns exactly", () => {
    const run = Array.from({ length: 12 }, (_, i) => tileSizeAt(i));
    expect(run.reduce((sum, size) => sum + cells[size], 0) % 4).toBe(0);
    expect(Array.from({ length: 12 }, (_, i) => tileSizeAt(i + 12))).toEqual(run);
  });

  it("is mostly squares, with no size given twice in a row among the larger ones", () => {
    const run = Array.from({ length: 12 }, (_, i) => tileSizeAt(i));
    expect(run.filter((s) => s === "square").length).toBeGreaterThan(6);
    run.forEach((size, i) => {
      if (size !== "square") expect(run[(i + 1) % 12]).not.toBe(size);
    });
  });
});
