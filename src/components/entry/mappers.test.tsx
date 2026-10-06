// @vitest-environment node
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/load";
import { createQueries, type Queries } from "@/lib/content/query";
import { coverOf, disciplineOf, tileLabel, toTile } from "./mappers";

/*
 * Entries as the projects gallery takes them, asked of the fixture site in
 * src/lib/content/__fixtures__.
 */

let q: Queries;
beforeAll(async () => {
  q = createQueries(
    await loadContent(path.join(__dirname, "../../lib/content/__fixtures__/site")),
  );
});

describe("disciplineOf", () => {
  it("is a project's category", () => {
    expect(disciplineOf(q.need("project", "lamp"))).toBe("Hardware");
  });

  it("is Photography for a photo series and Music for a release, whatever its format", () => {
    expect(disciplineOf(q.need("photo-series", "marsh"))).toBe("Photography");
    expect(disciplineOf(q.need("album", "tides"))).toBe("Music");
    expect(disciplineOf(q.need("album", "collected"))).toBe("Music");
  });
});

describe("tileLabel", () => {
  it("is a project's category", () => {
    expect(tileLabel(q.need("project", "lamp"), q)).toBe("Hardware");
  });

  it("counts a series' photographs and a release's tracks, from what they hold", () => {
    const marsh = q.need("photo-series", "marsh");
    const tides = q.need("album", "tides");
    expect(tileLabel(marsh, q)).toBe(`Photo series · ${q.members(marsh).length}`);
    expect(tileLabel(tides, q)).toBe(`EP · ${q.members(tides).length} tracks`);
  });
});

describe("coverOf", () => {
  it("is a photo series' first photograph when it names no cover", () => {
    expect(coverOf(q.need("photo-series", "marsh"), q)?.ref).toBe("photo:2026-10-02-wren");
  });

  it("is nothing for a project or a release without a cover", () => {
    expect(coverOf(q.need("project", "lamp"), q)).toBeUndefined();
    expect(coverOf(q.need("album", "tides"), q)).toBeUndefined();
  });
});

describe("toTile", () => {
  it("is the entry's link, title, summary, label, year and status", () => {
    expect(toTile(q.need("project", "lamp"), q)).toEqual({
      href: "/projects/lamp",
      title: "A lamp",
      summary: "A fixture project.",
      label: "Hardware",
      year: 2025,
      status: "Finished",
    });
  });

  it("has no status or summary when the entry has none", () => {
    const tile = toTile(q.need("photo-series", "marsh"), q);
    expect(tile.status).toBeUndefined();
    expect(tile.summary).toBeUndefined();
    expect(tile.href).toBe("/projects/marsh");
  });
});
