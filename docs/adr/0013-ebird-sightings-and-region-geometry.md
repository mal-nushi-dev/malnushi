# 0013. eBird sightings read in the build, and region geometry from Natural Earth

- **Status:** accepted
- **Date:** 2026-10-11

## Context

The life list is to be fed by eBird's "Download My Data" export, which Mal re-exports from time to time, and drawn on a map of the world whose countries, states and provinces are colored by species seen. The export holds more than a site should say: exact coordinates for home and for other people's places, a named person, the time of day, free-text comments.

ADR 0010 handled the same worry for flights with a script run by hand, because the repository was public and the export could not be committed. Mal is making the repository private, and asked for the export to sit in a folder and be read at build time, with what is shown decided in code.

## Decision

1. **The export is a file in the repository,** `content/ebird/MyEBirdData.csv`, replaced whole on each re-export. It is never edited.
2. **Reading it is an allowlist in code** (`src/lib/ebird/read.ts`). A schema names the columns used; a sighting is built field by field, so a column not named cannot reach a page. A test asserts the exact keys emitted and that planted private values do not appear.
3. **How a place is shown is a policy in code** (`src/lib/ebird/policy.ts`), by eBird Location ID. By default a place is its county on the page and a 0.1° cell (about 11 km) on the map. An entry can give a public label, show the exact point, or draw no point. The time of day is read to order a day and never emitted.
4. **Species, not observations, is what a region is colored by.** A species counts once in each region it was seen in, so the regions add up to more than the list.
5. **Region geometry is Natural Earth, 1:10m, simplified by `scripts/geo.mjs`.** Admin-0 (countries, territories, dependencies) is one file, `public/geo/countries.json`. Admin-1 (states, provinces) is a file for each country in `public/geo/regions/`, which the map fetches only when a country is opened. A country is keyed by `ISO_A2_EH` and a region by its ISO 3166-2 code, which is what eBird's State/Province column holds.
6. **The shapefile is read by hand,** as `flights.mjs` reads its CSV. No dependency.
7. **Major regions are drafted in code from Natural Earth's continent and subregion** (`src/lib/ebird/regions.ts`, with `continent` and `subregion` carried in `countries.json`), plus a few written by country or state code (Lower 48, Borneo, Hispaniola, mainland Portugal). A region with no membership yet is listed in the file with no `has`, counts nothing and is not shown. The table has not been checked against eBird.
8. **A sighting from the export is a `sighting` entry,** read by the loader from `ebird/MyEBirdData.csv` beside the ones written by hand, one species keeping one name across both. Its URL is an anchor on the table under the life list. It has no family until the taxonomy is read.
9. **Heat is 0 gray and a straight line from a clear first tint to the deepest color,** scaled to the most in the current view (the world's, or the opened country's). See `src/components/map/heat.ts` and the design log.

## Consequences

- `public/geo` grows by 8.5 MB, of which a visitor fetches about 1.3 MB for the world and one country's file (up to 600 kB) on opening it.
- Natural Earth gives six small areas a parent's country code (Christmas Island, Cocos, Coral Sea, Ashmore and Cartier, Baikonur, Clipperton, the Brazilian islands); the script skips them with a warning. eBird has its own codes for some, so an override table is needed if they are ever seen.
- Twelve admin-1 areas with no ISO code (Somaliland, Northern Cyprus, Kashmir and others) are left out.
- Neighbours are simplified apart, so a hairline gap can open between two. None was seen at world or state scale.
- If the repository is ever public again, the export is in its history for good.

## Deferred

- The two placeholder sightings written by hand remain until the photographs that point at them are repointed.

- Taxonomy: family, and leaving out subspecies, slashes, spuhs and hybrids, need eBird's taxonomy file.
- Regions that are not countries or states (the eBird region list: ABA Area, Lower 48, Island of Borneo and so on) need a hand-written membership table.
- Counties, which the export carries, would need a US county file and are not drawn.
