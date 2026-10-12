"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterPill } from "@/components/filter-pill";
import { BaseMap, type BBox, type MapContext, type MapView } from "@/components/map/base-map";
import { heatRamp } from "@/components/map/heat";

/*
 * The life list's map: every country, territory and dependency (and, once
 * one is opened, its states or provinces) filled by how much was seen in it.
 * Geometry is public/geo (scripts/geo.mjs); the counts are the page's. It is
 * the site's base map with one layer on it. See ADR 0012 and 0013.
 */

type Region = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, { code: string; name: string }>;

export type Counts = { species: number; observations: number; checklists: number };
export type LifeMapProps = {
  /** By country code. */
  countries: Record<string, Counts>;
  /** By state or province code (US-NC). */
  regions: Record<string, Counts>;
  /** The species on the list, for the map's label. */
  total: number;
};

const metrics = [
  { key: "species", label: "Species", unit: "species" },
  { key: "observations", label: "Observations", unit: "observations" },
  { key: "checklists", label: "Checklists", unit: "checklists" },
] as const;
type Metric = (typeof metrics)[number]["key"];

const world: BBox = [-180, -58, 180, 80];
const views: MapView[] = ["flat", "globe"];

/**
 * The west, south, east and north to frame a set of regions in: the parts
 * big enough to matter. The United States has the Aleutians on the far side
 * of the antimeridian and Hawaii in the Pacific, and framing those frames
 * the world.
 */
export function boundsOf(features: Region[]): BBox {
  const polygons = features.flatMap((f) =>
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates,
  );
  const box = (poly: number[][][]) => {
    let [w, s, e, n] = [180, 90, -180, -90];
    for (const [x, y] of poly[0]) {
      w = Math.min(w, x);
      e = Math.max(e, x);
      s = Math.min(s, y);
      n = Math.max(n, y);
    }
    return { w, s, e, n, size: (e - w) * (n - s) };
  };
  const boxes = polygons.map(box);
  const biggest = Math.max(...boxes.map((b) => b.size));
  const big = boxes.filter((b) => b.size >= biggest * 0.02);
  return [
    Math.min(...big.map((b) => b.w)),
    Math.min(...big.map((b) => b.s)),
    Math.max(...big.map((b) => b.e)),
    Math.max(...big.map((b) => b.n)),
  ];
}

export default function LifeMap({ countries, regions, total }: LifeMapProps) {
  const [all, setAll] = useState<Region[]>([]);
  const [opened, setOpened] = useState<{ name: string; features: Region[] } | null>(null);
  const [metric, setMetric] = useState<Metric>("species");

  useEffect(() => {
    let stop = false;
    fetch("/geo/countries.json")
      .then((r) => r.json() as Promise<GeoJSON.FeatureCollection>)
      .then((fc) => {
        if (!stop) setAll(fc.features as Region[]);
      })
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, []);

  const shown = opened ? opened.features : all;
  const counts = opened ? regions : countries;
  const valueOf = useCallback(
    (code: string) => counts[code]?.[metric] ?? 0,
    [counts, metric],
  );
  const peak = useMemo(() => Math.max(0, ...shown.map((r) => valueOf(r.properties.code))), [shown, valueOf]);
  const bounds = useMemo(() => (opened ? boundsOf(shown) : world), [opened, shown]);
  const unit = metrics.find((m) => m.key === metric)!.unit;

  const open = useCallback(async (code: string, name: string) => {
    // A country with no states in the geometry has nothing to open.
    const res = await fetch(`/geo/regions/${code}.json`);
    if (!res.ok) return;
    const fc = (await res.json()) as GeoJSON.FeatureCollection;
    setOpened({ name, features: fc.features as Region[] });
  }, []);

  const layers = useCallback(
    (context: MapContext) => {
      const rgb = (token: string) => context.color(token).slice(0, 3) as [number, number, number];
      const ramp = heatRamp(rgb("--surface"), rgb("--accent"), rgb("--ink"), [0x2e, 0x2e, 0x2e], context.colors.dark);
      return [
        new GeoJsonLayer<Region["properties"]>({
          id: "regions",
          data: shown,
          filled: true,
          stroked: true,
          pickable: true,
          autoHighlight: true,
          highlightColor: [...rgb("--ink"), 70],
          getFillColor: (f) => ramp.at(valueOf(f.properties.code), peak),
          getLineColor: context.color("--line"),
          lineWidthUnits: "pixels",
          getLineWidth: 0.75,
          parameters: { cullMode: "none" },
          updateTriggers: { getFillColor: [ramp.key, peak, shown, valueOf] },
          onHover: (info) => {
            const f = info.object as Region | undefined;
            context.tip(
              f
                ? {
                    x: info.x,
                    y: info.y,
                    text: `${f.properties.name}: ${valueOf(f.properties.code)} ${unit}`,
                  }
                : null,
            );
          },
          onClick: (info) => {
            const f = info.object as Region | undefined;
            if (f && !opened) void open(f.properties.code, f.properties.name);
          },
        }),
      ];
    },
    [shown, valueOf, peak, unit, opened, open],
  );

  return (
    <BaseMap
      label={`Map of the ${total} species seen, by ${opened ? `state or province in ${opened.name}` : "country"}`}
      bounds={bounds}
      padding={opened ? 32 : 8}
      maxFitZoom={6}
      views={views}
      land={false}
      layers={layers}
      controls={
        <>
          <span aria-hidden className="mx-1 w-px self-stretch bg-line" />
          <div role="group" aria-label="Count" className="flex gap-2">
            {metrics.map((m) => (
              <FilterPill key={m.key} size="sm" active={m.key === metric} onClick={() => setMetric(m.key)}>
                {m.label}
              </FilterPill>
            ))}
          </div>
          {opened && (
            <FilterPill size="sm" active={false} onClick={() => setOpened(null)}>
              World
            </FilterPill>
          )}
        </>
      }
      note={
        <p className="type-meta text-ink-2" role="status">
          {opened ? opened.name : "World"}:{" "}
          {peak === 0 ? "none seen" : `0 gray · 1 to ${peak} ${unit}`}
        </p>
      }
    />
  );
}
