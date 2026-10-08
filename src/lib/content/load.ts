import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { greatCircleKm } from "@/lib/flights/distance";
import { parseTable } from "./csv";
import { fieldOf, isBefore, orientationOf } from "./format";
import { jpegSize } from "./image-size";
import { definitions, edges, type Described } from "./kinds";
import { idPattern, pageless, refsInBody, toRef, urlFor, type Kind } from "./refs";
import {
  airportsFile,
  cabins,
  cellValue,
  collectionFile,
  flightRow,
  photoData,
  photoOverrides,
  reasons,
  seats,
  type Airport,
  type Entry,
  type Facet,
  type Rel,
} from "./schema";

/*
 * Reads the content folder into one index. Nothing is fetched and nothing
 * runs per request: pages are static, so this happens while the site builds.
 * Every problem in the folder is collected and reported together, each with
 * the file it is in.
 */

export type ContentIndex = {
  /** Every entry, by ref. */
  entries: Map<string, Entry>;
  /** For each ref, the entries that point at it, and how. */
  backlinks: Map<string, { rel: Rel; from: string }[]>;
};

export class ContentError extends Error {
  constructor(public problems: string[]) {
    super(`Content has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    this.name = "ContentError";
  }
}

/** Photographs are .jpg only: see `imageOf` in components/entry/photo-figure.tsx. */
const imageExtensions = [".jpg"];

async function filesIn(root: string, folder: string) {
  try {
    const names = await readdir(path.join(root, folder));
    return names.filter((n) => !n.startsWith(".")).sort();
  } catch {
    return [];
  }
}

function splitFrontmatter(text: string): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  return { data: parseYaml(match[1]) ?? {}, body: match[2].trim() };
}

/** "FUJIFILM" + "X-T5", without repeating a maker the model already names. */
function cameraName(make?: unknown, model?: unknown) {
  const maker = typeof make === "string" ? make.trim() : "";
  const name = typeof model === "string" ? model.trim() : "";
  if (!name) return maker || undefined;
  return name.toLowerCase().startsWith(maker.toLowerCase())
    ? name
    : `${maker} ${name}`.trim();
}

function shutterSpeed(seconds: unknown) {
  if (typeof seconds !== "number" || seconds <= 0) return undefined;
  return seconds >= 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}`;
}

/** EXIF writes "2026:10:02 07:14:09", with the offset in its own field. */
function takenAt(original: unknown, offset: unknown) {
  if (typeof original !== "string") return undefined;
  const match = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(original);
  if (!match) return undefined;
  const [, y, mo, d, h, mi, s] = match;
  const day = `${y}-${mo}-${d}`;
  return typeof offset === "string" && /^[+-]\d{2}:\d{2}$/.test(offset)
    ? `${day}T${h}:${mi}:${s}${offset}`
    : day;
}

/** XMP text is a plain string or `{ lang, value }`. */
function text(value: unknown) {
  if (typeof value === "string") return value.trim() || undefined;
  if (value && typeof value === "object" && "value" in value) {
    return text((value as { value: unknown }).value);
  }
  return undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** What the image file itself says, in the photo schema's terms. */
async function readImageMetadata(file: string) {
  const image = await readFile(file);
  let tags: Record<string, unknown> = {};
  // 1 to 8, as EXIF numbers the ways an image can be turned.
  let orientation: number | undefined;
  try {
    tags = (await exifr.parse(image, { xmp: true, iptc: true, reviveValues: false })) ?? {};
    orientation = await exifr.orientation(image);
  } catch {
    // No readable metadata (a scan, a stripped export): the .yml supplies it.
  }
  const frame = jpegSize(image);
  // Orientations 5 to 8 are stored on their side: a browser turns them, so
  // the size it shows has the two swapped.
  const turned = orientation !== undefined && orientation >= 5;
  return {
    alt: text(tags.AltTextAccessibility),
    caption: text(tags.ImageDescription) ?? text(tags.description) ?? text(tags.Caption),
    title: text(tags.title) ?? text(tags.ObjectName),
    date: takenAt(tags.DateTimeOriginal, tags.OffsetTimeOriginal),
    camera: cameraName(tags.Make, tags.Model),
    lens: text(tags.LensModel),
    focalLength: number(tags.FocalLength),
    aperture: number(tags.FNumber),
    shutter: shutterSpeed(tags.ExposureTime),
    iso: number(tags.ISO),
    width: turned ? frame?.height : frame?.width,
    height: turned ? frame?.width : frame?.height,
  };
}

/** Days sort as midnight UTC; a moment sorts by its instant. */
function oldestFirst(a: Entry, b: Entry) {
  return Date.parse(a.date) - Date.parse(b.date) || a.ref.localeCompare(b.ref);
}

/** The facets an entry has: nothing empty, and nothing that is not text or a number. */
function searchable(fields: Record<string, Facet | undefined>) {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
    ),
  ) as Record<string, Facet>;
}

function defined<T extends object>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export async function loadContent(
  root: string,
  { drafts = false }: { drafts?: boolean } = {},
): Promise<ContentIndex> {
  const problems: string[] = [];
  const entries = new Map<string, Entry>();
  /** Refs left out because they are drafts, to explain a dangling link. */
  const withheld = new Set<string>();

  function check<S extends z.ZodType>(schema: S, value: unknown, source: string) {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      const field = issue.path.join(".");
      problems.push(`${source}: ${field ? `${field}: ` : ""}${issue.message}`);
    }
    return null;
  }

