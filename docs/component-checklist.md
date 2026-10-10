# Component checklist

Status of the components in `src/components/`, previewed at `/components`. Design decisions for each live in [design-log.md](design-log.md); the spec lives in [DESIGN.md](DESIGN.md). Desktop only for now.

Legend: `[x]` built · `[ ]` not started · `[~]` in progress

Components are grouped in sections 01–07. States (hover, focus) are CSS; variants are props.

## 01 Shell

- [x] Nav (floating toolbar: search, wordmark, menu; expands on springs)
- [x] Next Link
- [x] Footer
- [x] Status Page (404 and error pages; `src/components/status-page.tsx`)

## 02 Text and media

- [x] Eyebrow
- [x] Meta Row
- [x] Section Label
- [x] Caption (image, photo with EXIF)
- [x] Image Placeholder (hero 1248 × 640, column 680 × 453)
- [x] Figure (`size`: hero, column)
- [x] Portrait
- [x] Photo (`next/image` at the hero and column sizes; replaces ImagePlaceholder when real images exist)

## 03 Links and controls

- [x] Inline Link
- [x] Arrow Link
- [x] Filter Pill (`active`; `size`: md 44px, sm 32px)
- [x] Collection Link
- [x] Tabs (arrow keys move between them; panels are rendered on the server)

## 04 Lists and tables

- [x] Index List (rows are whole links)
- [x] Data Table (`columns`: life list, Lego inventory)
- [x] Tile and Tile Grid (`size`: square, wide, tall, large; sage plate on hover and focus)
- [x] Bar List (a ranking: name, bar, number)

## 05 Editorial content

- [x] Pull Quote
- [x] Aside
- [x] Spec Block (code, hardware)
- [x] Stat (and `StatPart`, the parts a stat's number is made of)
- [x] Stat Card (a stat on a `surface` plate, 3:2, with a decorative `backdrop`)
- [x] Code Block
- [x] Inline Code

## 06 Patterns

- [x] Toolbar (filter pills and sort label; presentational)
- [x] Other Collections Row
- [x] Essay Header
- [x] Tile Gallery (filter pills over a tile grid; `UrlTileGallery` keeps the selection in the address). Not on the preview page: see `/projects`.
- [x] Flight Log (year pills over the flight table; `UrlFlightLog` keeps the year in the address). Not on the preview page: see `/collections/travels/log`.
- [x] Flight Map (deck.gl over MapLibre; flat, tilted, globe). Not on the preview page: see `/collections/travels`.
- [x] Flight Scenes (four stat cards with three.js scenes behind them, on one shared context; scenes are drawn from `scene-kit.ts` and `earth.ts` and found by `data-scene`). Not on the preview page: see `/collections/travels`.

## 07 Charts

- [x] Pie Chart (slices in the `chart` colors, in a fixed order; a table beside it)
- [x] Line Chart (one series; `width`, `every`)

## Where things are

Components are in `src/components/`. Tokens are in `tokens/*.json`, mirrored by `src/app/globals.css`; fonts are in `src/app/fonts.ts`.

## Next

Essay page (house version), assembled at 1440 from these components; add components only where the page shows a gap. Then project, collection and photography pages, and feature variants. The projects index (`/projects`) and the travels collection (`/collections/travels`) are built.

## Open

- The Lego table's cell styles are guessed; only its header was designed.
- Toolbar search, filter and sort are not wired to anything.
- Mobile is out of scope until desktop is done.
