// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadContent } from "./load";
import { createQueries } from "./query";
import { refsInBody } from "./refs";
import { doc, folder, jpeg, problemsOf, site, valid } from "./testing";

/*
 * How entries point at each other, and what pages can ask of that: edges,
 * what a grouping may hold, the questions in query.ts, and the embeds read
 * out of a body.
 */

const post = (extra: Record<string, unknown> = {}, body = "Text.") =>
  doc({ ...valid.post.data, ...extra }, body);
const track = (extra: Record<string, unknown> = {}) => doc({ ...valid.track.data, ...extra });
const album = (tracks: string[], extra: Record<string, unknown> = {}) =>
  doc({ ...valid.album.data, tracks, ...extra });
const sighting = (species: string, date: string, extra: Record<string, unknown> = {}) =>
  doc({ ...valid.sighting.data, species, scientific: `S. ${species}`, date, ...extra });
const photo = (id: string, date: string) => ({
  [`photos/${id}.jpg`]: jpeg(0xc0, 300, 200),
  [`photos/${id}.yml`]: `alt: A.\ndate: ${date}\n`,
});
const lifeList = (extra = "") =>
  `title: Life list\nfrom: sighting\n${extra}columns:\n  - { key: species, label: Species }\n`;

async function load(files: Parameters<typeof folder>[0], options?: { drafts?: boolean }) {
  return createQueries(await loadContent(await folder(files), options));
}

describe("what a grouping may hold", () => {
  it.each([
    ["album", { tracks: ["photo:2026-01-01-pic"] }, "albums/record.mdx: lists photo:2026-01-01-pic, which is not a track"],
    ["album", { tracks: ["track:song", "album:record"] }, "albums/record.mdx: lists album:record, which is not a track"],
    ["photo-series", { photos: ["post:essay"] }, "photo-series/walk.mdx: lists post:essay, which is not a photo"],
    ["photo-series", { photos: ["photo-series:walk"] }, "photo-series/walk.mdx: lists photo-series:walk, which is not a photo"],
    ["post-series", { posts: ["note:2026-01-02-0900"] }, "post-series/run.mdx: lists note:2026-01-02-0900, which is not a post"],
    ["post-series", { posts: ["post:essay", "project:thing"] }, "post-series/run.mdx: lists project:thing, which is not a post"],
  ] as const)("%s listing %o is stopped", async (kind, change, problem) => {
    expect(await problemsOf(await folder(site({ [kind]: change })))).toEqual([problem]);
  });

  it.each([
    ["album", { tracks: ["track:song", "track:song"] }, "albums/record.mdx: lists track:song twice"],
    ["photo-series", { photos: ["photo:2026-01-01-pic", "photo:2026-01-01-pic"] }, "photo-series/walk.mdx: lists photo:2026-01-01-pic twice"],
    ["post-series", { posts: ["post:essay", "post:essay", "post:essay"] }, "post-series/run.mdx: lists post:essay twice"],
  ] as const)("%s listing one entry more than once is stopped, once", async (kind, change, problem) => {
    expect(await problemsOf(await folder(site({ [kind]: change })))).toEqual([problem]);
  });

  it("stops on a member that does not exist", async () => {
    expect(await problemsOf(await folder(site({ album: { tracks: ["track:song", "track:gone"] } })))).toEqual([
      "albums/record.mdx: points at track:gone, which does not exist",
    ]);
  });

  it("stops on two rows of a table with one id", async () => {
    const problems = await problemsOf(
      await folder({
        "collections/shelf.yml": [
          "title: Shelf",
          "columns:",
          "  - { key: pieces, label: Pieces }",
          "items:",
          "  - { id: set, title: A, date: 2026-01-01, pieces: 1 }",
          "  - { id: set, title: B, date: 2026-01-02, pieces: 2 }",
        ].join("\n"),
      }),
    );
    expect(problems).toEqual(['collections/shelf.yml: item "set": this id is used twice']);
  });
});

