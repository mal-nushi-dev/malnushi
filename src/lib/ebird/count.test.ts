import { describe, expect, it } from "vitest";
import { speciesBy } from "./count";
import type { Sighting } from "./read";

const s = (scientific: string, region: string): Sighting => ({
  checklist: "S1",
  species: scientific,
  scientific,
  taxon: 1,
  date: "2026-01-01",
  country: region.split("-")[0],
  region,
  county: "",
  place: "",
});

describe("speciesBy", () => {
  const all = [s("a", "US-NC"), s("a", "US-NC"), s("b", "US-NC"), s("a", "US-NY")];

  it("counts a species once in a place, however many times it was seen there", () => {
    expect(speciesBy(all, (x) => x.region)).toEqual({ "US-NC": 2, "US-NY": 1 });
  });

  it("counts a species in each place it was seen, so places add up to more than the list", () => {
    expect(speciesBy(all, (x) => x.country)).toEqual({ US: 2 });
  });
});
