import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { filterKeys, filtersFrom } from "@/lib/filter";
import { axe } from "@/test/axe";
import { TileGallery, UrlTileGallery, type GalleryItem } from "./tile-gallery";

const search = vi.hoisted(() => ({ value: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
  useSearchParams: () => new URLSearchParams(search.value),
}));

const filters = filtersFrom(["Code", "Design", "Hardware", "Music"]);
const item = (title: string, label: string, tags: string[] = []): GalleryItem => ({
  id: title,
  href: `/projects/${title.toLowerCase()}`,
  title,
  label,
  year: 2026,
  keys: filterKeys(label, tags, filters),
  cover: <span>cover of {title}</span>,
});
const items = [
  item("Filter", "Code", ["design"]),
  item("System", "Design", ["code"]),
  item("Lamp", "Hardware", ["design"]),
  item("Tides", "Music"),
];

const pills = () =>
  within(screen.getByRole("group", { name: "Filter" }))
    .getAllByRole("button")
    .map((b) => b.textContent);
const titles = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
const pill = (name: string) => screen.getByRole("button", { name });

describe("TileGallery", () => {
  it("shows every item and every filter, with All pressed, when nothing is selected", () => {
    render(<TileGallery items={items} filters={filters} />);
    expect(titles()).toEqual(["Filter", "System", "Lamp", "Tides"]);
    expect(pills()).toEqual(["All", "Code", "Design", "Hardware", "Music"]);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the items that answer to every selected filter", () => {
    render(<TileGallery items={items} filters={filters} selected={["code", "design"]} />);
    expect(titles()).toEqual(["Filter", "System"]);
    expect(pill("Code")).toHaveAttribute("aria-pressed", "true");
    expect(pill("Design")).toHaveAttribute("aria-pressed", "true");
    expect(pill("All")).toHaveAttribute("aria-pressed", "false");
  });

  it("hides a filter that would leave nothing", () => {
    render(<TileGallery items={items} filters={filters} selected={["hardware"]} />);
    expect(pills()).toEqual(["All", "Design", "Hardware"]);
  });

  it("asks for a filter to be added, removed, and for all to be cleared", async () => {
    const onChange = vi.fn();
    render(
      <TileGallery items={items} filters={filters} selected={["design"]} onChange={onChange} />,
    );
    await userEvent.click(pill("Code"));
    expect(onChange).toHaveBeenLastCalledWith(["code", "design"]);
    await userEvent.click(pill("Design"));
    expect(onChange).toHaveBeenLastCalledWith([]);
    await userEvent.click(pill("All"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("tells screen readers how many are shown", () => {
    const noun = { one: "project", many: "projects" };
    const { rerender } = render(<TileGallery items={items} filters={filters} noun={noun} />);
    expect(screen.getByRole("status")).toHaveTextContent("4 projects");
    rerender(<TileGallery items={items} filters={filters} noun={noun} selected={["music"]} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 project");
  });

  it("draws each item's cover in its tile", () => {
    render(<TileGallery items={items} filters={filters} />);
    expect(
      within(screen.getByRole("link", { name: /^Lamp/ })).getByText("cover of Lamp"),
    ).toBeInTheDocument();
  });

  it("shows no filter row when there is nothing to choose between", () => {
    render(<TileGallery items={[items[3]]} filters={filtersFrom(["Music"])} />);
    expect(screen.queryByRole("group", { name: "Filter" })).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <h1>Projects</h1>
        <TileGallery items={items} filters={filters} selected={["design"]} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UrlTileGallery", () => {
  let replace: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    search.value = "";
    replace = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  it("takes its selection from the address", () => {
    search.value = "t=design,code";
    render(<UrlTileGallery items={items} filters={filters} />);
    expect(titles()).toEqual(["Filter", "System"]);
  });

  it("ignores what is not a filter", () => {
    search.value = "t=nope";
    render(<UrlTileGallery items={items} filters={filters} />);
    expect(titles()).toHaveLength(4);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
  });

  it("writes a new selection to the address without adding to history", async () => {
    search.value = "t=design";
    render(<UrlTileGallery items={items} filters={filters} />);
    await userEvent.click(pill("Code"));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/projects?t=code,design");
  });

  it("leaves a bare address when the last filter is cleared, keeping other parameters", async () => {
    search.value = "t=design";
    const { unmount } = render(<UrlTileGallery items={items} filters={filters} />);
    await userEvent.click(pill("All"));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/projects");
    unmount();

    search.value = "t=design&ref=home";
    render(<UrlTileGallery items={items} filters={filters} />);
    await userEvent.click(pill("Design"));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/projects?ref=home");
  });

  it("can keep its selection under another name", async () => {
    search.value = "show=music";
    render(<UrlTileGallery items={items} filters={filters} param="show" />);
    expect(titles()).toEqual(["Tides"]);
  });
});
