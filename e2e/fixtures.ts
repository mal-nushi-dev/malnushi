import { expect, test as base } from "@playwright/test";

/** Fails any test that logs a console error or throws on the page. */
export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        // Failed loads are reported with their URL below instead.
        if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) {
          problems.push(`console: ${m.text()}`);
        }
      });
      page.on("response", (r) => {
        // Page loads assert their own status. Next prefetches every link, and
        // most routes are not built yet, so their prefetches 404. Remove the
        // `_rsc` exemption once the section routes exist.
        const isDocument = r.request().resourceType() === "document";
        const isPrefetch = new URL(r.url()).searchParams.has("_rsc");
        if (r.status() >= 400 && !isDocument && !isPrefetch) {
          problems.push(`${r.status()} ${r.url()}`);
        }
      });
      await use(problems);
      expect(problems, "console errors and page errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
