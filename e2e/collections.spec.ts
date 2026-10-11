import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { createQueries } from "../src/lib/content/query";
import { expect, test } from "./fixtures";

/*
 * The collections shelf, in the built site. Like projects.spec.ts, nothing
 * here names a collection: what should be on the shelf is asked of the
 * content folder.
 */

const shown = async () => {
  const q = createQueries(await loadContent(path.join(process.cwd(), "content")));
  return q
    .list("collection")
    .filter((c) => q.members(c).length > 0)
    .sort((a, b) => a.title!.localeCompare(b.title!));
};

const spines = (page: import("@playwright/test").Page) =>
  page.locator("main a.spine");

test("every collection with rows is a spine, alphabetical, linking to its page", async ({ page }) => {
  const collections = await shown();
  expect(collections.length).toBeGreaterThan(0);
  await page.goto("/collections");
  await expect(page.getByRole("heading", { level: 1, name: "Collections" })).toBeVisible();
  await expect(spines(page)).toHaveCount(collections.length);
  const hrefs = await spines(page).evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(collections.map((c) => c.url));
});

test("the shelf is as wide as the content and does not move when a spine opens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/collections");
  const shelf = page.getByRole("main").getByRole("list").first();
  const before = await shelf.boundingBox();
  expect(before!.x).toBeCloseTo(96, 0);
  expect(before!.width).toBeCloseTo(1248, 0);

  const first = spines(page).first();
  const closed = (await first.boundingBox())!.width;
  expect(closed).toBeLessThanOrEqual(128 + 1);
  await first.hover();
  await expect.poll(async () => (await first.boundingBox())!.width).toBeGreaterThan(closed * 2.5);
  const after = await shelf.boundingBox();
  expect(after!.width).toBeCloseTo(before!.width, 0);
  expect(after!.height).toBeCloseTo(before!.height, 0);
});

test("a spine opens on hover and on keyboard focus, and closes when left", async ({ page }) => {
  await page.goto("/collections");
  const spine = spines(page).first();
  const body = spine.locator("span[aria-hidden] > span").nth(1);
  await expect(body).toBeHidden();
  await expect(spine).toHaveAccessibleName(/\S/);

  await spine.hover();
  await expect(body).toBeVisible();
  await expect(body).toHaveCSS("opacity", "1");

  await page.mouse.move(0, 0);
  await expect(body).toBeHidden();

  await page.keyboard.press("Tab");
  for (let i = 0; i < 40 && !(await spine.evaluate((a) => a === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(spine).toBeFocused();
  await expect(body).toBeVisible();
});

test("by category sets the same spines in labelled groups and is kept in the address", async ({ page }) => {
  const collections = await shown();
  await page.goto("/collections");
  const arrange = page.getByRole("group", { name: "Arrange the shelf" });
  test.skip((await arrange.count()) === 0, "fewer than two groups to arrange");

  await expect(arrange.getByRole("button", { name: "All together" })).toHaveAttribute("aria-pressed", "true");
  await arrange.getByRole("button", { name: "By category" }).click();
  await expect(page).toHaveURL(/\/collections\?shelve=category$/);
  await expect(page.getByRole("main").getByRole("region").first()).toBeVisible();
  await expect(spines(page)).toHaveCount(collections.length);

  await page.reload();
  await expect(arrange.getByRole("button", { name: "By category" })).toHaveAttribute("aria-pressed", "true");

  await arrange.getByRole("button", { name: "All together" }).click();
  await expect(page).toHaveURL(/\/collections$/);
});

test("the shelf is whole without JavaScript", async ({ browser }) => {
  const collections = await shown();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/collections");
  await expect(spines(page)).toHaveCount(collections.length);
  await context.close();
});
