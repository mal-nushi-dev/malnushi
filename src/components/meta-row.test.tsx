import { render, screen, within } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import { axe } from "@/test/axe";
import { MetaItem, MetaRow } from "./meta-row";

describe("MetaRow", () => {
  it("renders a semantic unordered list with role='list'", () => {
    render(
      <MetaRow>
        <MetaItem>October 14, 2026</MetaItem>
      </MetaRow>,
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe("UL");
  });

  it("renders multiple children within the list container", () => {
    render(
      <MetaRow>
        <MetaItem>Item 1</MetaItem>
        <MetaItem>Item 2</MetaItem>
        <MetaItem>Item 3</MetaItem>
      </MetaRow>,
    );

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.textContent)).toEqual([
      "Item 1",
      "Item 2",
      "Item 3",
    ]);
  });

  it("renders gracefully when children are empty or null", () => {
    render(<MetaRow>{null}</MetaRow>);

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });
});

describe("MetaItem", () => {
  it("renders a semantic list item element (<li>)", () => {
    render(
      <ul>
        <MetaItem>Metadata entry</MetaItem>
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toBeInTheDocument();
    expect(item.tagName).toBe("LI");
    expect(item).toHaveTextContent("Metadata entry");
  });

  it("renders structured elements such as time and links", () => {
    render(
      <ul>
        <MetaItem>
          <time dateTime="2026-10-14">2026-10-14</time>
        </MetaItem>
        <MetaItem>
          <a href="/topics/typography">Typography</a>
        </MetaItem>
      </ul>,
    );

    const time = screen.getByText("2026-10-14");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", "2026-10-14");

    const link = screen.getByRole("link", { name: "Typography" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/topics/typography");
  });

  it("handles null and undefined children without error", () => {
    render(
      <ul>
        <MetaItem>{null}</MetaItem>
        <MetaItem>{undefined}</MetaItem>
      </ul>,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("");
    expect(items[1]).toHaveTextContent("");
  });
});

describe("MetaRow and MetaItem integration", () => {
  it("composes list and list items preserving order and semantic structure", () => {
    render(
      <MetaRow>
        <MetaItem>
          <time dateTime="2026-10-14">2026-10-14</time>
        </MetaItem>
        <MetaItem>5 min read</MetaItem>
        <MetaItem>Architecture</MetaItem>
      </MetaRow>,
    );

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(items[0]).toContainElement(screen.getByText("2026-10-14"));
    expect(items[1]).toHaveTextContent("5 min read");
    expect(items[2]).toHaveTextContent("Architecture");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MetaRow>
        <MetaItem>
          <time dateTime="2026-10-14">2026-10-14</time>
        </MetaItem>
        <MetaItem>6 min read</MetaItem>
        <MetaItem>
          <Link href="/writing/tag/typography">Typography</Link>
        </MetaItem>
      </MetaRow>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

