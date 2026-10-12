// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readEbird, snap, type Policy } from "./read";

/*
 * The export's header, as eBird writes it, and invented rows: the real
 * export is never a fixture. The private cells are filled on purpose, so a
 * test can see that none comes out.
 */
const header =
  "Submission ID,Common Name,Scientific Name,Taxonomic Order,Count,State/Province,County,Location ID,Location,Latitude,Longitude,Date,Time,Protocol,Duration (Min),All Obs Reported,Distance Traveled (km),Area Covered (ha),Number of Observers,Breeding Code,Observation Details,Checklist Comments,ML Catalog Numbers";

const line = (o: {
  id: string;
  name: string;
  sci: string;
  order: number;
  region: string;
  county: string;
  loc: string;
  place: string;
  lat: number;
  lon: number;
  date: string;
  time: string;
  comment?: string;
}) =>
  [
    o.id,
    o.name,
    o.sci,
    o.order,
    "X",
    o.region,
    o.county,
    o.loc,
    o.place,
    o.lat,
    o.lon,
    o.date,
    o.time,
    "eBird - Casual Observation",
    "",
    "0",
    "",
    "",
    "1",
    "",
    "SECRET-DETAILS",
    o.comment ?? "SECRET-COMMENT",
    "1234567",
  ].join(",");

const csv = [
  header,
  line({ id: "S1", name: "Mallard", sci: "Anas platyrhynchos", order: 545, region: "US-NC", county: "Mecklenburg", loc: "L1", place: "Test Residence 12 Elm St", lat: 35.143919, lon: -80.818071, date: "2026-03-14", time: "04:04 PM" }),
  line({ id: "S2", name: "Mallard", sci: "Anas platyrhynchos", order: 545, region: "US-NC", county: "Mecklenburg", loc: "L1", place: "Test Residence 12 Elm St", lat: 35.143919, lon: -80.818071, date: "2026-03-14", time: "09:30 AM" }),
  line({ id: "S3", name: "Blue Jay", sci: "Cyanocitta cristata", order: 21294, region: "US-MI", county: "Wayne", loc: "L2", place: "Red Dot", lat: 42.435761, lon: -83.483851, date: "2025-10-18", time: "02:44 PM" }),
  line({ id: "S4", name: "Great-tailed Grackle", sci: "Quiscalus mexicanus", order: 33864, region: "MX-ROO", county: "Isla Mujeres", loc: "L3", place: "Garza Blanca", lat: 21.230842, lon: -86.803855, date: "2026-04-25", time: "01:51 PM" }),
  "",
].join("\n");

const policy: Policy = {
  cell: 0.1,
  places: { L2: { label: "A public park", exact: true }, L3: { hide: true } },
};

describe("reading an eBird export", () => {
  const { sightings, problems } = readEbird(csv, "ebird/MyEBirdData.csv", policy);

  it("reads every row and has nothing to report", () => {
    expect(problems).toEqual([]);
    expect(sightings).toHaveLength(4);
  });

  it("puts the newest first, ordering a day by its time", () => {
    expect(sightings.map((s) => s.checklist)).toEqual(["S4", "S1", "S2", "S3"]);
  });

  it("emits exactly the named keys and no others", () => {
    for (const s of sightings) {
      expect(Object.keys(s).sort()).toEqual(
        [
          "area", "checklist", "country", "county", "date", "place",
          "region", "scientific", "species", "taxon",
        ].sort(),
      );
    }
  });

  it("lets nothing private through, whatever the policy does", () => {
    const out = JSON.stringify(sightings);
    for (const secret of ["SECRET-DETAILS", "SECRET-COMMENT", "1234567", "Residence", "Elm St", "04:04", "35.143919", "-80.818071", "Garza Blanca", "21.230842"]) {
      expect(out, secret).not.toContain(secret);
    }
  });

  it("rounds an unlisted place to a cell and says only its county", () => {
    const s = sightings.find((x) => x.checklist === "S1")!;
    expect(s.place).toBe("Mecklenburg");
    expect(s.area).toEqual({ kind: "cell", lon: -80.85, lat: 35.15, size: 0.1 });
  });

  it("shows a listed place by its label and its real point", () => {
    const s = sightings.find((x) => x.checklist === "S3")!;
    expect(s.place).toBe("A public park");
    expect(s.area).toEqual({ kind: "exact", lon: -83.483851, lat: 42.435761 });
  });

  it("draws no point for a hidden place, and still counts its county and region", () => {
    const s = sightings.find((x) => x.checklist === "S4")!;
    expect(s.area).toBeUndefined();
    expect(s.region).toBe("MX-ROO");
    expect(s.country).toBe("MX");
    expect(s.county).toBe("Isla Mujeres");
  });

  it("names a bad row by its line", () => {
    const bad = csv.replace("S3,", "X3,");
    const out = readEbird(bad, "ebird/MyEBirdData.csv", policy);
    expect(out.problems).toEqual([
      "ebird/MyEBirdData.csv:4: Submission ID: expected S followed by digits",
    ]);
    expect(out.sightings).toHaveLength(3);
  });

  it("names a missing column once, and reads nothing", () => {
    const out = readEbird(csv.replace("Latitude", "Lat"), "x.csv", policy);
    expect(out.problems).toEqual(['x.csv: has no "Latitude" column']);
    expect(out.sightings).toEqual([]);
  });
});

describe("snap", () => {
  it("is the middle of the cell, and the same for every point in it", () => {
    expect(snap(35.1001, 0.1)).toBe(35.15);
    expect(snap(35.1999, 0.1)).toBe(35.15);
    expect(snap(-80.81, 0.1)).toBe(-80.85);
    expect(snap(-80.8999, 0.1)).toBe(-80.85);
  });
});
