// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/load";
import { createQueries } from "@/lib/content/query";
import { folder, problemsOf, site } from "@/lib/content/testing";
import { majorRegions } from "./regions";
import { lifeStats, type Geography } from "./stats";

/*
 * An invented export, read the way the build reads it, then counted. The
 * private columns are filled so that nothing can be seen to leak.
 */
const header =
  "Submission ID,Common Name,Scientific Name,Taxonomic Order,Count,State/Province,County,Location ID,Location,Latitude,Longitude,Date,Time,Protocol,Duration (Min),All Obs Reported,Distance Traveled (km),Area Covered (ha),Number of Observers,Breeding Code,Observation Details,Checklist Comments,ML Catalog Numbers";
const row = (id: string, name: string, sci: string, region: string, county: string, date: string, time = "01:00 PM") =>
  `${id},${name},${sci},100,X,${region},${county},L1,Secret Place,35.1,-80.8,${date},${time},eBird - Casual Observation,,0,,,1,,SECRET,SECRET,`;

const csv = [
  header,
  row("S1", "Mallard", "Anas platyrhynchos", "US-NC", "Mecklenburg", "2025-03-14"),
  row("S2", "Blue Jay", "Cyanocitta cristata", "US-MI", "Wayne", "2025-10-18"),
  row("S3", "Mallard", "Anas platyrhynchos", "US-NC", "Mecklenburg", "2026-03-14", "09:00 AM"),
  row("S4", "Mallard", "Anas platyrhynchos", "US-NC", "Mecklenburg", "2026-03-14", "04:00 PM"),
  row("S5", "Great-tailed Grackle", "Quiscalus mexicanus", "MX-ROO", "Isla Mujeres", "2026-04-25"),
  "",
].join("\n");

const geo: Geography = {
  country: (code) =>
    ({
      US: { name: "United States of America", type: "Country", continent: "North America", subregion: "Northern America" },
      MX: { name: "Mexico", type: "Sovereign country", continent: "North America", subregion: "Central America" },
    })[code]!,
  region: (code) => ({ "US-NC": "North Carolina", "US-MI": "Michigan", "MX-ROO": "Quintana Roo" })[code] ?? code,
};

describe("the eBird export in the content folder", async () => {
  const root = await folder({ ...site(), "ebird/MyEBirdData.csv": csv });
  const q = createQueries(await loadContent(root));
  const sightings = q.list("sighting").filter((s) => s.data.checklist);

  it("is one sighting a row, numbered when a species is seen twice in a day", () => {
    expect(sightings.map((s) => s.id).sort()).toEqual([
      "2025-03-14-mallard",
      "2025-10-18-blue-jay",
      "2026-03-14-mallard",
      "2026-03-14-mallard-2",
      "2026-04-25-great-tailed-grackle",
    ]);
  });

  it("anchors a sighting on the table under the life list", () => {
    expect(q.need("sighting", "2025-10-18-blue-jay").url).toBe(
      "/collections/life-list/log#2025-10-18-blue-jay",
    );
  });

  it("has what the policy lets a page say and nothing else", () => {
    const blue = q.need("sighting", "2025-10-18-blue-jay");
    expect(blue.data).toMatchObject({
      species: "Blue Jay",
      checklist: "S2",
      country: "US",
      region: "US-MI",
      county: "Wayne",
      place: "Wayne",
      area: { kind: "cell", size: 0.1 },
    });
    expect(JSON.stringify([...q.list("sighting")])).not.toMatch(/SECRET|Secret Place|35\.1,|-80\.8,/);
    expect(JSON.stringify(blue)).not.toContain("1:00");
  });

  it("names a file it does not expect", async () => {
    const out = await problemsOf(await folder({ ...site(), "ebird/notes.txt": "x" }));
    expect(out).toContain("ebird/notes.txt: expected MyEBirdData.csv only");
  });

  it("reports a bad row by its line", async () => {
    const bad = csv.replace("S2,", "X2,");
    const out = await problemsOf(await folder({ ...site(), "ebird/MyEBirdData.csv": bad }));
    expect(out).toEqual([
      "ebird/MyEBirdData.csv:3: Submission ID: expected S followed by digits",
    ]);
  });

  describe("counted", () => {
    const stats = lifeStats(sightings, geo);

    it("says how much there is, counting a species once", () => {
      expect(stats.totals).toMatchObject({
        species: 3,
        observations: 5,
        checklists: 5,
        countries: 2,
        regions: 3,
        years: 2,
        since: "2025",
      });
      expect(stats.totals.lastLifer).toMatchObject({ species: "Great-tailed Grackle", date: "2026-04-25" });
    });

    it("counts a year by what was seen in it, and keeps the running total", () => {
      expect(stats.byYear).toEqual([
        { year: "2025", species: 2, observations: 2, checklists: 2, life: 2 },
        { year: "2026", species: 2, observations: 3, checklists: 3, life: 3 },
      ]);
    });

    it("ranks countries by species", () => {
      expect(stats.byCountry.map((c) => [c.code, c.counts.species, c.counts.observations])).toEqual([
        ["US", 2, 4],
        ["MX", 1, 1],
      ]);
    });

    it("counts a species in every major region that holds a place it was seen", () => {
      const of = Object.fromEntries(stats.byMajor.map((r) => [r.name, r.counts.species]));
      expect(of).toMatchObject({
        World: 3,
        "Western Hemisphere": 3,
        "North America": 3,
        "USA Lower 48": 2,
        "ABA Area": 2,
        "Latin America & Caribbean": 1,
        // Mexico is in Natural Earth's Central America and not in eBird's.
        "Central America": 0,
        "Eastern Hemisphere": 0,
      });
    });

    it("says how many regions have no membership yet", () => {
      expect(stats.undefinedRegions).toBe(majorRegions.filter((r) => !r.has).length);
      expect(stats.undefinedRegions).toBeGreaterThan(0);
    });

    it("counts the map by each measure", () => {
      expect(stats.map.countries.US).toEqual({ species: 2, observations: 4, checklists: 4 });
      expect(stats.map.regions["US-NC"]).toEqual({ species: 1, observations: 3, checklists: 3 });
    });

    it("lists the newest first, with where in words", () => {
      expect(stats.latest[0]).toMatchObject({
        species: "Great-tailed Grackle",
        where: "Isla Mujeres, Quintana Roo",
        checklist: "S5",
      });
      // Two on one day: the later checklist number first.
      expect(stats.latest.slice(1, 3).map((l) => l.checklist)).toEqual(["S4", "S3"]);
    });
  });
});
