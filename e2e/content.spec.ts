import path from "node:path";
import { loadContent } from "../src/lib/content/load";
import { createQueries } from "../src/lib/content/query";
import { expect, test } from "./fixtures";

/*
 * Every page the content produces, in the built site. The routes come from
 * the sitemap and the entries from the content folder itself, so nothing
 * here names a piece of content: it keeps passing as content changes.
 *
 * The `problems` fixture fails a test on any console error or page error,
 * which is where a hydration mismatch shows.
 */

const content = async () =>
  createQueries(await loadContent(path.join(process.cwd(), "content")));

/**
 * Sections in the nav and in links that have no page yet. Remove a prefix
 * when its route is built, and its links are checked from then on.
 */
const notBuilt = [
  "/about",
  "/projects",
  "/collections",
  "/writing/the-kernel",
  "/writing/dev-journal",
  "/writing/feed.xml",
  "/writing/notes/feed.xml",
];

const isBuilt = (href: string) =>
  !notBuilt.some((prefix) => href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}#`));

async function routes(request: import("@playwright/test").APIRequestContext) {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

test("every page in the sitemap loads, whole and without errors", async ({ page, request }) => {
  test.slow();
  const all = await routes(request);
  expect(all.length).toBeGreaterThan(5);
  for (const route of all) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(1);
      await expect(page.getByRole("main"), route).toBeVisible();
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        unsized: [...document.querySelectorAll("main img")]
          .filter((img) => !img.getAttribute("width") || !img.getAttribute("height"))
          .map((img) => img.getAttribute("alt")),
      }));
      // Nothing wider than the page, and every image's box reserved before it loads.
      expect(layout.overflow, `${route} scrolls sideways`).toBeLessThanOrEqual(0);
      expect(layout.unsized, `${route}: images without a size`).toEqual([]);
    });
  }
});

test("the sitemap lists every entry that has a page, and no draft", async ({ request }) => {
  const q = await content();
  const listed = new Set(await routes(request));
  for (const entry of q.stream({ kinds: ["post", "note", "photo", "track"] })) {
    expect(listed.has(entry.url), `${entry.source} is missing from the sitemap`).toBe(true);
  }
  const drafts = createQueries(
    await loadContent(path.join(process.cwd(), "content"), { drafts: true }),
  )
    .stream({ kinds: ["post", "note", "photo", "track"] })
    .filter((e) => e.draft);
  for (const draft of drafts) {
    expect(listed.has(draft.url), `${draft.source} is a draft and is in the sitemap`).toBe(false);
    expect((await request.get(draft.url)).status(), `${draft.url} is a draft and has a page`).toBe(404);
  }
});

test("no link on any page leads to a 404", async ({ page, request }) => {
  test.slow();
  const from = new Map<string, string>();
  for (const route of await routes(request)) {
    await page.goto(route);
    const hrefs = await page
      .locator("a[href^='/']")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) if (!from.has(href)) from.set(href, route);
  }
  const broken: string[] = [];
  for (const [href, route] of from) {
    if (!isBuilt(href)) continue;
    const response = await request.get(href);
    if (response.status() !== 200) broken.push(`${href} (${response.status()}), linked from ${route}`);
  }
  expect(broken).toEqual([]);
});

test("an in-page link lands on something", async ({ page, request }) => {
  const dangling: string[] = [];
  for (const route of await routes(request)) {
    await page.goto(route);
    const anchors = await page
      .locator("a[href*='#']")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of new Set(anchors)) {
      const [target, id] = href.split("#");
      if (!id || !target.startsWith("/") || !isBuilt(target)) continue;
      await page.goto(href);
      if ((await page.locator(`[id="${id}"]`).count()) === 0) dangling.push(`${href}, linked from ${route}`);
    }
  }
  expect(dangling).toEqual([]);
});

test("home shows the newest essays and work, each linked to its page", async ({ page }) => {
  const q = await content();
  await page.goto("/");
  const main = page.getByRole("main");
  const essays = q.list("post", { where: (p) => p.data.type === "article", limit: 3 });
  const work = q.stream({ kinds: ["project", "album"], limit: 3 });
  expect(essays.length + work.length).toBeGreaterThan(0);
  for (const entry of [...essays, ...work]) {
    const links = main.locator(`a[href="${entry.url}"]`).filter({ hasText: entry.title! });
    expect(await links.count(), `${entry.ref} on the home page`).toBeGreaterThan(0);
  }
});

test("an embedded entry is drawn in the essay that embeds it", async ({ page }) => {
  const q = await content();
  const embedding = q
    .list("post")
    .filter((post) => post.edges.some((edge) => edge.rel === "embeds"));
  test.skip(embedding.length === 0, "no post embeds anything");
  for (const post of embedding) {
    await page.goto(post.url);
    const article = page.getByRole("article");
    for (const edge of post.edges.filter((e) => e.rel === "embeds")) {
      const entry = q.get(edge.to)!;
      const where = `${entry.ref} in ${post.url}`;
      if (entry.kind === "photo") {
        const image = article.locator(`a[href="${entry.url}"] img`);
        await expect(image, where).toHaveAttribute("alt", entry.data.alt);
        // Its box has the photograph's own proportions, so nothing moves when it loads.
        const box = (await image.boundingBox())!;
        expect(box.width, where).toBeGreaterThan(0);
        expect(box.width / box.height, where).toBeCloseTo(entry.data.width / entry.data.height, 1);
      } else if (entry.kind === "note") {
        await expect(article.getByText(entry.body.slice(0, 40)), where).toBeVisible();
      } else if (isBuilt(entry.url)) {
        await expect(article.locator(`a[href="${entry.url}"]`).first(), where).toBeVisible();
      } else {
        // Its page is not built, so it is drawn by name without a link.
        await expect(article.getByText(entry.title!).first(), where).toBeVisible();
      }
    }
    // An embed never spills out of the reading column's page.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, post.url).toBeLessThanOrEqual(0);
  }
});

test("a part of a series says where it is, and links only to parts that exist", async ({ page, request }) => {
  const q = await content();
  const series = q.stream({ kinds: ["post-series"] });
  test.skip(series.length === 0, "no series of posts");
  for (const one of series) {
    for (const part of q.members(one)) {
      const [place] = q.partOf(part.ref, "post-series");
      await page.goto(part.url);
      await expect(page.getByText(`Part ${place.position} of ${place.total}`), part.url).toBeVisible();
    }
    // A part still in draft has no page.
    for (const edge of one.edges.filter((e) => e.rel === "contains" && !q.get(e.to))) {
      const slug = edge.to.slice(edge.to.indexOf(":") + 1);
      expect((await request.get(`/writing/${slug}`)).status(), edge.to).toBe(404);
    }
  }
});
