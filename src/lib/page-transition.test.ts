import { describe, expect, it } from "vitest";
import { plateOrigin, type Origin } from "./page-origin";
import { frame } from "./page-transition";

const spine: Origin = {
  box: { l: 96, t: 250, r: 208, b: 590 },
  rad: 4,
  rb: 0,
  spine: true,
};
const at = (over: Partial<Parameters<typeof frame>[3]> = {}) => ({
  p: 0, q: 0, c: 0, dy: 0, squash: 0, ...over,
});

describe("frame", () => {
  it("starts as the origin's box, held by a full plate", () => {
    const f = frame(spine, 1100, 700, at(), false);
    expect(f.plate).toMatchObject({ l: 96, t: 250, w: 112, h: 340 });
    expect(f.fill).toBe(1);
    expect(f.ghost).toBe(1);
  });

  it("ends as the whole viewport, with the plate gone", () => {
    const f = frame(spine, 1100, 700, at({ p: 1, q: 1, c: 1 }), false);
    expect(f.plate).toMatchObject({ l: 0, t: 0, w: 1100, h: 700 });
    expect(f.fill).toBe(0);
    expect(f.ghost).toBe(0);
  });

  it("widens before it drops", () => {
    const f = frame(spine, 1100, 700, at({ p: 1 }), false);
    expect(f.plate).toMatchObject({ l: 0, w: 1100, t: 250, h: 340 });
  });

  it("keeps the box where it is seen while the page settles", () => {
    const still = frame(spine, 1100, 700, at(), false);
    const moved = frame(spine, 1100, 700, at({ dy: 18 }), false);
    // The image is moved down 18px, so its clip moves up by the same.
    expect(moved.open).toContain("232px");
    expect(still.open).toContain("250px");
  });

  it("thins the box by the squash, evenly", () => {
    const f = frame(spine, 1100, 700, at({ squash: 4 }), false);
    expect(f.plate.t).toBe(252);
    expect(f.plate.h).toBe(336);
  });

  it("lets the plate go as it lands when closing", () => {
    const open = frame(spine, 1100, 700, at({ p: 1, q: 1, c: 0 }), true);
    const landed = frame(spine, 1100, 700, at({ p: 0, q: 0, c: 0 }), true);
    expect(open.fill).toBe(1);
    expect(landed.fill).toBe(0);
  });

  it("starts from the nav plate's footprint by default", () => {
    const o = plateOrigin(1100);
    expect(o.box).toEqual({ l: 250, t: 24, r: 850, b: 96 });
    expect(o.spine).toBe(false);
  });
});