describe("edges", () => {
  it("keeps each pointer once, in the order written: frontmatter, then the body", async () => {
    const q = await load({
      ...site({
        post: {
          cover: "photo:2026-01-01-pic",
          related: ["photo:2026-01-01-pic", "project:thing", "project:thing"],
        },
      }),
      "posts/essay.mdx": post(
        {
          cover: "photo:2026-01-01-pic",
          related: ["photo:2026-01-01-pic", "project:thing", "project:thing"],
        },
        `<Embed of="track:song" />\n\n<Embed of="photo:2026-01-01-pic" />\n\n<Embed of="track:song" />`,
      ),
    });
    // One target under three meanings is three edges; one meaning twice is one.
    expect(q.need("post", "essay").edges).toEqual([
      { rel: "cover", to: "photo:2026-01-01-pic" },
      { rel: "related", to: "photo:2026-01-01-pic" },
      { rel: "related", to: "project:thing" },
      { rel: "embeds", to: "track:song" },
      { rel: "embeds", to: "photo:2026-01-01-pic" },
    ]);
  });

  it("reads them backwards, by meaning, each pointing entry once", async () => {
    const q = await load({
      ...site({ post: { cover: "photo:2026-01-01-pic", related: ["photo:2026-01-01-pic"] } }),
      "posts/later.mdx": post({ date: "2026-02-01" }, `<Embed of="photo:2026-01-01-pic" />`),
    });
    const pic = "photo:2026-01-01-pic";
    // Newest first; the essay points twice and is listed once.
    expect(q.backlinks(pic).map((e) => e.ref)).toEqual(["post:later", "photo-series:walk", "post:essay"]);
    expect(q.backlinks(pic, "cover").map((e) => e.ref)).toEqual(["post:essay"]);
    expect(q.backlinks(pic, "related").map((e) => e.ref)).toEqual(["post:essay"]);
    expect(q.backlinks(pic, "embeds").map((e) => e.ref)).toEqual(["post:later"]);
    expect(q.backlinks(pic, "contains").map((e) => e.ref)).toEqual(["photo-series:walk"]);
    expect(q.backlinks("photo:no-such-photo")).toEqual([]);
  });

  it("lets an entry point at a row of a table", async () => {
    const q = await load(site({ post: { related: ["item:shelf/set"] } }));
    expect(q.backlinks("item:shelf/set").map((e) => e.ref)).toEqual(["collection:shelf", "post:essay"]);
    expect(q.get("item:shelf/set")?.url).toBe("/collections/shelf#set");
  });

  it("gives a draft's pointers no say in a build", async () => {
    const files = {
      ...site(),
      "posts/unfinished.mdx": post({ draft: true, cover: "photo:2026-01-01-pic" }),
    };
    expect((await load(files)).backlinks("photo:2026-01-01-pic", "cover")).toEqual([]);
    const writing = await load(files, { drafts: true });
    expect(writing.backlinks("photo:2026-01-01-pic", "cover").map((e) => e.ref)).toEqual(["post:unfinished"]);
  });

  it("reports every pointer left behind when an entry is renamed", async () => {
    const files = site({
      post: { cover: "photo:2026-01-01-pic" },
      project: { related: ["photo:2026-01-01-pic"] },
    });
    files["tracks/song.mdx"] = doc(valid.track.data, `<Embed of="photo:2026-01-01-pic" />`);
    files["photos/2026-01-01-renamed.jpg"] = files["photos/2026-01-01-pic.jpg"];
    files["photos/2026-01-01-renamed.yml"] = files["photos/2026-01-01-pic.yml"];
    delete files["photos/2026-01-01-pic.jpg"];
    delete files["photos/2026-01-01-pic.yml"];
    const gone = "points at photo:2026-01-01-pic, which does not exist";
    expect((await problemsOf(await folder(files))).sort()).toEqual([
      `photo-series/walk.mdx: ${gone}`,
      `posts/essay.mdx: ${gone}`,
      `projects/thing.mdx: ${gone}`,
      `tracks/song.mdx: ${gone}`,
    ]);
  });
});

