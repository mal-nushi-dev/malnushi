// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadContent } from "./load";
import { createQueries } from "./query";
import { doc, folder, problemsOf, site, valid, written, type Written } from "./testing";

/*
 * What each kind's file must hold. Every case starts from a whole valid site
 * (testing.ts) and breaks one thing, so a failure names the one rule that
 * stopped holding.
 */

const required: Record<Written, string[]> = {
  post: ["title", "subtitle", "date", "category"],
  note: ["date"],
  project: ["title", "subtitle", "date", "category"],
  "photo-series": ["title", "date", "photos"],
  "post-series": ["title", "posts"],
  track: ["title", "date", "duration"],
  album: ["title", "date", "format", "tracks"],
  sighting: ["species", "scientific", "family", "date", "place"],
  recommendation: ["title", "medium", "date"],
};

describe("a valid site", () => {
  it("loads with nothing to report, with and without drafts", async () => {
    const root = await folder(site());
    expect(await problemsOf(root)).toEqual([]);
    expect(await problemsOf(root, { drafts: true })).toEqual([]);
  });

  it("is written with required fields only, so each test below removes a needed one", () => {
    for (const kind of written) {
      expect(Object.keys(valid[kind].data).sort(), kind).toEqual([...required[kind]].sort());
    }
  });
});

describe("a missing field", () => {
  const cases = written.flatMap((kind) => required[kind].map((field) => [kind, field] as const));

  it.each(cases)("%s without %s is reported by file and field", async (kind, field) => {
    const problems = await problemsOf(await folder(site({ [kind]: { [field]: undefined } })));
    const expected = `${valid[kind].path}: ${field}: `;
    expect(problems.filter((p) => p.startsWith(expected)), problems.join("\n")).toHaveLength(1);
  });
});

describe("a field the kind does not have", () => {
  it.each(written)("%s rejects a misspelled key, and names it", async (kind) => {
    const problems = await problemsOf(await folder(site({ [kind]: { catgory: "Tech" } })));
    const own = problems.filter((p) => p.startsWith(`${valid[kind].path}: `));
    expect(own, problems.join("\n")).toHaveLength(1);
    expect(own[0]).toContain("catgory");
  });
});

describe("a field with the wrong value", () => {
  const cases: [Written, Record<string, unknown>, string, string][] = [
    ["post", { date: "January 1" }, "date", "use YYYY-MM-DD"],
    ["post", { date: "2026-1-5" }, "date", "use YYYY-MM-DD"],
    ["post", { updated: "soon" }, "updated", ""],
    ["post", { cover: "wren" }, "cover", 'use a ref such as "photo:2026-10-02-wren"'],
    ["post", { related: ["Photo:Wren"] }, "related.0", "use a ref"],
    ["post", { tags: [""] }, "tags.0", ""],
    ["post", { tags: "birds" }, "tags", ""],
    ["post", { type: "essay" }, "type", ""],
    ["post", { issue: 0 }, "issue", ""],
    ["post", { substack: "not a link" }, "substack", ""],
    ["post", { draft: "yes" }, "draft", ""],
    ["post", { feature: { accent: "red", hero: "type-only", headline: "display-l" } }, "feature.accent", "use a six-digit hex color"],
    ["post", { feature: { accent: "#8A5A3C", hero: "poster", headline: "display-l" } }, "feature.hero", ""],
    [
      "post",
      { type: "the-kernel", feature: { accent: "#8A5A3C", hero: "type-only", headline: "display-l" } },
      "feature",
      "a newsletter issue is never a feature",
    ],
    ["note", { date: "2026-01-02" }, "date", "a time with its UTC offset"],
    ["note", { date: "2026-01-02T09:00" }, "date", "a time with its UTC offset"],
    ["note", { syndicated: ["threads"] }, "syndicated.0", ""],
    ["project", { links: [{ label: "Code" }] }, "links.0.href", ""],
    ["photo-series", { photos: [] }, "photos", ""],
    ["photo-series", { number: 1.5 }, "number", ""],
    ["post-series", { posts: [] }, "posts", ""],
    ["track", { duration: "3m42" }, "duration", 'use minutes and seconds, such as "3:42"'],
    ["track", { duration: "3:60" }, "duration", "use minutes and seconds"],
    ["track", { duration: "3:4" }, "duration", "use minutes and seconds"],
    ["track", { duration: ":42" }, "duration", "use minutes and seconds"],
    ["track", { duration: "1:02:03" }, "duration", "use minutes and seconds"],
    ["track", { duration: 222 }, "duration", ""],
    ["track", { bpm: 0 }, "bpm", ""],
    ["track", { composer: "Traditional" }, "composer", ""],
    ["track", { credits: [{ role: "Mix" }] }, "credits.0.name", ""],
    ["album", { format: "lp" }, "format", ""],
    ["album", { tracks: [] }, "tracks", ""],
    ["album", { tracks: ["song"] }, "tracks.0", "use a ref"],
    ["sighting", { coordinates: { lat: 91, lng: 0 } }, "coordinates.lat", ""],
    ["sighting", { coordinates: { lat: 0, lng: -181 } }, "coordinates.lng", ""],
    ["sighting", { coordinates: { lat: 0 } }, "coordinates.lng", ""],
    ["sighting", { count: 0 }, "count", ""],
    ["sighting", { count: 1.5 }, "count", ""],
    ["recommendation", { url: "nope" }, "url", ""],
  ];

  it.each(cases)("%s with %o is reported at %s", async (kind, change, field, message) => {
    const problems = await problemsOf(await folder(site({ [kind]: change })));
    const own = problems.filter((p) => p.startsWith(`${valid[kind].path}: ${field}: `));
    expect(own, problems.join("\n")).toHaveLength(1);
    expect(own[0]).toContain(message);
  });

  const accepted: [Written, Record<string, unknown>][] = [
    ["track", { duration: "0:07" }],
    ["track", { duration: "3:42" }],
    ["track", { duration: "12:05" }],
    ["track", { duration: "72:10" }],
    ["track", { duration: "120:00" }],
    ["sighting", { date: "2026-01-07T07:14-05:00" }],
    ["sighting", { date: "2026-01-07T07:14:09+05:30" }],
    ["sighting", { coordinates: { lat: -90, lng: 180 } }],
    ["post", { type: "the-kernel", category: undefined, issue: 12 }],
    ["post-series", { total: 3 }],
  ];

  it.each(accepted)("%s accepts %o", async (kind, change) => {
    expect(await problemsOf(await folder(site({ [kind]: change })))).toEqual([]);
  });
});

