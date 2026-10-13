"use client";

import { type Color, type Effect, type Layer } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { Map as MapLibre, setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FilterPill } from "@/components/filter-pill";
import { reducedMotion } from "@/lib/motion";

/*
 * The map the site's pages share: MapLibre draws the ground and owns the
 * camera, flat or tilted, and deck.gl draws a page's data on a
 * canvas of its own above it. A page supplies layers; this supplies
 * everything else: the colors of the day, the views, the hover tip, the
 * frame, the loop that moves things, and what happens without WebGL 2.
 * See docs/adr/0010-flight-map-and-flight-data.md and
 * docs/adr/0012-one-base-map.md.
 */

/*
 * MapLibre looks for its worker beside its own file, which a bundler has
 * moved into a chunk. This has the bundler ship the worker as a file of its
 * own and tells MapLibre where that is.
 */
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

/** West, south, east, north. */
export type BBox = [number, number, number, number];

export const views = {
  flat: { label: "Flat", pitch: 0, padding: 56, lower: 0 },
  // Tilted, what is far away rises up the screen: the frame is set lower to keep it in.
  tilted: { label: "Tilted", pitch: 50, padding: 32, lower: 0.2 },
} as const;
export type MapView = keyof typeof views;

/** A tip beside the pointer: where, in pixels from the map's corner, and what it says. */
export type Tip = { x: number; y: number; text: string };

/** The page's colors as they are now, light or dark. */
export type MapColors = { bg: string; surface: string; line: string; dark: boolean };

/** What a page's layers are made from, on every draw. */
export type MapContext = {
  colors: MapColors;
  /** A CSS custom property of the page as deck.gl's 0 to 255 color. */
  color: (token: string, alpha?: number) => Color;
  view: MapView;
  /** Seconds since the map was shown: 0 unless the map is `animated`. */
  time: number;
  /** True while things move: animated, and the reader has not asked for less. */
  moving: boolean;
  /** Shows a tip at the pointer, or none for null. */
  tip: (tip: Tip | null) => void;
};

export type BaseMapProps = {
  /** For assistive technology: what the map shows. */
  label: string;
  /** What to frame. Changing it flies the camera there. */
  bounds: BBox;
  /** Room round the bounds on the flat map, in pixels. */
  padding?: number;
  /** The nearest the frame may come, for a small place. */
  maxFitZoom?: number;
  views?: MapView[];
  /** Draw the land under the data. Off where the data is the land. */
  land?: boolean;
  /** Redraw every frame, with `time` running. */
  animated?: boolean;
  /** Made once, when the map is shown. */
  effects?: (info: { still: boolean }) => Effect[];
  /** The data layers. Draws again when this changes, and on every frame if `animated`. */
  layers: (context: MapContext) => Layer[];
  /** Pills after the view pills. */
  controls?: ReactNode;
  /** Text at the right of the pills. */
  note?: ReactNode;
};

/** A CSS color, as a canvas reads it, in deck.gl's 0 to 255. */
export function rgb(color: string, alpha = 255): Color {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, alpha];
}

