import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * What jsdom cannot show: real focus, real layout and hit testing, scroll,
 * and the springs settling. Springs are left running; assertions wait for
 * the layout to reach its end state.
 */

const searchToggle = (page: Page) =>
  page.getByRole("button", { name: /^(Search|Close search)$/ });
const menuToggle = (page: Page) =>
  page.getByRole("button", { name: /^(Open menu|Close menu)$/ });
const field = (page: Page) => page.getByLabel("Search the site");
const menu = (page: Page) => page.getByRole("navigation", { name: "Sections" });
const plate = (page: Page) => page.locator("header [class*='overflow-hidden']");

/** Waits for the springs to stop: the plate's box is the same on two frames. */
async function settled(page: Page) {
  let last = "";
  await expect
    .poll(async () => {
      const box = JSON.stringify(await plate(page).boundingBox());
      const same = box === last;
      last = box;
      return same;
    })
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("search opens, takes focus, and is usable", async ({ page }) => {
  await searchToggle(page).click();
  await expect(field(page)).toBeVisible();
  await expect(field(page)).toBeFocused();
  await field(page).fill("carolina wren");
  await expect(field(page)).toHaveValue("carolina wren");
  await settled(page);
  expect((await plate(page).boundingBox())!.height).toBeGreaterThan(130);
});

test("a long query stays inside the plate", async ({ page }) => {
  await searchToggle(page).click();
  await expect(field(page)).toBeFocused();
  await field(page).fill("a very long query ".repeat(8));
  await settled(page);
  const inside = await page.evaluate(() => {
    const input = document.querySelector<HTMLElement>("input[type=search]")!;
    const plate = input.closest<HTMLElement>("[class*='overflow-hidden']")!;
    const a = input.getBoundingClientRect();
    const b = plate.getBoundingClientRect();
    return a.left >= b.left - 1 && a.right <= b.right + 1;
  });
  expect(inside).toBe(true);
});

test("Escape closes search and returns focus to its toggle", async ({ page }) => {
  await searchToggle(page).click();
  await expect(field(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(searchToggle(page)).toHaveAccessibleName("Search");
  await expect(searchToggle(page)).toBeFocused();
  await expect(field(page)).toBeHidden();
});

test("search text survives closing and reopening", async ({ page }) => {
  await searchToggle(page).click();
  await field(page).fill("wren");
  await searchToggle(page).click();
  await searchToggle(page).click();
  await expect(field(page)).toHaveValue("wren");
});

test("the menu lists the sections and closes on a link", async ({ page }) => {
  await menuToggle(page).click();
  await expect(menu(page)).toBeVisible();
  await expect(menu(page).getByRole("link")).toHaveCount(5);
  await page.getByRole("link", { name: "Mal Nushi" }).click();
  await expect(menuToggle(page)).toHaveAccessibleName("Open menu");
  await expect(menu(page)).toBeHidden();
});

test("a press outside closes the plate and keeps its target", async ({ page }) => {
  await menuToggle(page).click();
  await expect(menu(page)).toBeVisible();
  await page.mouse.click(40, 600);
  await expect(menuToggle(page)).toHaveAccessibleName("Open menu");
  await expect(menu(page)).toBeHidden();
});

test("a press inside the plate does not close it", async ({ page }) => {
  await searchToggle(page).click();
  await expect(field(page)).toBeFocused();
  await field(page).click();
  await expect(searchToggle(page)).toHaveAccessibleName("Close search");
});

test("the toolbar stays pinned while the page scrolls", async ({ page }) => {
  const top = () =>
    page.getByRole("link", { name: "Mal Nushi" }).evaluate(
      (el) => el.getBoundingClientRect().top,
    );
  const before = await top();
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  expect(Math.abs((await top()) - before)).toBeLessThan(1);
});

test("the plate gains a fill once scrolled", async ({ page }) => {
  const fill = () =>
    page.evaluate(() => {
      const plate = document.querySelector<HTMLElement>("[class*='overflow-hidden']")!;
      return getComputedStyle(plate).backgroundColor;
    });
  expect(await fill()).toBe("rgba(0, 0, 0, 0)");
  await page.mouse.wheel(0, 400);
  await expect.poll(fill).not.toBe("rgba(0, 0, 0, 0)");
});

test("keyboard: tab reaches search, wordmark, menu in order", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(searchToggle(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Mal Nushi" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menuToggle(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(menu(page)).toBeVisible();
});

test("focus ring shows for keyboard focus only", async ({ page }) => {
  // The menu toggle, not search: opening search moves focus to the field on
  // a timer, which races every assertion made on the toggle.
  const outline = () =>
    menuToggle(page).evaluate((el) => getComputedStyle(el).outlineStyle);
  await menuToggle(page).hover();
  await page.mouse.down();
  await page.mouse.up();
  await expect(menuToggle(page)).toBeFocused();
  expect(await outline()).toBe("none");
  await page.getByRole("link", { name: "Mal Nushi" }).focus();
  await page.keyboard.press("Tab");
  await expect(menuToggle(page)).toBeFocused();
  expect(await outline()).toBe("solid");
});
