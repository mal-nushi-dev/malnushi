import { describe, expect, it } from "vitest";
import { clamp, lerp, lerpArray, reducedMotion, springs } from "./motion";

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
