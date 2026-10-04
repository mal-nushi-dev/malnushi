import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "./nav";

/*
 * jsdom has no matchMedia and applies no CSS, so these tests cover what a user
 * or assistive technology can observe: roles, accessible names, aria state,
 * focus and link targets. They never read class names, CSS variables or
 * motion values. Fill, tint and spring motion need a browser test.
 *
 * Reduced motion is on by default, so the real component jumps to its end
 * state instead of animating. `motion` is not mocked.
 */
function stubMedia({ reducedMotion = true, narrow = false } = {}) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion")
      ? reducedMotion
      : query.includes("max-width")
        ? narrow
        : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function renderNav(props: Parameters<typeof Nav>[0] = {}) {
  const user = userEvent.setup({ delay: null });
  render(<Nav {...props} />);
  return {
    user,
    searchToggle: () =>
      screen.getByRole("button", { name: /^(Close search|Search)$/ }),
    menuToggle: () =>
      screen.getByRole("button", { name: /^(Close menu|Open menu)$/ }),
    searchInput: () => screen.getByLabelText("Search the site"),
    menuLinks: () => within(screen.getByRole("navigation")).getAllByRole("link"),
  };
}

const afterFocusDelay = () => act(() => vi.advanceTimersByTime(120));

beforeEach(() => {
  vi.useFakeTimers();
  stubMedia();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("initial state", () => {
  it("starts with search and menu collapsed", () => {
    const nav = renderNav();
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("links the wordmark to the home page", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Mal Nushi" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("keeps the search field out of the tab order", () => {
    const nav = renderNav();
    expect(nav.searchInput()).toHaveAttribute("tabindex", "-1");
  });

  it("does not move focus on its own", () => {
    const nav = renderNav();
    act(() => vi.advanceTimersByTime(1000));
    expect(nav.searchInput()).not.toHaveFocus();
  });
});

describe("search", () => {
  it("expands and offers to close", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    expect(nav.searchToggle()).toHaveAccessibleName("Close search");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("puts the search field in the tab order once open", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    expect(nav.searchInput()).toHaveAttribute("tabindex", "0");
  });

  it("focuses the field after it opens", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    expect(nav.searchInput()).toHaveFocus();
  });

  it("focuses without scrolling, so the field cannot jump over the toolbar row (9b47aaf)", async () => {
    // jsdom cannot scroll, so the contract is the option passed to focus().
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    const onField = focus.mock.contexts.indexOf(nav.searchInput());
    expect(onField).toBeGreaterThanOrEqual(0);
    expect(focus.mock.calls[onField][0]).toMatchObject({ preventScroll: true });
  });

  it("does not steal focus if closed before the field takes focus", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    expect(nav.searchInput()).not.toHaveFocus();
  });

  it("collapses when closed", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    await nav.user.click(nav.searchToggle());
    expect(nav.searchToggle()).toHaveAccessibleName("Search");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.searchInput()).toHaveAttribute("tabindex", "-1");
  });

  it.each([
    [10, "false"],
    [7, "true"],
  ])("ends %i rapid clicks with aria-expanded=%s", async (clicks, expanded) => {
    const nav = renderNav();
    for (let i = 0; i < clicks; i++) await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", expanded);
  });

  it("accepts typed text", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    await nav.user.keyboard("ink & paper");
    expect(nav.searchInput()).toHaveValue("ink & paper");
  });
});

describe("menu", () => {
  it("expands, offers to close and points at the list it controls", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    expect(nav.menuToggle()).toHaveAccessibleName("Close menu");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "true");
    const controlled = document.getElementById(
      nav.menuToggle().getAttribute("aria-controls") ?? "",
    );
    expect(controlled).toBe(screen.getByRole("navigation"));
  });

  it("lists the five sections in order, with their targets", () => {
    const nav = renderNav();
    const links = nav.menuLinks();
    expect(
      links.map((a) => [a.textContent, a.getAttribute("href")]),
    ).toEqual([
      ["001Writing", "/writing"],
      ["002Work", "/work"],
      ["003Photography", "/photography"],
      ["004Collections", "/collections"],
      ["005About", "/about"],
    ]);
  });

  it("collapses when a section link is chosen", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.click(screen.getByRole("link", { name: /Work/ }));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses when the wordmark is chosen", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.click(screen.getByRole("link", { name: "Mal Nushi" }));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("active section", () => {
  it("marks only the current section", () => {
    const nav = renderNav({ active: "Work" });
    const current = nav.menuLinks().filter((a) => a.ariaCurrent === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAttribute("href", "/work");
  });

  it("marks nothing without an active section", () => {
    const nav = renderNav();
    expect(nav.menuLinks().some((a) => a.hasAttribute("aria-current"))).toBe(
      false,
    );
  });

  it("marks nothing for a section that does not exist", () => {
    const nav = renderNav({ active: "Nowhere" as never });
    expect(nav.menuLinks().some((a) => a.hasAttribute("aria-current"))).toBe(
      false,
    );
  });
});

describe("switching between search and menu", () => {
  it("moves from search to menu in one click", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    await nav.user.click(nav.menuToggle());
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("moves from menu to search in one click", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.click(nav.searchToggle());
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("leaves the search field out of the tab order after moving to the menu", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    await nav.user.click(nav.menuToggle());
    expect(nav.searchInput()).toHaveAttribute("tabindex", "-1");
  });
});

describe("Escape", () => {
  it("closes the search", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    await nav.user.keyboard("{Escape}");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the search with text typed in it", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    await nav.user.keyboard("a long query {Escape}");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.keyboard("{Escape}");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("does nothing when already at rest", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.click(nav.menuToggle());
    await nav.user.keyboard("{Escape}");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("returns focus to the button that opened the plate", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    await nav.user.keyboard("{Escape}");
    expect(nav.menuToggle()).toHaveFocus();
  });

  it("returns focus to the search button after Escape in the search field", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    afterFocusDelay();
    await nav.user.keyboard("{Escape}");
    expect(nav.searchToggle()).toHaveFocus();
  });

  // Characterization: the handler is on the header, so Escape is ignored once
  // focus has left it. Revisit if the spec ("Escape returns to rest") is read
  // as global.
  it("is ignored while focus is outside the nav", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    act(() => (document.activeElement as HTMLElement | null)?.blur());
    await nav.user.keyboard("{Escape}");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("with animation enabled", () => {
  beforeEach(() => stubMedia({ reducedMotion: false }));

  it("opens and closes the menu and ends collapsed", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "true");
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("survives being reversed mid-animation", async () => {
    const nav = renderNav();
    await nav.user.click(nav.searchToggle());
    act(() => vi.advanceTimersByTime(100));
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(50));
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(nav.searchToggle()).toHaveAttribute("aria-expanded", "false");
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("on a narrow viewport", () => {
  beforeEach(() => stubMedia({ reducedMotion: false, narrow: true }));

  it("opens and closes the menu", async () => {
    const nav = renderNav();
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "true");
    await nav.user.click(nav.menuToggle());
    act(() => vi.advanceTimersByTime(2000));
    expect(nav.menuToggle()).toHaveAttribute("aria-expanded", "false");
  });
});
