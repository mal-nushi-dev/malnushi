"use client";

import dynamic from "next/dynamic";
import type { LifeMapProps } from "./life-map";

/*
 * The map draws with WebGL, so there is nothing to render on the server, and
 * deck.gl and MapLibre load only on the page that has it. See
 * components/flight-map/index.tsx, which this follows.
 */
const Loaded = dynamic(() => import("./life-map"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-(--space-sm)">
      <div className="aspect-[2/1] w-full rounded-(--radius-img) bg-surface" />
      <div className="h-(--pill-height-sm)" />
    </div>
  ),
});

export function LifeMap(props: LifeMapProps) {
  return <Loaded {...props} />;
}
