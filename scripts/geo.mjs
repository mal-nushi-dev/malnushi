/*
 * Makes the region maps' geometry from Natural Earth (public domain):
 *
 *   npm run geo -- path/to/ne_10m_admin_0_countries path/to/ne_10m_admin_1_states_provinces
 *
 * Each argument is the folder an unzipped download makes, which holds the
 * .shp and .dbf of the same name:
 *
 *   https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip
 *   https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
 *
 * It writes, all committed:
 *
 *   public/geo/countries.json      every country, territory and dependency, with
 *                                  its continent and subregion
 *   public/geo/regions/<XX>.json   one country's states or provinces, which
 *                                  the map loads only when it is drilled into
 *
 * A country is keyed by its two-letter code (Natural Earth's ISO_A2_EH, which
 * has France and Norway where ISO_A2 has none) and a region by its ISO 3166-2
 * code, which is what eBird's State/Province column holds ("US-NC").
 *
 * The shapefile is read here, by hand, as flights.mjs reads its CSV: the
 * format is small and a dependency for one script is not worth it. Lines are
 * simplified with Douglas-Peucker and rounded. Neighbours are simplified
 * apart, so a hairline gap may open between two: the map draws a border over
 * it.
 */
import fs from "node:fs";
import path from "node:path";

const [countriesDir, regionsDir] = process.argv.slice(2);
if (!countriesDir || !regionsDir) {
  console.error("usage: npm run geo -- <admin_0 folder> <admin_1 folder>");
  process.exit(1);
}

/* ---- DBF ---- */

function readDbf(file) {
  const buf = fs.readFileSync(file);
  const count = buf.readUInt32LE(4);
  const headerLength = buf.readUInt16LE(8);
  const recordLength = buf.readUInt16LE(10);
  const fields = [];
  for (let at = 32; buf[at] !== 0x0d; at += 32) {
    fields.push({
      name: buf.toString("latin1", at, at + 11).replace(/\0.*$/, ""),
      length: buf[at + 16],
    });
  }
  const rows = [];
  for (let i = 0; i < count; i++) {
    let at = headerLength + i * recordLength + 1;
    const row = {};
    for (const f of fields) {
      row[f.name] = buf
        .toString("utf8", at, at + f.length)
        .replace(/\0/g, "")
        .trim();
      at += f.length;
    }
    rows.push(row);
  }
  return rows;
}

/* ---- SHP (polygons only) ---- */

/** Each record's rings, as arrays of [lon, lat], or null for a null shape. */
function readShp(file) {
  const buf = fs.readFileSync(file);
  const records = [];
  for (let at = 100; at < buf.length; ) {
    const length = buf.readInt32BE(at + 4) * 2;
    const body = at + 8;
    const type = buf.readInt32LE(body);
    if (type === 0) records.push(null);
    else if (type === 5) {
      const parts = buf.readInt32LE(body + 36);
      const points = buf.readInt32LE(body + 40);
      const starts = [];
      for (let p = 0; p < parts; p++) starts.push(buf.readInt32LE(body + 44 + p * 4));
      const pointsAt = body + 44 + parts * 4;
      const rings = starts.map((start, p) => {
        const end = p + 1 < parts ? starts[p + 1] : points;
        const ring = [];
        for (let i = start; i < end; i++) {
          ring.push([buf.readDoubleLE(pointsAt + i * 16), buf.readDoubleLE(pointsAt + i * 16 + 8)]);
        }
        return ring;
      });
      records.push(rings);
    } else throw new Error(`${file}: shape type ${type} is not a polygon`);
    at = body + length;
  }
  return records;
}

/* ---- Geometry ---- */

/** Positive when the ring is counter-clockwise. */
function area(ring) {
  let sum = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return sum / 2;
}

function inside([x, y], ring) {
  let yes = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) yes = !yes;
  }
  return yes;
}

