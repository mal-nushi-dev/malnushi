# 0011. three.js for the travel scenes, on one shared context

- **Status:** accepted
- **Date:** 2026-10-10

## Context

The travels page says four things about the flights as a whole: how many, how far, how many times round the Earth (drawn as one loop, not counted out), and how far toward the Moon and the Sun. Mal asked for these as small 3D scenes (a plane over the Earth, laps wound round it, the Moon and the Sun as lit spheres), not as numbers alone, and that they run well on any current device.

The page already holds two WebGL contexts for the map (MapLibre and deck.gl, ADR 0010). Four scenes drawn the obvious way would add four more.

## Decision

- **three.js**, which Mal named first. OGL is a fraction of its size, but has no extruded shapes, wide lines or dashed lines, and each would have been shader code to write and keep.
- **One context for all four scenes.** `src/components/flight-scenes/scenes.ts` makes one `WebGLRenderer` whose canvas is never on the page. Each frame it renders a scene and copies the picture to that card's own 2D canvas with `drawImage`. The page gains one GPU context, the cards clip to their own corners, and the text sits over the picture as ordinary markup.
- **It loads late and draws little.** three.js is imported when the cards come within 800px of the screen, so it is in no page's first load. The loop runs only while the cards are on screen and the tab is visible. It draws at the screen's rate for the eight seconds the scenes take to draw themselves in, then at about 30 a second. The pixel ratio is capped at 2.
- **The numbers do not depend on it.** They are server-rendered text in each card. With no WebGL the cards are the numbers alone; with reduced motion each scene is drawn once, as it ends up.
- **No assets.** The plane is a capsule and three flat shapes built in code. The Earth's land is the map's own `public/geo/land.json`, painted to a canvas and wrapped round a sphere (all in `earth.ts`, so every scene's Earth is the same one). Colors are read from the CSS tokens and re-read when the color scheme changes.

## Consequences

- A third 3D dependency on one page, about 150 kB compressed, fetched only by readers who scroll to the cards.
- Lines are three.js's `Line2` (from `three/examples/jsm/lines`), because WebGL's own lines are one device pixel wide and all but vanish on a dense screen.
- The bodies are not to scale with the distances between them. What each scene keeps true is where the marker sits along its line and the Moon's size beside the Earth's. The loop round the Earth is a field-line shape, not the 6.5 laps.
