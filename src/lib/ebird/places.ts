import { readFileSync } from "node:fs";
import path from "node:path";

/*
 * What the build knows about a place from the geometry in public/geo (see
 * scripts/geo.mjs): its name, and for a country, what it is and where. Read
 * once, at build time, from the same files the map draws.
 */

export type Country = {
  code: string;
  name: string;
  /** "Sovereign country", "Dependency", "Country", "Disputed"… as Natural Earth has it. */
  type: string;
  continent: string;
  subregion: string;
};

const geo = path.join(process.cwd(), "public/geo");
let countries: Record<string, Country> | undefined;
const regions = new Map<string, Record<string, string>>();

/** Every country, territory and dependency, by its code. */
export function countryTable() {
  if (!countries) {
    const file = JSON.parse(readFileSync(path.join(geo, "countries.json"), "utf8")) as {
      features: { properties: Country }[];
    };
    countries = Object.fromEntries(
      file.features.map((f) => [
        f.properties.code,
        { ...f.properties, name: commonNames[f.properties.code] ?? f.properties.name },
      ]),
    );
  }
  return countries;
}

/** Where Natural Earth's short name is not the one a person says. */
const commonNames: Record<string, string> = {
  US: "United States",
};

/** The state or province named by an ISO 3166-2 code ("US-NC"), or the code. */
export function regionName(code: string) {
  const country = code.split("-")[0];
  if (!regions.has(country)) {
    try {
      const file = JSON.parse(readFileSync(path.join(geo, "regions", `${country}.json`), "utf8")) as {
        features: { properties: { code: string; name: string } }[];
      };
      regions.set(country, Object.fromEntries(file.features.map((f) => [f.properties.code, f.properties.name])));
    } catch {
      regions.set(country, {});
    }
  }
  return regions.get(country)![code] ?? code;
}
