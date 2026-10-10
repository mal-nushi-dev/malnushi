import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEarth, spinRadiansPerSecond, timeLapse, type Land } from "./earth";

const colors = { ocean: "rgb(0, 0, 255)", land: "rgb(0, 128, 0)" };

// jsdom has no 2D canvas; the Earth only paints on one, so record what it paints.
const fills: string[] = [];
beforeEach(() => {
  fills.length = 0;
  const context = {
    set fillStyle(value: string) {
      fills.push(value);
    },
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
});

describe("Earth spin", () => {
  it("is one turn in 24 seconds: an hour of the real Earth every second", () => {
    expect(timeLapse).toBe(3600);
    expect(spinRadiansPerSecond * 24).toBeCloseTo(Math.PI * 2, 10);
  });

  it("depends on the time, not on how many frames drew it", () => {
    const earth = createEarth(colors);
    const globe = earth.create(1);
    const object = globe.object.children[0];
    globe.turn(10);
    const direct = object.rotation.y;
    for (const t of [1, 2.5, 7, 10]) globe.turn(t);
    expect(object.rotation.y).toBeCloseTo(direct, 10);
    expect(direct).toBeCloseTo(10 * spinRadiansPerSecond, 10);
  });

  it("turns every Earth the same way and at the same rate, at any size", () => {
    const earth = createEarth(colors);
    const small = earth.create(0.16);
    const large = earth.create(2.3);
    small.turn(3);
    large.turn(3);
    expect(small.object.children[0].rotation.y).toBe(large.object.children[0].rotation.y);
    expect(small.object.children[0].rotation.y).toBeGreaterThan(0);
  });
});

describe("Earth shape", () => {
  it("is tilted by the real 23.5 degrees", () => {
    const globe = createEarth(colors).create(1);
    expect(Math.abs(globe.object.rotation.z)).toBeCloseTo((23.5 * Math.PI) / 180, 10);
  });

  it("measures what sits above it from its own radius", () => {
    const globe = createEarth(colors).create(2.3);
    expect(globe.radius).toBe(2.3);
    expect(globe.altitude(1.14)).toBeCloseTo(2.3 * 1.14, 10);
    expect(globe.object.scale.x).toBe(2.3);
  });
});

describe("Earth look", () => {
  it("is painted ocean first, then land", () => {
    createEarth(colors);
    expect(fills).toEqual([colors.ocean, colors.land]);
  });

  it("is one material for every Earth, repainted when land loads or the colors change", () => {
    const earth = createEarth(colors);
    const a = earth.create(1).object.children[0] as unknown as { material: { map: unknown } };
    const b = earth.create(2).object.children[0] as unknown as { material: { map: unknown } };
    expect(a.material).toBe(b.material);

    const before = a.material.map;
    earth.setLand({ features: [] } satisfies Land);
    const withLand = a.material.map;
    expect(withLand).not.toBe(before);

    fills.length = 0;
    earth.recolor({ ocean: "rgb(1, 1, 1)", land: "rgb(2, 2, 2)" });
    expect(a.material.map).not.toBe(withLand);
    expect(b.material.map).toBe(a.material.map);
    expect(fills).toEqual(["rgb(1, 1, 1)", "rgb(2, 2, 2)"]);
  });

  it("disposes once without error", () => {
    const earth = createEarth(colors);
    earth.create(1);
    expect(() => earth.dispose()).not.toThrow();
  });
});
