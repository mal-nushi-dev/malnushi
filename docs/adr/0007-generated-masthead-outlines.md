# 0007. The masthead is drawn from generated glyph outlines

- **Status:** accepted
- **Date:** 2026-10-04

## Context

The Writing index masthead types "Kodikion." in JetBrains Mono and springs each letter into Newsreader. A browser cannot morph one font into another: text is not shapes. The morph needs both fonts as vector outlines with the same number of points, and it has to run at 60fps on phones and in every engine without shifting the layout.

## Decision

1. **Outlines are generated, not shipped as fonts.** `scripts/masthead-glyphs.mjs` reads the two woff2 files Next has already built (`.next/static/media`), takes the glyph outlines, merges Newsreader's overlapping pieces, scales both fonts to one cap height, and resamples every contour to 128 points. Its output, `src/components/masthead-glyphs.json`, is committed (about 44 kB, 17 kB gzipped).
2. **The script is run by hand** when the word or the fonts change. Its tools (`fontkit`, `wawoff2`, `paper`) are not project dependencies: they are installed outside the repository and a copy of the script is run there, so the app and CI carry nothing extra.
3. **The component animates without React.** `Masthead` uses motion's `animate()` to write path data straight to the DOM, as ADR 0001 sets out, with the nav's width spring. React renders once.
4. **Fallbacks are the finished state.** With reduced motion or no JavaScript the exact serif outlines are shown still; the `h1` is real text for assistive technology and the SVG is `aria-hidden`.
5. **The settled letters are the exact outlines,** not the 128-point polygons, so the resting masthead is crisp at any size.

## Consequences

- Changing the word or either font means regenerating the JSON by hand and committing it.
- Only `/writing` imports the component, so only that page's script pays for the data.
- The point count is a trade: more points follow curves more closely but grow the file.

## Deferred

- A smaller data format (the JSON stores each contour twice, exact and resampled).
- Checking Safari, Firefox and a real phone, and a mobile size.