describe("embeds in a body", () => {
  it("finds each one, in order, however the tag is written", () => {
    expect(refsInBody(`<Embed of="photo:a" />`)).toEqual(["photo:a"]);
    expect(refsInBody(`<Embed of='note:b'/>`)).toEqual(["note:b"]);
    expect(refsInBody(`<Embed index="03" of="photo:a" />`)).toEqual(["photo:a"]);
    expect(refsInBody(`<Embed\n  of="item:shelf/set"\n  index="03"\n/>`)).toEqual(["item:shelf/set"]);
    expect(refsInBody(`One <Embed of="photo:a" /> two <Embed of="track:b" /> one again <Embed of="photo:a" />`)).toEqual([
      "photo:a",
      "track:b",
      "photo:a",
    ]);
    expect(refsInBody("")).toEqual([]);
    expect(refsInBody("No embeds, only [a link](/photography/a).")).toEqual([]);
  });

  it("does not take another tag, or prose, for an embed", () => {
    expect(refsInBody(`<Embedded of="photo:a" />`)).toEqual([]);
    expect(refsInBody(`<EmbedLink of="photo:a" />`)).toEqual([]);
    expect(refsInBody(`<Aside of="photo:a" />`)).toEqual([]);
    expect(refsInBody(`Write Embed of="photo:a" to show it.`)).toEqual([]);
    expect(refsInBody(`<Embed thereof="photo:a" />`)).toEqual([]);
    // Only a ref written out is read; the page itself fails on one it cannot find.
    expect(refsInBody(`<Embed of={cover} />`)).toEqual([]);
  });

  it("passes over one shown as an example in code", () => {
    const fenced = "Before.\n\n```mdx\n<Embed of=\"photo:example\" />\n```\n\n<Embed of=\"photo:real\" />";
    expect(refsInBody(fenced)).toEqual(["photo:real"]);
    expect(refsInBody("~~~\n<Embed of=\"photo:example\" />\n~~~\n")).toEqual([]);
    expect(refsInBody("````\n```\n<Embed of=\"photo:example\" />\n```\n````\n")).toEqual([]);
    expect(refsInBody("Write `<Embed of=\"photo:example\" />` to show it.")).toEqual([]);
    expect(refsInBody("`code` then <Embed of=\"photo:real\" /> then `more`")).toEqual(["photo:real"]);
  });

  it("makes each an `embeds` edge, and stops on one that names nothing", async () => {
    const q = await load({
      ...site(),
      "posts/essay.mdx": post({}, `Text.\n\n<Embed of="sighting:2026-01-07-wren" />\n\n<Embed of="item:shelf/set" />`),
    });
    expect(q.need("post", "essay").edges).toEqual([
      { rel: "embeds", to: "sighting:2026-01-07-wren" },
      { rel: "embeds", to: "item:shelf/set" },
    ]);
    expect(q.backlinks("sighting:2026-01-07-wren", "embeds").map((e) => e.ref)).toEqual(["post:essay"]);

    const problems = await problemsOf(
      await folder({
        ...site(),
        "posts/essay.mdx": post({}, `<Embed of="photo:gone" />\n\n<Embed of="Photo:Wren" />`),
      }),
    );
    expect(problems).toEqual([
      "posts/essay.mdx: points at photo:gone, which does not exist",
      "posts/essay.mdx: points at Photo:Wren, which does not exist",
    ]);
  });

  it("does not stop on an example of an embed that names nothing", async () => {
    const body = "How to embed:\n\n```mdx\n<Embed of=\"photo:your-photo\" />\n```\n";
    const q = await load({ ...site(), "posts/essay.mdx": post({}, body) });
    expect(q.need("post", "essay").edges).toEqual([]);
  });
});

describe("an entry's place in what lists it", () => {
  const releases = {
    "tracks/a.mdx": track({ title: "A" }),
    "tracks/b.mdx": track({ title: "B" }),
    "tracks/c.mdx": track({ title: "C" }),
    "tracks/alone.mdx": track({ title: "Alone" }),
    "albums/first.mdx": album(["track:a", "track:b", "track:c"], { date: "2026-02-01" }),
    "albums/second.mdx": album(["track:c", "track:a"], { date: "2026-03-01", format: "compilation" }),
  };

  it("gives the first, the middle and the last their neighbours", async () => {
    const q = await load(releases);
    const place = (ref: string) => {
      const [part] = q.partOf(ref, "album").filter((p) => p.parent.id === "first");
      return [part.position, part.total, part.previous?.ref, part.next?.ref];
    };
    expect(place("track:a")).toEqual([1, 3, undefined, "track:b"]);
    expect(place("track:b")).toEqual([2, 3, "track:a", "track:c"]);
    expect(place("track:c")).toEqual([3, 3, "track:b", undefined]);
  });

  it("keeps a separate place in each release, newest release first", async () => {
    const q = await load(releases);
    expect(
      q.partOf("track:a").map((p) => [p.parent.ref, p.position, p.total, p.previous?.ref, p.next?.ref]),
    ).toEqual([
      ["album:second", 2, 2, "track:c", undefined],
      ["album:first", 1, 3, undefined, "track:b"],
    ]);
    expect(q.partOf("track:b").map((p) => p.parent.ref)).toEqual(["album:first"]);
  });

  it("is nowhere for an entry on no release, for another kind of grouping, or for no entry", async () => {
    const q = await load(releases);
    expect(q.partOf("track:alone")).toEqual([]);
    expect(q.partOf("track:a", "photo-series")).toEqual([]);
    expect(q.partOf("track:never-written")).toEqual([]);
    // A release is not part of itself.
    expect(q.partOf("album:first")).toEqual([]);
  });

  it("lists members in the order written, not by date", async () => {
    const q = await load({
      "tracks/old.mdx": track({ date: "2020-01-01" }),
      "tracks/new.mdx": track({ date: "2026-01-01" }),
      "albums/record.mdx": album(["track:new", "track:old"]),
    });
    expect(q.members(q.need("album", "record")).map((e) => e.id)).toEqual(["new", "old"]);
    expect(q.members(q.need("track", "old"))).toEqual([]);
  });

  it("counts the parts a series announces, and never fewer than it lists", async () => {
    const series = (posts: string[], total?: number) =>
      doc({ title: "Run", posts, ...(total ? { total } : {}) });
    const parts = { "posts/one.mdx": post(), "posts/two.mdx": post({ date: "2026-01-02" }) };
    const total = async (posts: string[], announced?: number) =>
      (await load({ ...parts, "post-series/run.mdx": series(posts, announced) })).partOf("post:one")[0].total;
    expect(await total(["post:one", "post:two"])).toBe(2);
    expect(await total(["post:one", "post:two"], 5)).toBe(5);
    expect(await total(["post:one"], 1)).toBe(1);
  });
});

