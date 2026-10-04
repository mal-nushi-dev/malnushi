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

test("one photograph shows on its page, in the archive and inside an essay", async ({ page }) => {
  const photo = "/photography/2026-10-02-wren-at-the-window";
  const alt = /Carolina wren on a window ledge/;

  expect((await page.goto(photo))?.status()).toBe(200);
  await expect(page.getByRole("img", { name: alt })).toBeVisible();
  // The essay that embeds it is listed without the photo naming it.
  await expect(
    page.getByRole("link", { name: /The list that keeps me looking/ }),
  ).toBeVisible();

  await page.goto("/photography");
  await expect(page.getByRole("img", { name: alt })).toBeVisible();

  await page.goto("/writing/the-list-that-keeps-me-looking");
  const embedded = page.getByRole("link", { name: alt });
  await expect(embedded).toHaveAttribute("href", photo);
});

test("a note has its own page", async ({ page }) => {
  expect((await page.goto("/writing/notes/2026-10-03-1412"))?.status()).toBe(200);
  await expect(page.getByText("2026-10-03 · 2:12 PM EDT")).toBeVisible();
});
