// @vitest-environment node
import path from "node:path";
import { describe, expect, it } from "vitest";
import { definitions } from "./kinds";
import { loadContent } from "./load";
import { createQueries } from "./query";
import { kinds, pageless, urlFor } from "./refs";
import { doc, expectEnvelope, folder, site, valid } from "./testing";

const fixture = path.join(import.meta.dirname, "__fixtures__/site");

describe("the registry", () => {
  it("declares each kind once, in a folder of its own", () => {
    const declared = definitions.map((d) => d.kind);
    expect(new Set(declared).size).toBe(declared.length);
    const folders = definitions.map((d) => d.folder);
    expect(new Set(folders).size).toBe(folders.length);
    for (const kind of declared) expect(kinds).toContain(kind);
  });

  it("leaves only photographs, collections and their rows to the loader's own code", () => {
    const declared = definitions.map((d) => d.kind);
    expect(kinds.filter((k) => !declared.includes(k))).toEqual(["photo", "collection", "item"]);
    for (const folder of ["photos", "collections"]) {
      expect(definitions.map((d) => d.folder)).not.toContain(folder);
    }
  });

  it("says what each grouping holds, and only a kind that exists", () => {
    expect(
      Object.fromEntries(definitions.filter((d) => d.contains).map((d) => [d.kind, d.contains])),
    ).toEqual({ "photo-series": "photo", "post-series": "post", album: "track" });
  });

  it("gives every kind an address, and a kind with a page one that is its own", () => {
    const paged = kinds.filter((k) => !pageless.includes(k));
    for (const kind of kinds) {
      const id = kind === "item" ? "shelf/set" : "an-id";
      expect(urlFor(kind, id), kind).toMatch(/^\//);
    }
    // Two entries of one kind never share an address.
    for (const kind of paged) expect(urlFor(kind, "a"), kind).not.toBe(urlFor(kind, "b"));
    // An observation or a row is an anchor on a collection's page.
    for (const kind of ["sighting", "recommendation"] as const) {
      expect(urlFor(kind, "an-id")).toMatch(/^\/collections\/[a-z-]+#an-id$/);
    }
  });
});

describe("the envelope", async () => {
  const minimal = createQueries(await loadContent(await folder(site())));
  const full = createQueries(await loadContent(fixture, { drafts: true }));

  it("is kept by every entry of every kind", () => {
    for (const q of [minimal, full]) {
      const all = q.stream({ kinds: [...kinds] });
      expect(new Set(all.map((e) => e.kind))).toEqual(new Set(kinds));
      for (const entry of all) expectEnvelope(entry);
    }
  });

  it("names every entry once", () => {
    const refs = full.stream({ kinds: [...kinds] }).map((e) => e.ref);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("finds an entry by its ref or by its kind and id alike", () => {
    for (const entry of minimal.stream({ kinds: [...kinds] })) {
      expect(minimal.get(entry.ref)).toBe(entry);
      expect(minimal.get(entry.kind, entry.id)).toBe(entry);
    }
  });

  it("records where each entry was written", () => {
    expect(minimal.need("post", "essay").source).toBe("posts/essay.mdx");
    expect(minimal.need("photo", "2026-01-01-pic").source).toBe("photos/2026-01-01-pic.jpg");
    expect(minimal.need("item", "shelf/set").source).toBe("collections/shelf.yml");
    expect(minimal.need("collection", "life-list").source).toBe("collections/life-list.yml");
  });
});

describe("facets", () => {
  /** One site in which every kind fills in what it can be searched by. */
  const described = async () =>
    createQueries(
      await loadContent(
        await folder({
          ...site({
            project: { medium: "Print", status: "Finished", role: "Design", stack: [], materials: ["oak"] },
            "photo-series": { camera: "Olympus XA" },
            track: {
              composer: ["Traditional"],
              key: "A minor",
              bpm: 60,
              instruments: ["Guitar"],
              credits: [{ role: "Mix", name: "A. Person" }],
            },
            album: { tools: ["Tape"], status: "Finished" },
            sighting: { habitat: "Garden" },
            recommendation: { creator: "An Author" },
          }),
          "photos/2026-01-01-pic.yml": "alt: A picture.\ndate: 2026-01-01\nplace: Here\ncamera: Olympus XA\n",
        }),
      ),
    );

  it("uses one key for one meaning, whatever the kind", async () => {
    const q = await described();
    const facet = (ref: string, key: string) => q.get(ref)?.facets[key];
    expect(facet("photo:2026-01-01-pic", "place")).toBe("Here");
    expect(facet("sighting:2026-01-07-wren", "place")).toBe("Here");
    expect(facet("photo:2026-01-01-pic", "camera")).toBe("Olympus XA");
    expect(facet("photo-series:walk", "camera")).toBe("Olympus XA");
    expect(facet("project:thing", "medium")).toBe("Print");
    expect(facet("recommendation:book", "medium")).toBe("Book");
    expect(facet("project:thing", "status")).toBe("Finished");
    expect(facet("album:record", "status")).toBe("Finished");
    expect(facet("track:song", "artist")).toBe("Mal Nushi");
    expect(facet("album:record", "artist")).toBe("Mal Nushi");
  });

  it("finds a writer or a credited name without either being an entry", async () => {
    const song = (await described()).need("track", "song");
    expect(song.facets).toEqual({
      artist: "Mal Nushi",
      composer: ["Traditional"],
      bpm: 60,
      key: "A minor",
      instruments: ["Guitar"],
      credits: ["A. Person"],
    });
  });

  it("copies the category, and leaves out a field that is empty", async () => {
    const q = await described();
    const thing = q.need("project", "thing");
    expect(thing.facets.category).toBe("Code");
    // `stack: []` was written, and is not a facet.
    expect(Object.keys(thing.facets).sort()).toEqual(["category", "materials", "medium", "role", "status"]);
    expect(q.need("note", "2026-01-02-0900").facets).toEqual({});
    expect(q.need("track", "song").category).toBeUndefined();
    expect("category" in q.need("track", "song").facets).toBe(false);
  });

  it("labels a release by its format, in words", async () => {
    for (const [format, label] of [
      ["album", "Album"],
      ["ep", "EP"],
      ["single", "Single"],
      ["compilation", "Compilation"],
    ]) {
      const q = createQueries(await loadContent(await folder(site({ album: { format } }))));
      expect(q.need("album", "record").category).toBe(label);
      expect(q.need("album", "record").facets.format).toBe(label);
    }
  });
});

describe("the text an entry is listed by", () => {
  it("falls back from the description to the subtitle, and uses a body where that is the entry", async () => {
    const q = createQueries(
      await loadContent(
        await folder({
          ...site(),
          "posts/described.mdx": doc({ ...valid.post.data, description: "For search." }),
          "sightings/2026-01-07-wren.md": doc(valid.sighting.data, "On the fence."),
        }),
      ),
    );
    expect(q.need("post", "essay").summary).toBe("Sub");
    expect(q.need("post", "described").summary).toBe("For search.");
    expect(q.need("note", "2026-01-02-0900").summary).toBe("A note.");
    expect(q.need("note", "2026-01-02-0900").title).toBeUndefined();
    expect(q.need("sighting", "2026-01-07-wren").title).toBe("Wren");
    expect(q.need("sighting", "2026-01-07-wren").summary).toBe("On the fence.");
    // No notes written: no summary, not an empty one.
    expect(q.need("recommendation", "book").summary).toBeUndefined();
  });
});
