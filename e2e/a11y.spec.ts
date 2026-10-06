import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * axe in a real browser, so color contrast is checked. Runs in light and dark
 * (one project each). Dark surface and code colors are still provisional in
 * the design log; a failure here is the check that was waiting on.
 */

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/*
 * Image placeholders are stand-ins that real images will replace. Their
 * labels fail AA (ink-2 on line: 3.9:1 light, 3.2:1 dark), which is an open
 * question in DESIGN.md. Remove this exclusion when that is decided.
 */
const placeholders = '[role="img"][aria-label*="placeholder" i], [role="img"][aria-label*="hero placeholder" i]';

async function scan(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(tags)
    .exclude(placeholders)
    .analyze();
  // Readable failure: rule, impact, and the offending nodes.
  expect(
    violations.map((v) => ({
      rule: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => {
        const d = n.any[0]?.data as
          | { contrastRatio?: number; fgColor?: string; bgColor?: string }
          | undefined;
        const detail = d?.contrastRatio
          ? ` (${d.contrastRatio}:1, ${d.fgColor} on ${d.bgColor})`
          : "";
        return n.target.join(" ") + detail;
      }),
    })),
  ).toEqual([]);
}

/**
 * Fades and color changes take up to 500ms (300ms colors, a 150ms delay and
 * 350ms for opacity). Scan only once the wordmark, the plate and the revealed
 * content have all stopped changing.
 */
async function settled(page: Page, selector: string) {
  const sample = () =>
    page.evaluate((target) => {
      const style = (el: Element | null) =>
        el ? getComputedStyle(el) : null;
      const plate = document.querySelector("header [class*='overflow-hidden']");
      const word = [...document.querySelectorAll("header a")].find(
        (a) => a.textContent === "Mal Nushi",
      );
      return JSON.stringify([
        style(document.querySelector(target))?.opacity,
        style(plate ?? null)?.backgroundColor,
        style(word ?? null)?.color,
      ]);
    }, selector);
  let last = "";
  await expect
    .poll(async () => {
      const now = await sample();
      const same = now === last && now.startsWith('["1"');
      last = now;
      return same;
    })
    .toBe(true);
}

for (const path of [
  "/",
  "/writing",
  "/writing/notes",
  "/writing/notes/2026-10-03-0931",
  "/writing/the-list-that-keeps-me-looking",
  "/photography",
  "/photography/2026-10-02-wren-at-the-window",
  "/music",
  "/music/ebb",
  "/components",
  "/no-such-page",
]) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);
    await scan(page);
  });
}

test("home, scrolled with the filled nav, has no violations", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await scan(page);
});

test("search open (sage plate) has no violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();
  await settled(page, "input[type=search]");
  await scan(page);
});

test("a tile's plate (sage over its cover) has no violations", async ({ page }) => {
  // On the preview page the covers are flat, so the text on the plate can be
  // measured: over a photograph axe cannot tell.
  await page.goto("/components");
  const tile = page.getByRole("link", { name: /A DNS filter/ });
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  const words = tile.locator("[data-tile-plate] > div").nth(1);
  await expect(words).toHaveCSS("opacity", "1");
  await expect(tile.locator("[data-tile-plate] > div").first()).toHaveCSS("opacity", "1");
  const { violations } = await new AxeBuilder({ page })
    .withTags(tags)
    .include("[data-tile-plate]")
    .analyze();
  expect(violations.map((v) => [v.id, v.nodes.map((n) => n.any[0]?.message)])).toEqual([]);
});

test("menu open (sage plate) has no violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await settled(page, "#site-menu");
  await scan(page);
});
