# Design log

Decisions made while turning [DESIGN.md](DESIGN.md) into a design and then into code. DESIGN.md says what the design is. This file records the decisions behind it, and why.

Format: newest first. Each entry has the decision, the reason, and what would change it. Unresolved questions live in DESIGN.md under "Open questions"; don't duplicate them here.

## 2026-10-06

### Projects index: a tight gallery of tiles
Decided with Mal, from four mockups (an even card grid, varied ratios, mixed card styles, then a "gallery wall" with captions under each piece, which Mal did not like). Built at `/projects`. The engineering is in `docs/adr/0009-tiles-css-springs-and-filters-in-the-address.md`.
- **A gallery, not an index list.** Mal: the index list "is very boring sounding". DESIGN.md said both "image-forward card grid" and "the index list replaces card grids"; the Projects index is now a named exception, as the Writing index is.
- **"Projects" in `feature-display`, centered under the nav,** with no eyebrow, standfirst or full stop (Mal's choices; I had tried a sage full stop to echo "Kodikion." and a standfirst).
- **Tiles 4px apart both ways, at the content width** (Mal's choices, over 2px, touching, or edge to edge). 4 is off the 8px scale, so it is its own token, `space.tile-gap`.
- **No hero; sizes vary.** Mal: equal weight does not mean the tiles must look alike. A tile is one cell, two across, two down or four. **Sizes come from position** in a repeating run of twelve (my choice): no content field decides layout, and filtering never resizes a tile. The cost is that a piece's size changes as newer ones arrive. In Open questions.
- **The plate is the nav's effect** (Mal asked for something like the nav and the "Kodikion." masthead): sage over the whole tile at some opacity, on the nav's springs, with the words arriving 150ms later as the nav's panel does. Mal chose the sage covering the whole tile over a plate floating 8px inside it, and turned down a mono-to-serif title morph. With the whole tile covered, the spring's overshoot is hidden by the tile's edge, so the plate lands without a visible bounce.
- **`sage.700` (`#4D5749`), a new primitive, at 90%** (my choice; Mal offered a new color if the tokens had none that worked). The nav's `sage.600` at 90% over a white cover leaves `#FAFAFA` at 4.2:1 and `#EDEEEB` at 3.7:1, under AA. `sage.700` gives 5.6:1 and 5.0:1 in that worst case.
- **On the plate:** label, year, title, one line of summary and status (my suggestion; Mal approved "for now"). The label counts what a series or a release holds (`Photo series · 12`, `EP · 3 tracks`). These are views of the entry: filtering and search read the entry, never the label.
- **Ordering:** the last changed first, `updated` then `date` (Mal: "updated, then newest"). This is the first page to order by `updated`.
- **Filters are small (32px), centered, just above the gallery** (Mal). Multi-select, and a piece must answer to all that are on; a pill that would leave nothing is hidden (Mal: hide combinations that do not exist). The selection is in the address so it can be shared (Mal).
- **Disciplines need no new field.** I first proposed a `disciplines` list on each entry; Mal asked what the content model says. It already has the answer: `category` is the one label shown and `tags` are the many used for finding. A piece answers to its discipline and to any tag that names one. Only disciplines get pills, so a tag such as `swift` does not flood the row (my choice).
- **Nothing related is shown on a tile** (Mal): a project's essays, source and design files belong on its own page, which Mal expects to style piece by piece.
- **"All photos" and "All music"** link the two archives from under the gallery (Mal: photographs and tracks would otherwise swamp it).
- **No cover:** an image placeholder (Mal), which carries the piece's title (my choice, so a coverless tile still says what it is). A photo series without a `cover` uses its first photograph (my choice).
- **Small pills are under the 44px touch target.** Fine for a pointer; revisit with mobile, which Mal set aside for this page.
- **What would change it:** many more pieces than a screen or two would want paging or grouping by year. If position-based sizes feel arbitrary, an entry could ask for its size. If touch readers cannot tell tiles apart, the tile needs a resting caption.

## 2026-10-05

### A series counts a part still in draft
Decided with Mal. The engineering is in `docs/adr/0008-atomic-content-model.md`.
- **A draft part keeps its place** in a published series or album (Mal's choice, from three I offered). With part 3 of 3 in draft, part 2 reads "Part 2 of 3" and has no link onward. The draft has no page and nothing links to it.
- **Reason:** the other two readings are both wrong to a reader. Counting the draft and linking it leads to a 404. Dropping it makes the count shrink to "Part 2 of 2", which misstates a series that is planned as three. Holding the place also means a part can be listed as soon as it is started, and publishing it is one flag in one file.
- **An album's track list leaves a draft track out,** while the track's number on the release still counts it. Not designed: no album page exists yet.
- **`updated`** is now read from every kind that can be revised, but no page shows it. In Open questions.
- **What would change it:** if a release should never go out with a track missing, albums and photo series can fail the build on a draft member while post series keep this rule.

### A track has its own page
Decided with Mal. The engineering is in `docs/adr/0008-atomic-content-model.md`.
- **Track is a seventh type,** with its own URL at `/music/[id]`, as a photo has `/photography/[id]` (Mal's choice; I had proposed an anchor on its album). Mal's reasons: a recording is a piece of work in itself, with its own notes, tempo and key; the same track can be a single and later sit on an EP, so no release can own its address; and a lone cover or demo should be one file, not a file plus an invented one-track release.
- **A release is `album`, whatever its length,** with a `format` of album, EP, single or compilation. It lists its tracks and lives at `/projects/[slug]` beside projects and photo series (my choice, following where photo series went). It has no page until the project template is built.
- **Track page and `/music`** are built from existing tokens and components only: eyebrow `MUSIC / TRACK`, `h1`, standfirst, a meta row of date, duration, tempo, key and composer, the liner notes in the reading column, then "Appears on" (its releases) and "Appears in" (entries that embed it) as index lists and a next link. `/music` is one index list. Not designed with Mal; in Open questions. There is no player.
- **Embedded** in an essay, a track is a label, its title and its facts between two hairlines, linking to its page, as a sighting is.
- **Home:** "Latest work" now lists releases with projects, so music still shows there.
- **Placeholder content:** the two mock music projects (Porch Light, Low Tide Sketches) were replaced by three placeholder tracks and one EP.
- **What would change it:** if tracks are only ever heard in the context of a release, the track pages could redirect to the release; the refs and files would not change.

### Content model: groupings, tags and observations
Decided with Mal. The engineering is in `docs/adr/0008-atomic-content-model.md`, which was rewritten for it. What it changes in the design:
- **Tags are shown to readers.** `keywords` (search only, hidden) is gone; every kind has `tags`. Reason: a piece about a connected kitchen appliance is technology, home and food at once, and a reader should be able to arrive from any of them. Where tags appear is not designed; in Open questions.
- **Category stays, as the one primary label** (Mal's choice). Eyebrows, badges and index rows need a single word chosen by the author; picking one from an unordered list of tags would be a guess. Articles still require it.
- **A sighting and a recommendation are entries, not table rows.** Each is its own file with notes. They are still read as rows and still have no page: the address is an anchor on the list (Mal's choice: one or two sentences do not earn a page). The life list is worked out from the sightings, one row a species.
- **A multi-part run is a post series** with its own entry, which lists its parts. "Part 2 of 3" is worked out from that list. No page for the series yet (Mal's choice).
- **Names:** `photo-series` and `post-series` (Mal's choice), so the two kinds of series cannot be confused.
- **Music:** Mal's own recordings are projects (track and album kinds to come); other people's music is a recommendation.
- **Home:** "Latest bird" is the newest species on the life list, not the newest sighting of any bird (my choice, to match the label's old meaning).
- **What would change it:** if tags turn out not to be worth showing, they can go back to search only without touching content. If a subject gathers its own writing and a reading list, it becomes a topic entry instead of a tag.

## 2026-10-04

### One content model; a photo is its own kind
Mal named it the **Atomic Content Model**.

Mal wants content written once and shown anywhere: a photograph on its own page, in the archive, on the home page and inside an essay, and the same for notes, posts, projects and collection rows. The engineering is in `docs/adr/0008-atomic-content-model.md`. What it changes in the design:
- **Photo is a sixth type** (Mal's choice): one photograph with its own URL, read in an archive, never art-directed, as a note is for text. A series becomes an ordered selection of photos.
- **A collection row can be shown away from its table** (embedded in an essay, on the home page). It still has no page; it links to its list.
- **Content moves into this repository** (Mal's choice, reversing ADR 0006), which will be made private. Placeholder content only until then.
- **Photo metadata:** read from the image, and anything in the photo's `.yml` wins (Mal's choice). Alt text is required, or the build fails (my choice, from the accessibility rule that every image has alt text).
- **Series move to `/projects/[slug]`** so `/photography/[id]` can be the photo's permalink (my choice, for review). It follows the earlier entry that lists series on the Projects index. The home page's link to the marsh series changed with it.
- **Photo archive and photo page** are built from existing tokens and components only: figures `space-block` apart, landscape at hero width and portrait at column width, alternating sides; the photo page reuses the meta row and index list. Not designed with Mal; in Open questions.
- **Embeds** in an essay: a photograph is a column figure indexed by its date; a note and a collection row sit between two hairlines; anything else is a label over an `index-title` link.
- **Home:** the collections strip is three equal cells (was 5 and 6 columns) and gains "Latest photograph", as text. "Latest writing" now lists the three newest articles from the same content the Writing page uses; before, the two pages had different placeholder lists. The feature essay is dated 2025-10-01 so the Writing page's lead stays as it was.
- **Eyebrow fixed:** `EssayHeader` read `ESSAY / …`; it now reads `WRITING / …`, as decided on 2026-10-03.
- **Essay page built** (`/writing/[slug]`) to the house template in DESIGN.md, without margin asides or the feature tier. The single note page (`/writing/notes/[id]`) is built as specified, with a hidden `h1` naming the note by its date.
- **What would change it:** if photos outgrow one archive (hundreds), it needs paging or grouping by month or place; if series should stay under `/photography/`, photos need a different permalink.

### Page significance and editorial roles defined
Mal clarified what each of the five primary spaces in the site signifies, formalizing their information architecture and presentation models in [DESIGN.md](DESIGN.md):
- **Home:** An active front porch rather than a static directory, pairing personal introduction with lead features and live pulses from recent writing, projects, and collection activity.
- **Writing:** Unifies long-form blog articles and short-form microblog notes under one roof to prevent thought fragmentation; reverse-chronological stream with subtle filter toggles (essays, quick notes, all) and reading times.
- **Projects:** The creative workshop for things made, engineered, or arranged (code repositories, original music compositions, Lego creations, and photography portfolios); structured as an image-forward card grid browsing disparate disciplines side by side, linking to dedicated case studies.
- **Collections:** Personal encyclopedia and data hub (bird life list, plant tracker, flight stats, city guides, item inventories, media recommendations) of living tables and dashboards evolving over decades; visual index tiles with previews and running tallies.
- **About:** Personal grounding and connection points; background, current technical focus, colophon detailing build and hosting, a "Now" module, and direct contact.

### Masthead: typography protection, CRT bezel refinement, and shared motion library
Mal pointed out that the serifs still noticeably snapped into the real font shape at the end of the transition, and the CRT outer bezel had ripples and corner pinching.
- **Why the serifs snapped:** In `masthead-glyphs.json`, the resampled 128-point polygon (`to.pts`) missed the sharp serif vertices of Newsreader display cuts by up to 27 units. Even with clamped morphing, `main` remained a polygon until `late2` settled ~750ms later, whereupon `main.setAttribute("d", gl.to.d)` abruptly swapped the path while stationary.
- **Eliminating the serif snap:** Introduced a dedicated layer for the true Newsreader cubic bezier path (`gl.to.d`). As letters spring across the screen into place ($t$ from 0.55 to 0.95), the exact serif outlines cross-fade in *during dynamic motion*, while the morphing polygon fades out. By the time letters land on the baseline, they are already 100% authentic Newsreader serifs with zero delayed snap or polygon pop.
- **Uniform pill-arc bezel:** The previous cubic/quadratic bezier edges bowed outward beyond the corners, causing normal vector kinks and a ~17-degree tangent mismatch that pinched the corners and created ripples along the left border. Replaced with an exact pill-shaped enclosure with mathematical circular arcs (`Cr = 480`). The outer bezel stroke maintains 100% constant, uniform thickness all the way around with zero ripples, bumps, or corner pinching.
- **Shared motion architecture:** Created `src/lib/motion.ts` as the single source of truth for site-wide spring tokens (`springs.width`, `springs.height`, `springs.close`) and shared animation math (`clamp`, `lerp`, `lerpArray`, `reducedMotion`). Both `nav.tsx` and `masthead.tsx` now import from this shared library.
- **CRT visuals & performance:** Added an authentic cathode ray warm-up beam, 100 fine raster lines, a decaying phosphor cursor trail during typing, vibrant color cooling, snappy single-blink replay, and a temporal path ring buffer cutting vector morph math by 66%.

### Writing index: the masthead's mono mode is a CRT terminal
Mal wanted the block to flash like a terminal cursor and the monospace text to have phosphor persistence (DEC VT100, IBM 3270), and, after the options, a dark convex CRT screen behind it with green phosphor text.
- **What it is:** a dark screen with bowed sides, a bezel, a vignette, scanlines and a glare warms up behind the name; the name is typed in green; the cursor blinks twice; then the letters morph to serif, the screen fades and the full stop is sage again. The replay runs the same terminal moment (serif → mono, two blinks, → serif). The intro is about 3.3s, up from 2.5s.
- **Why not the canvas "low-alpha rectangle" trick:** it would work with a morph (shapes would leave trails), but it needs the masthead rebuilt as a DPR-aware canvas (no exact vector serif at rest, colours read from CSS by hand), re-fills the whole panel every frame, and 8-bit alpha leaves a permanent faint ghost. The persistence is made from the same outlines instead: a halo (a wide faint stroke, no filter, since filters re-rasterise badly in Safari when the shape changes each frame), two lagging ghosts per letter, and a flare on each typed letter. The glass is geometry: every point is bulged toward the centre (stronger with distance) and the bulge relaxes to nothing as the letter becomes serif.
- **Rules loosened (written into DESIGN.md):** "no gradients", "one tinted surface" (the sage nav plate) and "nothing else is curved or rounded". The screen is the second tinted surface, exists only while the animation plays, and is decorative.
- **Colours are the masthead's own, not tokens:** the screen is dark in both modes, and `tokens.test.ts` ties every CSS variable to a token. If more terminal surfaces appear, promote them.
- **Measured (Chromium, 1440px, light and dark):** 16.7ms median frames in the intro and the replay at 1×, 4× and 6× CPU throttle; no long frames in the intro, one 41–48ms frame when a replay starts. At rest the letters are the exact serif outlines, the glow and screen are hidden and the layout does not move. Not checked: Safari, Firefox, a phone.
- **My choices, for review:** the bulge (0.11, down from 0.24, which warped the K and the cursor), the screen's size and bow, the green, two ghosts at 50ms and 120ms lags, two blinks at 0.5s each (under 3 flashes a second), the scanlines (not asked for).

### Writing index: masthead replays on press
Mal settled the open points: the masthead does not span the notes rail, it plays on every load, and pressing "Kodikion." plays it again.
- **Replay:** serif to monospace (the full stop becomes the block cursor), a 0.3s hold, then back to serif, on the same springs and stagger. A press during a play is ignored, so plays never overlap.
- **Keyboard and screen readers:** a transparent button covers the masthead, named "Play the masthead animation again", outside the `h1` so the heading still reads "Kodikion.". It appears only when the animation runs: not with reduced motion, not without JavaScript. The `h1` keeps its text and is not itself clickable (my choice, for review).
- **Set aside for now:** Safari, Firefox and phone checks, and the mobile layout. They stay in Open questions in DESIGN.md.

### Writing index: Kodikion masthead built at /writing
Mal chose mockup B ("Running rail", with the typed-then-morphed masthead) for `/writing`. It replaces the old page, which was four stacked lists.
- **Built as mocked up**, with the sample content now inline in `src/app/writing/page.tsx`. Mockups A and C, the `/components/writing` chooser and their shared files are deleted.
- **Pieces moved to `src/components/`:** `Masthead` (and its outlines), `ArticleFilter`, `IssueStub` and `EarlierIssues`, `WireNotes`, and `ImageSlot` (in `image-placeholder.tsx`).
- **Spec rules loosened, now written into DESIGN.md:** the Writing index is the one page with no eyebrow; the index list replaces card grids except where articles lead with images here; this page has filter pills outside a collection, and a sticky notes rail beside the articles.
- **Left open (Open questions):** Safari, Firefox and a real phone; the mobile size and layout; whether the masthead spans the notes rail; once per session or every load. ADR 0007 records the generated outlines.
- **Dropped with A and C:** the broadsheet nameplate with a mono dateline, vertical column rules, and the hover-driven image beside the list.

### Writing index: three mockups
Mal finds `/writing` bland and linear: every section looks the same, nothing leads, it is one column from top to bottom, and there is little to look at but titles. The brief: a front page that mixes a lead article with the latest notes and newsletter issues; images and category filters are welcome; newspaper-like in structure, but "structured, but also fun", not a copy of the New York Times.
- **Three directions** are built at `/components/writing` on the same sample content, as was done for the note stream. None is chosen yet (see Open questions in DESIGN.md).
  - **A, Broadsheet** (`/a`): a centred nameplate between two `--ink` rules with a mono dateline, then three zones divided by vertical hairlines: the lead article with an image (columns 1–6), the latest issue of each newsletter (7–9) and the notes set small (10–12). The article index follows.
  - **B, Running rail** (`/b`): articles in columns 1–8, led by images of unequal size; the notes sit in columns 10–12 and stay in view while the page scrolls. The page title is small (`quote`) so the lead headline can be `h1`.
  - **C, Live index** (`/c`): the article list leads, in columns 1–7; one image beside it shows the article whose row is hovered or focused, and stays in view. Newsletters and notes share one row beneath.
- **In all three:** filter pills filter the article list in place, and a newsletter's latest issue shows its number in `stat`, in `--accent` (a large decorative mark, which the accent allows).
- **No new tokens or type sizes.** Display type and subtitles on every row were not asked for; only the lead carries its subtitle.
- **My choices, for review:** A's zones are 6/3/3 columns, not 7/3/2, because notes were unreadable in two columns. C's image first sat beside the page title; it scrolled away before the rows could be pointed at, so it moved beside the list.
- **Rules the chosen direction would loosen** (not changed yet): "index lists replace card grids entirely" (images on an index page), filter pills outside collections, vertical hairlines (A), and a sticky element other than the nav (B and C).
- **B is the front-runner (same day).** Mal prefers B and is revising it; it is not final, so A and C stay. First revision, the masthead:
  - The page calls itself **Kodikion.**, not "Writing"; the nav item is still "Writing". The full stop is part of the name and is set in `--accent` (Mal's choice over ink). At 88px it is a large mark: 5.14:1 in light, 3.28:1 in dark.
  - The name is the `h1` at `h1` size, across the full content width with a 1px `--ink` rule under it, above both the articles and the notes rail. Under it, as the standfirst: "A blog by Mal Nushi. Also on Substack."
  - The lead headline drops from `h1` to `quote`, and its subtitle from `standfirst` to `body`, so the masthead is the largest type and the lead leads by its image (my choice, to stop two 88px lines competing).
  - **No eyebrow** on this page: `WRITING / KODIKION` would repeat the name above itself. The spec puts an eyebrow above every `h1`, so this is an exception if B is chosen.
  - **Tension, not settled:** the spec says notes are not part of Kodikion, but the full-width masthead sits over the notes rail too. If that matters, end the masthead at column 8 and start the rail beside it.
- **Masthead, second revision (same day): large, centered, typed then morphed.** Mal sees Kodikion as mostly a tech blog (The Verge) shaped by literary publications (The New Yorker, The New York Times), and wanted the nameplate to say so: built in the monospace, then morphed into the serif with the nav's springs.
  - **Sequence:** the name is typed in JetBrains Mono behind a sage block cursor (70ms a character); after a 0.3s hold each letter springs into Newsreader, 40ms apart, and the cursor becomes the sage full stop. The spring is the nav's width spring (`260, 21, 1`, now exported from `nav.tsx`), so the letters overshoot and settle as the plate does. About 2.5s in all, once per page load.
  - **Size and place:** centered in columns 3–10, which sets the serif at about 200px. It is drawn as outlines in an SVG that scales with the column, so it is not a type token. The subtitle is centered under it. The wider mono word overflows the SVG's box sideways while it plays but stays inside the content width.
  - **How:** `scripts/masthead-glyphs.mjs` reads the two built font files, merges Newsreader's overlapping pieces into plain outlines, scales both to one cap height, and resamples every contour to 128 points so letters morph point to point. The output is `masthead-glyphs.json`; `masthead.tsx` writes path data from motion values, so React never re-renders (ADR 0001's pattern). The mono weight is 400 and the serif is 400 at optical size 72, with `h1` tracking.
  - **Reduced motion and no JavaScript** show the finished serif, still. The `h1` is real text for screen readers; the SVG is hidden from them.
  - **Measured (Chromium, 1440px):** 60fps throughout, also with the CPU throttled 4× and 6× (one or two long frames at page load in each run, none during the morph). The outlines add 17 kB gzipped of script to this page only. No font has to load for the masthead and its box never changes size, so it cannot shift the layout. Not measured: Safari and Firefox (their Playwright builds are out of date here), and a real phone.
  - **My choices, for review:** the cursor-to-full-stop idea; 8 columns wide; cap heights matched, so the word narrows as it morphs; plays on every load, not once per visit.
  - **Owed if B is chosen:** an ADR for generated outlines (the script's three tools are not project dependencies and it runs by hand), a smaller data format, and a mobile size.
- **Outcome:** B was chosen and built at `/writing` (entry above); the other two are deleted.

## 2026-10-03

### Contrast checked in the browser
The new axe scan (`e2e/a11y.spec.ts`) checks WCAG 2.2 AA contrast on the pages and the nav's open states, in light and dark. The sage plate passes in both modes. Findings, all in DESIGN.md "Open questions": placeholder labels fail AA, and the dark accent is under 4.5:1 so it cannot carry text.
- **Changed:** the section headings on the `/components` preview page were `--accent`, which the spec reserves for marks, not small text (3.28:1 in dark). They are now `--ink-2`.

### 404 and error pages
Added `not-found.tsx` and `error.tsx`, both built on a shared `StatusPage` (nav, a small label, an `h1`, a standfirst, then arrow links). They use existing tokens and type styles only, so nothing new is added to the spec.
- **Copy** is plain and short: "That page isn’t here." and "Something went wrong." The 404 admits that most of the site is unwritten, since most links currently lead there. Mal hasn't reviewed the wording.
- **Layout** follows the page header pattern: 120px top padding, one column, no image.

### Placeholder icons and share image
`icon.tsx`, `apple-icon.tsx` and `opengraph-image.tsx` are generated: an "M" on `--ink`, and a light card with the site name and description under a sage rule. They are placeholders for a real mark and use the renderer's bundled sans, because it cannot load the `next/font` files. Replace them when the logo and share image are designed. The default Next favicon was removed.

### Pressing outside the nav closes it
Mal wanted an expanded nav to close when the page is pressed anywhere outside the toolbar and plate. The search text is kept when it closes, by any route (outside press, Escape, the toggle); it is cleared only on refresh or when the page changes. Focus stays on whatever was pressed.

### Nav opens in two phases, on springs
Mal wanted the expansion to feel less generic than one uniform ease: choreographed phases, spring physics with a slight overshoot, and a softer shape.
- **Phases:** the plate widens about its center, then drops open once the width has covered 80% of its travel. Closing runs in reverse.
- **Feel:** each phase grows a little past its target and settles (width about 7%, height about 5%). "Wobble" here means the plate's own size settling; it never sways sideways and its top edge stays put. Closing is nearly critically damped, so the bar lands still.
- **Springs** (stiffness, damping, mass): width `260, 21, 1`; height `220, 21, 1`; close `320, 34, 1`. Starting values, not yet tuned by eye with Mal.
- **Shape:** resting plate radius goes from 4px to 14px (new `--radius-nav`), easing to 20px when open; the bar thins by up to 4px while widening. Mal chose 12–16px over a full pill or keeping 4px. This is a second exception to "nothing else is rounded".
- **No goo filter.** Mal first proposed an SVG blur-and-threshold filter; we dropped it because on a single plate it only rounds corners, and it would blur the text and harden the shadow. Mal chose the spring-driven shape alone.
- **Narrow viewports** skip the widen phase, since the plate is already full width (Mal confirmed this on a narrow screen).
- **Reduced motion:** the plate jumps to size.
- **Timing change:** the sage fade is 300ms, down from 600ms, to match the widen phase.
- **Tokens:** `radius.nav` (14px) and `radius.nav-open` (20px) are in `tokens/` and `globals.css`.
- **Close keeps its color (same day, after Mal's review):** the first build dropped the sage fill the moment close was clicked, so at the top of the page the plate faded away before it finished collapsing and the close read as a fade. The fill and shadow are now held until the height has collapsed and fade only as the width narrows, so the close is the open in reverse.
- Engineering (library, why width and height are animated directly) is in `docs/adr/0001-spring-animation-with-motion.md`.

### `tokens/` is the source of truth
Mal retired the separate design file. From now on `tokens/*.json` is the source of truth for tokens, `src/app/globals.css` mirrors it, DESIGN.md is the spec, and the components are the ones in `src/components/`.
- References to the design file were removed from the code, tokens, DESIGN.md, the component checklist and this log. Entries below that only described work in that file were deleted; the rest were trimmed to the decision.
- The "Known differences" table at the top of this log was removed, since there is nothing left to differ from.
- `type.label`'s uppercase is now stored under `$extensions["malnushi"].textCase` in `tokens/semantic.json`.
- The design tool's agent skills and MCP entry were removed from `.agents/`.

### Nav buttons show a pointer cursor
The search and menu buttons kept the default arrow on hover, because Tailwind's preflight resets `<button>` to `cursor: default`. Added `cursor-pointer` to the shared `button` class in `src/components/nav.tsx`, so both controls (and their close states) show the pointing hand. Links already did.

## 2026-10-02

### Expanded nav is sage
Mal asked to try other colors for the nav while expanded (resting nav unchanged). Four palette-only candidates were built and compared in the browser: `surface` (`#EDEEEB`), `ink` (inverted `#2E2E2E`), `slate` (`#485861`) and `sage` (`#626E5E`). All passed AA. Mal chose **sage**, for both the menu and search.
- **Implementation:** `[data-nav-open]` on the nav wrapper re-points the color tokens in `src/app/globals.css`; the plate, row and contents follow, and the row text fades with the plate (600ms). The `?navtone=` experiment and the other three tones were removed.
- **Contrast on sage:** ink `#FAFAFA` 5.1:1, ink-2 and link `#EDEEEB` 4.6:1. Hairlines are a `color-mix` of `#EDEEEB` into sage; the active underline is `#EDEEEB`, since the sage accent would vanish.
- **Same in dark mode** (my call: sage is mid-tone, so it lifts off `#2E2E2E` and the light text still works; unchecked visually).
- **Spec change:** a tinted surface is now allowed in this one place. Written into DESIGN.md (Nav).
- **Not done:** the color mix is not a token in `tokens/`.

### Nav controls pinned, panel grows outward, fill and shadow on scroll
Mal found the nav hard to read once content scrolled behind it, and noticed the search and menu buttons shifting when the nav expanded.
- **Why they moved:** one centred island both held the buttons and animated its width (600 → 840px), so the buttons at its edges slid outward, and search also re-laid out the wordmark.
- **Decision:** split the surface from the controls. The row (search, wordmark, menu) is fixed at 600 × 72px and never resized. A plate behind it grows outward from the same origin, wider and downward, and the search field and menu list appear in that expansion below the row. Mal's words: expand "width wise and below", in place, and don't touch the three row elements. Only the icon swaps to close, in place (my choice, so the toggle state stays visible; say if the icons should never change).
- **Fill on scroll:** clear at the top of the page, as before. After 8px of scroll the plate fades to a `--bg` fill with a very slight shadow. Search and menu also fill it, even at the top (my call; the menu was already filled, which settles the earlier unconfirmed note).
- **First shadow in the system:** DESIGN.md said no shadows. Mal asked for one on the scrolled nav, so `shadow.nav` is the single exception, written into the rules. Light `0 1px 2px / 0.04, 0 4px 16px / 0.06`; dark values (higher alpha, shadows read weakly on `#2e2e2e`) are provisional and unchecked.
- **Not done:** `--shadow-nav` lives in `src/app/globals.css` only; it is not in `tokens/`. Search panel height (144px) and the 8px threshold are my defaults.

### Nav becomes a floating toolbar
Mal wanted a simpler, more expansive nav that could grow into a hub, so the five-item bar was replaced by a toolbar (search, wordmark, menu). Decided in artifact comments on the home page canvas, then built in `src/components/nav.tsx`:
- **Structure:** transparent sticky layer, a 104px spacer, and a fill-less island; width, height and flex-grow transitions on `cubic-bezier(0.16, 1, 0.3, 1)`. Details are in DESIGN.md (Nav).
- **No outline, no pill, no fill:** Mal asked for a rectangular island (4px corners) with no stroke and no background. First tries had a `--bg` fill with a hairline, then a pill, then a `--surface` fill; all were removed on request. Size was raised about 25% (600 × 72px).
- **Exception:** the open menu panel has a `--bg` fill, because transparent it was unreadable over the page text. Mal hasn't confirmed this; see Open questions.
- **Departures from earlier rules:** this adds motion (the README said "no motion spec yet") and line icons (the system had none; they are inline SVG, 1.5px stroke). The "nothing else is rounded" rule still holds, since the 4px radius is the image radius.
- **Not done:** `docs/component-checklist.md` still showed the old bar (updated 2026-10-03).

### Home page built
`src/app/page.tsx` follows DESIGN.md's Home: intro with the portrait (`src/components/portrait.tsx`, from `docs/portrait.svg`), lead feature with its own accent, three more features at different sizes, latest writing and work index lists, and a collections strip. All copy, titles and the accent are placeholders.

---

## 2026-10-01

### Light accent darkened to `#626E5E`
The design system's contrast check flagged light `accent` (`#758072`) at 3.96:1 on `bg`, under 4.5:1. Mal chose to re-tint it in the source, not just in the design system.
- **New primitive `color.sage.600` `#626E5E`** (5.14:1 on `bg`, 4.61:1 on `surface`). First try was `#6A7667`, which reached 4.57:1 on `bg` but only 4.10:1 on `surface`, so it was darkened again. Light `accent` now aliases it. `color.sage.500` `#758072` stays and is still the dark `accent`, because a darker sage would read worse on the dark ground (provisional, unchecked).
- **Changed in:** `tokens/primitives.json`, `tokens/modes/light.json`, `src/app/globals.css`, DESIGN.md.
- Accent is still a mark color (nav underline, eyebrow slash, quote rule, status dot). It now passes 4.5:1 on both `bg` and `surface`, but at 5.14:1 it is close to `ink-2` (about 5.4:1), so it reads less distinct from secondary text.

### New ground and ink: `#FAFAFA` and `#2E2E2E`
Mal didn't like the lead headline's placeholder rust (`#B4532A`) and asked for `#FAFAFA` and `#2E2E2E`. They were applied as the house ground and ink, not just to the headline (Mal's choice):
- **Primitives changed, not the semantic tokens:** `color.neutral.50` `#F1F1F1` → `#FAFAFA`, `color.neutral.900` `#343A42` → `#2E2E2E`. Light `bg`, light `ink`, light `code-bg` and dark `bg` all follow, because they alias these primitives.
- **Lead headline** on Home is now bound to `color.ink`. It was the only hard-coded fill, so nothing is hard-coded now.
- **Contrast on the new light bg:** ink 13.0:1 (was 10.2), `ink-2` 5.4:1, `link` 7.1:1, `accent` 4.0:1. On the new dark bg: ink 11.7:1, `ink-2` 5.9:1, `accent` 3.3:1, which clears the 3:1 for marks it failed before.
- **Side effects, not fixed:** the dark `code-bg` (`#2A2F35`) is now 1.01:1 against the dark `bg`. The new values are neutral grays, while the rest of the family is still cool. Both are in Open questions.
- Updated to match: `tokens/primitives.json`, `src/app/globals.css` and the `--bg` fallback in `docs/portrait.svg`.

### Home layout
Laid out on the 1440 desktop grid from existing components: Nav, Feature / Lead, Intro with portrait, Other Features, Latest writing, Latest work, Collections strip (latest bird and rec plus Other Collections Row), Footer. Bound to tokens except the lead headline colour. Decisions:
- **Intro before feature** (changed the same day; first built feature-first). The intro and portrait open the page, right under the nav (120px top), and the lead feature follows 128px lower. Mal's call: it is a personal site, so a visitor should meet the person first. The 180px feature headline still gives the page its type-scale contrast; it just comes second. DESIGN.md Page types → Home is updated to match.
- **Placeholder content.** Titles, dates, the bird and the rec are invented. The open question about picking real features stays open in DESIGN.md.
- **Placeholder feature accent `#B4532A`** on the lead headline, the only hard-coded fill. Replace it with a colour pulled from the real feature. Contrast on `--bg` is not checked yet.
- **Headline wraps** to two lines inside the 1248 content width instead of breaking the grid.
- **Intro layout.** Text in columns 3-8 (612px, `standfirst` style, so under the 680 reading measure), portrait in columns 9-12 (400px). No "building things" tagline.
- **Portrait** (fourth version). Source of truth is `docs/portrait.svg`, an inline-ready SVG. Monoline 1.5px strokes with round caps and joins (brows 2px). Hair, bun, irises and mustache are solid `ink`; thin `bg` lines cut three hair strands, two bun wraps, the hair tie and a catchlight in each eye. The hair was filled because the outlined version read as a cap. A spiral on the bun was dropped because with the tie it looked like a face. The hairline recedes slightly at the temples. In dark mode the solid shapes invert to light, like every other line on the page; tokens can't keep the hair dark without a hard-coded colour. The mustache is Mal's pick (2026-10-01): the "Mustache" icon from SVG Repo, scaled non-uniformly (0.32 × 0.24) so it sits under the nose and lets the centre of the smile show, then rewritten as absolute coordinates. It replaced my hand-drawn curls, which read as thin and fussy. Smiling: warm eyes with lower lids and crow's feet, the centre of a smile below the mustache. Tried and dropped: smile creases (hidden by the mustache), cheek lines (read as tired). For the web it draws in `currentColor` and the mustache sits on a 6px `var(--bg)` knockout stroke, so the face lines it crosses stop cleanly at its edge, and it follows dark mode. The mustache is one self-contained `<g id="mustache">` with a transparent hit area and a CSS transform origin under the nose. The face and smile are drawn complete underneath it, so moving it never exposes a gap; checked by rotating it 10°. Licence of the SVG Repo icon not yet checked.
- **Other Features.** A 7-column and a 4-column feature, the second 128px lower for asymmetry. Each is a placeholder, eyebrow and `h2` title, not a component.

Still to do: cursor exploration (Cursors specimen), mobile frame.

---

## 2026-09-30

### Components in code
Every component in groups 01–06 is now a React server component in `src/components/`, built for Next 16 and Tailwind 4 from DESIGN.md. `/components` previews them in their groups (`noindex`, not linked). Checked at 1440: nav 104px, gutters 96px, all three fonts loading. Departures and choices:
- **States are CSS, not props.** Hover uses `:hover`; focus is one global `:focus-visible` rule (2px `--ink`, 4px offset, 4px radius; pills keep their round shape). The ring offset is 4px everywhere. Only Active is a prop (`NavItem active`, `FilterPill active`).
- **Caption, Figure and Data Table are one component each** in code. Caption shows the EXIF layout when `exif` is passed. Variant sets map to props: `Figure size="hero" | "column"`, `DataTable columns={lifeListColumns | legoColumns}`.
- **Rows are whole links.** Index rows link the entire row; Next Link and Collection Link do the same.
- **Added where the design had nothing:** footer links get `--ink` on hover; the Lego table's cell styles are guessed, because only its header was designed.
- **Semantics:** `<nav>`, `<table>` with a hidden caption, `<dl>` for the spec block, `<figure>`/`<figcaption>`, `<blockquote>`, `<aside>`; Section Label renders an `<h2>` by default; the nav marks the current section with `aria-current="page"`.
- **Font variables renamed** to `--font-newsreader`, `--font-google-sans-flex` and `--font-jetbrains-mono`, because `--font-serif` etc. are Tailwind's own theme names and would reference themselves.
- **Not done:** mobile layout, filter and sort behavior in the toolbar (presentational for now), syntax colors in code blocks.

### Link style confirmed, section label order
- **Links:** confirmed by Mal: `--link` with a 1px underline, `--ink` on hover; arrow links underline only on hover. The focus ring stays keyboard-only (`:focus-visible`); it must never show on mouse hover or click. Moved from Open questions into DESIGN.md Components → Links.
- **Section label order:** label above the rule, as built (Mal's choice after comparing both orders over the same index list). This differs from Next Link and Meta Row, where the rule is on top: there the rule opens a block, here it separates the label from its list. The comparison specimen was deleted.

### Essay Header, Figure and the collection table
- **Essay Header** (section 06): Eyebrow, `h1`, standfirst, then Meta Row across 1248px. The title block is 718px wide (7 columns of 82px with 24px gaps). Gaps: 24px between eyebrow, title and standfirst (`space.stack.md`), 48px from standfirst to meta row (`space.stack.xl`). The standfirst is `--ink-2` (my choice; DESIGN.md gives no color) so the title carries the contrast. No byline; DESIGN.md doesn't have one. Sample text from the frontmatter example in DESIGN.md.
- **Image Placeholder / Size=Column** (section 02): 680 × 453 (3:2), the reading-column width.
- **Figure / Size=Hero and Size=Column** (section 02): placeholder over `Caption / Type=Image`, 16px apart (`space.stack.sm`), caption stretched to the figure width.
- **Specimen / Collection Table** (section 07): Toolbar, then 32px, then the life-list header and six rows of Charlotte-area birds. The 32px toolbar margin is a literal.
- **Decisions from the component agents, for review:**
  - Links: inline links are `--link` with a 1px underline; hover turns text and underline `--ink`; focus adds the nav's ring. Arrow links have no underline until hover.
  - Section Label: label over the 1px `--ink` rule.
  - Aside has no top rule, so it reads as the site talking, not a new section.
  - Spec block: 96px key column, 24px gap, hairlines between rows but none after the last. The Hardware sample values are invented.
  - Inline code: 4px radius (`radius.image`; no small-chip token), 4px × 1px padding.
  - Table rows have no hover or focus state; they aren't interactive.
  - Not bound to tokens: the pull-quote rule height (2px), focus-ring offsets, spec-block key width.

### Components grouped into sections
Components are grouped in six sections: 01 Shell, 02 Text and media, 03 Links and controls, 04 Lists and tables, 05 Editorial content, 06 Patterns. Patterns are multi-component assemblies (Toolbar, Index List, Other Collections Row, Stats). A seventh group, Specimens, holds usage examples (inline link, arrow link, an inline-code sample sentence); they are documentation, not components. Rule: something is a component only if it is meant to be reused.

### First components: Nav Item and Nav / Desktop
Components are built starting with the nav. Order of work: shell (nav, footer with next link), small parts, index list row, essay page, other page types, feature variants, home page last.
- **Desktop only.** Mobile nav is out of scope until desktop is done. No mobile pattern is decided.
- **Focus state is new.** DESIGN.md had no focus style. Chosen: `--ink` text and a 2px `--ink` outer ring with 4px radius (`radius.image`), drawn outside the item so its layout doesn't change. Nothing else shows focus in the site yet, so this sets the pattern for links and buttons. It is there for keyboard users (a visible focus indicator is an accessibility requirement) and shows on `:focus-visible` only, never on mouse clicks. Reviewed on 2026-09-30: the ring was questioned as generic, alternatives (ink underline, hairline box, inverted fill) were offered, and it was kept.
- **Hover is `--ink` only,** no underline, so the underline stays exclusive to the active section.
- **Wordmark uses `type.standfirst`** (Newsreader 24 / 1.45 / 400), the only token matching "Newsreader 24px". Not semantically a standfirst; add a `type.wordmark` token if the wordmark ever diverges.
- **Bar spacing:** 96px gutter (`space.gutter.desktop`), 32px top and bottom (`space.stack.lg`), 40px between items (`space.nav-item`). The 2px underline slot is always reserved (empty when not active) so items don't shift when the active section changes. That slot made the labels sit 4px above the bar's centre line, so the items row has 8px of top padding (6px gap + 2px underline) to centre the labels with the wordmark. The padding is a literal, not a token, and the bar is 104px tall (103 plus the hairline).
- **Not bound to tokens:** the 6px gap between label and underline, the underline height (2px) and the focus ring offsets. There is no token for them yet.

### Image Placeholder, Captions and Filter Pill
Components: `Image Placeholder / Size=Hero`; `Caption / Type=Image`, `Type=Photo` and `Type=Photo, Sparse`; `Filter Pill / State=Default|Hover|Active|Focus`.
- **Placeholder sizes:** hero only (1248 × 640). Pair, triple and full-bleed were offered and left out; add when a page needs them.
- **Caption layout:** index in a fixed 48px column, text beside it 600px wide, so wrapped lines hang. The 600px text width is my choice, not DESIGN.md's.
- **EXIF is flexible.** Not every photo has the same metadata, so the caption shows only the fields present, in a fixed order, right-aligned. `Photo` (4 items) and `Photo, Sparse` (2 items) show the range; in code, render present fields only. The camera model is not a required field.
- **Filter pill:** 44px tall (`size.pill-height`), 24px side padding (`space.stack.md`), 1px `--line` border, `radius.pill`. Hover darkens the border to `--ink-2` (my choice). Focus reuses the nav's ring, 4px outside the pill and following its radius. No counts, disabled state or "All" variant; add them if the collections pages need them.
- **Not bound to tokens:** the focus ring's size and offset, and the caption's 48px and 600px widths. Filter pill width follows its label.

### Eyebrow and Meta Row
Components `Eyebrow` and `Meta Row`. Neither is interactive, so neither has states.
- **Eyebrow** is a row of three text elements (section, `/`, sub-category) rather than one text with a colored character, so each part binds to its own color token (`--ink-2`, `--accent`, `--ink-2`). The 8px gap is a literal, not a token.
- **Meta Row** is the 1px `--ink` rule over mono `meta` items 32px apart (`space.meta-item`). DESIGN.md gave no width or rule-to-items gap, so: the rule spans the 1248px content width and the gap is 16px (`space.stack.sm` would match, not bound). Sample items: date, reading time, tag.
- **Accent contrast:** the `/` is small text in `--accent` (about 3.7:1 on `--bg`). DESIGN.md allows accent for eyebrow separators because it is decoration, not information. In dark mode the accent is still provisional and lower (2.78:1); see the dark-mode contrast entry.

### Next Link and Footer
Components `Next Link / State=Default|Hover` and `Footer / Desktop`, bound to tokens.
- **Next Link** follows DESIGN.md (label over `index-title`). Added a 1px `--ink` rule on top, since DESIGN.md says that rule marks the start of something, and a hover state where the title turns `--link`. The default title text is a placeholder and the width is fixed at 1248px.
- **Footer content was not specified**, so this is a proposal: copyright on the left, the same five section links on the right, `small` in `--ink-2`, nothing else. Change it if you want more (contact, colophon, RSS).
- **Colophon line added:** "© 2026 Mal Nushi · Made with ♥ in Charlotte", left-aligned. The heart is the text glyph ♥ in `--ink-2`, chosen over a drawn sage heart or plain words. DESIGN.md bans emoji, and a text glyph is not one, but Google Sans Flex appears to lack it: it is drawn from a fallback font, and looks slightly heavier than the text. In code, force text presentation with `font-variant-emoji: text` (or wrap it in a span with a font that has the glyph) so no platform swaps in a colored emoji.
- **Footer links have no hover or focus state yet.** Add states when links are built as real components, with the same focus ring as the nav.
- Footer spacing: 48px above and below (`space.stack.xl`), 24px between links (`space.stack.md`).

### 12-column grid
The grid is 12 columns, margin 96, gutter 24 (82px columns across the 1248px content width). Three reference layouts come from DESIGN.md's grid text: a title across columns 1–7 with a spec block in 9–12; a 680px reading column offset two columns with a 294px margin column in 10–12; and a full-bleed bar that ignores the 96px gutter. DESIGN.md's grid spec is unchanged.

### Page structure under redesign
The page structure is being redesigned, so the Layout, Components and Page types sections of DESIGN.md may no longer match the new pages. Whether the grid fits them is not yet confirmed. Revisit when the new page structure is defined.

### Dark-mode contrast postponed
The dark `surface` (`#3D444C`) fails AA for `ink-2` text on it (4.28:1, needs 4.5), and the dark `accent` (`#758072`) is 2.78:1 on `bg`, below the 3:1 wanted for decorative marks. Both are provisional, and the "Open questions" item on them stays open. Candidate fixes: surface `#394048` (4.55:1), accent `#8A9787` (3.75:1).

## 2026-09-29

### Tokens in W3C DTCG JSON
The tokens live in `tokens/` (`primitives`, `semantic`, `modes/light`, `modes/dark`) in the W3C Design Tokens Community Group format (2025.10): colors as `{colorSpace, components, hex}`, dimensions as `{value, unit: "px"}`, aliases as `{path.to.token}`. Checked: 111 tokens per mode, every alias resolves in both modes, and every hex matches its components.
- The DTCG typography type has no case or decoration property, so `type.label`'s `uppercase` lives in `$extensions`.
- The light and dark files reuse the same token paths, so a build has to load one mode at a time on top of `primitives` and `semantic`.
- Nothing generates CSS from these files yet; `globals.css` is updated by hand. A build step (for example Style Dictionary) is not set up.

### Spec simplified: one sans weight, upright standfirst, no mobile scale
Applied on 2026-09-29:
- Google Sans Flex is regular (400) everywhere. `type.display-sans` and `type.label` changed from 500 and 600 to 400, and the unused `font.weight.semibold` token was removed. The width axis is dropped from the spec.
- The standfirst is upright Newsreader, not italic.
- The mobile type scale and the 16px inline code size were removed. Add mobile when mobile design starts.

### Type scale and nav weights settled in DESIGN.md
DESIGN.md was edited:
- Type scale: one size per style (the 140–220, 96–180, 23–26, 26–28 and 12–13 ranges are gone), tracking in px instead of em, `ui` weight 400.
- Nav and filter pills now use `ui` and `small` (400) instead of 500. Emphasis comes from color and the underline.
- Dark mode lists surface, accent and code colors as provisional; palette primitives, off-scale spacing and the semantic layout tokens are documented.

### Dark surface and code colours are provisional
DESIGN.md defines only bg, ink, ink-2, link and line for dark. Added `neutral.800` (`#3D444C`) for surface and `neutral.950` (`#2A2F35`) for code-bg so the dark set is complete and code blocks stay distinct from the page. Change them in primitives once dark contrast is checked.

### Tracking stored in px
`font.tracking.*` values are px, calculated as size × em (for example h1: 88 × -0.025 = -2.2). Percent values resolved as fractions (-0.03) and would have applied as -0.03px. If the size of a style changes, recalculate its tracking token.

### Off-grid spacing kept
`spacing.18`, `.22` and `.120` (table row, index row, header top) and `.40` (nav items) are not 4px multiples in every case, but DESIGN.md specifies them. Kept as written.

### Colour set split
Colour tokens live in `modes/light` and `modes/dark` with identical names. Everything else lives in `semantic`. Light is the default.

### Spelling
Use "color" (US) in names and labels to match the tokens and DESIGN.md.

### Search field centered and enlarged
Applied on 2026-10-03:
- The search input in the expanded nav is centered, 40px Newsreader, one line (72px tall) with `--space-lg` side padding. Long queries do not wrap; the text scrolls sideways inside the field and the caret stays in view, so nothing leaves the plate.
- The browser's clear button is hidden so it cannot push the centered text off center.

### Search icon morphs into close
Applied on 2026-10-03:
- The search toggle's magnifier morphs into the X instead of swapping: the lens unrolls into one diagonal stroke and the handle slides across to form the other. Stroke width, round caps and color are unchanged throughout.
- 250ms, `cubic-bezier(0.4, 0, 0.2, 1)`, reversible mid-flight. `prefers-reduced-motion` switches instantly. The menu toggle still swaps its icon.
- Done as matching-node cubic paths with `d` written from a motion value, so no layout and no new dependency (ADR 0001 applies).
- The menu toggle morphs the same way (2026-10-03): the two bars rotate and cross into the X over the same 250ms curve, sharing one driver with the search icon.

### Writing: posts and notes
Decided with Mal on 2026-10-03. Docs only; nothing is built yet.
- **Two kinds of writing.** A post is a Kodikion post at `/writing/[slug]`; a note is a short untitled post at `/writing/notes/[id]`. Notes are not part of Kodikion. They sit inside Writing so the nav stays at five items.
- **One kind of post.** Articles and newsletter issues share one template and one URL pattern. A `type` field (`article`, `the-kernel`, `dev-journal`) tells them apart. An earlier draft made "issue" its own kind and drew a hard line between series and category; Mal found that too complicated.
- **Newsletters get their own sections.** On `/writing`, The Kernel and Dev Journal each have a section and a page (`/writing/the-kernel`, `/writing/dev-journal`). Issues stay out of the article list, need no category and are never promoted to a feature.
- **Series is separate from category.** A multi-part run is a series name and part number on any post, so the parts of one series can sit in different categories. It has no page of its own.
- **Eyebrows for writing** read `WRITING / <category or newsletter>`, which matches the `Eyebrow` already on the home page. The spec's old example was `ESSAY / BIRDING`.
- **The frontmatter key is `subtitle`,** not `standfirst`. It is the word Mal uses, and Substack's. The type style is still called `standfirst`.
- **No "subtype" field.** `type` and `category` cover it; a third level would mostly be empty. Add it if a real post needs it.
- **The site is canonical** for every post, including the ones first published on Substack. Substack cannot defer, so the copies will compete in search. Mal chose the simple rule over pointing the old posts at Substack.
- Where the content is stored and how notes are posted is engineering: see `docs/adr/0006-writing-content-in-a-private-repo.md`.
- **What would change it:** a third newsletter is one more `type` value and page. If notes outgrow Writing, they become a sixth section and the menu plate grows by a row.

### Writing: follow-up decisions
Decided with Mal on 2026-10-03.
- **Home shows notes and newsletter issues.** Mal wants both on the home page for now and does not mind how; the layout is left for a later pass, so the page is unchanged.
- **RSS: yes.** Two feeds, one for posts and one for notes, both full text. The split is my choice: someone subscribing to essays should not get every short note. Merge them if that proves wrong.
- **No Substack import tool.** Existing posts are brought over by hand.
- **Only writing moves to the private repository.** Work, photography and collections content stays here.
- **Note stream mockups** are at `/components/notes`: A, the reading column with the date under each note; B, a ledger with the mono date in the left columns; C, grouped by day with the note set in `quote`. All three use existing tokens and type styles. None is chosen yet.

### Note stream: reading column, 12-hour time with zone
Decided with Mal on 2026-10-03, from the three mockups.
- **Layout A, the reading column.** It is the one Mal had in mind. The ledger and the by-day layouts were dropped and removed from the mockup page.
- **Date line** reads `2026-10-03 · 2:12 PM EDT`: Mal asked for a 12-hour clock and a named time zone. The date stays in the ISO form used by the rest of the site's mono metadata.
- **The zone is the author's, not the reader's** (my choice). It keeps the page static and the same for everyone. Notes store a UTC offset so this can change later without editing them.

### Move Writing and Notes pages from /components to canonical app routes
Decided with Mal on 2026-10-04.
- **Canonical routing:** The Writing index is moved to `/writing` (`src/app/writing/page.tsx`) and the note stream to `/writing/notes` (`src/app/writing/notes/page.tsx`), moving them out of the `/components` folder where they were initially prototyped as mockups.
- `/components` (`src/app/components/page.tsx`) remains the dedicated design system component preview gallery (`noindex`, unlinked).
- **Sitemap:** Added `/writing` and `/writing/notes` to `src/app/sitemap.ts`.


### Navigation matches the five pages
Decided with Mal on 2026-10-04.
- **Menu items** are now Home, Writing, Projects, Collections, About. Work and Photography are gone: photography lives under Projects, as the page descriptions in DESIGN.md already say.
- **Home is in the menu** (as well as the wordmark), at the request of Mal's page list. Still five rows, so the 416px plate is unchanged.
- **Order** is my choice, since Mal gave none: Home first, About last, as before.


### Project route is /projects, not /work
Decided with Mal on 2026-10-04.
- **`/work/[slug]` becomes `/projects/[slug]`.** The section is called Projects in the nav and the page descriptions, so the URL, the eyebrow (`PROJECTS / CODE`) and the "More projects" list now use the same word. The home page links and the placeholder categories were updated to match.
- **Photography routes are unchanged** (`/photography/[slug]`, eyebrow `PHOTOGRAPHY / SERIES 04`). Photography series are listed on the Projects index; whether their URLs should also move under `/projects/` is not decided.
