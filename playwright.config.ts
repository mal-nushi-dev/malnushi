import { defineConfig, devices } from "@playwright/test";

const port = 3100;

/*
 * Runs against a production build, which is what ships. Port 3100 keeps it
 * clear of `npm run dev` on 3000. Visual tests are tagged @visual and skipped
 * unless asked for: their baselines are per platform, so they run locally
 * with `npm run test:visual`.
 *
 * TODO: run the visual tests in CI. Fonts render differently on Linux, so the
 * committed macOS baselines would fail there. Generate Linux baselines in the
 * Playwright Docker image (or a CI job that updates them), then drop the
 * @visual grep split above for CI. See docs/adr/0004.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  grepInvert: process.env.VISUAL ? undefined : /@visual/,
  grep: process.env.VISUAL ? /@visual/ : undefined,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  expect: { toHaveScreenshot: { threshold: 0.02, maxDiffPixels: 50 } },
  projects: [
    {
      name: "desktop-light",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
      testIgnore: /narrow/,
    },
    {
      name: "desktop-dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
      testIgnore: /narrow/,
    },
    {
      // Touch, and narrower than the plate, so it takes the full-width path.
      name: "narrow-touch",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 560, height: 900 },
        hasTouch: true,
      },
      testMatch: /narrow/,
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
