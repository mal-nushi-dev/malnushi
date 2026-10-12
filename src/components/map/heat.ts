/*
 * The heat of a count: 0 is the page's gray, and anything above it is a tint
 * of the accent that is already a clear step from gray, deepening in a
 * straight line to the most. In the dark scheme "more" is lighter, since a
 * dark fill on a dark ground vanishes.
 */

type RGB = [number, number, number];

const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;

export type Ramp = {
  /** Changes when the colors do, for deck.gl's update triggers. */
  key: string;
  at: (value: number, max: number) => [number, number, number, number];
};

/** `zero` is the gray; `accent` and `ink` are the page's own; `deep` is the light scheme's darkest. */
export function heatRamp(zero: RGB, accent: RGB, ink: RGB, deep: RGB, dark: boolean): Ramp {
  const high = dark ? mix(accent, ink, 0.55) : mix(accent, deep, 0.45);
  // One species is a step from gray toward the accent, never a step sideways.
  const low = mix(zero, accent, 0.65);
  return {
    key: [zero, low, high].join("|"),
    at: (value, max) => {
      if (value <= 0) return [...zero, 255];
      const t = max <= 1 ? 1 : Math.min(1, (value - 1) / (max - 1));
      return [...mix(low, high, t), 255];
    },
  };
}
