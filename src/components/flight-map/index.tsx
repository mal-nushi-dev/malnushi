"use client";

import dynamic from "next/dynamic";
import type { FlightMapProps } from "./flight-map";

/*
 * The map draws with WebGL, so there is nothing to render on the server, and
 * deck.gl and MapLibre are large: they load only on the page that has the
 * map, after it is shown. `ssr: false` is only allowed in a client
 * component, which is why this file exists. The box it loads into is the
 * map's own size, so nothing moves when it arrives.
 */
const Loaded = dynamic(() => import("./flight-map"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-(--space-sm)">
      <div className="aspect-[2/1] w-full rounded-(--radius-img) bg-surface" />
      <div className="h-(--pill-height-sm)" />
    </div>
  ),
});

export function FlightMap(props: FlightMapProps) {
  return <Loaded {...props} />;
}