describe("the questions pages ask", () => {
  const dated = {
    "posts/january.mdx": post({ date: "2026-01-10", tags: ["Birds", "garden"] }),
    "posts/march.mdx": post({ date: "2026-03-10", type: "the-kernel", category: undefined }),
    "posts/may.mdx": post({ date: "2026-05-10" }),
    "tracks/march.mdx": track({ date: "2026-03-10", tags: ["birds"] }),
    "tracks/april.mdx": track({ date: "2026-04-10" }),
    "notes/2026-03-10-0800.md": doc({ date: "2026-03-10T08:00-04:00", tags: ["BIRDS"] }, "A note."),
    "post-series/run.mdx": doc({ title: "Run", posts: ["post:january"] }),
    "collections/shelf.yml": "title: Shelf\ncolumns:\n  - { key: pieces, label: Pieces }\n",
  };

  it("fails loudly on an entry a page cannot do without", async () => {
    const q = await load(dated);
    expect(() => q.need("post", "gone")).toThrow("No post:gone in the content folder");
    expect(q.get("post", "gone")).toBeUndefined();
    expect(q.get("post:gone")).toBeUndefined();
    expect(q.get("not a ref")).toBeUndefined();
  });

  it("lists one kind newest first, and takes a filter, a limit and the other order", async () => {
    const q = await load(dated);
    expect(q.list("post").map((e) => e.id)).toEqual(["may", "march", "january"]);
    expect(q.list("post", { oldestFirst: true }).map((e) => e.id)).toEqual(["january", "march", "may"]);
    expect(q.list("post", { limit: 2 }).map((e) => e.id)).toEqual(["may", "march"]);
    expect(q.list("post", { limit: 0 })).toEqual([]);
    expect(q.list("post", { limit: 99 })).toHaveLength(3);
    // The limit applies after the filter and the order.
    expect(
      q.list("post", { where: (p) => p.data.type === "article", oldestFirst: true, limit: 1 }).map((e) => e.id),
    ).toEqual(["january"]);
    expect(q.list("photo")).toEqual([]);
  });

  it("streams kinds together by date, and settles a tie the same way every time", async () => {
    const q = await load(dated);
    expect(q.stream().map((e) => e.ref)).toEqual([
      "post:may",
      "track:april",
      // 08:00 in New York is after midnight UTC, which is when a bare day begins.
      "note:2026-03-10-0800",
      "post:march",
      "track:march",
      "post:january",
    ]);
    expect(q.stream({ kinds: ["track"] }).map((e) => e.id)).toEqual(["april", "march"]);
    expect(q.stream({ kinds: ["track", "post"], limit: 2 }).map((e) => e.ref)).toEqual(["post:may", "track:april"]);
    expect(q.stream({ kinds: [] })).toEqual([]);
  });

  it("leaves a grouping without a date of its own out of the stream unless asked", async () => {
    const q = await load(dated);
    const kindsIn = (entries: { kind: string }[]) => new Set(entries.map((e) => e.kind));
    expect(kindsIn(q.stream()).has("post-series")).toBe(false);
    expect(kindsIn(q.stream()).has("collection")).toBe(false);
    expect(q.stream({ kinds: ["post-series", "collection"] }).map((e) => e.ref).sort()).toEqual([
      "collection:shelf",
      "post-series:run",
    ]);
  });

  it("finds a tag whatever its capitals, across kinds, and nothing for a tag unused", async () => {
    const q = await load(dated);
    const birds = ["note:2026-03-10-0800", "track:march", "post:january"];
    expect(q.tagged("birds").map((e) => e.ref)).toEqual(birds);
    expect(q.tagged("BIRDS").map((e) => e.ref)).toEqual(birds);
    expect(q.tagged("garden").map((e) => e.ref)).toEqual(["post:january"]);
    // A tag is matched whole.
    expect(q.tagged("bird")).toEqual([]);
    expect(q.tagged("")).toEqual([]);
  });

  it("finds the neighbours of the same kind, and none past either end", async () => {
    const q = await load(dated);
    const near = (id: string, where?: Parameters<typeof q.adjacent<"post">>[1]) => {
      const { newer, older } = q.adjacent(q.need("post", id), where);
      return [newer?.id, older?.id];
    };
    expect(near("march")).toEqual(["may", "january"]);
    expect(near("may")).toEqual([undefined, "march"]);
    expect(near("january")).toEqual(["march", undefined]);
    // Among articles only, the newsletter issue between them is skipped.
    const articles = (p: { data: { type: string } }) => p.data.type === "article";
    expect(near("may", articles)).toEqual([undefined, "january"]);
    // An entry the filter leaves out has no place in that run.
    expect(near("march", articles)).toEqual([undefined, undefined]);
  });

  it("orders by revision only when asked", async () => {
    const q = await load({
      ...dated,
      "posts/january.mdx": post({ date: "2026-01-10", updated: "2026-06-01" }),
    });
    expect(q.list("post").map((e) => e.id)).toEqual(["may", "march", "january"]);
    expect(q.list("post", { by: "updated" }).map((e) => e.id)).toEqual(["january", "may", "march"]);
    expect(q.stream({ by: "updated", limit: 1 })[0].ref).toBe("post:january");
    expect(q.list("post", { by: "updated", oldestFirst: true }).map((e) => e.id)).toEqual(["march", "may", "january"]);
  });
});