  function idOf(source: string) {
    const id = path.basename(source, path.extname(source));
    if (idPattern.test(id)) return id;
    problems.push(
      `${source}: the file name is the id, so use lowercase letters, digits and hyphens only`,
    );
    return null;
  }

  function add(
    kind: Kind,
    id: string,
    source: string,
    { facets, edges: written, ...rest }: Described & { body: string; data: unknown },
  ) {
    const ref = toRef(kind, id);
    if (rest.draft && !drafts) {
      withheld.add(ref);
      return;
    }
    if (rest.updated && isBefore(rest.updated, rest.date)) {
      problems.push(`${source}: updated: ${rest.updated} is before its date, ${rest.date}`);
    }
    if (refsInBody(rest.body).includes(ref)) {
      problems.push(`${source}: embeds itself`);
    }
    const url = urlFor(kind, id);
    if (!pageless.includes(kind)) {
      const clash = [...entries.values()].find((e) => e.url === url);
      if (clash) {
        problems.push(`${source}: ${url} is already taken by ${clash.source}`);
        return;
      }
    }
    const members = written.filter((e) => e.rel === "contains").map((e) => e.to);
    for (const twice of new Set(members.filter((to, at) => members.indexOf(to) !== at))) {
      problems.push(`${source}: lists ${twice} twice`);
    }
    // Each pointer once, in the order written: frontmatter, then the body.
    const all = [...written, ...edges("embeds", ...refsInBody(rest.body))];
    const once = all.filter(
      (edge, at) => all.findIndex((e) => e.rel === edge.rel && e.to === edge.to) === at,
    );
    entries.set(ref, {
      ...rest,
      kind,
      id,
      ref,
      url,
      source,
      edges: once,
      facets: searchable({ category: rest.category, ...facets }),
    } as Entry);
  }

  // The kinds that are one file per entry: see kinds.ts.
  for (const definition of definitions) {
    const { kind, folder, extension, schema } = definition;
    const names = await filesIn(root, folder);
    const assets = Object.entries(definition.assets ?? {});
    const isAsset = (name: string) =>
      assets.some(([, extensions]) => extensions.includes(path.extname(name)));
    for (const name of names) {
      const source = `${folder}/${name}`;
      if (isAsset(name)) {
        // A file that belongs to an entry: a track's audio beside its .mdx.
        const stem = path.basename(name, path.extname(name));
        if (!names.includes(`${stem}${extension}`)) {
          problems.push(`${source}: there is no ${kind} named ${stem}`);
        }
        continue;
      }
      if (path.extname(name) !== extension) {
        problems.push(`${source}: expected a ${extension} file`);
        continue;
      }
      const id = idOf(source);
      let parsed;
      try {
        parsed = splitFrontmatter(await readFile(path.join(root, source), "utf8"));
      } catch (error) {
        problems.push(`${source}: ${(error as Error).message}`);
        continue;
      }
      const data = check(schema, parsed.data, source);
      if (!id || !data) continue;
      const found = definition.check?.(id, data, parsed.body) ?? [];
      // Plain Markdown has no components: the tag would be dropped unseen.
      if (extension === ".md" && refsInBody(parsed.body).length > 0) {
        problems.push(`${source}: <Embed> is only drawn in an .mdx file, and a ${kind} is a .md`);
      }
      problems.push(...found.map((problem) => `${source}: ${problem}`));
      // A reserved slug has no address to be given.
      if (kind === "post" && found.length > 0) continue;
      // The files beside it, each under its field.
      const beside = Object.fromEntries(
        assets.flatMap(([field, extensions]) => {
          const file = extensions.map((ext) => `${id}${ext}`).find((n) => names.includes(n));
          return file ? [[field, file]] : [];
        }),
      );
      add(kind, id, source, {
        ...definition.describe(data, parsed.body),
        body: parsed.body,
        data: { ...(data as object), ...beside },
      });
    }
  }

