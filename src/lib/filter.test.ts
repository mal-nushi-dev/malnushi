// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  filterKeys,
  filtersFrom,
  formatSelection,
  matching,
  openFilters,
  parseSelection,
  toggle,
} from "./filter";

const filters = filtersFrom(["Code", "Design", "Code", "Hardware", "Music"]);
const item = (id: string, label: string, tags: string[] = []) => ({
  id,
  keys: filterKeys(label, tags, filters),
});
const items = [
  item("dns", "Code", ["design", "swift"]),
  item("system", "Design", ["Code"]),
  item("lamp", "Hardware", ["design"]),
  item("ep", "Music"),
];
const ids = (found: { id: string }[]) => found.map((i) => i.id);

describe("filtersFrom", () => {
  it("offers one filter per main label, the most used first, then by name", () => {
    expect(filters).toEqual([
      { key: "code", label: "Code" },
      { key: "design", label: "Design" },
      { key: "hardware", label: "Hardware" },
      { key: "music", label: "Music" },
    ]);
  });

  it("treats labels that differ only in case as one, shown as first written", () => {
    expect(filtersFrom(["Lego", "lego ", "LEGO"])).toEqual([{ key: "lego", label: "Lego" }]);
  });
});

describe("filterKeys", () => {
  it("is the main label and the tags that name a filter, once each", () => {
    expect(items[0].keys).toEqual(["code", "design"]);
    expect(filterKeys("Code", ["code", "CODE"], filters)).toEqual(["code"]);
  });

  it("leaves out a tag that names no filter", () => {
    expect(items[0].keys).not.toContain("swift");
  });
});

describe("matching", () => {
  it("is everything when nothing is selected", () => {
    expect(matching(items, [])).toEqual(items);
  });

  it("keeps the items that answer to every selected filter", () => {
    expect(ids(matching(items, ["design"]))).toEqual(["dns", "system", "lamp"]);
    expect(ids(matching(items, ["code", "design"]))).toEqual(["dns", "system"]);
    expect(matching(items, ["music", "code"])).toEqual([]);
  });
});

describe("openFilters", () => {
  const keys = (selected: string[]) => openFilters(items, selected, filters).map((f) => f.key);

  it("is every filter when nothing is selected", () => {
    expect(keys([])).toEqual(["code", "design", "hardware", "music"]);
  });

  it("hides a filter that would leave nothing", () => {
    expect(keys(["hardware"])).toEqual(["design", "hardware"]);
    expect(keys(["music"])).toEqual(["music"]);
  });

  it("keeps a selected filter even when the selection matches nothing", () => {
    expect(keys(["music", "code"])).toEqual(["code", "music"]);
  });

  it("never offers a filter that would empty the list", () => {
    for (const f of filters) {
      for (const open of openFilters(items, [f.key], filters)) {
        expect(matching(items, toggle([f.key], open.key, filters)).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("toggle", () => {
  it("adds and removes, in the order the filters are shown", () => {
    expect(toggle([], "design", filters)).toEqual(["design"]);
    expect(toggle(["design"], "code", filters)).toEqual(["code", "design"]);
    expect(toggle(["code", "design"], "code", filters)).toEqual(["design"]);
  });
});

describe("the URL", () => {
  it("reads a selection, dropping what is not a filter and ignoring case and order", () => {
    expect(parseSelection("design,code", filters)).toEqual(["code", "design"]);
    expect(parseSelection("Design, nope,,", filters)).toEqual(["design"]);
    expect(parseSelection(null, filters)).toEqual([]);
    expect(parseSelection("", filters)).toEqual([]);
  });

  it("writes a selection, and nothing when all is shown", () => {
    expect(formatSelection(["code", "design"])).toBe("code,design");
    expect(formatSelection([])).toBeUndefined();
  });

  it("round-trips", () => {
    expect(parseSelection(formatSelection(["code", "music"]), filters)).toEqual(["code", "music"]);
  });
});
