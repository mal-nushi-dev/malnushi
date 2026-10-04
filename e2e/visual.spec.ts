import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * Screenshots in light and dark (one project each). They catch accidental
 * token, type and layout changes. Baselines are per platform and per project
 * (name-desktop-light-darwin.png), so run these locally:
 *
 *   npm run test:visual          compare
 *   npm run test:visual:update   accept an intended change
 *
 * TODO: not run in CI yet. The committed baselines are macOS-only and Linux
 * renders fonts differently, so they would fail there. Needs Linux baselines
 * made in the Playwright Docker image first.
 */

async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

/** Springs and fades are paused by `animations: "disabled"`; wait them out. */
const settle = (page: Page) => page.waitForTimeout(900);

const options = { animations: "disabled", fullPage: true } as const;

test("home @visual", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await expect(page).toHaveScreenshot("home.png", options);
});

test("component preview @visual", async ({ page }) => {
  await page.goto("/components");
  await ready(page);
  await expect(page).toHaveScreenshot("components.png", options);
});

test("404 @visual", async ({ page }) => {
  await page.goto("/no-such-page");
  await ready(page);
  await expect(page).toHaveScreenshot("not-found.png", options);
});

test("nav, search open @visual", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Search" }).click();
  await settle(page);
  await expect(page).toHaveScreenshot("nav-search.png", {
    animations: "disabled",
    clip: { x: 0, y: 0, width: 1280, height: 320 },
  });
});

test("nav, menu open @visual", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await settle(page);
  await expect(page).toHaveScreenshot("nav-menu.png", {
    animations: "disabled",
    clip: { x: 0, y: 0, width: 1280, height: 560 },
  });
});

test("nav, scrolled with the filled plate @visual", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);
  await settle(page);
  await expect(page).toHaveScreenshot("nav-scrolled.png", {
    animations: "disabled",
  });
});
