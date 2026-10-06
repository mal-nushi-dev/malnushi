import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { createQueries } from "../src/lib/content/query";
import { expect, test } from "./fixtures";

/*
 * The projects gallery, in the built site. Like content.spec.ts, nothing
 * here names a piece of content: what should be on the page is asked of the
 * content folder.
 */

const shown = async () =>
  createQueries(await loadContent(path.join(process.cwd(), "content"))).stream({
    kinds: ["project", "photo-series", "album"],
    by: "updated",
  });

const tiles = (page: import("@playwright/test").Page) =>
  page.getByRole("main").getByRole("list").first().getByRole("link");
const filterRow = (page: import("@playwright/test").Page) =>
  page.getByRole("group", { name: "Filter" });

test("every project, photo series and release is a tile, the last changed first", async ({ page }) => {
  const entries = await shown();
  expect(entries.length).toBeGreaterThan(0);
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await expect(tiles(page)).toHaveCount(entries.length);
  const hrefs = await tiles(page).evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(entries.map((e) => e.url));
  for (const entry of entries) {
    await expect(tiles(page).filter({ hasText: entry.title! })).toHaveCount(1);
  }
});

test("the tiles sit four to a row, 4px apart, inside the content width", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projects");
  const boxes = await page
    .getByRole("main")
    .getByRole("list")
    .first()
    .getByRole("listitem")
    .evaluateAll((items) => items.map((li) => li.getBoundingClientRect().toJSON()));
  const cell = (1248 - 3 * 4) / 4;
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(96);
    expect(box.right).toBeLessThanOrEqual(1440 - 96);
    // One cell or two, each way.
    expect([cell, cell * 2 + 4].some((w) => Math.abs(box.width - w) < 1)).toBe(true);
    expect([cell, cell * 2 + 4].some((h) => Math.abs(box.height - h) < 1)).toBe(true);
  }
  // No two tiles overlap, and neighbours are exactly the gap apart.
  for (const a of boxes) {
    for (const b of boxes) {
      if (a === b) continue;
      const apart = a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
      expect(apart).toBe(true);
      const sameRow = Math.abs(a.top - b.top) < 1;
      if (sameRow && b.left > a.right && b.left - a.right < cell) {
        expect(b.left - a.right).toBeCloseTo(4, 0);
      }
    }
  }
});

test("the plate covers the tile on hover and on keyboard focus, and goes when left", async ({ page }) => {
  await page.goto("/projects");
  const tile = tiles(page).first();
  const plate = tile.locator("[data-tile-plate] > div").first();
  const words = tile.locator("[data-tile-plate] > div").nth(1);
  await expect(plate).toHaveCSS("opacity", "0");
  await expect(words).toBeHidden();
  // It is named without its plate.
  await expect(tile).toHaveAccessibleName(/\S/);

  await tile.hover();
  await expect(plate).toBeVisible();
  await expect(plate).toHaveCSS("opacity", "1");
  await expect(words).toBeVisible();
  await expect(words).toHaveCSS("opacity", "1");
  // The plate is the whole tile.
  const [outer, inner] = await Promise.all([tile.boundingBox(), plate.boundingBox()]);
  await expect.poll(async () => (await plate.boundingBox())?.width).toBeCloseTo(outer!.width, 0);
  expect(inner!.x).toBeGreaterThanOrEqual(outer!.x - outer!.width * 0.1);

  await page.mouse.move(0, 0);
  await expect(plate).toHaveCSS("opacity", "0");

  await page.keyboard.press("Tab");
  for (let i = 0; i < 40 && !(await tile.evaluate((a) => a === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(tile).toBeFocused();
  await expect(plate).toHaveCSS("opacity", "1");
});

test("the plate appears at once with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  const tile = tiles(page).first();
  const plate = tile.locator("[data-tile-plate] > div").first();
  await expect(plate).toHaveCSS("transition-property", "none");
  await tile.hover();
  await expect(plate).toHaveCSS("opacity", "1");
});

test("a filter narrows the gallery, hides filters that would empty it, and is kept in the address", async ({ page }) => {
  const entries = await shown();
  await page.goto("/projects");
  const pills = filterRow(page).getByRole("button");
  test.skip((await pills.count()) < 3, "fewer than two filters to choose between");
  await expect(filterRow(page).getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

  const before = await pills.count();
  const first = pills.nth(1);
  const name = (await first.textContent())!;
  await first.click();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(new RegExp(`/projects\\?t=${name.toLowerCase()}$`));
  const narrowed = await tiles(page).count();
  expect(narrowed).toBeGreaterThan(0);
  expect(narrowed).toBeLessThan(entries.length);
  expect(await pills.count()).toBeLessThanOrEqual(before);
  await expect(page.getByRole("status")).toHaveText(new RegExp(`^${narrowed} project`));

  // Every filter still offered leaves something.
  for (const other of await pills.allTextContents()) {
    if (other === "All" || other === name) continue;
    await filterRow(page).getByRole("button", { name: other }).click();
    expect(await tiles(page).count()).toBeGreaterThan(0);
    await filterRow(page).getByRole("button", { name: other }).click();
  }

  // The address alone brings the same view back.
  await page.reload();
  await expect(tiles(page)).toHaveCount(narrowed);
  await expect(filterRow(page).getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");

  await filterRow(page).getByRole("button", { name: "All" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(tiles(page)).toHaveCount(entries.length);
});

test("a filter in the address that names nothing shows everything", async ({ page }) => {
  const entries = await shown();
  await page.goto("/projects?t=no-such-thing");
  await expect(tiles(page)).toHaveCount(entries.length);
});

test("the gallery is whole without JavaScript", async ({ browser }) => {
  const entries = await shown();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/projects");
  await expect(tiles(page)).toHaveCount(entries.length);
  await context.close();
});

test("the archives are linked from under the gallery", async ({ page }) => {
  await page.goto("/projects");
  const archives = page.getByRole("navigation", { name: "Archives" });
  await expect(archives.getByRole("link", { name: /All photos/ })).toHaveAttribute("href", "/photography");
  await expect(archives.getByRole("link", { name: /All music/ })).toHaveAttribute("href", "/music");
});
