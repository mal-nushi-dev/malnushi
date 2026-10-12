/*
 * eBird's major regions, as Mal's life list is read by them. They overlap
 * (the Lower 48 is inside the ABA Area, which is inside North America), so a
 * species counts in every region that holds a place it was seen in.
 *
 * Membership is drafted from Natural Earth's continents and subregions and
 * from my reading of eBird's own lists: it has not been checked against
 * eBird. Compare a region's count here with the same region on eBird's life
 * list page. A region with no `has` is listed but not defined yet: it counts
 * nothing, and is said to be undefined rather than guessed at.
 */

/** Where a sighting was: its country and, where eBird has one, its state or province. */
export type Where = {
  country: string;
  region: string;
  continent: string;
  subregion: string;
};

export type MajorRegion = {
  name: string;
  group: "World" | "Americas" | "Eastern Hemisphere" | "Birding areas" | "Islands and oceans";
  has?: (where: Where) => boolean;
};

const inAny = (codes: string[]) => (w: Where) => codes.includes(w.region) || codes.includes(w.country);
const BORNEO_MY = ["MY-12", "MY-13", "MY-15"];
const BORNEO = ["BN", ...BORNEO_MY, "ID-KB", "ID-KT", "ID-KS", "ID-KI", "ID-KU"];

export const majorRegions: MajorRegion[] = [
  { name: "World", group: "World", has: () => true },

  {
    name: "Western Hemisphere",
    group: "Americas",
    has: (w) => w.continent === "North America" || w.continent === "South America",
  },
  { name: "North America", group: "Americas", has: (w) => w.continent === "North America" },
  {
    name: "Central America",
    group: "Americas",
    has: (w) => w.subregion === "Central America" && w.country !== "MX",
  },
  { name: "West Indies", group: "Americas", has: (w) => w.subregion === "Caribbean" },
  { name: "Caribbean", group: "Americas" },
  {
    name: "USA Lower 48",
    group: "Americas",
    has: (w) => w.country === "US" && w.region !== "US-AK" && w.region !== "US-HI",
  },
  { name: "ABA Area", group: "Birding areas", has: inAny(["US", "CA", "PM"]) },
  {
    name: "ABA Continental",
    group: "Birding areas",
    has: (w) => ["US", "CA", "PM"].includes(w.country) && w.region !== "US-HI",
  },
  { name: "AOU Area", group: "Birding areas" },
  {
    name: "Latin America & Caribbean",
    group: "Americas",
    has: (w) =>
      w.continent === "South America" ||
      (w.continent === "North America" && !["US", "CA", "BM", "GL", "PM"].includes(w.country)),
  },
  { name: "South America", group: "Americas", has: (w) => w.continent === "South America" },

  {
    name: "Eastern Hemisphere",
    group: "Eastern Hemisphere",
    has: (w) => ["Europe", "Asia", "Africa", "Oceania"].includes(w.continent),
  },
  { name: "Africa", group: "Eastern Hemisphere", has: (w) => w.continent === "Africa" },
  { name: "Africa (ABA)", group: "Birding areas" },
  {
    name: "Southern Africa",
    group: "Eastern Hemisphere",
    has: (w) => w.subregion === "Southern Africa",
  },
  {
    name: "Eurasia",
    group: "Eastern Hemisphere",
    has: (w) => w.continent === "Europe" || w.continent === "Asia",
  },
  { name: "Western Palearctic", group: "Birding areas" },
  { name: "Europe", group: "Eastern Hemisphere", has: (w) => w.continent === "Europe" },
  { name: "Asia", group: "Eastern Hemisphere", has: (w) => w.continent === "Asia" },
  { name: "Middle East", group: "Eastern Hemisphere" },
  { name: "OSME Region", group: "Birding areas" },
  { name: "Australasia", group: "Eastern Hemisphere", has: (w) => w.continent === "Oceania" },
  { name: "Australasia (ABA)", group: "Birding areas" },
  { name: "Australia and Territories", group: "Eastern Hemisphere", has: inAny(["AU"]) },
  { name: "South Polar", group: "Eastern Hemisphere", has: (w) => w.continent === "Antarctica" },

  { name: "Atlantic/Arctic Oceans", group: "Islands and oceans" },
  { name: "Indian Ocean", group: "Islands and oceans" },
  { name: "Pacific Ocean", group: "Islands and oceans" },
  { name: "Island of Hispaniola", group: "Islands and oceans", has: inAny(["HT", "DO"]) },
  { name: "Island of New Guinea", group: "Islands and oceans" },
  { name: "Island of Borneo", group: "Islands and oceans", has: inAny(BORNEO) },
  { name: "Malaysia (Borneo)", group: "Islands and oceans", has: inAny(BORNEO_MY) },
  {
    name: "Malaysia (Peninsula)",
    group: "Islands and oceans",
    has: (w) => w.country === "MY" && !BORNEO_MY.includes(w.region),
  },
  {
    name: "Mainland Portugal",
    group: "Islands and oceans",
    has: (w) => w.country === "PT" && w.region !== "PT-20" && w.region !== "PT-30",
  },
];
