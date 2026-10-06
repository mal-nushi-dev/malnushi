import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clamp, cssSprings, lerp, lerpArray, reducedMotion, springEasing, springs } from "./motion";

describe("motion library", () => {
  it("defines standard springs matching the site physics", () => {
    expect(springs.width).toEqual({
      type: "spring",
      stiffness: 260,
      damping: 21,
      mass: 1,
    });
    expect(springs.height).toEqual({
      type: "spring",
      stiffness: 220,
      damping: 21,
      mass: 1,
    });
    expect(springs.close).toEqual({
      type: "spring",
      stiffness: 320,
      damping: 34,
      mass: 1,
    });
  });

  it("clamps values between min and max", () => {
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(-0.2)).toBe(0);
    expect(clamp(1.5)).toBe(1);
    expect(clamp(15, 10, 20)).toBe(15);
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it("interpolates scalar values with lerp", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("interpolates array values with lerpArray", () => {
    expect(lerpArray([0, 100, 200], [10, 50, 100], 0.5)).toEqual([5, 75, 150]);
  });

  it("handles reduced motion query gracefully", () => {
    expect(typeof reducedMotion()).toBe("boolean");
  });
});

describe("springEasing", () => {
  const points = (easing: string) =>
    easing.slice("linear(".length, -1).split(", ").map(Number);

  it("starts at rest, ends at rest and is a CSS linear() curve", () => {
    const easing = springEasing(springs.width, 0.6);
    expect(easing).toMatch(/^linear\(0, .+, 1\)$/);
    expect(points(easing)).toHaveLength(31);
  });

  it("overshoots as the nav's opening spring does, by about 7%", () => {
    const peak = Math.max(...points(springEasing(springs.width, 0.6)));
    expect(peak).toBeGreaterThan(1.05);
    expect(peak).toBeLessThan(1.09);
  });

  it("does not overshoot on the closing spring", () => {
    const peak = Math.max(...points(springEasing(springs.close, 0.35)));
    expect(peak).toBeLessThanOrEqual(1.005);
  });

  it("has settled within its time", () => {
    for (const { spring, ms } of Object.values(cssSprings)) {
      const all = points(springEasing(spring, ms / 1000));
      expect(Math.abs(all[all.length - 2] - 1)).toBeLessThan(0.01);
    }
  });

  it.each(Object.entries(cssSprings))("--ease-spring-%s in globals.css is its spring", (name, { spring, ms }) => {
    const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");
    expect(css).toContain(`--ease-spring-${name}: ${springEasing(spring, ms / 1000)};`);
  });
});