describe("what is filled in when a field is left out", () => {
  it("gives each kind its defaults", async () => {
    const q = createQueries(await loadContent(await folder(site())));
    expect(q.need("post", "essay").data).toMatchObject({
      author: "Mal Nushi",
      type: "article",
      tags: [],
      related: [],
      draft: false,
    });
    expect(q.need("note", "2026-01-02-0900").data).toMatchObject({ tags: [], syndicated: [] });
    expect(q.need("project", "thing").data).toMatchObject({ links: [], tags: [] });
    expect(q.need("track", "song").data).toMatchObject({ artist: "Mal Nushi", credits: [] });
    expect(q.need("album", "record").data.artist).toBe("Mal Nushi");
    expect(q.need("collection", "shelf").data.summary).toEqual(["date"]);
    for (const entry of q.stream({ kinds: ["post", "note", "project", "track", "album"] })) {
      expect(entry.tags, entry.ref).toEqual([]);
      expect(entry.draft, entry.ref).toBe(false);
      expect(entry.updated, entry.ref).toBeUndefined();
    }
  });

  it("lets what is written win over a default", async () => {
    const q = createQueries(
      await loadContent(
        await folder(site({ track: { artist: "Someone Else" }, post: { author: "A Guest" } })),
      ),
    );
    expect(q.need("track", "song").facets.artist).toBe("Someone Else");
    expect(q.need("post", "essay").facets.author).toBe("A Guest");
  });
});

