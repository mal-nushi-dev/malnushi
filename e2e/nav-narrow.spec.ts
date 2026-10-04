import { expect, test } from "./fixtures";

/* Under the plate's width (632px) it is already full width and only drops. */

test("the plate fits the viewport when open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).tap();
  const menu = page.getByRole("navigation", { name: "Sections" });
  await expect(menu).toBeVisible();
  await expect.poll(async () => {
    const box = await menu.boundingBox();
    return box ? box.x >= 0 && box.x + box.width <= 560 : false;
  }).toBe(true);
});

test("touch: search opens, types, and closes on an outside tap", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).tap();
  const field = page.getByLabel("Search the site");
  await expect(field).toBeFocused();
  await field.fill("wren");
  await page.touchscreen.tap(20, 700);
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(field).toHaveValue("wren");
});

test("a menu link navigates and closes the menu", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).tap();
  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name: /About/ })
    .tap();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});
