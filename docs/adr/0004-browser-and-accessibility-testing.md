# 0004. Playwright, axe, and token drift tests

- **Status:** accepted
- **Date:** 2026-10-03

## Context

[ADR 0002](0002-vitest-and-testing-library.md) says jsdom cannot test focus, layout, color or motion, and named Playwright as the next step. The first browser run found a real bug that every unit test had missed: the search field never received focus when search opened, because the focus timer (120ms) fired while the field was still `visibility: hidden` behind a 150ms transition delay. Separately, `globals.css` is a hand copy of `tokens/`, so the two can drift.

## Decision

1. **Playwright (`@playwright/test`) for end-to-end tests** in `e2e/`, against a production build on port 3100 (so `npm run dev` on 3000 can keep running). Projects: `desktop-light` and `desktop-dark` (1440 × 900, one color scheme each) and `narrow-touch` (560px, touch) for the nav only. Specs: `smoke` (loads, 404 status, fonts, robots, sitemap, icons), `nav` (focus, Escape, outside press, scroll, fill, keyboard order, focus ring), `nav-narrow`, `a11y` and `visual`. Every test fails on a console error, a page error or a failed non-document request.
2. **`@axe-core/playwright`** scans the real pages and the nav's open states for WCAG 2.0 to 2.2 A and AA in both color schemes, including color contrast, which jsdom cannot compute.
3. **`vitest-axe`** adds a structural axe check to the component tests (`src/app/a11y.test.tsx`), with color contrast off. The package types its matcher on the old `Vi` namespace, so `src/test/vitest-axe.d.ts` re-declares it for Vitest 5.
4. **Visual regression** with Playwright screenshots, tagged `@visual` and left out of CI. Baselines are named per project and platform (`home-desktop-dark-darwin.png`) and are committed. Run with `npm run test:visual`; accept a change with `npm run test:visual:update`. Thresholds are tight (color tolerance 0.02, 50 pixels) because the default tolerance hid a deliberate `ink-2` change.
5. **Token drift test** (`src/lib/tokens.test.ts`, a unit test) reads `tokens/` and `globals.css` and fails if a color, dimension or type style differs, if a token has no CSS, or if a `:root` variable has no token. `--shadow-nav` is the one listed exception.
6. **CI** runs the e2e job separately from lint, typecheck, unit tests and build. It installs Chromium only and uploads the report on failure.

## Alternatives considered

- **Cypress or WebdriverIO.** Playwright's auto-waiting, multiple projects and built-in screenshots cover this without a second tool.
- **`jest-axe`.** `vitest-axe` is the same matcher for Vitest, with no Jest dependency.
- **Visual tests in CI (TODO).** Font rendering differs between macOS and Linux, so baselines made on one fail on the other. Running them in CI needs Linux baselines generated in a container (or a CI job that updates them); not done yet.
- **Percy or Chromatic.** Hosted visual review is more than a one-person site needs.
- **Parsing `globals.css` with a CSS parser.** The drift test uses a small brace-matching reader instead of a dependency, since the file has one shape.

## Consequences

- E2E runs need `npx playwright install chromium` once (about 95 MB), and a build, so they take about 10 seconds longer than a bare run.
- Next prefetches every link, and most routes are not built, so their prefetches return 404. The fixture ignores failed `_rsc` requests; remove that exemption when the routes exist.
- Image placeholders are excluded from the contrast scan until the open question in DESIGN.md is settled.
- The visual baselines are 2 MB of PNGs in git, and change whenever the design does.