  // Photographs: the image is the entry; a .yml of the same name overrides it.
  const photoFiles = await filesIn(root, "photos");
  const images = photoFiles.filter((n) => imageExtensions.includes(path.extname(n)));
  for (const name of photoFiles) {
    const stem = path.basename(name, path.extname(name));
    if (images.includes(name)) continue;
    if (path.extname(name) !== ".yml") {
      problems.push(`photos/${name}: expected a .jpg image or a .yml file`);
    } else if (!images.some((i) => path.basename(i, path.extname(i)) === stem)) {
      problems.push(`photos/${name}: there is no image named ${stem}`);
    }
  }
  for (const name of images) {
    const source = `photos/${name}`;
    const id = idOf(source);
    const stem = path.basename(name, path.extname(name));
    let written: unknown = {};
    if (photoFiles.includes(`${stem}.yml`)) {
      try {
        written = parseYaml(await readFile(path.join(root, "photos", `${stem}.yml`), "utf8")) ?? {};
      } catch (error) {
        problems.push(`photos/${stem}.yml: ${(error as Error).message}`);
        continue;
      }
    }
    const overrides = check(photoOverrides, written, `photos/${stem}.yml`);
    if (!id || !overrides) continue;
    const { tags, related, draft, ...fields } = overrides;
    const fromFile = await readImageMetadata(path.join(root, source));
    // The file's own metadata first, then whatever the .yml says on top.
    const merged = { ...defined(fromFile), ...defined(fields), file: name };
    if (!merged.alt) {
      problems.push(
        `${source}: no alt text. Add \`alt\` to photos/${stem}.yml, or fill in the image's alt text before exporting`,
      );
      continue;
    }
    if (!merged.date) {
      problems.push(
        `${source}: no date in the image. Add \`date\` to photos/${stem}.yml`,
      );
      continue;
    }
    if (!merged.width || !merged.height) {
      problems.push(`${source}: could not read the image's size. Export it again as a JPEG`);
      continue;
    }
    const data = check(photoData, merged, source);
    if (!data) continue;
    add("photo", id, source, {
      date: data.date,
      title: data.title,
      summary: data.caption,
      tags: tags ?? [],
      facets: {
        place: data.place,
        camera: data.camera,
        lens: data.lens,
        focalLength: data.focalLength,
        aperture: data.aperture,
        iso: data.iso,
        orientation: orientationOf(data),
      },
      draft,
      edges: edges("related", ...related),
      body: "",
      data,
    });
  }

  // One species keeps one name: a slip in a sighting would start a new row
  // in the life list.
  const species = new Map<string, Entry>();
  for (const sighting of entries.values()) {
    if (sighting.kind !== "sighting") continue;
    const first = species.get(sighting.data.species);
    if (!first) {
      species.set(sighting.data.species, sighting);
      continue;
    }
    for (const key of ["scientific", "family"] as const) {
      if (first.facets[key] !== sighting.facets[key]) {
        problems.push(
          `${sighting.source}: ${key} is "${sighting.facets[key]}", but ${first.source} has "${first.facets[key]}" for ${sighting.data.species}`,
        );
      }
    }
  }

