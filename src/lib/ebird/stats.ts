import type { SightingEntry } from "@/lib/content";
import { majorRegions, type MajorRegion, type Where } from "./regions";

/*
 * Everything the life list's page says, worked out in one place at build
 * time from the sightings, as flightStats does for the flights. Plain data:
 * nothing is computed in the browser, and every ranking is a list a page
 * can print without a chart.
 */

export const metrics = ["species", "observations", "checklists"] as const;
export type Metric = (typeof metrics)[number];
export type Counts = Record<Metric, number>;

/** What the stats need to know of a place, which only the geometry has. */
export type Geography = {
  country: (code: string) => { name: string; type: string; continent: string; subregion: string };
  region: (code: string) => string;
};

export type Ranked = { code: string; name: string; type?: string; counts: Counts };
export type Year = { year: string; species: number; observations: number; checklists: number; life: number };
export type Latest = {
  id: string;
  date: string;
  species: string;
  scientific: string;
  /** "Mecklenburg, North Carolina" or "Isla Mujeres, Mexico". */
  where: string;
  checklist: string;
};

type Tally = { species: Set<string>; observations: number; checklists: Set<string> };

const blank = (): Tally => ({ species: new Set(), observations: 0, checklists: new Set() });
const counted = (t: Tally): Counts => ({
  species: t.species.size,
  observations: t.observations,
  checklists: t.checklists.size,
});

function tallyBy<T>(items: T[], key: (item: T) => string | undefined, species: (item: T) => string, list: (item: T) => string) {
  const map = new Map<string, Tally>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    const t = map.get(k) ?? blank();
    t.species.add(species(item));
    t.observations += 1;
    t.checklists.add(list(item));
    map.set(k, t);
  }
  return map;
}

/** Sightings that came from eBird: the only ones with a checklist and a place. */
const fromEbird = (s: SightingEntry) => Boolean(s.data.checklist && s.data.region);

export function lifeStats(all: SightingEntry[], geo: Geography, latestCount = 7) {
  const rows = all.filter(fromEbird);
  const sp = (s: SightingEntry) => s.data.scientific;
  const list = (s: SightingEntry) => s.data.checklist!;

  const byCountryMap = tallyBy(rows, (s) => s.data.country, sp, list);
  const byRegionMap = tallyBy(rows, (s) => s.data.region, sp, list);
  const byYearMap = tallyBy(rows, (s) => s.date.slice(0, 4), sp, list);

  // A species' first sighting is its place on the list.
  const first = new Map<string, SightingEntry>();
  for (const s of [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))) {
    if (!first.has(s.data.scientific)) first.set(s.data.scientific, s);
  }
  const lifers = [...first.values()];
  const lastLifer = lifers.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];

  // Every year from the first to the last, so a year with nothing is a gap, not a skip.
  const years = [...byYearMap.keys()].sort();
  const byYear: Year[] = [];
  if (years.length) {
    let life = 0;
    for (let y = Number(years[0]); y <= Number(years.at(-1)); y++) {
      const key = String(y);
      const t = byYearMap.get(key);
      life += lifers.filter((s) => s.date.startsWith(key)).length;
      byYear.push({
        year: key,
        species: t?.species.size ?? 0,
        observations: t?.observations ?? 0,
        checklists: t?.checklists.size ?? 0,
        life,
      });
    }
  }

  const byCountry: Ranked[] = [...byCountryMap]
    .map(([code, t]) => ({ code, name: geo.country(code).name, type: geo.country(code).type, counts: counted(t) }))
    .sort((a, b) => b.counts.species - a.counts.species || a.name.localeCompare(b.name));

  // Major regions: a species counts in each region that holds a place it was seen in.
  const placed = rows.map((s) => {
    const c = geo.country(s.data.country!);
    return {
      s,
      where: {
        country: s.data.country!,
        region: s.data.region!,
        continent: c.continent,
        subregion: c.subregion,
      } satisfies Where,
    };
  });
  const defined = majorRegions.filter((r): r is MajorRegion & { has: NonNullable<MajorRegion["has"]> } => Boolean(r.has));
  const byMajor = defined.map((r) => {
    const t = blank();
    for (const { s, where } of placed) {
      if (!r.has(where)) continue;
      t.species.add(s.data.scientific);
      t.observations += 1;
      t.checklists.add(s.data.checklist!);
    }
    return { name: r.name, group: r.group, counts: counted(t) };
  });

  const latest: Latest[] = [...rows]
    .sort((a, b) => b.date.localeCompare(a.date) || b.data.checklist!.localeCompare(a.data.checklist!))
    .slice(0, latestCount)
    .map((s) => ({
      id: s.id,
      date: s.date,
      species: s.data.species,
      scientific: s.data.scientific,
      where: [s.data.county, s.data.region!.includes("-") ? geo.region(s.data.region!) : geo.country(s.data.country!).name]
        .filter(Boolean)
        .join(", "),
      checklist: s.data.checklist!,
    }));

  const countries = Object.fromEntries([...byCountryMap].map(([k, t]) => [k, counted(t)]));
  const regions = Object.fromEntries([...byRegionMap].map(([k, t]) => [k, counted(t)]));

  return {
    totals: {
      species: first.size,
      observations: rows.length,
      checklists: new Set(rows.map(list)).size,
      countries: byCountryMap.size,
      // Where eBird has a state or province, the code has one.
      regions: [...byRegionMap.keys()].filter((k) => k.includes("-")).length,
      years: byYear.filter((y) => y.checklists > 0).length,
      since: years[0],
      lastLifer: lastLifer
        ? { species: lastLifer.data.species, scientific: lastLifer.data.scientific, date: lastLifer.date, id: lastLifer.id }
        : undefined,
    },
    byYear,
    byCountry,
    byMajor,
    undefinedRegions: majorRegions.length - defined.length,
    map: { countries, regions },
    latest,
  };
}
