import { expect, test } from "./fixtures";

test("home loads with its heading and landmarks", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Mal Nushi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I’m Mal");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("fonts load", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const families = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family),
  );
  expect(families.join(" ")).toMatch(/Newsreader/);
});

test("an unknown route shows the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: /isn’t here/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Back to the home page/ }).click();
  await expect(page).toHaveURL("/");
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("<urlset");
});

test("icons and share image are served as images", async ({ request }) => {
  for (const path of ["/icon", "/apple-icon", "/opengraph-image"]) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    expect(res.headers()["content-type"], path).toBe("image/png");
  }
});
