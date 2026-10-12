import { z } from "zod";
import { parseTable } from "@/lib/content/csv";

/*
 * eBird's "Download My Data" export, read into sightings. The export holds
 * more than the site should say (home addresses, other people's names, the
 * time of day, free-text comments), so nothing is passed through: every
 * field of a sighting is named here, and a column that is not named cannot
 * reach a page. The policy, which says how each place is shown, is a
 * parameter: it lives in code (see policy.ts), where Mal decides it.
 */

/** How one place (an eBird location, by its ID) is shown. Anything not listed is rounded. */
export type PlacePolicy = {
  /** What the site calls it. Without one, the county is all it says. */
  label?: string;
  /** Show the real point, not the cell it is in. */
  exact?: true;
  /** Draw no point at all. The county still counts. */
  hide?: true;
};

export type Policy = {
  /** Side of the cell a point is rounded to, in degrees (0.1 is about 11 km). */
  cell: number;
  places: Record<string, PlacePolicy>;
};

/** Where a sighting was, to the precision the policy allows. */
export type Area =
  | { kind: "exact"; lon: number; lat: number }
  | { kind: "cell"; lon: number; lat: number; size: number };

/** One bird, on one checklist. Exactly these keys: no more, ever. */
export type Sighting = {
  /** The eBird checklist, S followed by digits: ebird.org/checklist/<id>. */
  checklist: string;
  species: string;
  scientific: string;
  /** eBird's taxonomic order: sorts species the way a field guide does. */
  taxon: number;
  date: string;
  /** Two letters: US. */
  country: string;
  /** The state or province, as eBird codes it: US-NC. Equal to the country when eBird has none. */
  region: string;
  county: string;
  /** What the site calls the place: the policy's label, or the county. */
  place: string;
  area?: Area;
};

/** Only the columns used. A schema that is not strict drops the rest on parse. */
const row = z.object({
  "Submission ID": z.string().regex(/^S\d+$/, "expected S followed by digits"),
  "Common Name": z.string().min(1),
  "Scientific Name": z.string().min(1),
  "Taxonomic Order": z.string().regex(/^\d+$/, "expected a number"),
  "State/Province": z.string().regex(/^[A-Z]{2,3}(-[A-Z0-9]+)?$/, "expected a code such as US-NC"),
  County: z.string(),
  "Location ID": z.string().regex(/^L\d+$/, "expected L followed by digits"),
  Latitude: z.coerce.number().min(-90).max(90),
  Longitude: z.coerce.number().min(-180).max(180),
  Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  // Read to put the day's sightings in order. Never emitted.
  Time: z.string(),
});

const toMinutes = (time: string) => {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time.trim());
  if (!m) return 0;
  return ((Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]);
};

/** The middle of the cell a coordinate falls in, to the cell's own decimals. */
export function snap(value: number, size: number) {
  const digits = Math.max(0, Math.ceil(-Math.log10(size)) + 1);
  return Number(((Math.floor(value / size) + 0.5) * size).toFixed(digits));
}

function areaOf(lon: number, lat: number, policy: PlacePolicy | undefined, cell: number): Area | undefined {
  if (policy?.hide) return undefined;
  if (policy?.exact) return { kind: "exact", lon, lat };
  return { kind: "cell", lon: snap(lon, cell), lat: snap(lat, cell), size: cell };
}

/**
 * Every sighting in an export, newest first, and a problem for each row that
 * could not be read, named by its line as the content loader names them.
 */
export function readEbird(text: string, source: string, policy: Policy) {
  const problems: string[] = [];
  const { header, rows } = parseTable(text);
  for (const need of Object.keys(row.shape)) {
    if (!header.includes(need)) problems.push(`${source}: has no "${need}" column`);
  }
  if (problems.length) return { sightings: [] as Sighting[], problems };

  const read: { sighting: Sighting; time: number }[] = [];
  for (const { line, cells } of rows) {
    const parsed = row.safeParse(cells);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push(`${source}:${line}: ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }
    const r = parsed.data;
    const place = policy.places[r["Location ID"]];
    const [country] = r["State/Province"].split("-");
    read.push({
      time: toMinutes(r.Time),
      sighting: {
        checklist: r["Submission ID"],
        species: r["Common Name"],
        scientific: r["Scientific Name"],
        taxon: Number(r["Taxonomic Order"]),
        date: r.Date,
        country,
        region: r["State/Province"],
        county: r.County,
        place: place?.label ?? r.County,
        area: areaOf(r.Longitude, r.Latitude, place, policy.cell),
      },
    });
  }
  read.sort(
    (a, b) =>
      b.sighting.date.localeCompare(a.sighting.date) ||
      b.time - a.time ||
      b.sighting.checklist.localeCompare(a.sighting.checklist),
  );
  return { sightings: read.map((r) => r.sighting), problems };
}
