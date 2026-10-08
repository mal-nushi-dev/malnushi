import { describe, expect, it } from "vitest";
import type { Airport, FlightData } from "@/lib/content";
import { greatCircleKm, kmPerMile } from "./distance";
import { emissionsOf } from "./emissions";
import {
  earthKm,
  estimatedMinutes,
  flightStats,
  moonKm,
  sunKm,
  timeParts,
  top,
  type Flown,
} from "./stats";

const us = { countryCode: "US", country: "United States", continent: "North America" } as const;
const airports = {
  DTW: { iata: "DTW", icao: "KDTW", city: "Detroit", name: "Metropolitan", lat: 42.2138, lon: -83.3538, ...us },
  ORD: { iata: "ORD", icao: "KORD", city: "Chicago", name: "O'Hare", lat: 41.9786, lon: -87.9048, ...us },
  VIE: {
    iata: "VIE",
    icao: "LOWW",
    city: "Vienna",
    name: "Schwechat",
    lat: 48.1103,
    lon: 16.5697,
    countryCode: "AT",
    country: "Austria",
    continent: "Europe",
  },
  // No IATA code: it goes by its ICAO code.
  JQF: { icao: "KJQF", city: "Concord", name: "Regional", lat: 35.3878, lon: -80.7091, ...us },
} satisfies Record<string, Airport>;

function flight(
  date: string,
  from: keyof typeof airports,
  to: keyof typeof airports,
  rest: Partial<FlightData> = {},
): Flown {
  const a = airports[from];
  const b = airports[to];
  return { date, data: { from: a, to: b, km: greatCircleKm(a, b), minutes: 60, ...rest } };
}

// 2024-03-01 is a Friday, 2024-03-03 a Sunday, 2026-06-08 a Monday.
const flown = [
  flight("2024-03-01", "DTW", "VIE", { minutes: 520, airline: "Delta", aircraft: "A330", seat: "Window", cabin: "Economy", reason: "Leisure" }),
  flight("2024-03-03", "VIE", "DTW", { minutes: 600, airline: "Delta", aircraft: "A330", seat: "Aisle", cabin: "First", reason: "Business" }),
  flight("2026-06-08", "DTW", "ORD", { minutes: 80, airline: "United", aircraft: "E175", seat: "Window", cabin: "Economy" }),
  flight("2026-06-08", "ORD", "DTW", { minutes: 75, airline: "United" }),
  flight("2026-06-08", "DTW", "JQF", { minutes: 0 }),
];
const stats = flightStats(flown);
const long = flown[0].data.km;
const short = flown[2].data.km;
const hop = flown[4].data.km;

describe("the counts", () => {
  it("counts flights, and those that stay in one country", () => {
    expect(stats).toMatchObject({ flights: 5, domestic: 3, international: 2, countries: 2 });
  });

  it("adds up the distance in both units", () => {
    expect(stats.km).toBeCloseTo(2 * long + 2 * short + hop, 6);
    expect(stats.miles).toBeCloseTo(stats.km / 1.609344, 6);
  });
});

describe("the comparisons", () => {
  it("sets the distance against the Moon, the Sun and the Earth", () => {
    expect(stats.toMoon).toBeCloseTo(stats.km / 384_400, 9);
    expect(stats.toSun).toBeCloseTo(stats.km / 149_597_870.7, 12);
    expect(stats.aroundEarth).toBeCloseTo(stats.km / 40_075.017, 9);
  });

  it("makes 161,494 miles 0.68 of the way to the Moon, 0.00174 to the Sun and 6.5 times round", () => {
    const km = 161_494 * kmPerMile;
    expect((km / moonKm).toFixed(2)).toBe("0.68");
    expect((km / sunKm).toFixed(5)).toBe("0.00174");
    expect((km / earthKm).toFixed(1)).toBe("6.5");
  });
});

describe("time in the air", () => {
  it("breaks minutes into the largest units they fill", () => {
    expect(timeParts(26_001)).toEqual({ years: 0, months: 0, weeks: 2, days: 4, hours: 1, minutes: 21 });
    expect(timeParts(0)).toEqual({ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0 });
    const year = 365 * 24 * 60;
    expect(timeParts(year + 31 * 24 * 60 + 61)).toEqual({
      years: 1,
      months: 1,
      weeks: 0,
      days: 1,
      hours: 1,
      minutes: 1,
    });
  });

  it("estimates a flight the diary has no duration for, and says how many", () => {
    expect(estimatedMinutes(800)).toBe(90);
    expect(stats.estimated).toBe(1);
    expect(stats.minutes).toBe(520 + 600 + 80 + 75 + estimatedMinutes(hop));
    expect(stats.time).toEqual(timeParts(stats.minutes));
  });
});

describe("the shares", () => {
  it("counts each value in a fixed order and says how many flights have none", () => {
    expect(stats.shares.cabin).toEqual({
      slices: [
        { label: "Economy", count: 2 },
        { label: "First", count: 1 },
      ],
      unrecorded: 2,
    });
    expect(stats.shares.seat).toEqual({
      slices: [
        { label: "Window", count: 2 },
        { label: "Aisle", count: 1 },
      ],
      unrecorded: 2,
    });
    expect(stats.shares.reason.slices.map((s) => s.label)).toEqual(["Leisure", "Business"]);
  });

  it("counts a continent each time a flight lands in it, largest first", () => {
    expect(stats.shares.continent).toEqual({
      slices: [
        { label: "North America", count: 4 },
        { label: "Europe", count: 1 },
      ],
      unrecorded: 0,
    });
  });
});