describe("a collection that asks for its rows", () => {
  it("keeps one row a species: the earliest, whether a day or a moment was written", async () => {
    const q = await load({
      "sightings/c.md": sighting("Wren", "2026-03-01"),
      "sightings/a.md": sighting("Wren", "2026-01-05T07:30-05:00"),
      "sightings/b.md": sighting("Wren", "2026-01-05T18:00-05:00"),
      "sightings/d.md": sighting("Heron", "2026-01-04"),
      "sightings/e.md": sighting("Heron", "2025-12-31T23:59-05:00"),
      "collections/life-list.yml": lifeList("unique: species\n"),
    });
    const list = q.need("collection", "life-list");
    // In the order of first seeing.
    expect(list.data.items).toEqual(["sighting:e", "sighting:a"]);
    expect(list.edges).toEqual([
      { rel: "contains", to: "sighting:e" },
      { rel: "contains", to: "sighting:a" },
    ]);
    // The list's date is its newest row, not its newest sighting.
    expect(list.date).toBe("2026-01-05T07:30-05:00");
    expect(q.partOf("sighting:a", "collection")[0]).toMatchObject({ position: 2, total: 2 });
    expect(q.partOf("sighting:c")).toEqual([]);
    expect(q.list("sighting")).toHaveLength(5);
  });

  it("lists every entry, oldest first, when no field is to be unique", async () => {
    const q = await load({
      "sightings/b.md": sighting("Wren", "2026-02-01"),
      "sightings/a.md": sighting("Wren", "2026-01-01"),
      "sightings/c.md": sighting("Heron", "2026-01-15"),
      "collections/life-list.yml": lifeList(),
    });
    expect(q.need("collection", "life-list").data.items).toEqual(["sighting:a", "sighting:c", "sighting:b"]);
  });

  it("never lets a draft be a row, or stand in for the first published sighting", async () => {
    const files = {
      "sightings/draft.md": sighting("Wren", "2026-01-01", { draft: true }),
      "sightings/seen.md": sighting("Wren", "2026-02-01"),
      "sightings/only-draft.md": sighting("Heron", "2026-01-10", { draft: true }),
      "collections/life-list.yml": lifeList("unique: species\n"),
    };
    expect((await load(files)).need("collection", "life-list").data.items).toEqual(["sighting:seen"]);
    expect((await load(files, { drafts: true })).need("collection", "life-list").data.items).toEqual([
      "sighting:draft",
      "sighting:only-draft",
    ]);
  });

  it("is empty, not broken, before the first entry is written", async () => {
    const q = await load({ "collections/life-list.yml": lifeList("unique: species\n") });
    expect(q.need("collection", "life-list").data.items).toEqual([]);
    expect(q.members(q.need("collection", "life-list"))).toEqual([]);
  });

  it("stops when one species is given two scientific names, or two families", async () => {
    const problems = await problemsOf(
      await folder({
        "sightings/a.md": sighting("Wren", "2026-01-01"),
        "sightings/b.md": sighting("Wren", "2026-01-02", { scientific: "Troglodytes aedon" }),
        "sightings/c.md": sighting("Wren", "2026-01-03", { family: "Wrens" }),
        "sightings/d.md": sighting("Heron", "2026-01-04"),
      }),
    );
    expect(problems).toEqual([
      'sightings/b.md: scientific is "Troglodytes aedon", but sightings/a.md has "S. Wren" for Wren',
      'sightings/c.md: family is "Wrens", but sightings/a.md has "Troglodytidae" for Wren',
    ]);
  });

  it("holds a conflict against a draft too, so publishing it cannot split a row", async () => {
    const files = {
      "sightings/a.md": sighting("Wren", "2026-01-01"),
      "sightings/b.md": sighting("Wren", "2026-01-02", { family: "Wrens", draft: true }),
    };
    expect(await problemsOf(await folder(files))).toEqual([]);
    expect(await problemsOf(await folder(files), { drafts: true })).toHaveLength(1);
  });

  it("asks each row for the columns the collection shows, unless a column is optional", async () => {
    const columns = (optional: boolean) =>
      `title: Life list\nfrom: sighting\ncolumns:\n  - { key: species, label: Species }\n  - { key: habitat, label: Habitat, optional: ${optional} }\n`;
    const files = (optional: boolean) => ({
      "sightings/a.md": sighting("Wren", "2026-01-01", { habitat: "Garden" }),
      "sightings/b.md": sighting("Heron", "2026-01-02"),
      "collections/life-list.yml": columns(optional),
    });
    expect(await problemsOf(await folder(files(false)))).toEqual([
      'sightings/b.md: collections/life-list.yml needs "habitat"',
    ]);
    expect(await problemsOf(await folder(files(true)))).toEqual([]);
  });

  it("withholds a draft table and its rows together", async () => {
    const files: Parameters<typeof folder>[0] = {
      ...site(),
      "collections/shelf.yml":
        "title: Shelf\ndraft: true\ncolumns:\n  - { key: pieces, label: Pieces }\nitems:\n  - { id: set, title: Set, date: 2026-01-09, pieces: 10 }\n",
    };
    const q = await load(files);
    expect(q.get("collection", "shelf")).toBeUndefined();
    expect(q.get("item", "shelf/set")).toBeUndefined();
    expect((await load(files, { drafts: true })).get("item", "shelf/set")?.draft).toBe(true);
    // And nothing published may point at a row of it.
    files["posts/essay.mdx"] = post({ related: ["item:shelf/set"] });
    expect(await problemsOf(await folder(files))).toEqual([
      "posts/essay.mdx: points at item:shelf/set, which is a draft",
    ]);
  });
});

describe("two entries, one address", () => {
  it("stops a project, a photo series and a release from sharing a slug", async () => {
    const problems = await problemsOf(
      await folder({
        ...photo("2026-01-01-pic", "2026-01-01"),
        "tracks/song.mdx": track(),
        "projects/same.mdx": doc(valid.project.data),
        "photo-series/same.mdx": doc(valid["photo-series"].data),
        "albums/same.mdx": album(["track:song"]),
      }),
    );
    expect(problems.sort()).toEqual([
      "albums/same.mdx: /projects/same is already taken by projects/same.mdx",
      "photo-series/same.mdx: /projects/same is already taken by projects/same.mdx",
    ]);
  });

  it("lets kinds with different addresses share a name", async () => {
    const root = await folder({
      "posts/same.mdx": post(),
      "tracks/same.mdx": track(),
      "projects/same.mdx": doc(valid.project.data),
      "recommendations/same.md": doc(valid.recommendation.data),
    });
    expect(await problemsOf(root)).toEqual([]);
  });
});
