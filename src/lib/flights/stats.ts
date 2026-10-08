import type { Airport, FlightData } from "@/lib/content";
import { kmPerMile } from "./distance";
import { emissionsOf } from "./emissions";

/*
 * Everything the travels page says about the flights, worked out once while
 * the site builds. What comes back is plain data, so it can cross to a
 * client component as it is.
 */

/** Average distances, in kilometres. */
export const moonKm = 384_400;
export const sunKm = 149_597_870.7;
/** Around the equator. */
export const earthKm = 40_075.017;

export type Flown = { date: string; data: FlightData };

/** One slice of a pie, or one point of a line. */
export type Count = { label: string; count: number };
/** One bar of a ranking, which can be read either way. */
export type Ranked = { label: string; detail?: string; count: number; km: number };

const cabinOrder = ["Economy", "Economy+", "Business", "First", "Private"];
const seatOrder = ["Window", "Middle", "Aisle"];
const reasonOrder = ["Leisure", "Business", "Crew", "Other"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A long time as the largest units it fills: a year is 365 days, a month 30. */
export function timeParts(totalMinutes: number) {
  const units = [
    ["years", 365 * 24 * 60],
    ["months", 30 * 24 * 60],
    ["weeks", 7 * 24 * 60],
    ["days", 24 * 60],
    ["hours", 60],
    ["minutes", 1],
  ] as const;
  let left = Math.round(totalMinutes);
  return Object.fromEntries(
    units.map(([name, size]) => {
      const whole = Math.floor(left / size);
      left -= whole * size;
      return [name, whole];
    }),
  ) as Record<(typeof units)[number][0], number>;
}

/**
 * Minutes in the air for a flight the diary has no duration for: half an
 * hour of climbing, descending and taxiing, and the rest at 800 km/h.
 */
export function estimatedMinutes(km: number) {
  return Math.round(30 + (km / 800) * 60);
}

/** How often each value comes up, in a set order, with those never seen left out. */
function shares(values: (string | undefined)[], order?: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value !== undefined) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const slices = [...counts].map(([label, count]) => ({ label, count }));
  slices.sort((a, b) =>
    order ? order.indexOf(a.label) - order.indexOf(b.label) : b.count - a.count || a.label.localeCompare(b.label),
  );
  return { slices, unrecorded: values.length - slices.reduce((sum, s) => sum + s.count, 0) };
}

function ranking(rows: { label?: string; detail?: string; km: number }[]) {
  const found = new Map<string, Ranked>();
  for (const { label, detail, km } of rows) {
    if (label === undefined) continue;
    const row = found.get(label) ?? { label, ...(detail ? { detail } : {}), count: 0, km: 0 };
    row.count++;
    row.km += km;
    found.set(label, row);
  }
  return [...found.values()];
}

/** The top of a ranking, by flights or by distance. Ties go by the other, then the name. */
export function top(rows: Ranked[], by: "count" | "km", limit = 10) {
  const other = by === "count" ? "km" : "count";
  return [...rows]
    .sort((a, b) => b[by] - a[by] || b[other] - a[other] || a.label.localeCompare(b.label))
    .slice(0, limit);
}

const codeOf = (airport: Airport) => airport.iata ?? airport.icao;

export function flightStats(flights: Flown[]) {
  const all = flights.map((f) => f.data);
  const km = all.reduce((sum, f) => sum + f.km, 0);
  const domestic = all.filter((f) => f.from.countryCode === f.to.countryCode).length;
  const estimated = all.filter((f) => f.minutes === 0).length;
  const minutes = all.reduce((sum, f) => sum + (f.minutes || estimatedMinutes(f.km)), 0);

  const years = flights.map((f) => Number(f.date.slice(0, 4)));
  const first = Math.min(...years);
  const last = Math.max(...years);
  const perYear = Array.from({ length: flights.length ? last - first + 1 : 0 }, (_, i) => ({
    label: String(first + i),
    count: years.filter((y) => y === first + i).length,
  }));
  const perMonth = months.map((label, i) => ({
    label,
    count: flights.filter((f) => Number(f.date.slice(5, 7)) === i + 1).length,
  }));
  // A day written without a time is midnight UTC, so its weekday is read in UTC.
  const days = flights.map((f) => (new Date(f.date.slice(0, 10)).getUTCDay() + 6) % 7);
  const perWeekday = weekdays.map((label, i) => ({
    label,
    count: days.filter((d) => d === i).length,
  }));

  // The map: each airport once, and each pair of airports once whichever way it was flown.
  const airports: { code: string; city: string; name: string; lat: number; lon: number; visits: number }[] = [];
  const indexOf = new Map<string, number>();
  const place = (airport: Airport) => {
    let at = indexOf.get(airport.icao);
    if (at === undefined) {
      at = airports.length;
      indexOf.set(airport.icao, at);
      const { city, name, lat, lon } = airport;
      airports.push({ code: codeOf(airport), city, name, lat, lon, visits: 0 });
    }
    airports[at].visits++;
    return at;
  };
  const pairs = new Map<string, { from: number; to: number; count: number }>();
  for (const flight of all) {
    const a = place(flight.from);
    const b = place(flight.to);
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    const pair = pairs.get(key) ?? { from: Math.min(a, b), to: Math.max(a, b), count: 0 };
    pair.count++;
    pairs.set(key, pair);
  }

  return {
    flights: all.length,
    domestic,
    international: all.length - domestic,
    km,
    miles: km / kmPerMile,
    toMoon: km / moonKm,
    toSun: km / sunKm,
    aroundEarth: km / earthKm,
    minutes,
    time: timeParts(minutes),
    /** Flights whose time in the air is an estimate. */
    estimated,
    emissions: emissionsOf(all),
    countries: new Set(all.flatMap((f) => [f.from.countryCode, f.to.countryCode])).size,
    shares: {
      cabin: shares(all.map((f) => f.cabin), cabinOrder),
      seat: shares(all.map((f) => f.seat), seatOrder),
      reason: shares(all.map((f) => f.reason), reasonOrder),
      // Where each flight landed.
      continent: shares(all.map((f) => f.to.continent)),
    },
    rankings: {
      // An airport is visited when a flight leaves it and when one arrives.
      airports: ranking(
        all.flatMap((f) =>
          [f.from, f.to].map((a) => ({ label: codeOf(a), detail: a.city, km: f.km })),
        ),
      ),
      airlines: ranking(all.map((f) => ({ label: f.airline, km: f.km }))),
      aircraft: ranking(all.map((f) => ({ label: f.aircraft, km: f.km }))),
      // A route is the pair of airports, whichever way it was flown.
      routes: ranking(
        all.map((f) => ({
          label: [codeOf(f.from), codeOf(f.to)].sort().join(" – "),
          km: f.km,
        })),
      ),
      // A country is visited when a flight lands in it.
      countries: ranking(all.map((f) => ({ label: f.to.country, km: f.km }))),
    },
    series: { years: perYear, months: perMonth, weekdays: perWeekday },
    map: { airports, routes: [...pairs.values()] },
  };
}

export type FlightStats = ReturnType<typeof flightStats>;
