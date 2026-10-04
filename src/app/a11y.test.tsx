import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "@/components/nav";
import { FilterPill } from "@/components/filter-pill";
import { Toolbar } from "@/components/toolbar";
import { axe } from "@/test/axe";
import ComponentsPage from "./components/page";
import ErrorPage from "./error";
import Home from "./page";
import NotFound from "./not-found";
import NotesPage from "./writing/notes/page";
import WritingPage from "./writing/page";

/*
 * axe in jsdom checks structure: names, roles, aria use, landmarks, headings,
 * labels. It cannot check color contrast or focus order (no layout or CSS),
 * so those are covered by the Playwright suite in e2e/.
 */

beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("pages", () => {
  it("home has no violations", async () => {
    const { container } = render(<Home />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("component preview has no violations", async () => {
    const { container } = render(<ComponentsPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("404 has no violations", async () => {
    const { container } = render(<NotFound />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("error page has no violations", async () => {
    const { container } = render(
      <ErrorPage error={new Error("boom")} retry={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("writing index has no violations", async () => {
    const { container } = render(<WritingPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("notes stream has no violations", async () => {
    const { container } = render(<NotesPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("nav", () => {
  it("has no violations at rest", async () => {
    const { container } = render(<Nav />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations with search open", async () => {
    const { container } = render(<Nav />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations with the menu open", async () => {
    const { container } = render(<Nav />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("controls", () => {
  it("filter pills and toolbar have no violations", async () => {
    const { container } = render(
      <>
        <FilterPill active>All</FilterPill>
        <FilterPill>Warblers</FilterPill>
        <Toolbar filters={["All", "Wrens"]} active="All" sort="First seen ↓" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("axe wiring", () => {
  it("reports a real violation", async () => {
    const { container } = render(<button type="button" />);
    expect((await axe(container)).violations.length).toBeGreaterThan(0);
  });
});
