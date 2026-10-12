import { describe, expect, it } from "vitest";
import { heatRamp } from "./heat";

const light = heatRamp([237, 238, 235], [98, 110, 94], [46, 46, 46], [46, 46, 46], false);
const dark = heatRamp([61, 68, 76], [117, 128, 114], [237, 238, 235], [46, 46, 46], true);
const lightness = ([r, g, b]: readonly number[]) => (r + g + b) / 3;

describe("heat ramp", () => {
  it("is the gray for nothing", () => {
    expect(light.at(0, 18)).toEqual([237, 238, 235, 255]);
  });

  it("makes one a clear step from the gray, in the direction of more", () => {
    // Light: more is darker. Dark: more is lighter.
    expect(lightness(light.at(0, 18)) - lightness(light.at(1, 18))).toBeGreaterThan(25);
    expect(lightness(dark.at(1, 18)) - lightness(dark.at(0, 18))).toBeGreaterThan(25);
  });

  it("deepens in a straight line to the most, and no further", () => {
    const l = [1, 6, 12, 18, 40].map((n) => lightness(light.at(n, 18)));
    expect(l).toEqual([...l].sort((a, b) => b - a));
    expect(light.at(40, 18)).toEqual(light.at(18, 18));
    expect(light.at(9, 17)).toEqual(light.at(9, 17));
  });

  it("is not blank when one species is the most", () => {
    expect(light.at(1, 1)).not.toEqual(light.at(0, 1));
  });
});
