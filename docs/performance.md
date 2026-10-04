# Performance

Baseline and budgets for the site, measured before there is real content. Decisions are in [ADR 0005](adr/0005-images-and-performance-budgets.md). Re-measure after the first real essay and photograph, and after any dependency change.

## Baseline (2026-10-03, home page, production build)

Lighthouse 13.5.0, headless Chromium, simulated throttling. Desktop: two runs, identical. Mobile: five runs; the first was an outlier (85, LCP 4.4 s) and the other four agreed within 0.1 s.

| | Desktop preset | Mobile preset |
|---|---|---|
| Performance | 99 | 87–88 |
| First Contentful Paint | 0.3–0.5 s | 1.1 s |
| Largest Contentful Paint | 0.8 s | 3.8–3.9 s (one outlier 4.4 s) |
| Total Blocking Time | 0 ms | 10 ms |
| Cumulative Layout Shift | 0 | 0 |
| Transferred | 609 KiB | 608 KiB |
| Accessibility / Best practices / SEO | 96 / 96 / 100 | 96 / 100 / 100 |

- **Read the mobile column with care.** The design is desktop-only until the mobile design starts (DESIGN.md), so the mobile preset renders a 96px-gutter layout in 412px: the h1 wraps to a 900px-tall block, and that h1 is the LCP element. Treat desktop as the baseline and mobile as a number to improve when mobile is designed.
- **LCP is the headline text**, not an image. Its render delay is about 25 ms; the simulated time is network and font transfer.
- **Accessibility 96** is the image placeholder labels (contrast), already an open question in DESIGN.md. **Best practices 96** on desktop is the console error from Next prefetching links to routes that are not built (404). Both go away with real content.
- **Lighthouse also flags** 29 KiB unused JavaScript and 13 KiB "legacy JavaScript". Both come from the framework chunks (React and Next), not site code.

### What the home page transfers

| Type | Size | Notes |
|---|---|---|
| JavaScript | 163 kB | React DOM 72 kB, Next client 45 kB, nav plus Motion 25 kB, the rest small |
| Fonts | 436 kB | 9 files, all `latin` plus symbol subsets, all `display: swap` |
| CSS | 9.6 kB | one render-blocking file (about 150 ms simulated) |
| HTML | 8.6 kB | |

## Bundle

Run `npm run analyze` (`next experimental-analyze`, built into Next 16 and Turbopack). `@next/bundle-analyzer` is not used: it only works with webpack, and this project builds with Turbopack.

**Motion** is `animate` and `motionValue` from `motion`, bundled alone at 55 kB (20 kB gzipped). It is the largest piece of site-specific JavaScript. `LazyMotion` and `domAnimation` do not apply: they shrink the `motion.div` React components, which the nav does not use (ADR 0001). Options if it ever matters, none worth doing now (Total Blocking Time is 0):
- Import Motion with `import("motion")` on first interaction (about 20 kB off first load; the first open waits on a small fetch unless it is prefetched on hover or idle).
- Drive the springs with `JSAnimation` from `motion-dom` directly, or write a small spring solver (about 2 kB).

## Fonts

`src/app/fonts.ts` loads three families with `next/font/google`: all `subsets: ["latin"]`, all `display: "swap"`, self-hosted. Next preloads only the `latin` file of each family, and the fallback metrics are size-adjusted (except Google Sans Flex, which Next has no data for; CLS is still 0).

Four files are preloaded on every page: Newsreader upright (132 kB) and italic (147 kB), Google Sans Flex (51 kB) and JetBrains Mono (40 kB).

**Tried and rejected: not preloading the italic and the mono.** Both are used below the first screen, so I split the italic into its own loader and set `preload: false` on both. Lighthouse (mobile preset, three runs of the split, two of the original) gave the same LCP (3.8 s against 3.9 s) and a worse First Contentful Paint (1.8–2.1 s against 1.1 s), because the files then start after the CSS is parsed. The preload is cheap here; keep it. Revisit if the site gets many more font files.

**Found: the arrow `→` costs 64 kB.** Google Sans Flex's `latin` file has no arrows, so the browser fetches two more subsets (25 kB and 39 kB) as soon as an arrow appears in sans text, on the critical path. Arrow links and the "Read the essay →" line use it. Drawing the arrow as inline SVG (the nav icons already are) would remove both requests. It changes a glyph into a drawing, so it is a design decision: not done.

The variable fonts include the full weight range (Newsreader 200–800, Google Sans Flex 1–1000, JetBrains Mono 100–800) although the site uses 300 and 400. `next/font` cannot trim a variable font's range; static weights would be smaller per file but add one file per weight.

## Images

There are no real images yet. The pattern is set so the first photograph follows it:

- Use `Photo` (`src/components/photo.tsx`) inside `Figure`, in place of `ImagePlaceholder`. It wraps `next/image` with the figure's width, height and `sizes`, so layout is reserved and the right width is chosen.
- Import local images (`import wren from "./wren.jpg"`) so Next hashes them and caches them as immutable.
- Set `aboveTheFold` on at most one image per page, the one that can be the first screen's largest element.
- `next.config.ts` serves AVIF, then WebP. Verified on a production build: a 50 kB JPEG came back as 7 kB AVIF or 10.5 kB WebP.
- **Size budget** (served, per image): hero 1248 × 640 at most 200 kB, column 680 × 453 at most 120 kB. Source files should be at least 2× the display size (2496 px wide for a hero) so large screens stay sharp.
- Only quality 75 is allowed (`qualities` in `next.config.ts`). Add another only if a photograph needs it.

## Budgets

`e2e/budget.spec.ts` fails if the home page, cold cache and compressed, goes over: JavaScript 190 kB, CSS 15 kB, fonts 500 kB, everything 720 kB, or more than four preloaded fonts. It also checks that fonts are cached immutably and that scripts and styles are compressed. Each limit is about 15% above the measured value. It runs in CI with the rest of the e2e suite.

## Core Web Vitals in the field

Not set up: the site is not live and there is nothing to measure. When it is, the options are Vercel Speed Insights (if hosted on Vercel) or `useReportWebVitals` posting to your own endpoint (`node_modules/next/dist/docs/01-app/02-guides/analytics.md`). A second reason to wait: lab numbers will be more useful once the first real essay, with images, is the page being measured.

## Reproduce

```bash
npm run build
npm run start -- --port 3100
npx lighthouse http://localhost:3100/ --preset=desktop --view      # desktop
npx lighthouse http://localhost:3100/ --view                       # mobile preset
```

Lighthouse needs Chrome. If there is none, point `CHROME_PATH` at Playwright's (`~/Library/Caches/ms-playwright/chromium_headless_shell-*/…/chrome-headless-shell` on macOS). Do not rebuild while the server is running; restart it.