/** Douglas-Peucker on an open run of points, keeping both ends. */
function simplifyRun(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  const t2 = tolerance * tolerance;
  while (stack.length) {
    const [a, b] = stack.pop();
    let worst = 0;
    let at = -1;
    const [ax, ay] = points[a];
    const dx = points[b][0] - ax;
    const dy = points[b][1] - ay;
    const len2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      let px = points[i][0] - ax;
      let py = points[i][1] - ay;
      if (len2 > 0) {
        const u = Math.max(0, Math.min(1, (px * dx + py * dy) / len2));
        px -= u * dx;
        py -= u * dy;
      }
      const d2 = px * px + py * py;
      if (d2 > worst) {
        worst = d2;
        at = i;
      }
    }
    if (worst > t2 && at > 0) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** A closed ring, simplified. Null when too little of it is left to be a ring. */
function simplifyRing(ring, tolerance) {
  // Split at the farthest point from the start so a closed ring has two runs to pull on.
  let far = 0;
  let best = -1;
  for (let i = 1; i < ring.length - 1; i++) {
    const d = (ring[i][0] - ring[0][0]) ** 2 + (ring[i][1] - ring[0][1]) ** 2;
    if (d > best) {
      best = d;
      far = i;
    }
  }
  if (far === 0) return null;
  const a = simplifyRun(ring.slice(0, far + 1), tolerance);
  const b = simplifyRun(ring.slice(far), tolerance);
  const out = [...a, ...b.slice(1)];
  return out.length >= 4 ? out : null;
}

const round = (n, places) => Number(n.toFixed(places));

/**
 * Natural Earth's rings as a MultiPolygon: shapefile outer rings run
 * clockwise and holes counter-clockwise, GeoJSON's the other way, and each
 * hole goes to the smallest outer ring that has it.
 * `floor` drops a polygon smaller than that many square degrees, except the
 * biggest, so no place disappears.
 */
function toMultiPolygon(rings, { tolerance, floor, places }) {
  const outers = [];
  const holes = [];
  for (const ring of rings) (area(ring) < 0 ? outers : holes).push(ring);
  if (!outers.length) return null;
  const polygons = outers.map((outer) => ({ outer, holes: [], size: Math.abs(area(outer)) }));
  for (const hole of holes) {
    const owner = polygons
      .filter((p) => inside(hole[0], p.outer))
      .sort((a, b) => a.size - b.size)[0];
    if (owner) owner.holes.push(hole);
  }
  polygons.sort((a, b) => b.size - a.size);
  const kept = [];
  for (const [i, p] of polygons.entries()) {
    if (i > 0 && p.size < floor) continue;
    // The biggest polygon is simplified more gently, so a small place stays a shape.
    const t = i === 0 && p.size < tolerance * tolerance * 400 ? tolerance / 4 : tolerance;
    const outer = simplifyRing(p.outer, t);
    if (!outer) continue;
    const rounded = (r) => r.map(([x, y]) => [round(x, places), round(y, places)]);
    const poly = [rounded(outer.slice().reverse())];
    for (const hole of p.holes) {
      const h = simplifyRing(hole, t);
      if (h) poly.push(rounded(h.slice().reverse()));
    }
    kept.push(poly);
  }
  return kept.length ? { type: "MultiPolygon", coordinates: kept } : null;
}

/* ---- Run ---- */

function load(dir) {
  const base = path.join(dir, path.basename(dir));
  const attributes = readDbf(`${base}.dbf`);
  const shapes = readShp(`${base}.shp`);
  if (attributes.length !== shapes.length) throw new Error(`${dir}: the .dbf and .shp disagree`);
  return attributes.map((properties, i) => ({ properties, rings: shapes[i] }));
}

const out = path.join(process.cwd(), "public/geo");
fs.mkdirSync(path.join(out, "regions"), { recursive: true });

// Countries, territories and dependencies.
{
  const features = [];
  const seen = new Set();
  for (const { properties: p, rings } of load(countriesDir)) {
    if (!rings) continue;
    const code = p.ISO_A2_EH !== "-99" && p.ISO_A2_EH ? p.ISO_A2_EH : p.ADM0_A3;
    if (seen.has(code)) {
      console.warn(`countries: ${code} (${p.NAME}) is a second feature for a code: skipped`);
      continue;
    }
    seen.add(code);
    const geometry = toMultiPolygon(rings, { tolerance: 0.03, floor: 0.0008, places: 2 });
    if (!geometry) continue;
    features.push({
      type: "Feature",
      properties: {
        code,
        name: p.NAME,
        type: p.TYPE,
        // Natural Earth's own grouping, which the life list's regions are built from.
        continent: p.CONTINENT,
        subregion: p.SUBREGION,
      },
      geometry,
    });
  }
  const file = path.join(out, "countries.json");
  fs.writeFileSync(file, JSON.stringify({ type: "FeatureCollection", features }));
  console.log(`countries.json: ${features.length} features, ${(fs.statSync(file).size / 1e3).toFixed(0)} kB`);
}

// States and provinces, a file for each country, merged by code.
{
  const byCountry = new Map();
  for (const { properties: p, rings } of load(regionsDir)) {
    const code = p.iso_3166_2;
    if (!rings || !code || code.startsWith("-")) continue;
    const country = code.split("-")[0];
    const merged = byCountry.get(country) ?? new Map();
    const entry = merged.get(code) ?? { name: p.name, rings: [] };
    entry.rings.push(...rings);
    merged.set(code, entry);
    byCountry.set(country, merged);
  }
  let total = 0;
  for (const [country, merged] of byCountry) {
    const features = [];
    for (const [code, { name, rings }] of merged) {
      const geometry = toMultiPolygon(rings, { tolerance: 0.01, floor: 0.0002, places: 3 });
      if (geometry) features.push({ type: "Feature", properties: { code, name }, geometry });
    }
    const file = path.join(out, "regions", `${country}.json`);
    fs.writeFileSync(file, JSON.stringify({ type: "FeatureCollection", features }));
    total += fs.statSync(file).size;
  }
  console.log(`regions/: ${byCountry.size} countries, ${(total / 1e6).toFixed(1)} MB in all`);
}
