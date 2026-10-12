# 0012. One base map for every map on the site

- **Status:** accepted
- **Date:** 2026-10-11
- **Supersedes:** the map-structure parts of ADR 0010 (decisions 7 to 11). Its data decisions stand.

## Context

ADR 0010 built the flights map as one component that owned everything: the MapLibre instance, the page's colors, the Flat, Tilted and Globe views, the frame, the animation loop and the deck.gl layers. The life list wants a map too, with filled countries and states, hover and a heat color. Mal does not want two maps to maintain: "maintaining one means also having to maintain the others".

## Decision

1. **`BaseMap` (`src/components/map/base-map.tsx`) owns everything a map is,** except what it draws. That is: the MapLibre instance, the worker, the site's own land and borders, the colors of the day (read from the CSS tokens and read again when the scheme changes), the views, the frame (a change of `bounds` flies the camera), the tip, the loop that moves things, and the message with no WebGL 2.
2. **A page supplies layers.** `layers(context)` returns deck.gl layers, made from a `MapContext`: `color(token)`, the view, the time, whether things are moving, and `tip()`. It is called when `layers` changes and, for an `animated` map, on every frame.
3. **All data is drawn with deck.gl,** polygons included (`GeoJsonLayer`). MapLibre is the ground and the camera only. Picking, highlight and the hover tip therefore work the same for flights and for regions, and a fix to one is a fix to both.
4. **Shared, pure helpers live beside it.** `heat.ts` makes the heat ramp from the page's own colors and is unit-tested. A page does not invent its own scale.
5. **`FlightMap` is a set of layers, effects and data buffers on `BaseMap`.** Its shaders, its trail extension and its glow pass are unchanged.

## What the move found

- **`maxZoom: undefined` is not "no limit".** MapLibre merges options, so an explicit `undefined` replaces its default and the camera is placed at NaN. Optional camera options are left out, not passed empty.
- **`effects: undefined` crashes deck.gl.** A map with no effects passes `[]`.
- **A projection cannot be set before the style loads,** and React's development double-run reaches that. The projection is set only when a reader picks a view.

## Consequences

- A new map page is a component of about a hundred lines: its data, its layers and its pills.
- `e2e/travels.spec.ts` is the guard for the base map: it mounts it, switches all three views and fails on any console error, in light and dark.
- `BaseMap` has more props than the flights map needed. If a third map wants something it lacks, the prop goes here, not in a copy.

## Alternatives considered

- **MapLibre fill layers with feature-state for the regions.** Simpler for one page, but a second way to pick, highlight and tip, which is what this record is trying not to have.
- **A fork of `FlightMap` for regions.** The cheapest way to start and the most expensive to keep.
