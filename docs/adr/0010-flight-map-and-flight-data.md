# 0010. Flights: a diary export as content, and a map drawn on the GPU

- **Status:** accepted
- **Date:** 2026-10-07

## Context

The travels collection (`/collections/travels`) shows every flight Mal has taken: a map of airports and routes, counts, and charts. Four things had to be settled.

- The flights are kept in my.flightradar24.com, which exports a CSV. The content model (ADR 0008) reads files with frontmatter, images and YAML; it had no reader for a table of rows, and nothing that needed a lookup the content does not carry (where an airport is).
- The repository is public. The export holds flight numbers, registrations, seat numbers, notes, clock times and flights that are booked but not yet flown.
- Mal asked for a map that is drawn on the GPU with instanced layers, takes typed arrays, allows custom shaders, has lighting and post-processing, animates the routes, and moves between a flat map, a tilted one and a globe.
- The site had no charts. Mal asked for pies, ranked bars and lines.

## Decision

1. **A flight is a kind (`flight`), loaded by the loader's own code,** as photographs and collection rows are. `content/flights/flights.csv` has one row a flight in the export's own column names and codes; the loader reads each into an entry with both airports, the great-circle distance and the minutes in the air, and reports a bad row by its line. Flights are the rows of `content/collections/travels.yml` (`from: flight`), so anything that reads the index (search, later) finds them without knowing about a CSV.
2. **The export is never committed. `npm run flights` makes what is.** `scripts/flights.mjs` takes the export and OurAirports' `airports.csv` (public domain) and writes `flights.csv`, with only the nine columns the site draws from and no flight dated after the day it is run, and `airports.json`, with the position, country and continent of each airport used, by ICAO code. It is run by hand when flights are added, like the masthead's glyphs (ADR 0007). The loader fails the build, naming the script, if a flight names an airport the file lacks.
3. **CSV is parsed by a small function of our own** (`src/lib/content/csv.ts`, RFC 4180). The script carries a copy, since a `.mjs` run by hand cannot import TypeScript.
4. **Everything said about the flights is worked out in one place, at build time.** `flightStats` in `src/lib/flights/stats.ts` returns plain data: counts, ratios, time, emissions, shares, rankings, series and the map's airports and routes. The page is static; nothing is computed in the browser.
5. **Emissions use the UK government's conversion factors** (DESNZ 2026, "International, to/from non-UK", without radiative forcing), by cabin, in `src/lib/flights/emissions.ts` with their source. The factors are CO2e per gas; methane and nitrous oxide are turned back into kilograms of the gas with the AR5 warming potentials the factors are written in.
6. **Charts are drawn on the server, with no chart library.** `PieChart`, `BarList` and `LineChart` (`src/components/charts/`) are server components that write SVG and HTML. Each chart's numbers are also in a table or a list, so none is read by color alone. `Tabs` (`src/components/tabs.tsx`) is the one client piece: it shows one of several panels that were rendered on the server and handed to it as elements, as a tile's cover is (ADR 0009).
7. **The map is deck.gl over MapLibre.** MapLibre GL 6 draws the base map and owns the camera and the projection, which is what gives one camera for flat, tilted and globe. deck.gl 9 draws the flights through `MapboxOverlay` on a canvas of its own (`interleaved: false`) and follows that camera. It is not interleaved because deck.gl's effects (lighting, post-processing) need their own framebuffers.
8. **The base map is ours.** One file, `public/geo/land.json` (Natural Earth 1:110m land and borders, public domain, 165 kB), drawn by a style written in code from the page's CSS variables and rewritten when the color scheme changes. No tiles, glyphs or sprites, so no request leaves the site.
9. **Data reaches the GPU as typed arrays, made once.** `buffers` builds `Float32Array`s for positions, widths and phases and wraps each in a `data` object that is never rebuilt, so deck.gl uploads them once however often the layers are redrawn.
10. **The moving parts are GLSL of our own.** `FlightTrailExtension` injects a travelling pulse into the arc layer's shaders through deck.gl's hooks, driven by a time uniform and a phase for each arc. `glowPass` is a post-processing pass for `PostProcessEffect`. A `LightingEffect` lights the airport columns in the tilted view.
11. **The map loads only where it is shown.** `src/components/flight-map/index.tsx` is a client component that loads the map with `next/dynamic` and `ssr: false` (not allowed in a server component in this Next), into a box of the map's size. MapLibre's worker is referenced with `new URL(…, import.meta.url)` so the bundler ships it as a file, and MapLibre is told where it is with `setWorkerUrl`: left alone, it looks beside its own file, which is now a chunk.

## What the first build found

- **On the globe, deck.gl culls arcs.** An arc is a ribbon with no back, and in the globe view it is taken to face away. `parameters: { cullMode: "none" }` on the arc layer draws them. The scatterplot has the same setting.
- **On the globe, `ColumnLayer` lies on its side.** The tilted view has columns; the globe has dots, as the flat map does.
- **Nothing casts a shadow.** deck.gl's shadows fall on deck.gl layers only, and the ground is MapLibre's. Shadows would need the land drawn as a deck.gl layer as well.
- **MapLibre 5 bundles its worker and needs no setup,** but every version to 6.4.0 has a critical advisory against its HTML sanitizer. The map has no popups or attribution to reach it through; 6.13 is used all the same.

## Alternatives considered

- **Commit the export and filter at build time.** Simpler, and the private columns would be public for good in the history.
- **A CSV dependency** (`papaparse`, `csv-parse`). The file is small and regular; the parser is forty lines with tests.
- **An airport dataset as a dependency.** Tens of megabytes for thirty-odd rows.
- **deck.gl alone, with the land as a deck.gl layer.** One fewer dependency and it would give shadows a ground, but deck.gl's own globe is experimental and moving between its map and globe views is a cut, not one camera.
- **Raw WebGL2 or luma.gl.** Projection, camera, picking and great circles written by hand, to arrive where deck.gl starts.
- **Apache Arrow or duckdb-wasm for the data.** Megabytes of script to hand over a few hundred rows. The layers already take typed arrays, so Arrow columns can be passed in later with no change to them.
- **WebGPU.** deck.gl's WebGPU backend does not cover these layers yet, and MapLibre is WebGL2.
- **A chart library** (Recharts, visx). Client script and a look to undo, for charts that never change after the build.
- **A third-party tile service.** Requests to someone else on every view, a style that is theirs, and a key to keep.

## Consequences

- Four dependencies: `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/mapbox` and `maplibre-gl`. They are in the travels page's chunks only; the home page's budget (ADR 0005) is unchanged.
- The scale asked for (millions of points) is what the pipeline is built for and is not tested: the diary has 123 flights.
- Adding flights is: export the diary, `npm run flights -- <export> <airports.csv>`, commit the two files.
- A new chart is a server component beside the three; a new categorical color is a seventh `chart` token and a pass through the palette check (see the design log).
- Another kind that arrives as rows (a reading log, say) can use `parseTable` and the same shape: a script that strips an export, a file the loader checks.
- `e2e/travels.spec.ts` mounts the map and switches views in a headless browser. A shader that fails to compile logs an error, which the shared fixture turns into a failure.

## Deferred

- Shadows, if the land moves into deck.gl.
- Hovering an airport or a route for its name and count. deck.gl's picking is on; nothing is shown yet.
- Feeding the map from Arrow, if the data ever grows past what a page should carry as props.
