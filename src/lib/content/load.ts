import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { idPattern, refsInBody, toRef, urlFor, type Kind } from "./refs";
import {
  cellValue,
  collectionFile,
  noteData,
  photoData,
  photoOverrides,
  postData,
  projectData,
  seriesData,
  type Entry,
  type Envelope,
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
  /** For each ref, the refs of the entries that point at it. */
  backlinks: Map<string, string[]>;
};

export class ContentError extends Error {
  constructor(public problems: string[]) {
    super(`Content has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    this.name = "ContentError";
  }
}

/** Slugs a post cannot take: they are routes under /writing. */
export const reservedPostSlugs = ["the-kernel", "dev-journal", "notes"];

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
  let tags: Record<string, unknown> = {};
  try {
    tags =
      (await exifr.parse(await readFile(file), {
        xmp: true,
        iptc: true,
        reviveValues: false,
      })) ?? {};
  } catch {
    // No readable metadata (a scan, a stripped export): the .yml supplies it.
  }
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
    width: number(tags.ExifImageWidth),
    height: number(tags.ExifImageHeight),
  };
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
    rest: Omit<Envelope, "kind" | "id" | "ref" | "url" | "source" | "links"> & {
      data: unknown;
      links: (string | undefined)[];
    },
  ) {
    const ref = toRef(kind, id);
    if (rest.draft && !drafts) {
      withheld.add(ref);
      return;
    }
    const url = urlFor(kind, id);
    const clash = [...entries.values()].find((e) => e.url === url);
    if (clash) {
      problems.push(`${source}: ${url} is already taken by ${clash.source}`);
      return;
    }
    const links = [
      ...new Set([...rest.links.filter((l) => l !== undefined), ...refsInBody(rest.body)]),
    ];
    entries.set(ref, { ...rest, kind, id, ref, url, source, links } as Entry);
  }

  async function documents<S extends z.ZodType>(
    folder: string,
    extension: string,
    schema: S,
    each: (id: string, source: string, data: z.infer<S>, body: string) => void,
  ) {
    for (const name of await filesIn(root, folder)) {
      const source = `${folder}/${name}`;
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
      if (id && data) each(id, source, data, parsed.body);
    }
  }

  await documents("posts", ".mdx", postData, (id, source, data, body) => {
    if (reservedPostSlugs.includes(id)) {
      problems.push(`${source}: "${id}" is reserved; rename the file`);
      return;
    }
    add("post", id, source, {
      date: data.date,
      title: data.title,
      summary: data.description ?? data.subtitle,
      tags: data.keywords,
      draft: data.draft,
      links: [data.cover, ...data.related],
      body,
      data,
    });
  });

  await documents("notes", ".md", noteData, (id, source, data, body) => {
    if (!body) problems.push(`${source}: a note needs its text`);
    add("note", id, source, {
      date: data.date,
      summary: body,
      tags: data.keywords,
      draft: data.draft,
      links: data.related,
      body,
      data,
    });
  });

  await documents("projects", ".mdx", projectData, (id, source, data, body) => {
    add("project", id, source, {
      date: data.date,
      title: data.title,
      summary: data.subtitle,
      tags: [data.category],
      draft: data.draft,
      links: [data.cover, ...data.related],
      body,
      data,
    });
  });

  await documents("series", ".mdx", seriesData, (id, source, data, body) => {
    add("series", id, source, {
      date: data.date,
      title: data.title,
      summary: data.subtitle,
      tags: [],
      draft: data.draft,
      links: [data.cover, ...data.photos, ...data.related],
      body,
      data,
    });
  });

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
    const data = check(photoData, merged, source);
    if (!data) continue;
    add("photo", id, source, {
      date: data.date,
      title: data.title,
      summary: data.caption,
      tags: tags ?? [],
      draft,
      links: related,
      body: "",
      data,
    });
  }

  // Collections: one file, one row per item. A row is an entry without a page.
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
      add("item", itemId, source, {
        date: item.date,
        title: item.title,
        tags: [],
        draft: collection.draft,
        links: related,
        body: "",
        data: { collection: id, fields },
      });
    }
    add("collection", id, source, {
      date: items.map((i) => i.date).sort().at(-1) ?? "1970-01-01",
      title: collection.title,
      summary: collection.description,
      tags: [],
      draft: collection.draft,
      links: [],
      body: "",
      data: { ...collection, items: rows },
    });
  }

  const backlinks = new Map<string, string[]>();
  for (const entry of entries.values()) {
    for (const target of entry.links) {
      if (entries.has(target)) {
        backlinks.set(target, [...(backlinks.get(target) ?? []), entry.ref]);
      } else {
        problems.push(
          withheld.has(target)
            ? `${entry.source}: points at ${target}, which is a draft`
            : `${entry.source}: points at ${target}, which does not exist`,
        );
      }
    }
  }

  if (problems.length > 0) throw new ContentError(problems);
  return { entries, backlinks };
}
