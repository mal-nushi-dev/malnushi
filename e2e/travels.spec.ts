import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { createQueries } from "../src/lib/content/query";
import { flightStats } from "../src/lib/flights/stats";
import { expect, test } from "./fixtures";

/*
 * The travels page and its flight log, in the built site. Nothing here names
 * a flight: what should be on the page is asked of the content folder.
 */

const flown = async () =>
  createQueries(await loadContent(path.join(process.cwd(), "content"))).list("flight");

test("the map draws, and switches between flat, tilted and globe", async ({ page }) => {
  const stats = flightStats(await flown());
  await page.goto("/collections/travels");
  await expect(page.getByRole("heading", { level: 1, name: "Travels" })).toBeVisible();
  const map = page.getByRole("application", {
    name: `Map of ${stats.map.airports.length} airports and the ${stats.map.routes.length} routes flown between them`,
  });
  // MapLibre's canvas and deck.gl's above it.
  await expect(map.locator("canvas")).toHaveCount(2);
  const views = page.getByRole("group", { name: "Map view" });
  await expect(views.getByRole("button", { name: "Flat" })).toHaveAttribute("aria-pressed", "true");
  for (const view of ["Tilted", "Globe", "Flat"]) {
    await views.getByRole("button", { name: view }).click();
    await expect(views.getByRole("button", { name: view })).toHaveAttribute("aria-pressed", "true");
    await expect(views.getByRole("button", { pressed: true })).toHaveCount(1);
  }
  // Any shader that failed to compile, on either projection, has logged an
  // error by now, and the fixture fails the test for it.
  await page.waitForTimeout(500);
});

test("the map has something drawn on it", async ({ page }) => {
  await page.goto("/collections/travels");
  const map = page.getByRole("application");
  await expect(map.locator("canvas")).toHaveCount(2);
  // The flights are on deck.gl's canvas, the second: wait for a frame with ink on it.
  await expect
    .poll(async () => {
      const shot = await map.screenshot();
      return new Set(shot).size;
    })
    .toBeGreaterThan(64);
});

test("the numbers are the content's", async ({ page }) => {
  const stats = flightStats(await flown());
  await page.goto("/collections/travels");
  const main = page.getByRole("main");
  const number = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  await expect(main.getByText("Flights", { exact: true }).locator("xpath=preceding-sibling::span")).toHaveText(
    number(stats.flights),
  );
  await expect(main.getByText("Domestic", { exact: true }).locator("xpath=preceding-sibling::span")).toHaveText(
    number(stats.domestic),
  );
  await expect(
    main.getByText("International", { exact: true }).locator("xpath=preceding-sibling::span"),
  ).toHaveText(number(stats.international));
  await expect(main.getByText(`${number(stats.km)} km`)).toBeVisible();
});

test("the four cards each get a scene drawn behind their number", async ({ page }) => {
  await page.goto("/collections/travels");
  const scenes = page.locator("[data-flight-scenes] canvas[data-scene]");
  await expect(scenes).toHaveCount(4);
  await scenes.first().scrollIntoViewIfNeeded();
  for (const scene of await scenes.all()) {
    // A canvas nothing has drawn to is one color; a scene is many.
    await expect.poll(async () => new Set(await scene.screenshot()).size).toBeGreaterThan(64);
  }
});

test("a ranking reads by flights, and by distance on its other tab", async ({ page }) => {
  await page.goto("/collections/travels");
  const tabs = page.getByRole("tablist", { name: "Rank airports by" });
  await expect(page.getByRole("list", { name: "Airports by flights" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Airports by distance" })).toBeHidden();
  await tabs.getByRole("tab", { name: "By distance" }).click();
  await expect(page.getByRole("list", { name: "Airports by distance" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Airports by flights" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Airports by distance" }).getByRole("listitem").first()).toContainText(
    "mi",
  );
  // The other rankings keep their own tab.
  await expect(page.getByRole("list", { name: "Airlines by flights" })).toBeVisible();
});

test("the log lists every flight, and a year's pill keeps that year in the address", async ({ page }) => {
  const flights = await flown();
  expect(flights.length).toBeGreaterThan(0);
  await page.goto("/collections/travels/log");
  const rows = page.getByRole("table").locator("tbody tr");
  await expect(rows).toHaveCount(flights.length);
  expect(await rows.evaluateAll((all) => all.map((row) => row.id))).toEqual(flights.map((f) => f.id));

  const year = flights[0].date.slice(0, 4);
  const inYear = flights.filter((f) => f.date.startsWith(year)).length;
  await page.getByRole("group", { name: "Year" }).getByRole("button", { name: year }).click();
  await expect(rows).toHaveCount(inYear);
  await expect(page).toHaveURL(new RegExp(`\\?y=${year}$`));
  await page.reload();
  await expect(rows).toHaveCount(inYear);
  await page.getByRole("group", { name: "Year" }).getByRole("button", { name: "All" }).click();
  await expect(rows).toHaveCount(flights.length);
  await expect(page).toHaveURL(/\/collections\/travels\/log$/);
});

test("a flight's link lands on its row", async ({ page }) => {
  const [flight] = await flown();
  await page.goto(flight.url);
  await expect(page.locator(`[id="${flight.id}"]`)).toBeInViewport();
});

test("the page and its table lead to each other", async ({ page }) => {
  await page.goto("/collections/travels");
  await page.getByRole("link", { name: /Every flight, in a table/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Flight log" })).toBeVisible();
  await page.getByRole("link", { name: /The map, and the flights counted/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Travels" })).toBeVisible();
});
