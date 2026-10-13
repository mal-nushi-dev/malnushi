"use client";

import {
  AmbientLight,
  DirectionalLight,
  LightingEffect,
  PostProcessEffect,
  type Layer,
} from "@deck.gl/core";
import { ArcLayer, ColumnLayer, ScatterplotLayer } from "@deck.gl/layers";
import { useCallback, useMemo } from "react";
import { BaseMap, type BBox, type MapContext } from "@/components/map/base-map";
import { glowPass } from "./glow-pass";
import { FlightTrailExtension, type TrailProps } from "./trail-extension";

/*
 * Every airport flown to and every route between them, drawn on the GPU.
 * The ground, the camera and the views are the site's base map
 * (components/map/base-map.tsx); this draws the flights on it, flat or
 * tilted. See docs/adr/0010-flight-map-and-flight-data.md.
 */

export type MapAirport = { code: string; city: string; lat: number; lon: number; visits: number };
export type MapRoute = { from: number; to: number; count: number };
export type FlightMapProps = { airports: MapAirport[]; routes: MapRoute[] };

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
    bounds: (airports.length ? [west, south, east, north] : [-130, 10, 30, 60]) as BBox,
  };
}

type Buffers = ReturnType<typeof buffers>;

function layersFor(data: Buffers, context: MapContext): Layer[] {
  const { view, time, moving, colors } = context;
  const arc = context.color("--chart-1");
  const pin = context.color("--chart-4");
  const raised = view !== "flat";
  return [
    new ArcLayer<unknown, TrailProps>({
      id: "routes",
      data: data.arcs,
      greatCircle: true,
      numSegments: 64,
      // Flat, an arc lies on the map as the great circle; raised, it lifts off it.
      getHeight: raised ? 0.35 : 0,
      getSourceColor: arc,
      getTargetColor: arc,
      widthUnits: "pixels",
      widthMinPixels: 1,
      // An arc is a ribbon with no back: deck.gl would cull it as facing away.
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
    // A column a visit where the map is tilted, dots as on the flat map otherwise.
    view === "tilted"
      ? new ColumnLayer({
          id: "airports-raised",
          data: data.columns,
          diskResolution: 16,
          radius: 28_000,
          extruded: true,
          // A column a visit: 12 km each, so the busiest stands well clear.
          elevationScale: 12_000,
          getFillColor: pin,
          material: { ambient: 0.45, diffuse: 0.7, shininess: 24, specularColor: [60, 60, 60] },
        })
      : new ScatterplotLayer({
          id: "airports",
          data: data.dots,
          radiusUnits: "pixels",
          getFillColor: pin,
          parameters: { cullMode: "none" },
          stroked: true,
          getLineColor: context.color("--bg"),
          lineWidthUnits: "pixels",
          getLineWidth: 1.5,
        }),
  ];
}

export default function FlightMap(props: FlightMapProps) {
  // The flights are fixed when the page is built: these are made once, and
  // deck.gl sends them to the GPU once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => buffers(props), []);
  const layers = useCallback((context: MapContext) => layersFor(data, context), [data]);
  const effects = useCallback(
    ({ still }: { still: boolean }) => [
      new LightingEffect({
        ambient: new AmbientLight({ color: [255, 255, 255], intensity: 1.6 }),
        sun: new DirectionalLight({ color: [255, 255, 255], intensity: 2.2, direction: [-3, -6, -4] }),
      }),
      ...(still ? [] : [new PostProcessEffect(glowPass, { strength: 0.55, radius: 9 })]),
    ],
    [],
  );
  return (
    <BaseMap
      label={`Map of ${props.airports.length} airports and the ${props.routes.length} routes flown between them`}
      bounds={data.bounds}
      animated
      effects={effects}
      layers={layers}
    />
  );
}