describe("the rankings", () => {
  it("visits an airport on leaving it and on arriving", () => {
    expect(top(stats.rankings.airports, "count")).toEqual([
      { label: "DTW", detail: "Detroit", count: 5, km: stats.km },
      // Level on flights, so the longer distance goes first.
      { label: "VIE", detail: "Vienna", count: 2, km: 2 * long },
      { label: "ORD", detail: "Chicago", count: 2, km: 2 * short },
      { label: "KJQF", detail: "Concord", count: 1, km: hop },
    ]);
  });

  it("can be read by distance instead", () => {
    expect(top(stats.rankings.airports, "km").map((r) => r.label)).toEqual(["DTW", "VIE", "KJQF", "ORD"]);
    expect(top(stats.rankings.airlines, "km").map((r) => r.label)).toEqual(["Delta", "United"]);
    expect(top(stats.rankings.airports, "count", 2)).toHaveLength(2);
  });

  it("leaves a flight out of a ranking it has no name for", () => {
    expect(top(stats.rankings.airlines, "count")).toEqual([
      { label: "Delta", count: 2, km: 2 * long },
      { label: "United", count: 2, km: 2 * short },
    ]);
    expect(stats.rankings.aircraft.map((r) => [r.label, r.count])).toEqual([
      ["A330", 2],
      ["E175", 1],
    ]);
  });

  it("counts a route once whichever way it was flown", () => {
    expect(top(stats.rankings.routes, "count").map((r) => [r.label, r.count])).toEqual([
      ["DTW – VIE", 2],
      ["DTW – ORD", 2],
      ["DTW – KJQF", 1],
    ]);
  });

  it("visits a country when a flight lands in it", () => {
    expect(top(stats.rankings.countries, "count").map((r) => [r.label, r.count])).toEqual([
      ["United States", 4],
      ["Austria", 1],
    ]);
  });
});

describe("the series", () => {
  it("has every year from the first to the last, empty ones too", () => {
    expect(stats.series.years).toEqual([
      { label: "2024", count: 2 },
      { label: "2025", count: 0 },
      { label: "2026", count: 3 },
    ]);
  });

  it("has all twelve months and all seven days, Monday first", () => {
    expect(stats.series.months.map((m) => m.count)).toEqual([0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 0]);
    expect(stats.series.weekdays).toEqual([
      { label: "Mon", count: 3 },
      { label: "Tue", count: 0 },
      { label: "Wed", count: 0 },
      { label: "Thu", count: 0 },
      { label: "Fri", count: 1 },
      { label: "Sat", count: 0 },
      { label: "Sun", count: 1 },
    ]);
  });
});

describe("the map", () => {
  it("has each airport once, with its visits", () => {
    expect(stats.map.airports.map((a) => [a.code, a.visits])).toEqual([
      ["DTW", 5],
      ["VIE", 2],
      ["ORD", 2],
      ["KJQF", 1],
    ]);
    expect(stats.map.airports[0]).toMatchObject({ city: "Detroit", lat: 42.2138, lon: -83.3538 });
  });

  it("has each pair of airports once, by index", () => {
    expect(stats.map.routes).toEqual([
      { from: 0, to: 1, count: 2 },
      { from: 0, to: 2, count: 2 },
      { from: 0, to: 3, count: 1 },
    ]);
  });
});

describe("with no flights", () => {
  it("is all zeroes and empty lists", () => {
    const none = flightStats([]);
    expect(none).toMatchObject({ flights: 0, km: 0, minutes: 0, countries: 0 });
    expect(none.series.years).toEqual([]);
    expect(none.map).toEqual({ airports: [], routes: [] });
  });
});

describe("emissions", () => {
  it("multiplies distance by the cabin's factor, gas by gas", () => {
    const e = emissionsOf([{ km: 1000, cabin: "Economy" }]);
    expect(e.co2Tonnes).toBeCloseTo(0.06382, 9);
    // kg CO2e back to kilograms of the gas: methane warms 28 times as much, nitrous oxide 265.
    expect(e.ch4Kg).toBeCloseTo((1000 * 0.00001) / 28, 9);
    expect(e.n2oKg).toBeCloseTo((1000 * 0.00067) / 265, 9);
  });

  it("charges a wider seat more", () => {
    const co2 = (cabin: FlightData["cabin"]) => emissionsOf([{ km: 1000, cabin }]).co2Tonnes;
    expect(co2("Economy")).toBeLessThan(co2("Economy+")!);
    expect(co2("Economy+")).toBeLessThan(co2("Business")!);
    expect(co2("Business")).toBeLessThan(co2("First")!);
  });

  it("uses the average passenger when the cabin was not recorded", () => {
    expect(emissionsOf([{ km: 1000 }]).co2Tonnes).toBeCloseTo(0.08333, 9);
  });

  it("leaves out a private flight, and counts it", () => {
    expect(emissionsOf([{ km: 1000, cabin: "Private" }])).toEqual({
      co2Tonnes: 0,
      ch4Kg: 0,
      n2oKg: 0,
      leftOut: 1,
    });
  });

  it("is part of the stats", () => {
    expect(stats.emissions).toEqual(emissionsOf(flown.map((f) => f.data)));
  });
});
