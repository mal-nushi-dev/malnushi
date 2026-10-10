"use client";

import { useEffect, useRef } from "react";
import { StatCard, StatPart } from "@/components/stat";
import type { SceneName, Scenes } from "./scenes";

/** One ratio: as the scene draws it, and as it is read ("0.68×"). */
type Ratio = { ratio: number; read: string };

export type FlightScenesProps = {
  flights: { total: string; domestic: string; international: string };
  distance: { miles: string; km: string };
  /** How far toward the Moon. */
  moon: Ratio;
  /** How many times round the Earth. */
  earth: Ratio;
  /** How far toward the Sun. */
  sun: Ratio;
};

/** A scene drawn behind a card. `data-scene` is how `mountScenes` finds it. */
function scene(name: SceneName) {
  return <canvas data-scene={name} />;
}

/**
 * The flights in four numbers, each with a small scene drawn behind it. The
 * numbers are the content and are on the page from the start; three.js loads
 * when the cards come near the screen, and without it they are the numbers
 * alone. Each card names its scene, so the cards can be in any order.
 */
export function FlightScenes({ flights, distance, moon, earth, sun }: FlightScenesProps) {
  const grid = useRef<HTMLDivElement>(null);
  const toMoon = moon.ratio;
  const aroundEarth = earth.ratio;
  const toSun = sun.ratio;

  useEffect(() => {
    const element = grid.current;
    if (!element) return;
    let scenes: Scenes | undefined;
    let gone = false;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        void import("./scenes").then(({ mountScenes }) => {
          if (gone) return;
          scenes = mountScenes(element, { toMoon, aroundEarth, toSun });
        });
      },
      { rootMargin: "800px" },
    );
    near.observe(element);
    return () => {
      gone = true;
      near.disconnect();
      scenes?.dispose();
    };
  }, [toMoon, aroundEarth, toSun]);

  return (
    <div ref={grid} data-flight-scenes className="grid grid-cols-2 gap-(--col-gap)">
      <StatCard value={flights.total} label="Flights" backdrop={scene("flights")}>
        <StatPart value={flights.domestic} label="Domestic" />
        <StatPart value={flights.international} label="International" />
      </StatCard>
      <StatCard
        value={distance.miles}
        label={`Miles flown · ${distance.km} km`}
        backdrop={scene("moon")}
      >
        <StatPart value={moon.read} label="Of the way to the Moon" />
      </StatCard>
      <StatCard value={earth.read} label="Around the Earth" backdrop={scene("earth")} />
      <StatCard value={sun.read} label="Of the way to the Sun" backdrop={scene("sun")} />
    </div>
  );
}
