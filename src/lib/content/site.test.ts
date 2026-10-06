// @vitest-environment node
import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { definitions } from "./kinds";
import { ContentError, loadContent } from "./load";
import { createQueries } from "./query";
import { homes, kinds, pageless } from "./refs";
import { expectEnvelope } from "./testing";

/*
 * The site's own content/ folder, read by the loader the build uses. The
 * other tests prove the rules on small folders made for them; this one holds
 * what is actually committed to those rules, in a second, before a build.
 *
 * It names no entry: it must keep passing as content is added and removed.
 */

const root = path.join(process.cwd(), "content");

async function load(drafts: boolean) {
  try {
    return createQueries(await loadContent(root, { drafts }));
  } catch (error) {
    // Each problem on its own line, as the build prints them.
    if (error instanceof ContentError) throw new Error(error.message);
    throw error;
  }
}

describe("the content folder", async () => {
  it("loads as the build reads it, with no problem in any file", async () => {
    await expect(load(false)).resolves.toBeDefined();
  });

  it("loads with drafts shown, as it is read while writing", async () => {
    await expect(load(true)).resolves.toBeDefined();
  });

  const published = await load(false).catch(() => undefined);
  const everything = await load(true).catch(() => undefined);
  // The two tests above report why; the rest have nothing to check.
  const loaded = it.skipIf(!published || !everything);

  loaded("holds every entry to the envelope", () => {
    for (const entry of everything!.stream({ kinds: [...kinds] })) expectEnvelope(entry);
  });

  loaded("publishes nothing marked a draft", () => {
    const drafts = published!.stream({ kinds: [...kinds] }).filter((e) => e.draft);
    expect(drafts.map((e) => e.source)).toEqual([]);
  });

  loaded("gives each page one entry", () => {
    const paged = everything!.stream({ kinds: [...kinds] }).filter((e) => !pageless.includes(e.kind));
    const taken = new Map<string, string>();
    for (const entry of paged) {
      expect(taken.get(entry.url), `${entry.source} and ${taken.get(entry.url)} share ${entry.url}`).toBeUndefined();
      taken.set(entry.url, entry.source);
    }
  });

  loaded("knows every photograph's size and alt text", () => {
    for (const photo of everything!.list("photo")) {
      expect(photo.data.width, photo.source).toBeGreaterThan(0);
      expect(photo.data.height, photo.source).toBeGreaterThan(0);
      expect(photo.data.alt.trim(), photo.source).not.toBe("");
    }
  });

  loaded("writes each tag one way", () => {
    const spellings = new Map<string, { tag: string; source: string }>();
    for (const entry of everything!.stream({ kinds: [...kinds] })) {
      const own = entry.tags.map((t) => t.toLowerCase());
      expect(new Set(own).size, `${entry.source}: a tag is repeated`).toBe(own.length);
      for (const tag of entry.tags) {
        expect(tag, `${entry.source}: a tag has space around it`).toBe(tag.trim());
        const first = spellings.get(tag.toLowerCase());
        // "Birds" on one entry and "birds" on another would be two labels for one list.
        if (first) expect(tag, `${entry.source} and ${first.source} spell a tag differently`).toBe(first.tag);
        else spellings.set(tag.toLowerCase(), { tag, source: entry.source });
      }
    }
  });

  loaded("has the list each observation is read on", () => {
    for (const [kind, home] of Object.entries(homes) as [keyof typeof homes, string][]) {
      if (published!.list(kind).length === 0) continue;
      const list = published!.get("collection", home);
      expect(list, `content/collections/${home}.yml, where a ${kind} is read`).toBeDefined();
      expect(list!.data.from, `collections/${home}.yml`).toBe(kind);
    }
  });

  loaded("leaves no published grouping with nothing in it", () => {
    for (const entry of published!.stream({ kinds: ["photo-series", "post-series", "album"] })) {
      expect(published!.members(entry).length, entry.source).toBeGreaterThan(0);
    }
  });

  it("keeps a file in every folder a body is imported from", async () => {
    // The bundler fails on an import pattern nothing matches: see body.tsx.
    for (const { folder, extension } of definitions) {
      const names = await readdir(path.join(root, folder)).catch(() => []);
      expect(names.some((n) => n.endsWith(extension)), `content/${folder} has no ${extension} file`).toBe(true);
    }
    const photos = await readdir(path.join(root, "photos")).catch(() => []);
    expect(photos.some((n) => n.endsWith(".jpg")), "content/photos has no .jpg").toBe(true);
  });
});
