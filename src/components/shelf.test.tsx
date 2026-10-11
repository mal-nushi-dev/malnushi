import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sentenceParts } from "@/lib/shelf";
import { axe } from "@/test/axe";
import { Shelf, UrlShelf, type ShelfItem } from "./shelf";

const search = vi.hoisted(() => ({ value: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/collections",
  useSearchParams: () => new URLSearchParams(search.value),
}));

const item = (id: string, title: string, count: number, category?: string): ShelfItem => ({
  id,
  href: `/collections/${id}`,
  title,
  category,
  count,
  description: `About ${title}.`,
  sentence: sentenceParts("I have {count} {items}.", count, "thing"),
  newest: [{ id: `${id}-1`, label: "2026-09-27", text: `Newest ${title}` }],
});

const items = [
  item("travels", "Travels", 123, "Places and nature"),
  item("recs", "Recommendations", 128, "Taste"),
  item("life-list", "Life list", 214, "Places and nature"),
  item("cameras", "Cameras", 6),
];

const names = () => screen.getAllByRole("link").map((l) => within(l).getAllByRole("heading")[0].textContent);

describe("Shelf", () => {
  beforeEach(() => {
    search.value = "";
  });

  it("is one spine for each collection, alphabetical, each a link to its page", () => {
    render(<Shelf items={items} />);
    expect(names()).toEqual(["Cameras", "Life list", "Recommendations", "Travels"]);
    expect(screen.getByRole("link", { name: /Life list/ })).toHaveAttribute(
      "href",
      "/collections/life-list",
    );
  });

  it("names a spine by its title and reads its sentence and newest rows", () => {
    render(<Shelf items={items} />);
    const link = screen.getByRole("link", { name: /^Life list/ });
    expect(link).toHaveTextContent("I have 214 things.");
    expect(link).toHaveTextContent("2026-09-27, Newest Life list");
  });

  it("numbers spines by their place in the alphabet, whatever the arrangement", () => {
    render(<Shelf items={items} grouped />);
    const link = screen.getByRole("link", { name: /^Travels/ });
    expect(link).toHaveTextContent("004");
  });

  it("sets spines in groups by category, alphabetical, the uncategorised last", () => {
    render(<Shelf items={items} grouped />);
    const groups = screen.getAllByRole("region").map((g) => g.getAttribute("aria-label"));
    expect(groups).toEqual(["Places and nature", "Taste", "Other collections"]);
    const first = screen.getByRole("region", { name: "Places and nature" });
    expect(within(first).getAllByRole("link")).toHaveLength(2);
  });

  it("offers the arrangement only when there is more than one group", () => {
    const { rerender } = render(<Shelf items={items} />);
    expect(screen.getByRole("group", { name: "Arrange the shelf" })).toBeInTheDocument();
    rerender(<Shelf items={items.map((i) => ({ ...i, category: "Same" }))} />);
    expect(screen.queryByRole("group", { name: "Arrange the shelf" })).not.toBeInTheDocument();
  });

  it("asks for the arrangement to change", async () => {
    const onChange = vi.fn();
    render(<Shelf items={items} onGroupedChange={onChange} />);
    expect(screen.getByRole("button", { name: "All together" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "By category" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("makes the tick longer for a bigger collection", () => {
    const { container } = render(<Shelf items={items} />);
    const width = (title: string) =>
      Number.parseInt(
        (screen.getByRole("link", { name: new RegExp(`^${title}`) }).querySelector("i") as HTMLElement)
          .style.width,
      );
    expect(width("Life list")).toBe(46);
    expect(width("Cameras")).toBeLessThan(width("Travels"));
    expect(container.querySelectorAll("i")).toHaveLength(4);
  });

  it("has no accessibility violations, together or grouped", async () => {
    const { container, rerender } = render(<Shelf items={items} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Shelf items={items} grouped />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UrlShelf", () => {
  beforeEach(() => {
    search.value = "";
    window.history.replaceState(null, "", "/collections");
  });

  it("shows the shelf together unless the address asks for categories", () => {
    render(<UrlShelf items={items} />);
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });

  it("is grouped by `?shelve=category`", () => {
    search.value = "shelve=category";
    render(<UrlShelf items={items} />);
    expect(screen.getAllByRole("region")).toHaveLength(3);
  });

  it("puts the arrangement in the address, replacing the history entry", async () => {
    const replace = vi.spyOn(window.history, "replaceState");
    render(<UrlShelf items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "By category" }));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/collections?shelve=category");
    replace.mockRestore();
  });
});
