import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { createQueries } from "../src/lib/content/query";
import { countryTable, regionName } from "../src/lib/ebird/places";
import { lifeStats } from "../src/lib/ebird/stats";
import { expect, test } from "./fixtures";

/*
 * The life list's page and its species log, in the built site. Nothing here
 * names a bird: what should be on the page is asked of the content folder.
 */

async function counted() {
  const q = createQueries(await loadContent(path.join(process.cwd(), "content")));
  const countries = countryTable();
  const sightings = q.list("sighting");
  return {
    q,
    sightings,
    stats: lifeStats(sightings, {
      country: (code) => countries[code] ?? { name: code, type: "", continent: "", subregion: "" },
      region: regionName,
    }),
  };
}

test("the map draws, and changes what it counts", async ({ page }) => {
  const { stats } = await counted();
  await page.goto("/collections/life-list");
  await expect(page.getByRole("heading", { level: 1, name: "Life list" })).toBeVisible();
  const map = page.getByRole("application", {
    name: new RegExp(`^Map of the ${stats.totals.species} species seen`),
  });
  // MapLibre's canvas and deck.gl's above it.
  await expect(map.locator("canvas")).toHaveCount(2);
  const count = page.getByRole("group", { name: "Count" });
  await expect(count.getByRole("button", { name: "Species" })).toHaveAttribute("aria-pressed", "true");
  await count.getByRole("button", { name: "Checklists" }).click();
  await expect(count.getByRole("button", { name: "Checklists" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status").filter({ hasText: "World:" })).toContainText("checklists");
  await expect(page.getByRole("group", { name: "Map view" })).toHaveCount(0);
  // The countries are on deck.gl's canvas: wait for a frame with ink on it.
  await expect
    .poll(async () => new Set(await map.screenshot()).size, { timeout: 20_000 })
    .toBeGreaterThan(64);
});

test("the numbers are the content's", async ({ page }) => {
  const { stats } = await counted();
  await page.goto("/collections/life-list");
  const main = page.getByRole("main");
  const number = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  const stat = (label: string) =>
    main.getByText(label, { exact: true }).locator("xpath=preceding-sibling::span");
  await expect(stat("Species")).toHaveText(number(stats.totals.species));
  await expect(stat("Checklists").first()).toHaveText(number(stats.totals.checklists));
  await expect(main.getByText(`${stats.totals.species} birds`)).toBeVisible();
});

test("every latest checklist links to eBird", async ({ page }) => {
  const { stats } = await counted();
  await page.goto("/collections/life-list");
  for (const latest of stats.latest) {
    await expect(
      page.locator(`a[href="https://ebird.org/checklist/${latest.checklist}"]`),
    ).toHaveCount(1);
  }
});

test("a sighting's link lands on its row in the log", async ({ page }) => {
  const { sightings } = await counted();
  const [newest] = sightings;
  await page.goto(newest.url);
  await expect(page.getByRole("heading", { level: 1, name: "Species log" })).toBeVisible();
  await expect(page.locator(`[id="${newest.id}"]`)).toBeInViewport();
});

test("the page and its table lead to each other", async ({ page }) => {
  await page.goto("/collections/life-list");
  await page.getByRole("link", { name: /Every species, in the order I first saw it/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Species log" })).toBeVisible();
  await page.getByRole("link", { name: /The map, and the list counted/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Life list" })).toBeVisible();
});
