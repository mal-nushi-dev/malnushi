// @vitest-environment node
import { cp, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { exifLine, noteDateLine, readingTime } from "./format";
import { ContentError, loadContent } from "./load";
import { createQueries } from "./query";
import { parseRef, refsInBody, urlFor } from "./refs";

const fixture = path.join(import.meta.dirname, "__fixtures__/site");

const post = (extra = "") =>
  `---\ntitle: "T"\nsubtitle: "S"\ndate: 2026-01-01\ncategory: Tech\n${extra}---\n\nText.\n`;

/** A throwaway content folder holding the given files. */
async function folder(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), "content-"));
  for (const [name, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), text);
  }
  return root;
}

async function problemsOf(root: string) {
  try {
    await loadContent(root);
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  return [];
}

describe("refs", () => {
  it("parses a ref and rejects anything else", () => {
    expect(parseRef("photo:2026-10-02-wren")).toEqual({ kind: "photo", id: "2026-10-02-wren" });
    expect(parseRef("item:life-list/carolina-wren")).toEqual({
      kind: "item",
      id: "life-list/carolina-wren",
    });
    expect(parseRef("photo:Wren")).toBeNull();
    expect(parseRef("bird:wren")).toBeNull();
    expect(parseRef("item:wren")).toBeNull();
  });

  it("gives a collection row its collection's page and an anchor", () => {
    expect(urlFor("item", "life-list/carolina-wren")).toBe("/collections/life-list#carolina-wren");
    expect(urlFor("series", "marsh")).toBe("/projects/marsh");
  });

  it("finds the embeds in a body", () => {
    expect(refsInBody(`a <Embed of="photo:a" /> b <Embed size="column" of='note:b'/>`)).toEqual([
      "photo:a",
      "note:b",
    ]);
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

describe("the fixture folder", async () => {
  const q = createQueries(await loadContent(fixture));

  it("loads every kind, without the draft", () => {
    expect(q.stream({ kinds: ["post", "note", "photo", "series", "project", "collection", "item"] }).map((e) => e.ref).sort()).toEqual([
      "collection:life-list",
      "item:life-list/carolina-wren",
      "item:life-list/great-blue-heron",
      "note:2026-10-03-1412",
      "photo:2026-08-09-scan",
      "photo:2026-10-02-wren",
      "post:first-post",
      "post:issue-1",
      "project:lamp",
      "series:marsh",
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

  it("keeps each kind's own fields", () => {
    expect(q.need("post", "issue-1").data).toMatchObject({ type: "the-kernel", issue: 1 });
    expect(q.need("project", "lamp").data.materials).toEqual(["brass", "walnut"]);
    expect(q.need("item", "life-list/carolina-wren").data).toEqual({
      collection: "life-list",
      fields: {
        title: "Carolina Wren",
        date: "2026-09-27",
        scientific: "Thryothorus ludovicianus",
        family: "Troglodytidae",
        where: "Charlotte",
      },
    });
    expect(q.need("collection", "life-list").data.items).toHaveLength(2);
  });

  it("lists one kind, newest first, with a filter and a limit", () => {
    expect(q.list("post").map((p) => p.id)).toEqual(["issue-1", "first-post"]);
    expect(q.list("post", { where: (p) => p.data.type === "article" }).map((p) => p.id)).toEqual([
      "first-post",
    ]);
    expect(q.list("item", { limit: 1 })[0].title).toBe("Carolina Wren");
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

  it("collects links from frontmatter and embeds, and reverses them", () => {
    expect(q.need("post", "first-post").links).toEqual([
      "photo:2026-10-02-wren",
      "project:lamp",
      "item:life-list/carolina-wren",
    ]);
    expect(q.backlinks("photo:2026-10-02-wren").map((e) => e.ref)).toEqual([
      "post:first-post",
      "series:marsh",
    ]);
    expect(q.backlinks("item:life-list/carolina-wren").map((e) => e.ref)).toEqual(["post:first-post"]);
    expect(q.backlinks("note:2026-10-03-1412")).toEqual([]);
  });

  it("finds an entry's neighbours", () => {
    const { newer, older } = q.adjacent(q.need("post", "first-post"));
    expect(newer?.id).toBe("issue-1");
    expect(older).toBeUndefined();
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

  it("rejects two entries at one address", async () => {
    const project = `---\ntitle: "T"\nsubtitle: "S"\ndate: 2026-01-01\ncategory: Code\n---\n`;
    const series = `---\ntitle: "T"\ndate: 2026-01-01\nphotos: [photo:x]\n---\n`;
    const problems = await problemsOf(
      await folder({ "projects/same.mdx": project, "series/same.mdx": series }),
    );
    expect(problems).toContain("series/same.mdx: /projects/same is already taken by projects/same.mdx");
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
