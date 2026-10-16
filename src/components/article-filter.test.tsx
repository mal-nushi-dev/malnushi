import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type IndexItem } from "@/components/index-list";
import { axe } from "@/test/axe";
import {
  ArticleFilter,
  UrlArticleFilter,
  categoriesOf,
} from "./article-filter";

const search = vi.hoisted(() => ({ value: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/writing",
  useSearchParams: () => new URLSearchParams(search.value),
}));

const item = (title: string, category: string, year = 2026): IndexItem => ({
  href: `/writing/${title.toLowerCase()}`,
  title,
  category,
  year,
});

const items: IndexItem[] = [
  item("Alpha", "Technology"),
  item("Beta", "Design"),
  item("Gamma", "Technology"),
  item("Delta", "Politics"),
];

const pills = () =>
  within(screen.getByRole("group", { name: /^Filter/i }))
    .getAllByRole("button")
    .map((b) => b.textContent);

const pill = (name: string) => screen.getByRole("button", { name });

const titles = () =>
  screen
    .queryAllByRole("listitem")
    .map((row) => row.querySelector(".type-index-title")?.textContent);

describe("categoriesOf", () => {
  it("extracts unique categories in order of first appearance with All prepended", () => {
    expect(categoriesOf(items)).toEqual([
      "All",
      "Technology",
      "Design",
      "Politics",
    ]);
  });

  /**
   * Precaution: Defensive data cleanup.
   * In real-life authoring, editors might accidentally leave extra spaces (e.g. "  Essays  ")
   * or empty category strings in an article's frontmatter.
   * This verifies we sanitize the data so we never render awkward, blank filter pills.
   */
  it("trims whitespace and ignores blank, empty, or undefined categories", () => {
    const mixed: IndexItem[] = [
      item("First", "  Essays  "),
      item("Second", ""),
      item("Third", "   "),
      item("Fourth", "Essays"),
    ];
    expect(categoriesOf(mixed)).toEqual(["All", "Essays"]);
  });
});

