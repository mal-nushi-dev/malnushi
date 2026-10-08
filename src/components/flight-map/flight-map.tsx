"use client";

import {
  AmbientLight,
  DirectionalLight,
  LightingEffect,
  PostProcessEffect,
  type Color,
} from "@deck.gl/core";
import { ArcLayer, ColumnLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { Map as MapLibre, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { FilterPill } from "@/components/filter-pill";
import { reducedMotion } from "@/lib/motion";
import { glowPass } from "./glow-pass";
import { FlightTrailExtension, type TrailProps } from "./trail-extension";

/*
 * Every airport flown to and every route between them, drawn on the GPU.
 * MapLibre draws the land and owns the camera; deck.gl draws the flights on
 * a canvas of its own above it and follows that camera, flat or on a globe.
 * See docs/adr/0010-flight-map-and-flight-data.md.
 */

export type MapAirport = { code: string; city: string; lat: number; lon: number; visits: number };
export type MapRoute = { from: number; to: number; count: number };
export type FlightMapProps = { airports: MapAirport[]; routes: MapRoute[] };

// Each view frames every airport, with this much room around them in pixels.
const views = {
  flat: { label: "Flat", projection: "mercator", pitch: 0, padding: 56, lower: 0 },
  // Tilted, what is far away rises up the screen: the frame is set lower to keep it in.
  tilted: { label: "Tilted", projection: "mercator", pitch: 50, padding: 32, lower: 0.2 },
  globe: { label: "Globe", projection: "globe", pitch: 0, padding: 8, lower: 0 },
} as const;
type View = keyof typeof views;

/** A CSS color, as a canvas reads it, in deck.gl's 0 to 255. */
function rgb(color: string, alpha = 255): Color {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, alpha];
}

/** The site's colors as they are now: light or dark. */
function palette() {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    bg: token("--bg"),
    surface: token("--surface"),
    line: token("--line"),
    // What deck.gl draws with, read once and not on every frame.
    arc: rgb(token("--chart-1")),
    pin: rgb(token("--chart-4")),
    ring: rgb(token("--bg")),
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

type Palette = ReturnType<typeof palette>;

/** The whole base map: the page's background, land, and the borders on it. */
function styleFor(colors: Palette): StyleSpecification {
  return {
    version: 8,
    sources: { land: { type: "geojson", data: "/geo/land.json" } },
    layers: [
      { id: "sea", type: "background", paint: { "background-color": colors.bg } },
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
    ],
  };
}

/**
 * The flights as typed arrays, made once. deck.gl hands these to the GPU as
 * they are: no object is made for a row, however many rows there are.
 */
function buffers({ airports, routes }: FlightMapProps) {
  const sources = new Float32Array(routes.length * 3);
  const targets = new Float32Array(routes.length * 3);
  const widths = new Float32Array(routes.length);
  const phases = new Float32Array(routes.length);
  routes.forEach((route, i) => {
    const a = airports[route.from];
    const b = airports[route.to];
    sources.set([a.lon, a.lat, 0], i * 3);
    targets.set([b.lon, b.lat, 0], i * 3);
    // A route flown often is a heavier line, but not in proportion.
    widths[i] = 1 + Math.log2(route.count);
    // The golden ratio spreads the pulses evenly around the cycle.
    phases[i] = (i * 0.618034) % 1;
  });
  const positions = new Float32Array(airports.length * 3);
  const visits = new Float32Array(airports.length);
  const radii = new Float32Array(airports.length);
  let [west, south, east, north] = [180, 90, -180, -90];
  airports.forEach((airport, i) => {
    positions.set([airport.lon, airport.lat, 0], i * 3);
    visits[i] = airport.visits;
    // A dot's area, not its width, grows with the visits.
    radii[i] = 2.5 + Math.sqrt(airport.visits);
    west = Math.min(west, airport.lon);
    east = Math.max(east, airport.lon);
    south = Math.min(south, airport.lat);
    north = Math.max(north, airport.lat);
  });
  // Each `data` object is made here and never again: deck.gl sends a buffer
  // to the GPU when its object changes, and these do not.
  return {
    arcs: {
      length: routes.length,
      attributes: {
        getSourcePosition: { value: sources, size: 3 },
        getTargetPosition: { value: targets, size: 3 },
        getWidth: { value: widths, size: 1 },
        getTrailPhase: { value: phases, size: 1 },
      },
    },
    dots: {
      length: airports.length,
      attributes: {
        getPosition: { value: positions, size: 3 },
        getRadius: { value: radii, size: 1 },
      },
    },
    columns: {
      length: airports.length,
      attributes: {
        getPosition: { value: positions, size: 3 },
        getElevation: { value: visits, size: 1 },
      },
    },
    bounds: (airports.length ? [west, south, east, north] : [-130, 10, 30, 60]) as [
      number,
      number,
      number,
      number,
    ],
  };
}

type Buffers = ReturnType<typeof buffers>;

function layersFor(data: Buffers, colors: Palette, view: View, time: number, moving: boolean) {
  const raised = view !== "flat";
  return [
    new ArcLayer<unknown, TrailProps>({
      id: "routes",
      data: data.arcs,
      greatCircle: true,
      numSegments: 64,
      // Flat, an arc lies on the map as the great circle; raised, it lifts off it.
      getHeight: raised ? 0.35 : 0,
      getSourceColor: colors.arc,
      getTargetColor: colors.arc,
      widthUnits: "pixels",
      widthMinPixels: 1,
      // An arc is a ribbon with no back. On the globe deck.gl would cull it
      // as facing away, and draw none of them.
      parameters: { cullMode: "none" },
      extensions: [new FlightTrailExtension()],
      trailTime: time,
      trailEnabled: moving,
      trailLift: colors.dark ? 0.55 : 0,
      // Without the pulses an arc is drawn at full strength, so thin it here.
      opacity: moving ? 1 : 0.55,
      updateTriggers: { getHeight: raised },
      transitions: { getHeight: 600 },
    }),
    // A column a visit where the map is tilted. On the globe deck.gl lays
    // columns on their side, so the airports are dots there, as on the flat map.
    view === "tilted"
      ? new ColumnLayer({
          id: "airports-raised",
          data: data.columns,
          diskResolution: 16,
          radius: 28_000,
          extruded: true,
          // A column a visit: 12 km each, so the busiest stands well clear.
          elevationScale: 12_000,
          getFillColor: colors.pin,
          material: { ambient: 0.45, diffuse: 0.7, shininess: 24, specularColor: [60, 60, 60] },
        })
      : new ScatterplotLayer({
          id: "airports",
          data: data.dots,
          radiusUnits: "pixels",
          getFillColor: colors.pin,
          parameters: { cullMode: "none" },
          stroked: true,
          getLineColor: colors.ring,
          lineWidthUnits: "pixels",
          getLineWidth: 1.5,
        }),
  ];
}

function webgl2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export default function FlightMap(props: FlightMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre | null>(null);
  const [view, setView] = useState<View>("flat");
  const viewRef = useRef<View>(view);
  const [supported] = useState(webgl2);

  useEffect(() => {
    if (!supported || !container.current) return;
    let colors = palette();
    const data = buffers(props);
    const still = reducedMotion();

    const instance = new MapLibre({
      container: container.current,
      style: styleFor(colors),
      bounds: data.bounds,
      fitBoundsOptions: { padding: views.flat.padding },
      minZoom: 0.5,
      maxZoom: 7,
      attributionControl: false,
      // The page scrolls past the map: zooming it takes ctrl or two fingers.
      cooperativeGestures: true,
      dragRotate: true,
    });
    map.current = instance;

    const effects = [
      new LightingEffect({
        ambient: new AmbientLight({ color: [255, 255, 255], intensity: 1.6 }),
        sun: new DirectionalLight({ color: [255, 255, 255], intensity: 2.2, direction: [-3, -6, -4] }),
      }),
      ...(still ? [] : [new PostProcessEffect(glowPass, { strength: 0.55, radius: 9 })]),
    ];
    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: layersFor(data, colors, viewRef.current, 0, !still),
      effects,
    });
    instance.addControl(overlay);

    // One loop for every pulse. It rests while the map is off screen or the
    // tab is hidden, and never starts for a reader who asked for less motion.
    let frame = 0;
    let visible = true;
    const start = performance.now();
    const draw = () => {
      overlay.setProps({
        layers: layersFor(data, colors, viewRef.current, (performance.now() - start) / 1000, !still),
      });
    };
    const tick = () => {
      draw();
      frame = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(frame);
      if (!still && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    watcher.observe(container.current);
    document.addEventListener("visibilitychange", run);
    redraw.current = draw;
    frameAll.current = data.bounds;

    // Light or dark: the map is drawn from the page's colors, so read them again.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const recolor = () => {
      colors = palette();
      instance.setStyle(styleFor(colors));
      draw();
    };
    scheme.addEventListener("change", recolor);

    return () => {
      cancelAnimationFrame(frame);
      watcher.disconnect();
      document.removeEventListener("visibilitychange", run);
      scheme.removeEventListener("change", recolor);
      redraw.current = () => {};
      instance.remove();
      map.current = null;
    };
    // The flights are fixed when the page is built: this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const redraw = useRef(() => {});
  const frameAll = useRef<[number, number, number, number] | null>(null);

  function show(next: View) {
    setView(next);
    viewRef.current = next;
    const instance = map.current;
    if (!instance) return;
    const { projection, pitch, padding, lower } = views[next];
    instance.setProjection({ type: projection });
    if (frameAll.current) {
      instance.fitBounds(frameAll.current, {
        padding,
        offset: [0, instance.getContainer().clientHeight * lower],
        pitch,
        bearing: 0,
        duration: reducedMotion() ? 0 : 1200,
      });
    }
    redraw.current();
  }

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
      <div
        ref={container}
        role="application"
        aria-label={`Map of ${props.airports.length} airports and the ${props.routes.length} routes flown between them`}
        className="aspect-[2/1] w-full overflow-hidden rounded-(--radius-img) bg-bg"
      />
      <div role="group" aria-label="Map view" className="flex gap-2">
        {(Object.keys(views) as View[]).map((key) => (
          <FilterPill key={key} size="sm" active={key === view} onClick={() => show(key)}>
            {views[key].label}
          </FilterPill>
        ))}
      </div>
    </div>
  );
}