describe("a file the loader cannot read as an entry", () => {
  it("reports broken YAML with the file, and carries on to the rest", async () => {
    const problems = await problemsOf(
      await folder({
        ...site(),
        "posts/broken.mdx": `---\ntitle: "Unclosed\ndate: 2026-01-01\n---\n\nText.\n`,
        "posts/also-wrong.mdx": doc({ title: "T" }),
      }),
    );
    expect(problems.filter((p) => p.startsWith("posts/broken.mdx: "))).toHaveLength(1);
    // Every problem at once, not only the first.
    expect(problems.some((p) => p.startsWith("posts/also-wrong.mdx: subtitle: "))).toBe(true);
    expect(problems.every((p) => /^posts\/(broken|also-wrong)\.mdx: /.test(p))).toBe(true);
  });

  it("treats a file with no frontmatter as one with every field missing", async () => {
    const problems = await problemsOf(await folder({ "posts/bare.mdx": "Just text.\n" }));
    // The rule that an article needs a category is checked once the rest is sound.
    expect(problems.map((p) => p.split(": ")[1]).sort()).toEqual(["date", "subtitle", "title"]);
    expect(problems.every((p) => p.startsWith("posts/bare.mdx: "))).toBe(true);
  });

  it("reads frontmatter saved with Windows line endings", async () => {
    const { path, data, body } = valid.post;
    const root = await folder({ [path]: doc(data, body).replace(/\n/g, "\r\n") });
    const q = createQueries(await loadContent(root));
    expect(q.need("post", "essay").title).toBe("Essay");
    expect(q.need("post", "essay").body).toBe("Text.");
  });

  it("rejects an empty note, a file of the wrong type and a name that cannot be an id", async () => {
    const problems = await problemsOf(
      await folder({
        "notes/2026-01-02-0900.md": doc(valid.note.data),
        "notes/2026-01-02-1000.mdx": doc(valid.note.data, "Text."),
        "sightings/Carolina Wren.md": doc(valid.sighting.data),
        "photos/sketch.png": "",
        "collections/list.json": "{}",
      }),
    );
    expect(problems.sort()).toEqual([
      "collections/list.json: expected a .yml file",
      "notes/2026-01-02-0900.md: a note needs its text",
      "notes/2026-01-02-1000.mdx: expected a .md file",
      "photos/sketch.png: expected a .jpg image or a .yml file",
      "sightings/Carolina Wren.md: the file name is the id, so use lowercase letters, digits and hyphens only",
    ]);
  });

  it("skips dotfiles and a folder that is not there", async () => {
    const root = await folder({ ...site(), "posts/.DS_Store": "", "tracks/.gitkeep": "" });
    expect(await problemsOf(root)).toEqual([]);
    expect(await problemsOf(await folder({}))).toEqual([]);
  });
});

describe("a file beside an entry", () => {
  const track = doc(valid.track.data);

  it("records the audio under either extension, and prefers .mp3", async () => {
    const q = createQueries(
      await loadContent(
        await folder({
          "tracks/one.mdx": track,
          "tracks/one.m4a": "",
          "tracks/both.mdx": track,
          "tracks/both.m4a": "",
          "tracks/both.mp3": "",
          "tracks/none.mdx": track,
        }),
      ),
    );
    expect(q.need("track", "one").data.audio).toBe("one.m4a");
    expect(q.need("track", "both").data.audio).toBe("both.mp3");
    expect(q.need("track", "none").data.audio).toBeUndefined();
    expect("audio" in q.need("track", "none").data).toBe(false);
  });

  it("stops on audio with no track, naming the file", async () => {
    const problems = await problemsOf(
      await folder({ "tracks/song.mdx": track, "tracks/sogn.mp3": "", "tracks/b-side.m4a": "" }),
    );
    expect(problems).toEqual([
      "tracks/b-side.m4a: there is no track named b-side",
      "tracks/sogn.mp3: there is no track named sogn",
    ]);
  });

  it("keeps the audio of a track in draft from counting as stray", async () => {
    const root = await folder({
      "tracks/song.mdx": track,
      "tracks/unfinished.mdx": doc({ ...valid.track.data, draft: true }),
      "tracks/unfinished.mp3": "",
    });
    expect(await problemsOf(root)).toEqual([]);
  });

  it("does not take audio in another kind's folder for an asset", async () => {
    const problems = await problemsOf(await folder({ ...site(), "posts/essay.mp3": "" }));
    expect(problems).toEqual(["posts/essay.mp3: expected a .mdx file"]);
  });
});

describe("a collection's file", () => {
  const collection = (extra: Record<string, unknown>) =>
    folder({
      ...site(),
      "collections/extra.yml": doc({ title: "Extra", ...extra }).replace(/^---\n|---\n\n\n$/g, ""),
    });

  it.each([
    [{ columns: [] }, "columns"],
    [{}, "columns"],
    [{ columns: [{ key: "a", label: "A" }], unique: "a" }, "unique"],
    [{ columns: [{ key: "a", label: "A" }], from: "post" }, "from"],
    [{ columns: [{ key: "a" }] }, "columns.0.label"],
  ])("with %o is reported at %s", async (extra, field) => {
    const problems = await problemsOf(await collection(extra));
    expect(problems.filter((p) => p.startsWith(`collections/extra.yml: ${field}: `))).toHaveLength(1);
  });
});