describe("ArticleFilter", () => {
  it("shows all articles and category pills with All active by default", () => {
    render(<ArticleFilter label="All articles" items={items} />);

    expect(titles()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
    expect(pills()).toEqual(["All", "Technology", "Design", "Politics"]);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
    expect(pill("Technology")).toHaveAttribute("aria-pressed", "false");
  });

  it("filters down to articles matching the clicked category", async () => {
    render(<ArticleFilter label="All articles" items={items} />);

    await userEvent.click(pill("Technology"));

    expect(titles()).toEqual(["Alpha", "Gamma"]);
    expect(pill("Technology")).toHaveAttribute("aria-pressed", "true");
    expect(pill("All")).toHaveAttribute("aria-pressed", "false");
  });

  it("deselects back to All when clicking the active category", async () => {
    render(<ArticleFilter label="All articles" items={items} />);

    await userEvent.click(pill("Technology"));
    expect(titles()).toEqual(["Alpha", "Gamma"]);

    await userEvent.click(pill("Technology"));
    expect(titles()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
  });

  it("resets back to All when clicking the All pill directly", async () => {
    render(<ArticleFilter label="All articles" items={items} />);

    await userEvent.click(pill("Design"));
    expect(titles()).toEqual(["Beta"]);

    await userEvent.click(pill("All"));
    expect(titles()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * Precaution: UI clutter prevention.
   * When all articles belong to the exact same category (or only one category exists),
   * filtering is unnecessary and would offer no meaningful choice to the reader.
   * This verifies the row gracefully stays hidden until at least two distinct topics exist.
   */
  it("hides the filter pills row when there are fewer than two distinct categories", () => {
    const singleCategoryItems = [
      item("One", "Coding"),
      item("Two", "Coding"),
    ];
    render(
      <ArticleFilter label="All articles" items={singleCategoryItems} />,
    );

    expect(screen.queryByRole("group", { name: /^Filter/i })).toBeNull();
    expect(titles()).toEqual(["One", "Two"]);
  });

  /**
   * Precaution: Case mismatch resilience.
   * Protects against minor authoring inconsistencies (e.g. "Technology" in one article
   * and "technology" in another) so readers never miss articles due to letter casing.
   */
  it("filters case-insensitively", () => {
    const mixedCaseItems = [
      item("One", "technology"),
      item("Two", "Technology"),
      item("Three", "Design"),
    ];
    render(
      <ArticleFilter
        label="All articles"
        items={mixedCaseItems}
        category="technology"
      />,
    );

    expect(titles()).toEqual(["One", "Two"]);
  });

  /**
   * Precaution: Extreme empty-state safety net.
   * Under ordinary browsing, every visible filter button is guaranteed to have at least
   * one article (because buttons are generated directly from existing articles).
   *
   * However, if the entire dataset is empty (such as a brand-new blog before its first
   * post is published, or a failed query), this verifies the component handles it
   * calmly without crashing or rendering an awkward blank void.
   */
  it("displays an empty state message when the articles list is empty", () => {
    render(<ArticleFilter label="All articles" items={[]} />);

    expect(
      screen.getByText("No articles in this category."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("announces matching article counts to screen readers", async () => {
    render(<ArticleFilter label="All articles" items={items} />);

    expect(screen.getByRole("status")).toHaveTextContent("4 articles");

    await userEvent.click(pill("Design"));
    expect(screen.getByRole("status")).toHaveTextContent("1 article");

    await userEvent.click(pill("Technology"));
    expect(screen.getByRole("status")).toHaveTextContent("2 articles");
  });

  it("supports controlled mode via category and onChange props", async () => {
    const onChange = vi.fn();
    render(
      <ArticleFilter
        label="All articles"
        items={items}
        category="Technology"
        onChange={onChange}
      />,
    );

    expect(titles()).toEqual(["Alpha", "Gamma"]);
    expect(pill("Technology")).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(pill("Politics"));
    expect(onChange).toHaveBeenCalledWith("Politics");

    await userEvent.click(pill("Technology"));
    expect(onChange).toHaveBeenCalledWith("All");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <main>
        <h1>Writing</h1>
        <ArticleFilter label="All articles" items={items} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UrlArticleFilter", () => {
  let replace: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    search.value = "";
    replace = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});
  });

  it("initializes with the category filter specified in the URL address", () => {
    search.value = "c=design";
    render(<UrlArticleFilter label="All articles" items={items} />);

    expect(titles()).toEqual(["Beta"]);
    expect(pill("Design")).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * Precaution: Malformed or stale URL protection.
   * If a visitor arrives via a broken link, a typo, or a deleted category (e.g. "?c=not-a-real-topic"),
   * the component must not crash or display an empty list. It safely defaults to "All".
   */
  it("falls back safely to All when the URL parameter does not match any category", () => {
    search.value = "c=not-a-real-topic";
    render(<UrlArticleFilter label="All articles" items={items} />);

    expect(titles()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
    expect(pill("All")).toHaveAttribute("aria-pressed", "true");
  });

  it("updates the address bar via replaceState when a category is selected", async () => {
    search.value = "c=technology";
    render(<UrlArticleFilter label="All articles" items={items} />);

    await userEvent.click(pill("Design"));
    expect(replace).toHaveBeenLastCalledWith(
      null,
      "",
      "/writing?c=design",
    );
  });

  /**
   * Precaution: Query parameter preservation.
   * When clearing or toggling off the active filter, we must delete only the category parameter
   * (`?c=...`) while preserving any other unrelated URL parameters (such as `?page=2`).
   */
  it("removes the filter parameter when All or the active filter is clicked", async () => {
    search.value = "c=technology";
    const { unmount } = render(
      <UrlArticleFilter label="All articles" items={items} />,
    );

    await userEvent.click(pill("All"));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/writing");
    unmount();

    search.value = "c=technology&page=2";
    render(<UrlArticleFilter label="All articles" items={items} />);

    await userEvent.click(pill("Technology"));
    expect(replace).toHaveBeenLastCalledWith(null, "", "/writing?page=2");
  });

  it("supports a custom query parameter name via the param prop", () => {
    search.value = "topic=politics";
    render(
      <UrlArticleFilter
        label="All articles"
        items={items}
        param="topic"
      />,
    );

    expect(titles()).toEqual(["Delta"]);
    expect(pill("Politics")).toHaveAttribute("aria-pressed", "true");
  });
});

