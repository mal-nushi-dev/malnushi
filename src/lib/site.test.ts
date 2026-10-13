import { describe, expect, it } from "vitest";
import { sectionOf } from "./site";

describe("sectionOf", () => {
  it("names the section a path is under", () => {
    expect(sectionOf("/writing")).toBe("Writing");
    expect(sectionOf("/writing/notes/a-note")).toBe("Writing");
    expect(sectionOf("/projects/dns-filter")).toBe("Projects");
    expect(sectionOf("/collections/life-list/log")).toBe("Collections");
    expect(sectionOf("/about")).toBe("About");
  });

  it("puts photography and music under Projects", () => {
    expect(sectionOf("/photography/2026-10-02-wren-at-the-window")).toBe("Projects");
    expect(sectionOf("/music")).toBe("Projects");
  });

  it("has none for the home page, an unknown path or no path", () => {
    expect(sectionOf("/")).toBeUndefined();
    expect(sectionOf("/nowhere")).toBeUndefined();
    expect(sectionOf(null)).toBeUndefined();
  });
});
