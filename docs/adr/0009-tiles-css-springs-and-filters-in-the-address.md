# 0009. Tiles: springs that CSS runs, filters kept in the address

- **Status:** accepted
- **Date:** 2026-10-06

## Context

The projects index (`/projects`) is a gallery of tiles. Hovering a tile brings a sage plate over it on the nav's springs, and a row of filters narrows the gallery. Three things had to be settled, and each will come up again on the next gallery or filtered list:

- The nav's springs are run by `motion` from script (ADR 0001). A hover on each of dozens of tiles should not need a script, a client component or a listener per tile.
- The filtered view has to be linkable, and the page has to stay prerendered.
- Mal asked that tiles be reusable, and the content model (ADR 0008) keeps views unaware of where their data comes from.

## Decision

1. **A spring that only answers hover or focus is a CSS easing.** `springEasing` in `src/lib/motion.ts` samples a spring's step response into a CSS `linear()` curve. `cssSprings` names the two in use (the nav's opening and closing springs) with the time each needs to settle, and `globals.css` holds the results as `--ease-spring-open` and `--ease-spring-close`. A test fails if the CSS and the springs drift. `motion` stays for anything interruptible, sequenced or driven by a value (the nav, the masthead): a CSS transition restarts from where it is but does not keep its velocity.
2. **A tile is three layers,** each one job:
   - `Tile`, `TileGrid`, `TileGridItem` (`src/components/tile.tsx`) are presentational server components. A tile takes a link, text and a cover as children. It imports nothing from the content layer.
   - `toTile`, `tileLabel`, `coverOf`, `disciplineOf` (`src/components/entry/mappers.tsx`) turn an entry into a tile's props, as `toIndexItem` does for an index row. `TileCover` draws an entry's photograph, or a placeholder, as a cover.
   - `src/lib/filter.ts` is the filtering, as pure functions over anything that carries labels: which filters to offer, what matches, which filters are still worth showing, and the selection to and from a URL.
3. **The filter's state is the URL.** `UrlTileGallery` reads `?t=code,design` with `useSearchParams` and writes it with `history.replaceState`, which Next's router follows. There is no state to keep in step with the address, a filtered view is a link, and a reload keeps it. `TileGallery` is the same view with the selection passed in, for a caller that keeps it elsewhere.
4. **The page stays static.** Reading the address in a client component needs a `Suspense` boundary on a prerendered page. Its fallback is the plain `TileGallery` with nothing selected, so the prerendered HTML is the whole gallery: it works without JavaScript, and a filtered link shows everything for a moment and then narrows.
5. **Covers are server-rendered and handed to the client gallery as elements.** The gallery is a client component because it filters; a cover is an async server component (`next/image` with the photograph's own dimensions). Each item carries its cover as a rendered node, so filtering reorders nodes and fetches nothing.
6. **A plate's resting state is an inline style.** If a script makes the browser work out styles before the stylesheet has arrived, a plate hidden by a class is first seen as shown and then runs its closing transition: a flash over every tile on a slow load, and a contrast failure if axe scans in that window (which is how it was found). `opacity: 0` and `visibility: hidden` are written on the element; the shown state is `!important` to override them.
7. **The plate is decoration.** It and the cover are `aria-hidden`; the link carries the same words in a visually hidden heading and line. The words on the plate are `visibility: hidden` at rest, so nothing invisible is left for a contrast checker or a text search to find.

## Alternatives considered

- **`motion` on every tile.** The same curve, at the cost of a client component and listeners per tile, and no plate without JavaScript.
- **A hand-tuned `cubic-bezier` with overshoot.** One line, but it is a different curve from the nav's and would drift from it unnoticed.
- **Filter state in `useState`, mirrored to the URL.** Two sources of truth, and a link would need an effect to restore it.
- **Reading `searchParams` in the page.** No Suspense, and the first paint is already filtered, but the route becomes dynamic: rendered per request, for a page whose content changes only on deploy.
- **A page per filter (`/projects/code`).** Static and linkable, but combinations multiply and it collides with `/projects/[slug]`.
- **A `disciplines` field on entries.** A second vocabulary beside `category` and `tags`, which ADR 0008 rules out.

## Consequences

- No dependency added. `/projects` ships the gallery's filtering as its only page script.
- A new spring for CSS is an entry in `cssSprings` and a line in `globals.css`; the test names the line to write.
- Another gallery (photographs, releases) is a mapper and a page: the tile, grid, filters and URL handling are reused.
- A filtered link paints unfiltered first. If that flash matters, the page can read `searchParams` and give up being static.
- The inline rest state and `!important` are unusual here. Any component whose hidden state is revealed on hover with a transition has the same load-time risk and should do the same.
- The filter row and the tile's plate need a pointer or a keyboard. Touch is an open design question (DESIGN.md).

## Deferred

- Covers that move: where motion lives in the content model.
- Whether an entry may choose its tile's size.
