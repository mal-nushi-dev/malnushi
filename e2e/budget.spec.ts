import type { Request } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * Transfer budgets for the home page, cold cache, as served (compressed).
 * Measured 2026-10-03: JS 163 kB, CSS 9.6 kB, fonts 436 kB, total ~620 kB.
 * Each budget is about 15% above that, so a real regression fails and noise
 * does not. Raise one only with a reason in docs/performance.md.
 */
const budget = {
  script: 190_000,
  stylesheet: 15_000,
  font: 500_000,
  total: 720_000,
  preloadedFonts: 4,
};

async function transferByType(
  page: import("@playwright/test").Page,
  path: string,
) {
  const pending: Promise<[string, number]>[] = [];
  page.on("requestfinished", (request: Request) => {
    pending.push(
      request
        .sizes()
        .then((s): [string, number] => [
          request.resourceType(),
          s.responseBodySize + s.responseHeadersSize,
        ]),
    );
  });
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  const totals: Record<string, number> = { total: 0 };
  for (const [type, bytes] of await Promise.all(pending)) {
    totals[type] = (totals[type] ?? 0) + bytes;
    totals.total += bytes;
  }
  return totals;
}

test("home stays inside its transfer budgets", async ({ page }) => {
  const bytes = await transferByType(page, "/");
  expect.soft(bytes.script, "JavaScript").toBeLessThan(budget.script);
  expect.soft(bytes.stylesheet, "CSS").toBeLessThan(budget.stylesheet);
  expect.soft(bytes.font, "fonts").toBeLessThan(budget.font);
  expect.soft(bytes.total, "everything").toBeLessThan(budget.total);
});

test("only the first-paint fonts are preloaded", async ({ page }) => {
  await page.goto("/");
  const preloads = await page
    .locator('link[rel="preload"][as="font"]')
    .count();
  expect(preloads).toBeLessThanOrEqual(budget.preloadedFonts);
});

test("fonts are served with long-lived immutable caching", async ({ request, page }) => {
  await page.goto("/");
  const href = await page
    .locator('link[rel="preload"][as="font"]')
    .first()
    .getAttribute("href");
  const res = await request.get(href!);
  expect(res.headers()["cache-control"]).toContain("immutable");
});

test("scripts and styles are served compressed", async ({ page }) => {
  const encodings: string[] = [];
  page.on("response", (r) => {
    if (["script", "stylesheet"].includes(r.request().resourceType())) {
      encodings.push(r.headers()["content-encoding"] ?? "none");
    }
  });
  await page.goto("/");
  expect(encodings.length).toBeGreaterThan(0);
  expect(encodings.filter((e) => e === "none")).toEqual([]);
});