function readColors(): MapColors {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    bg: token("--bg"),
    surface: token("--surface"),
    line: token("--line"),
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

/** The whole base map: the page's background, and when asked, land and the borders on it. */
function styleFor(colors: MapColors, land: boolean): StyleSpecification {
  return {
    version: 8,
    sources: land ? { land: { type: "geojson", data: "/geo/land.json" } } : {},
    layers: [
      { id: "sea", type: "background", paint: { "background-color": colors.bg } },
      ...(land
        ? ([
            {
              id: "land",
              type: "fill",
              source: "land",
              filter: ["==", ["get", "kind"], "land"],
              paint: { "fill-color": colors.surface },
            },
            {
              id: "borders",
              type: "line",
              source: "land",
              filter: ["==", ["get", "kind"], "border"],
              paint: { "line-color": colors.line, "line-width": 0.6 },
            },
          ] as const)
        : []),
    ],
  } as StyleSpecification;
}

function webgl2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export function BaseMap({
  label,
  bounds,
  padding = views.flat.padding,
  maxFitZoom,
  views: available = ["flat", "tilted"],
  land = true,
  animated = false,
  effects,
  layers,
  controls,
  note,
}: BaseMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre | null>(null);
  const [view, setView] = useState<MapView>(available[0]);
  const viewRef = useRef<MapView>(view);
  const [tip, setTip] = useState<Tip | null>(null);
  const [supported] = useState(webgl2);

  // What the map reads when it draws, kept current without rebuilding the map.
  const latest = useRef({ layers, bounds, padding, maxFitZoom });
  const draw = useRef(() => {});
  const fit = useRef<(duration: number) => void>(() => {});

  useEffect(() => {
    if (!supported || !container.current) return;
    let colors = readColors();
    let tokens = new Map<string, Color>();
    const still = reducedMotion();
    const moving = animated && !still;

    const instance = new MapLibre({
      container: container.current,
      style: styleFor(colors, land),
      bounds: latest.current.bounds,
      fitBoundsOptions: {
        padding: latest.current.padding,
        // Left out, not undefined: an explicit undefined overrides MapLibre's own limit.
        ...(latest.current.maxFitZoom === undefined ? {} : { maxZoom: latest.current.maxFitZoom }),
      },
      minZoom: 0.5,
      maxZoom: 9,
      attributionControl: false,
      // The page scrolls past the map: zooming it takes ctrl or two fingers.
      cooperativeGestures: true,
      dragRotate: true,
    });
    map.current = instance;

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
      effects: effects?.({ still }) ?? [],
    });
    instance.addControl(overlay);

    const start = performance.now();
    const paint = (time: number) => {
      const color = (token: string, alpha = 255): Color => {
        const key = `${token}/${alpha}`;
        let found = tokens.get(key);
        if (!found) {
          const css = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
          found = rgb(css, alpha);
          tokens.set(key, found);
        }
        return found;
      };
      overlay.setProps({
        layers: latest.current.layers({
          colors,
          color,
          view: viewRef.current,
          time,
          moving,
          tip: setTip,
        }),
      });
    };
    draw.current = () => paint((performance.now() - start) / 1000);
    draw.current();

    fit.current = (duration) => {
      const { pitch, padding: viewPadding, lower } = views[viewRef.current];
      const { bounds: box, padding: pad, maxFitZoom: zoom } = latest.current;
      instance.fitBounds(box, {
        padding: viewRef.current === "flat" ? pad : viewPadding,
        offset: [0, instance.getContainer().clientHeight * lower],
        pitch,
        bearing: 0,
        ...(zoom === undefined ? {} : { maxZoom: zoom }),
        duration: still ? 0 : duration,
      });
    };

    // One loop for every moving thing. It rests while the map is off screen
    // or the tab is hidden, and never starts for a reader who asked for less motion.
    let frame = 0;
    let visible = true;
    const tick = () => {
      draw.current();
      frame = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(frame);
      if (moving && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    watcher.observe(container.current);
    document.addEventListener("visibilitychange", run);
    run();

    // Light or dark: the map is drawn from the page's colors, so read them again.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const recolor = () => {
      colors = readColors();
      tokens = new Map();
      instance.setStyle(styleFor(colors, land));
      draw.current();
    };
    scheme.addEventListener("change", recolor);

    return () => {
      cancelAnimationFrame(frame);
      watcher.disconnect();
      document.removeEventListener("visibilitychange", run);
      scheme.removeEventListener("change", recolor);
      draw.current = () => {};
      fit.current = () => {};
      instance.remove();
      map.current = null;
    };
    // The map is made once. A page changes what it draws through `layers` and `bounds`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  // New layers: draw them. (An animated map is drawn again a frame later anyway.)
  useEffect(() => {
    latest.current.layers = layers;
    draw.current();
  }, [layers]);

  // A new frame: fly there. The first is the map's own.
  const frameKey = bounds.join();
  const framed = useRef(frameKey);
  useEffect(() => {
    latest.current.bounds = bounds;
    latest.current.padding = padding;
    latest.current.maxFitZoom = maxFitZoom;
    if (framed.current === frameKey) return;
    framed.current = frameKey;
    fit.current(800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey]);

  const show = useCallback((next: MapView) => {
    setView(next);
    viewRef.current = next;
    fit.current(1200);
    draw.current();
  }, []);

  if (!supported) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center rounded-(--radius-img) bg-surface">
        <p className="type-small text-ink-2">
          The map needs WebGL 2, which this browser does not have. The numbers below do not.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-sm)">
      <div className="relative">
        <div
          ref={container}
          role="application"
          aria-label={label}
          className="aspect-[2/1] w-full overflow-hidden rounded-(--radius-img) bg-bg"
        />
        {tip && (
          <div
            className="type-small pointer-events-none absolute z-10 rounded bg-ink px-2 py-1 text-bg"
            style={{ left: tip.x + 12, top: tip.y + 12 }}
          >
            {tip.text}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {available.length > 1 && (
            <div role="group" aria-label="Map view" className="flex gap-2">
              {available.map((key) => (
                <FilterPill key={key} size="sm" active={key === view} onClick={() => show(key)}>
                  {views[key].label}
                </FilterPill>
              ))}
            </div>
          )}
          {controls}
        </div>
        {note}
      </div>
    </div>
  );
}
