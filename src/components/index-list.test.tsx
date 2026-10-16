import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { IndexList, IndexRow, type IndexItem } from "./index-list";

const sampleItem: IndexItem = {
  href: "/writing/the-list-that-keeps-me-looking",
  title: "The list that keeps me looking",
  category: "Essay / Birding",
  year: 2026,
};

const sampleItems: IndexItem[] = [
  {
    href: "/writing/the-list-that-keeps-me-looking",
    title: "The list that keeps me looking",
    category: "Essay / Birding",
    year: 2026,
  },
  {
    href: "/projects/dns-filter",
    title: "DNS filter",
    category: "Code",
    year: "2024–2026",
  },
  {
    href: "/projects/skyline",
    title: "Skyline",
    category: "Design & Code",
    year: 2025,
  },
];

describe("IndexRow", () => {
  it("renders a list item containing a link targeting the item href", () => {
    render(<IndexRow index={1} item={sampleItem} />);

    const item = screen.getByRole("listitem");
    const link = within(item).getByRole("link");

    expect(link).toHaveAttribute("href", "/writing/the-list-that-keeps-me-looking");
  });

  it("displays the 3-digit zero-padded index, title, category, and year inside the link", () => {
    render(<IndexRow index={1} item={sampleItem} />);

    const link = screen.getByRole("link");

    expect(within(link).getByText("001")).toBeInTheDocument();
    expect(within(link).getByText("The list that keeps me looking")).toBeInTheDocument();
    expect(within(link).getByText("Essay / Birding")).toBeInTheDocument();
    expect(within(link).getByText("2026")).toBeInTheDocument();
  });

  it("pads single and double-digit indices to 3 digits while preserving larger indices", () => {
    const { rerender } = render(<IndexRow index={7} item={sampleItem} />);
    expect(screen.getByText("007")).toBeInTheDocument();

    rerender(<IndexRow index={42} item={sampleItem} />);
    expect(screen.getByText("042")).toBeInTheDocument();

    rerender(<IndexRow index={128} item={sampleItem} />);
    expect(screen.getByText("128")).toBeInTheDocument();
  });

  it("supports year values as both numbers and strings", () => {
    const stringYearItem: IndexItem = {
      ...sampleItem,
      year: "2024–2026",
    };

    render(<IndexRow index={2} item={stringYearItem} />);

    expect(screen.getByText("2024–2026")).toBeInTheDocument();
  });
});

describe("IndexList", () => {
  it("renders a section containing a SectionLabel with the provided label", () => {
    render(<IndexList label="Latest writing" items={sampleItems} />);

    const heading = screen.getByRole("heading", { level: 2, name: "Latest writing" });
    expect(heading).toBeInTheDocument();

    const section = heading.closest("section");
    expect(section).toBeInTheDocument();
  });

  it("renders an ordered list of rows with 1-based numbering in order", () => {
    render(<IndexList label="Latest writing" items={sampleItems} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");

    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);

    // Row 1 (0-based index 0 -> 1 -> '001')
    const firstLink = within(rows[0]).getByRole("link");
    expect(firstLink).toHaveAttribute("href", "/writing/the-list-that-keeps-me-looking");
    expect(within(firstLink).getByText("001")).toBeInTheDocument();
    expect(within(firstLink).getByText("The list that keeps me looking")).toBeInTheDocument();
    expect(within(firstLink).getByText("Essay / Birding")).toBeInTheDocument();
    expect(within(firstLink).getByText("2026")).toBeInTheDocument();

    // Row 2 (0-based index 1 -> 2 -> '002')
    const secondLink = within(rows[1]).getByRole("link");
    expect(secondLink).toHaveAttribute("href", "/projects/dns-filter");
    expect(within(secondLink).getByText("002")).toBeInTheDocument();
    expect(within(secondLink).getByText("DNS filter")).toBeInTheDocument();
    expect(within(secondLink).getByText("Code")).toBeInTheDocument();
    expect(within(secondLink).getByText("2024–2026")).toBeInTheDocument();

    // Row 3 (0-based index 2 -> 3 -> '003')
    const thirdLink = within(rows[2]).getByRole("link");
    expect(thirdLink).toHaveAttribute("href", "/projects/skyline");
    expect(within(thirdLink).getByText("003")).toBeInTheDocument();
    expect(within(thirdLink).getByText("Skyline")).toBeInTheDocument();
    expect(within(thirdLink).getByText("Design & Code")).toBeInTheDocument();
    expect(within(thirdLink).getByText("2025")).toBeInTheDocument();
  });

  it("handles an empty items list without rendering any rows", () => {
    render(<IndexList label="Archive" items={[]} />);

    expect(screen.getByRole("heading", { level: 2, name: "Archive" })).toBeInTheDocument();

    const list = screen.getByRole("list");
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("accessibility", () => {
  it("has no automated accessibility violations when rendered with items", async () => {
    const { container } = render(<IndexList label="Latest writing" items={sampleItems} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no automated accessibility violations when items list is empty", async () => {
    const { container } = render(<IndexList label="Archive" items={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no automated accessibility violations for an individual IndexRow inside a list", async () => {
    const { container } = render(
      <ol>
        <IndexRow index={1} item={sampleItem} />
      </ol>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

