import type { Sighting } from "./read";

/** How many different species were seen in each place, by whatever names a sighting's place. */
export function speciesBy(sightings: Sighting[], place: (s: Sighting) => string) {
  const seen = new Map<string, Set<string>>();
  for (const s of sightings) {
    const key = place(s);
    const set = seen.get(key) ?? new Set<string>();
    set.add(s.scientific);
    seen.set(key, set);
  }
  return Object.fromEntries([...seen].map(([key, set]) => [key, set.size]));
}
