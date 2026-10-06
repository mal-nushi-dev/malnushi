// @vitest-environment node
import { cp, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { exifLine, isBefore, noteDateLine, readingTime, trackLine } from "./format";
import { jpegSize } from "./image-size";
import { loadContent } from "./load";
import { createQueries } from "./query";
import { kinds, parseRef, refsInBody, urlFor } from "./refs";
import { exifOrientation, folder, jpeg, problemsOf } from "./testing";

const fixture = path.join(import.meta.dirname, "__fixtures__/site");

const post = (extra = "") =>
  `---\ntitle: "T"\nsubtitle: "S"\ndate: 2026-01-01\ncategory: Tech\n${extra}---\n\nText.\n`;

describe("refs", () => {
  it("parses a ref and rejects anything else", () => {
    expect(parseRef("photo:2026-10-02-wren")).toEqual({ kind: "photo", id: "2026-10-02-wren" });
    expect(parseRef("item:inventory/skyline")).toEqual({
      kind: "item",
      id: "inventory/skyline",
    });
    expect(parseRef("photo:Wren")).toBeNull();
    expect(parseRef("photo-series:marsh")).toEqual({ kind: "photo-series", id: "marsh" });
    expect(parseRef("series:marsh")).toBeNull();
    expect(parseRef("bird:wren")).toBeNull();
    expect(parseRef("item:wren")).toBeNull();
  });

  it("gives a collection row its collection's page and an anchor", () => {
    expect(urlFor("item", "inventory/skyline")).toBe("/collections/inventory#skyline");
    expect(urlFor("photo-series", "marsh")).toBe("/projects/marsh");
  });

  it("anchors an observation to its collection's page", () => {
    expect(urlFor("sighting", "2026-09-23-carolina-wren")).toBe(
      "/collections/life-list#2026-09-23-carolina-wren",
    );
    expect(urlFor("recommendation", "braiding-sweetgrass")).toBe(
      "/collections/recommendations#braiding-sweetgrass",
    );
  });

  it("finds the embeds in a body", () => {
    expect(refsInBody(`a <Embed of="photo:a" /> b <Embed size="column" of='note:b'/>`)).toEqual([
      "photo:a",
      "note:b",
    ]);
    // One shown as an example is not an embed.
    expect(refsInBody("```mdx\n<Embed of=\"photo:a\" />\n```\n\nOr `<Embed of=\"photo:b\" />`.")).toEqual([]);
  });
});

describe("format", () => {
  it("writes a note's time where it was written", () => {
    expect(noteDateLine("2026-10-03T14:12-04:00")).toEqual({ day: "2026-10-03", time: "2:12 PM EDT" });
    expect(noteDateLine("2026-01-03T00:05-05:00").time).toBe("12:05 AM EST");
    expect(noteDateLine("2026-01-03T09:31+01:00").time).toBe("9:31 AM UTC+01:00");
  });

  it("never reads faster than a minute", () => {
    expect(readingTime("three short words")).toBe(1);
    expect(readingTime("word ".repeat(690))).toBe(3);
  });
});

describe("dates", () => {
  it("compares two moments as instants", () => {
    expect(isBefore("2026-10-05T09:00-04:00", "2026-10-05T21:00-04:00")).toBe(true);
    expect(isBefore("2026-10-05T21:00-04:00", "2026-10-05T09:00-04:00")).toBe(false);
    // The same instant, written in two places.
    expect(isBefore("2026-10-05T21:00-04:00", "2026-10-06T03:00+02:00")).toBe(false);
  });

  it("compares a day with a moment by the days as written", () => {
    // 21:30 in New York is already the 6th in UTC.
    expect(isBefore("2026-10-05", "2026-10-05T21:30-04:00")).toBe(false);
    expect(isBefore("2026-10-05T21:30-04:00", "2026-10-05")).toBe(false);
    // 00:30 in Berlin is still the 4th in UTC.
    expect(isBefore("2026-10-05T00:30+02:00", "2026-10-05")).toBe(false);
    expect(isBefore("2026-10-05", "2026-10-05")).toBe(false);
    expect(isBefore("2026-10-04", "2026-10-05T00:30+02:00")).toBe(true);
    expect(isBefore("2026-10-04", "2026-10-05")).toBe(true);
  });
});

describe("a JPEG's size", () => {
  it("reads a baseline and a progressive frame", () => {
    expect(jpegSize(jpeg(0xc0, 2400, 1600))).toEqual({ width: 2400, height: 1600 });
    expect(jpegSize(jpeg(0xc2, 1600, 2400))).toEqual({ width: 1600, height: 2400 });
  });

  it("passes over a thumbnail's frame inside another segment", () => {
    const thumbnail = [0xff, 0xc0, 0, 11, 8, 0, 16, 0, 16, 1, 1, 0x11, 0];
    const exif = [0xff, 0xe1, 0, thumbnail.length + 2, ...thumbnail];
    expect(jpegSize(jpeg(0xc2, 300, 200, exif))).toEqual({ width: 300, height: 200 });
  });

  it("does not take a table for a frame", () => {
    const huffman = [0xff, 0xc4, 0, 4, 0, 0];
    expect(jpegSize(jpeg(0xc0, 300, 200, huffman))).toEqual({ width: 300, height: 200 });
  });

  it("gives nothing for a cut-off file or another format", () => {
    expect(jpegSize(jpeg(0xc0, 300, 200).slice(0, 7))).toBeUndefined();
    expect(jpegSize(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBeUndefined();
    expect(jpegSize(new Uint8Array())).toBeUndefined();
  });
});

describe("the fixture folder", async () => {
  const q = createQueries(await loadContent(fixture));

  it("loads every kind, without the draft", () => {
    expect(q.stream({ kinds: [...kinds] }).map((e) => e.ref).sort()).toEqual([
      "album:collected",
      "album:tides",
      "collection:inventory",
      "collection:life-list",
      "collection:recommendations",
      "item:inventory/lighthouse",
      "item:inventory/skyline",
      "note:2026-10-03-1412",
      "photo-series:marsh",
      "photo:2026-08-09-scan",
      "photo:2026-10-02-wren",
      "post-series:field-notes",
      "post:first-post",
      "post:issue-1",
      "project:lamp",
      "recommendation:braiding-sweetgrass",
      "sighting:2026-09-21-great-blue-heron",
      "sighting:2026-09-23-carolina-wren",
      "sighting:2026-09-27-carolina-wren",
      "track:demo",
      "track:ebb",
      "track:shanty",
    ]);
  });

  it("shows drafts when asked", async () => {
    const drafts = createQueries(await loadContent(fixture, { drafts: true }));
    expect(drafts.get("post", "draft-post")?.draft).toBe(true);
  });

  it("reads a photograph's EXIF and lets its .yml win", () => {
    const wren = q.need("photo", "2026-10-02-wren");
    expect(wren.data).toMatchObject({
      file: "2026-10-02-wren.jpg",
      alt: "A Carolina wren on a window ledge.",
      date: "2026-10-02T07:14:09-04:00",
      camera: "FUJIFILM X-T5",
      lens: "XF70-300mmF4-5.6 R LM OIS WR",
      focalLength: 300,
      shutter: "1/500",
      iso: 800,
      // f/5.6 in the file, 8 in the .yml.
      aperture: 8,
    });
    expect(exifLine(wren.data)).toEqual(["300mm", "f/8", "1/500", "ISO 800"]);
    expect(wren.tags).toEqual(["birds"]);
    expect(wren.url).toBe("/photography/2026-10-02-wren");
  });

  it("takes everything from the .yml when the image carries nothing", () => {
    const scan = q.need("photo", "2026-08-09-scan");
    expect(scan.data).toMatchObject({ date: "2026-08-09", camera: "Olympus XA" });
    expect(exifLine(scan.data)).toEqual([]);
  });

  it("knows every photograph's size, whatever the file says about itself", () => {
    for (const photo of q.list("photo")) {
      expect(photo.data).toMatchObject({ width: 300, height: 200 });
      expect(photo.facets.orientation).toBe("landscape");
    }
  });

  it("keeps each kind's own fields", () => {
    expect(q.need("post", "issue-1").data).toMatchObject({ type: "the-kernel", issue: 1 });
    expect(q.need("project", "lamp").data.materials).toEqual(["brass", "walnut"]);
    expect(q.need("item", "inventory/skyline").data).toEqual({
      collection: "inventory",
      fields: { title: "Skyline", date: "2025-04-01", number: 21028, pieces: 598 },
    });
    expect(q.need("collection", "inventory").data.items).toHaveLength(2);
    expect(q.need("sighting", "2026-09-21-great-blue-heron").data).toMatchObject({
      species: "Great Blue Heron",
      coordinates: { lat: 35.1, lng: -80.9 },
      count: 1,
    });
    expect(q.need("recommendation", "braiding-sweetgrass").data.creator).toBe("Robin Wall Kimmerer");
  });

  it("gives every kind a label, tags and the fields to search by", () => {
    const post = q.need("post", "first-post");
    expect(post.category).toBe("Birding");
    expect(post.tags).toEqual(["wren"]);
    expect(post.facets).toEqual({ category: "Birding", type: "article", author: "Mal Nushi" });
    expect(q.need("photo", "2026-10-02-wren").facets).toEqual({
      camera: "FUJIFILM X-T5",
      lens: "XF70-300mmF4-5.6 R LM OIS WR",
      focalLength: 300,
      aperture: 8,
      iso: 800,
      orientation: "landscape",
    });
    expect(q.need("project", "lamp").facets).toEqual({
      category: "Hardware",
      materials: ["brass", "walnut"],
      status: "Finished",
    });
    const wren = q.need("sighting", "2026-09-23-carolina-wren");
    expect(wren.title).toBe("Carolina Wren");
    expect(wren.summary).toBe("On the fence, tail up.");
    expect(wren.facets).toEqual({
      species: "Carolina Wren",
      scientific: "Thryothorus ludovicianus",
      family: "Troglodytidae",
      place: "Charlotte",
      habitat: "Garden",
    });
    const book = q.need("recommendation", "braiding-sweetgrass");
    expect(book.category).toBe("Book");
    expect(book.facets).toEqual({ category: "Book", medium: "Book", creator: "Robin Wall Kimmerer" });
    expect(q.need("item", "inventory/skyline").facets).toEqual({ number: 21028, pieces: 598 });
    expect(q.tagged("Backyard").map((e) => e.ref)).toEqual(["sighting:2026-09-23-carolina-wren"]);
  });

  it("asks a collection of the entries of one kind", () => {
    // One row a species, the first time it was seen, in the order of seeing.
    const lifeList = q.need("collection", "life-list");
    expect(lifeList.data.items).toEqual([
      "sighting:2026-09-21-great-blue-heron",
      "sighting:2026-09-23-carolina-wren",
    ]);
    expect(lifeList.date).toBe("2026-09-23");
    expect(q.members(lifeList).map((e) => e.title)).toEqual(["Great Blue Heron", "Carolina Wren"]);
    expect(q.need("collection", "recommendations").data.items).toEqual([
      "recommendation:braiding-sweetgrass",
    ]);
    // A later sighting of the same bird is still an entry, only not a row.
    expect(q.partOf("sighting:2026-09-27-carolina-wren")).toEqual([]);
  });

  it("keeps a draft sighting off the life list, and from hiding a published one", async () => {
    expect(q.get("sighting", "2026-09-01-carolina-wren")).toBeUndefined();
    const drafts = createQueries(await loadContent(fixture, { drafts: true }));
    expect(drafts.need("collection", "life-list").data.items).toEqual([
      "sighting:2026-09-01-carolina-wren",
      "sighting:2026-09-21-great-blue-heron",
    ]);
  });

  it("lists one kind, newest first, with a filter and a limit", () => {
    expect(q.list("post").map((p) => p.id)).toEqual(["issue-1", "first-post"]);
    expect(q.list("post", { where: (p) => p.data.type === "article" }).map((p) => p.id)).toEqual([
      "first-post",
    ]);
    expect(q.list("item", { limit: 1 })[0].title).toBe("Skyline");
    expect(q.list("sighting", { limit: 1 })[0].id).toBe("2026-09-27-carolina-wren");
    expect(q.list("photo", { oldestFirst: true })[0].id).toBe("2026-08-09-scan");
  });

  it("streams kinds together, newest first, without collections", () => {
    expect(q.stream({ limit: 4 }).map((e) => e.ref)).toEqual([
      "note:2026-10-03-1412",
      "photo:2026-10-02-wren",
      "post:issue-1",
      "post:first-post",
    ]);
    expect(q.stream().some((e) => e.kind === "collection")).toBe(false);
  });

  it("collects edges from frontmatter and embeds, each with its sort, and reverses them", () => {
    expect(q.need("post", "first-post").edges).toEqual([
      { rel: "cover", to: "photo:2026-10-02-wren" },
      { rel: "related", to: "project:lamp" },
      { rel: "embeds", to: "sighting:2026-09-23-carolina-wren" },
    ]);
    expect(q.backlinks("photo:2026-10-02-wren").map((e) => e.ref)).toEqual([
      "post:first-post",
      "photo-series:marsh",
    ]);
    expect(q.backlinks("photo:2026-10-02-wren", "cover").map((e) => e.ref)).toEqual(["post:first-post"]);
    expect(q.backlinks("photo:2026-10-02-wren", "contains").map((e) => e.ref)).toEqual([
      "photo-series:marsh",
    ]);
    expect(q.backlinks("sighting:2026-09-23-carolina-wren").map((e) => e.ref)).toEqual([
      "post:first-post",
      "collection:life-list",
    ]);
    expect(q.backlinks("note:2026-10-03-1412")).toEqual([]);
  });

  it("works out what an entry is part of from the series that lists it", () => {
    const [inMarsh] = q.partOf("photo:2026-08-09-scan", "photo-series");
    expect(inMarsh.parent.ref).toBe("photo-series:marsh");
    expect(inMarsh).toMatchObject({ position: 2, total: 2, next: undefined });
    expect(inMarsh.previous?.ref).toBe("photo:2026-10-02-wren");

    // Three parts announced, two written.
    const [inNotes] = q.partOf("post:first-post", "post-series");
    expect(inNotes).toMatchObject({ position: 1, total: 3, previous: undefined });
    expect(inNotes.next?.ref).toBe("post:issue-1");
    expect(q.partOf("post:first-post", "photo-series")).toEqual([]);
    expect(q.partOf("project:lamp")).toEqual([]);
  });

  it("gives a track one address, whatever releases it is on", () => {
    const ebb = q.need("track", "ebb");
    expect(ebb.url).toBe("/music/ebb");
    expect(ebb.data).toMatchObject({ duration: "11:27", bpm: 60, audio: "ebb.mp3" });
    expect(trackLine(ebb.data)).toEqual(["11:27", "60 BPM", "A minor"]);
    expect(ebb.facets).toEqual({
      artist: "Mal Nushi",
      bpm: 60,
      key: "A minor",
      instruments: ["Modular synth"],
      credits: ["A. Fixture"],
    });
    // Newest release first; its place differs in each.
    expect(
      q.partOf(ebb.ref, "album").map((p) => [p.parent.ref, p.position, p.total]),
    ).toEqual([
      ["album:collected", 2, 2],
      ["album:tides", 1, 2],
    ]);

    // A cover is found by who wrote it.
    const shanty = q.need("track", "shanty");
    expect(shanty.facets.composer).toEqual(["Traditional"]);
    expect(shanty.data.audio).toBeUndefined();
    expect(trackLine(shanty.data)).toEqual(["2:58"]);

    // A track needs no release to exist.
    expect(q.partOf("track:demo")).toEqual([]);
    expect(q.need("track", "demo").url).toBe("/music/demo");
  });

  it("makes a release an entry that lists its tracks", () => {
    const tides = q.need("album", "tides");
    expect(tides.url).toBe("/projects/tides");
    expect(tides.category).toBe("EP");
    expect(tides.facets).toEqual({
      category: "EP",
      format: "EP",
      artist: "Mal Nushi",
      tools: ["Ableton Live"],
      status: "Finished",
    });
    expect(q.members(tides).map((e) => e.ref)).toEqual(["track:ebb", "track:shanty"]);
  });

  it("sends a series of posts to its first part, with that part's date", () => {
    const series = q.need("post-series", "field-notes");
    expect(series.url).toBe("/writing/first-post");
    expect(series.date).toBe("2026-09-28");
    expect(q.stream().some((e) => e.kind === "post-series")).toBe(false);
  });

  it("finds an entry's neighbours", () => {
    const { newer, older } = q.adjacent(q.need("post", "first-post"));
    expect(newer?.id).toBe("issue-1");
    expect(older).toBeUndefined();
  });
});

describe("a series with a part in draft", () => {
  const series = (posts: string) => `---\ntitle: "T"\nposts: [${posts}]\n---\n`;
  const parts = {
    "posts/one.mdx": post(),
    "posts/two.mdx": post("draft: true\n"),
    "posts/three.mdx": post(),
  };

  it("keeps the draft's place, and steps over it", async () => {
    const q = createQueries(
      await loadContent(
        await folder({ ...parts, "post-series/s.mdx": series("post:one, post:two, post:three") }),
      ),
    );
    expect(q.get("post", "two")).toBeUndefined();
    expect(q.members(q.need("post-series", "s")).map((e) => e.ref)).toEqual([
      "post:one",
      "post:three",
    ]);
    const [first] = q.partOf("post:one");
    expect(first).toMatchObject({ position: 1, total: 3, previous: undefined });
    expect(first.next?.ref).toBe("post:three");
    const [last] = q.partOf("post:three");
    expect(last).toMatchObject({ position: 3, total: 3, next: undefined });
    expect(last.previous?.ref).toBe("post:one");
  });

  it("ends at the last published part", async () => {
    const q = createQueries(
      await loadContent(
        await folder({ ...parts, "post-series/s.mdx": series("post:one, post:three, post:two") }),
      ),
    );
    const [second] = q.partOf("post:three");
    expect(second).toMatchObject({ position: 2, total: 3, next: undefined });
  });

  it("takes its address from the first part that is published", async () => {
    const q = createQueries(
      await loadContent(await folder({ ...parts, "post-series/s.mdx": series("post:two, post:three") })),
    );
    expect(q.need("post-series", "s").url).toBe("/writing/three");
    expect(q.partOf("post:three")[0]).toMatchObject({ position: 2, total: 2, previous: undefined });
  });

  it("shows every part while writing", async () => {
    const root = await folder({ ...parts, "post-series/s.mdx": series("post:one, post:two, post:three") });
    const q = createQueries(await loadContent(root, { drafts: true }));
    expect(q.partOf("post:one")[0].next?.ref).toBe("post:two");
  });

  it("lets a release list a track in draft, and leaves it out", async () => {
    const track = (extra = "") => `---\ntitle: T\ndate: 2026-01-01\nduration: "3:42"\n${extra}---\n`;
    const q = createQueries(
      await loadContent(
        await folder({
          "tracks/a.mdx": track(),
          "tracks/b.mdx": track("draft: true\n"),
          "albums/ep.mdx": `---\ntitle: T\ndate: 2026-01-01\nformat: ep\ntracks: [track:a, track:b]\n---\n`,
        }),
      ),
    );
    expect(q.members(q.need("album", "ep")).map((e) => e.ref)).toEqual(["track:a"]);
    expect(q.partOf("track:a", "album")[0]).toMatchObject({ position: 1, total: 2, next: undefined });
  });

  it("rejects a series with nothing published in it", async () => {
    const problems = await problemsOf(
      await folder({ ...parts, "post-series/s.mdx": series("post:two") }),
    );
    expect(problems).toEqual([
      "post-series/s.mdx: every post it lists is a draft; mark it a draft too",
    ]);
  });
});

describe("a revised entry", () => {
  it("carries the day it was revised, and can be ordered by it", async () => {
    const q = createQueries(
      await loadContent(
        await folder({
          "posts/old.mdx": post("updated: 2026-06-01\n"),
          "posts/new.mdx": post().replace("2026-01-01", "2026-03-01"),
        }),
      ),
    );
    expect(q.need("post", "old").updated).toBe("2026-06-01");
    expect(q.need("post", "new").updated).toBeUndefined();
    expect(q.list("post").map((e) => e.id)).toEqual(["new", "old"]);
    expect(q.list("post", { by: "updated" }).map((e) => e.id)).toEqual(["old", "new"]);
    expect(q.stream({ by: "updated" }).map((e) => e.id)).toEqual(["old", "new"]);
  });

  it("accepts a revision on the day of publication, in any time zone", async () => {
    const sighting = (species: string, date: string, updated: string) =>
      `---\nspecies: ${species}\nscientific: S ${species}\nfamily: F\ndate: ${date}\nupdated: ${updated}\nplace: P\n---\n`;
    const problems = await problemsOf(
      await folder({
        "posts/same-day.mdx": post("updated: 2026-01-01\n"),
        "posts/earlier.mdx": post("updated: 2025-12-31\n"),
        "sightings/evening.md": sighting("a", "2026-10-05T21:30-04:00", "2026-10-05"),
        "sightings/abroad.md": sighting("b", "2026-10-05", "2026-10-05T00:30+02:00"),
        "sightings/later.md": sighting("c", "2026-10-05T09:00-04:00", "2026-10-05T21:00-04:00"),
        "sightings/sooner.md": sighting("d", "2026-10-05T21:00-04:00", "2026-10-05T09:00-04:00"),
      }),
    );
    expect(problems.sort()).toEqual([
      "posts/earlier.mdx: updated: 2025-12-31 is before its date, 2026-01-01",
      "sightings/sooner.md: updated: 2026-10-05T09:00-04:00 is before its date, 2026-10-05T21:00-04:00",
    ]);
  });
});

describe("a folder with mistakes", () => {
  it("names the file and the field", async () => {
    const root = await folder({
      "posts/no-category.mdx": `---\ntitle: "T"\nsubtitle: "S"\ndate: 2026-01-01\n---\n`,
      "posts/typo.mdx": post("catgory: Tech\n"),
      "posts/bad-date.mdx": `---\ntitle: "T"\nsubtitle: "S"\ndate: January 1\ncategory: Tech\n---\n`,
    });
    const problems = await problemsOf(root);
    expect(problems).toContain("posts/no-category.mdx: category: an article needs a category");
    expect(problems).toContain("posts/bad-date.mdx: date: use YYYY-MM-DD");
    expect(problems.some((p) => p.startsWith("posts/typo.mdx:") && p.includes("catgory"))).toBe(true);
  });

  it("rejects a reserved slug and a bad file name", async () => {
    const problems = await problemsOf(
      await folder({ "posts/notes.mdx": post(), "posts/My Post.mdx": post() }),
    );
    expect(problems).toContain('posts/notes.mdx: "notes" is reserved; rename the file');
    expect(problems.some((p) => p.startsWith("posts/My Post.mdx: the file name is the id"))).toBe(true);
  });

  it("rejects a ref that points at nothing, or at a draft", async () => {
    const problems = await problemsOf(
      await folder({
        "posts/a.mdx": post("cover: photo:missing\n") + `<Embed of="post:b" />\n`,
        "posts/b.mdx": post("draft: true\n"),
      }),
    );
    expect(problems).toEqual([
      "posts/a.mdx: points at photo:missing, which does not exist",
      "posts/a.mdx: points at post:b, which is a draft",
    ]);
  });

  it("rejects an entry that embeds itself", async () => {
    const problems = await problemsOf(
      await folder({ "posts/a.mdx": post() + `<Embed of="post:a" />\n` }),
    );
    expect(problems).toEqual(["posts/a.mdx: embeds itself"]);
  });

  it("rejects an embed in plain Markdown, where it would not be drawn", async () => {
    const problems = await problemsOf(
      await folder({
        "posts/a.mdx": post(),
        "notes/2026-01-01-0900.md": `---\ndate: 2026-01-01T09:00-05:00\n---\n\nSee <Embed of="post:a" />.\n`,
      }),
    );
    expect(problems).toEqual([
      "notes/2026-01-01-0900.md: <Embed> is only drawn in an .mdx file, and a note is a .md",
    ]);
  });

  it("rejects a draft as a cover, though a series may list one", async () => {
    const problems = await problemsOf(
      await folder({
        "posts/a.mdx": post(),
        "posts/b.mdx": post("draft: true\n"),
        "post-series/s.mdx": `---\ntitle: "T"\nposts: [post:a, post:b]\nrelated: [post:b]\n---\n`,
      }),
    );
    expect(problems).toEqual(["post-series/s.mdx: points at post:b, which is a draft"]);
  });

  it("rejects two entries at one address", async () => {
    const project = `---\ntitle: "T"\nsubtitle: "S"\ndate: 2026-01-01\ncategory: Code\n---\n`;
    const series = `---\ntitle: "T"\ndate: 2026-01-01\nphotos: [photo:x]\n---\n`;
    const problems = await problemsOf(
      await folder({ "projects/same.mdx": project, "photo-series/same.mdx": series }),
    );
    expect(problems).toContain(
      "photo-series/same.mdx: /projects/same is already taken by projects/same.mdx",
    );
  });

  it("rejects a series that lists the wrong kind, or one entry twice", async () => {
    const problems = await problemsOf(
      await folder({
        "posts/a.mdx": post(),
        "photo-series/mixed.mdx": `---\ntitle: "T"\ndate: 2026-01-01\nphotos: [post:a]\n---\n`,
        "post-series/twice.mdx": `---\ntitle: "T"\nposts: [post:a, post:a]\n---\n`,
        "post-series/short.mdx": `---\ntitle: "T"\nposts: [post:a]\ntotal: 0\n---\n`,
      }),
    );
    expect(problems).toContain("photo-series/mixed.mdx: lists post:a, which is not a photo");
    expect(problems).toContain("post-series/twice.mdx: lists post:a twice");
    expect(problems.some((p) => p.startsWith("post-series/short.mdx: total:"))).toBe(true);
  });

  it("checks a track's duration, its audio file and what a release lists", async () => {
    const track = (duration: string) =>
      `---\ntitle: T\ndate: 2026-01-01\nduration: "${duration}"\n---\n`;
    const album = (tracks: string) =>
      `---\ntitle: T\ndate: 2026-01-01\nformat: ep\ntracks: [${tracks}]\n---\n`;
    const problems = await problemsOf(
      await folder({
        "tracks/short.mdx": track("3:42"),
        "tracks/long.mdx": track("12:05"),
        "tracks/longer.mdx": track("72:10"),
        "tracks/words.mdx": track("3m42"),
        "tracks/seconds.mdx": track("3:60"),
        "tracks/digit.mdx": track("3:4"),
        "tracks/short.m4a": "",
        "tracks/orphan.mp3": "",
        "tracks/notes.txt": "",
        "posts/a.mdx": post(),
        "albums/mixed.mdx": album("track:short, post:a"),
        "albums/twice.mdx": album("track:long, track:long"),
      }),
    );
    const bad = 'duration: use minutes and seconds, such as "3:42"';
    expect(problems.sort()).toEqual(
      [
        "albums/mixed.mdx: lists post:a, which is not a track",
        "albums/twice.mdx: lists track:long twice",
        `tracks/digit.mdx: ${bad}`,
        "tracks/notes.txt: expected a .mdx file",
        "tracks/orphan.mp3: there is no track named orphan",
        `tracks/seconds.mdx: ${bad}`,
        `tracks/words.mdx: ${bad}`,
      ].sort(),
    );
  });

  it("rejects two sightings that name one species differently", async () => {
    const sighting = (family: string) =>
      `---\nspecies: Carolina Wren\nscientific: Thryothorus ludovicianus\nfamily: ${family}\ndate: 2026-01-01\nplace: Here\n---\n`;
    const problems = await problemsOf(
      await folder({
        "sightings/a.md": sighting("Troglodytidae"),
        "sightings/b.md": sighting("Trogloditidae"),
      }),
    );
    expect(problems).toEqual([
      'sightings/b.md: family is "Trogloditidae", but sightings/a.md has "Troglodytidae" for Carolina Wren',
    ]);
  });

  it("checks what a collection asks of its entries", async () => {
    const problems = await problemsOf(
      await folder({
        "recommendations/a.md": `---\ntitle: A\nmedium: Book\ndate: 2026-01-01\n---\n`,
        "collections/recommendations.yml": [
          "title: Recs",
          "from: recommendation",
          "columns:",
          "  - { key: creator, label: By }",
        ].join("\n"),
        "collections/both.yml": [
          "title: Both",
          "from: sighting",
          "columns:",
          "  - { key: place, label: Where }",
          "items:",
          "  - { id: a, title: A, date: 2026-01-01, place: Here }",
        ].join("\n"),
      }),
    );
    expect(problems).toEqual([
      "collections/both.yml: items: a collection has `items` or `from`, not both",
      'recommendations/a.md: collections/recommendations.yml needs "creator"',
    ]);
  });

  it("rejects a photograph with no alt text, and one with no date", async () => {
    const root = await folder({ "photos/no-alt.yml": "caption: Nothing else\n" });
    await cp(path.join(fixture, "photos/2026-10-02-wren.jpg"), path.join(root, "photos/no-alt.jpg"));
    await cp(path.join(fixture, "photos/2026-08-09-scan.jpg"), path.join(root, "photos/no-date.jpg"));
    await writeFile(path.join(root, "photos/no-date.yml"), "alt: A scan.\n");
    await writeFile(path.join(root, "photos/orphan.yml"), "alt: No image.\n");
    const problems = await problemsOf(root);
    expect(problems.some((p) => p.startsWith("photos/no-alt.jpg: no alt text"))).toBe(true);
    expect(problems.some((p) => p.startsWith("photos/no-date.jpg: no date"))).toBe(true);
    expect(problems).toContain("photos/orphan.yml: there is no image named orphan");
  });

  it("reads a turned photograph's size as it is shown, and rejects one with no frame", async () => {
    const root = await folder({
      "photos/turned.yml": "alt: A.\ndate: 2026-01-01\n",
      "photos/broken.yml": "alt: A.\ndate: 2026-01-01\n",
    });
    // Stored 300 wide and 200 tall, to be shown turned a quarter.
    await writeFile(path.join(root, "photos/turned.jpg"), jpeg(0xc2, 300, 200, exifOrientation(6)));
    await writeFile(path.join(root, "photos/broken.jpg"), "not an image");
    expect(await problemsOf(root)).toEqual([
      "photos/broken.jpg: could not read the image's size. Export it again as a JPEG",
    ]);
    await writeFile(path.join(root, "photos/broken.jpg"), jpeg(0xc0, 300, 200));
    const q = createQueries(await loadContent(root));
    expect(q.need("photo", "turned").data).toMatchObject({ width: 200, height: 300 });
    expect(q.need("photo", "turned").facets.orientation).toBe("portrait");
    expect(q.need("photo", "broken").data).toMatchObject({ width: 300, height: 200 });
  });

  it("checks a collection's rows against its columns", async () => {
    const problems = await problemsOf(
      await folder({
        "collections/recs.yml": [
          "title: Recs",
          "columns:",
          "  - { key: kind, label: Kind }",
          "items:",
          "  - { id: a, title: A, date: 2026-01-01 }",
          "  - { id: b, title: B, date: 2026-01-01, kind: Book, rating: 5 }",
          "  - { id: b, title: B, date: 2026-01-01, kind: Book }",
        ].join("\n"),
      }),
    );
    expect(problems).toEqual([
      'collections/recs.yml: item "a": missing "kind"',
      'collections/recs.yml: item "b": "rating" is not one of the collection\'s columns',
      'collections/recs.yml: item "b": this id is used twice',
    ]);
  });
});