  // Flights: one row each in flights.csv, as scripts/flights.mjs writes it
  // from a my.flightradar24.com export, with airports.json saying where each
  // airport is.
  const flightFiles = await filesIn(root, "flights");
  for (const name of flightFiles) {
    if (name !== "flights.csv" && name !== "airports.json") {
      problems.push(`flights/${name}: expected flights.csv and airports.json only`);
    }
  }
  if (flightFiles.includes("flights.csv")) {
    const source = "flights/flights.csv";
    let places: Record<string, Omit<Airport, "iata" | "icao" | "city" | "name">> | null = {};
    try {
      places = check(
        airportsFile,
        JSON.parse(await readFile(path.join(root, "flights/airports.json"), "utf8")),
        "flights/airports.json",
      );
    } catch (error) {
      problems.push(`flights/airports.json: ${(error as Error).message}`);
      places = null;
    }
    const table = parseTable(await readFile(path.join(root, source), "utf8"));
    const unplaced = new Set<string>();
    /** "Detroit / Detroit Metropolitan Wayne Co (DTW/KDTW)". */
    const airportOf = (written: string): Airport | null => {
      const [, label, iata, icao] = /^(.*)\(([A-Z0-9]*)\/([A-Z0-9]{4})\)\s*$/.exec(written)!;
      const [city, ...rest] = label.split(" / ");
      const place = places?.[icao];
      if (!place) {
        unplaced.add(icao);
        return null;
      }
      return {
        ...place,
        icao,
        ...(iata ? { iata } : {}),
        city: city.trim(),
        name: rest.join(" / ").trim() || city.trim(),
      };
    };
    /** "Delta Air Lines (DL/DAL)" is "Delta Air Lines"; " (/)" is nothing. */
    const named = (written: string) => written.replace(/\s*\([^)]*\)\s*$/, "").trim() || undefined;
    const taken = new Set<string>();
    for (const { line, width, cells } of table.rows) {
      const where = `${source}: line ${line}`;
      if (width !== table.header.length) {
        problems.push(`${where}: has ${width} fields, and the header has ${table.header.length}`);
        continue;
      }
      const row = check(flightRow, cells, where);
      if (!row || !places) continue;
      const from = airportOf(row.From);
      const to = airportOf(row.To);
      if (!from || !to) continue;
      const stem = `${row.Date}-${from.iata ?? from.icao}-${to.iata ?? to.icao}`.toLowerCase();
      // Out and back on one day is two flights; the same leg twice is rare, and numbered.
      let id = stem;
      for (let n = 2; taken.has(id); n++) id = `${stem}-${n}`;
      taken.add(id);
      const [hours, minutes] = row.Duration.split(":").map(Number);
      const data = {
        from,
        to,
        km: greatCircleKm(from, to),
        minutes: hours * 60 + minutes,
        airline: named(row.Airline),
        aircraft: named(row.Aircraft),
        seat: seats[Number(row["Seat type"]) as keyof typeof seats],
        cabin: cabins[Number(row["Flight class"]) as keyof typeof cabins],
        reason: reasons[Number(row["Flight reason"]) as keyof typeof reasons],
      };
      add("flight", id, source, {
        date: row.Date,
        title: `${from.city} to ${to.city}`,
        tags: [],
        facets: {
          from: from.iata ?? from.icao,
          to: to.iata ?? to.icao,
          place: to.city,
          country: to.country,
          airline: data.airline,
          aircraft: data.aircraft,
          class: data.cabin,
          seat: data.seat,
          reason: data.reason,
          km: Math.round(data.km),
        },
        draft: false,
        edges: [],
        body: "",
        data: defined(data),
      });
    }
    if (unplaced.size > 0) {
      problems.push(
        `flights/airports.json: has no ${[...unplaced].sort().join(", ")}. Run \`npm run flights\` again: see scripts/flights.mjs`,
      );
    }
  } else if (flightFiles.includes("airports.json")) {
    problems.push("flights/airports.json: there is no flights.csv beside it");
  }

  // Collections: a table whose rows are written in the file, or a question
  // asked of the entries of one kind. A row is an entry without a page.
  for (const name of await filesIn(root, "collections")) {
    const source = `collections/${name}`;
    if (path.extname(name) !== ".yml") {
      problems.push(`${source}: expected a .yml file`);
      continue;
    }
    const id = idOf(source);
    let parsed: unknown;
    try {
      parsed = parseYaml(await readFile(path.join(root, source), "utf8"));
    } catch (error) {
      problems.push(`${source}: ${(error as Error).message}`);
      continue;
    }
    const file = check(collectionFile, parsed, source);
    if (!id || !file) continue;
    const { items, ...collection } = file;
    const known = new Set(collection.columns.map((c) => c.key));
    const rows: string[] = [];
    let latest: string | undefined;
    if (collection.from) {
      // Only what was loaded: a draft is not in `entries` during a build, so
      // it can neither be a row nor stand in for a published one.
      let members = [...entries.values()]
        .filter((e) => e.kind === collection.from)
        .sort(oldestFirst);
      const { unique } = collection;
      if (unique) {
        const seen = new Set<string>();
        members = members.filter((member) => {
          const value = String(fieldOf(member, unique) ?? "");
          if (!value) problems.push(`${member.source}: ${source} needs "${unique}"`);
          if (!value || seen.has(value)) return false;
          seen.add(value);
          return true;
        });
      }
      for (const member of members) {
        for (const column of collection.columns) {
          if (!column.optional && fieldOf(member, column.key) === undefined) {
            problems.push(`${member.source}: ${source} needs "${column.key}"`);
          }
        }
        rows.push(member.ref);
      }
      latest = members.at(-1)?.date;
    } else {
      for (const item of items) {
        const where = `${source}: item "${item.id}"`;
        if (!idPattern.test(item.id)) {
          problems.push(`${where}: use lowercase letters, digits and hyphens in the id`);
          continue;
        }
        const { id: row, related, ...cells } = item;
        const fields: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(cells)) {
          const parsedCell = cellValue.safeParse(value);
          if (!known.has(key) && key !== "title" && key !== "date") {
            problems.push(`${where}: "${key}" is not one of the collection's columns`);
          } else if (!parsedCell.success) {
            problems.push(`${where}: "${key}" must be text or a number`);
          } else {
            fields[key] = parsedCell.data;
          }
        }
        for (const column of collection.columns) {
          if (!column.optional && fields[column.key] === undefined) {
            problems.push(`${where}: missing "${column.key}"`);
          }
        }
        const itemId = `${id}/${row}`;
        if (rows.includes(toRef("item", itemId))) {
          problems.push(`${where}: this id is used twice`);
          continue;
        }
        rows.push(toRef("item", itemId));
        const facets = Object.fromEntries(
          Object.entries(fields).filter(([key]) => key !== "title" && key !== "date"),
        );
        add("item", itemId, source, {
          date: item.date,
          title: item.title,
          tags: [],
          facets,
          draft: collection.draft,
          edges: edges("related", ...related),
          body: "",
          data: { collection: id, fields },
        });
      }
      latest = items.map((i) => i.date).sort().at(-1);
    }
    add("collection", id, source, {
      date: latest ?? "1970-01-01",
      title: collection.title,
      summary: collection.description,
      tags: [],
      facets: {},
      draft: collection.draft,
      edges: edges("contains", ...rows),
      body: "",
      data: { ...collection, items: rows },
    });
  }

  const memberKind = new Map(definitions.map((d) => [d.kind, d.contains]));
  const backlinks = new Map<string, { rel: Rel; from: string }[]>();
  for (const entry of entries.values()) {
    const listed = entry.edges.filter((edge) => edge.rel === "contains");
    // A series may list a part that is still a draft. The part keeps its
    // place in the count and is never linked: see `partOf` in query.ts.
    // A series with nothing published in it has nothing to show.
    if (listed.length > 0 && listed.every((edge) => withheld.has(edge.to))) {
      const what = memberKind.get(entry.kind) ?? "entry";
      problems.push(`${entry.source}: every ${what} it lists is a draft; mark it a draft too`);
      continue;
    }
    for (const { rel, to } of entry.edges) {
      const target = entries.get(to);
      if (!target) {
        if (rel === "contains" && withheld.has(to)) continue;
        problems.push(
          withheld.has(to)
            ? `${entry.source}: points at ${to}, which is a draft`
            : `${entry.source}: points at ${to}, which does not exist`,
        );
        continue;
      }
      const expected = memberKind.get(entry.kind);
      if (rel === "contains" && expected && target.kind !== expected) {
        problems.push(`${entry.source}: lists ${to}, which is not a ${expected}`);
        continue;
      }
      backlinks.set(to, [...(backlinks.get(to) ?? []), { rel, from: entry.ref }]);
    }
  }

  // A series of posts has no page and no date of its own: it takes those of
  // its first published part.
  for (const entry of entries.values()) {
    if (entry.kind !== "post-series") continue;
    const first = entry.data.posts.map((part) => entries.get(part)).find((part) => part);
    if (first?.kind !== "post") continue;
    entry.url = first.url;
    entry.date = first.date;
  }

  if (problems.length > 0) throw new ContentError(problems);
  return { entries, backlinks };
}
