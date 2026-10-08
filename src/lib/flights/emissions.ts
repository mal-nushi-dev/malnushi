import type { FlightData } from "@/lib/content";

/*
 * What one passenger's share of a flight emits, estimated from distance and
 * cabin with the UK government's conversion factors:
 *
 *   DESNZ, "Greenhouse gas reporting: conversion factors 2026", flat format
 *   (revised), Business travel – air, "Without RF".
 *   https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026
 *
 * The factors are kg CO2e per passenger-kilometre, one for each gas. The
 * "International, to/from non-UK" rows are used for every flight, since they
 * are the only ones not built from UK departures, and they are split by
 * cabin. "Without RF" leaves out the extra warming of emissions at altitude
 * (contrails, NOx): these are the gases themselves.
 *
 * It is an estimate. The real figure depends on the aircraft, how full it
 * was and the route flown.
 */

type Factor = { co2: number; ch4: number; n2o: number };

/** kg CO2e per passenger-kilometre, by gas. */
const factors = {
  average: { co2: 0.08333, ch4: 0.00001, n2o: 0.00086 },
  Economy: { co2: 0.06382, ch4: 0.00001, n2o: 0.00067 },
  "Economy+": { co2: 0.10211, ch4: 0.00001, n2o: 0.00106 },
  Business: { co2: 0.18507, ch4: 0.00002, n2o: 0.00192 },
  First: { co2: 0.25527, ch4: 0.00002, n2o: 0.00265 },
} satisfies Record<string, Factor>;

/**
 * Kilograms of CO2 that warm as much as a kilogram of each gas over 100
 * years (IPCC AR5, which the factors are written in). Dividing by these
 * turns kg CO2e back into kilograms of the gas.
 */
const gwp = { ch4: 28, n2o: 265 };

/**
 * The factor for a flight: its cabin's, or the average passenger's when the
 * cabin was not recorded. A private flight has no published factor.
 */
function factorFor(cabin: FlightData["cabin"]): Factor | undefined {
  if (cabin === "Private") return undefined;
  return cabin ? factors[cabin] : factors.average;
}

export type Emissions = {
  /** Tonnes of carbon dioxide. */
  co2Tonnes: number;
  /** Kilograms of methane. */
  ch4Kg: number;
  /** Kilograms of nitrous oxide. */
  n2oKg: number;
  /** Flights with no factor to estimate from. */
  leftOut: number;
};

export function emissionsOf(flights: Pick<FlightData, "km" | "cabin">[]): Emissions {
  let co2 = 0;
  let ch4 = 0;
  let n2o = 0;
  let leftOut = 0;
  for (const flight of flights) {
    const factor = factorFor(flight.cabin);
    if (!factor) {
      leftOut++;
      continue;
    }
    co2 += flight.km * factor.co2;
    ch4 += (flight.km * factor.ch4) / gwp.ch4;
    n2o += (flight.km * factor.n2o) / gwp.n2o;
  }
  return { co2Tonnes: co2 / 1000, ch4Kg: ch4, n2oKg: n2o, leftOut };
}
