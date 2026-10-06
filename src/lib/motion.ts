/**
 * Shared motion design tokens and animation utilities.
 *
 * Springs and physics parameters are defined here as the single source
 * of truth for component animations across the site (ADR 0001).
 */

export const springs = {
  /** Nav plate widening & typography morph */
  width: { type: "spring", stiffness: 260, damping: 21, mass: 1 },
  /** Nav plate vertical drop */
  height: { type: "spring", stiffness: 220, damping: 21, mass: 1 },
  /** Nav plate closing (critically damped) */
  close: { type: "spring", stiffness: 320, damping: 34, mass: 1 },
} as const;

/** Alias for backward compatibility */
export const spring = springs;

/** Returns true if the user has requested reduced motion. */
export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Clamps a number between min and max (defaults 0 to 1). */
export function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

/** Linear interpolation between two scalar numbers. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear interpolation between two arrays of numbers (e.g. RGB components or coordinates). */
export function lerpArray(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/**
 * A spring as a CSS `linear()` easing, for a transition that CSS runs: where
 * a spring answers a hover and no script is needed. The curve is the spring's
 * own step response, sampled evenly over `seconds`, so it overshoots and
 * settles exactly as the nav's plate does.
 *
 * `--ease-spring-open` and `--ease-spring-close` in globals.css are written
 * from `cssSprings` with this; motion.test.ts fails if they drift.
 */
export function springEasing(
  { stiffness, damping, mass }: { stiffness: number; damping: number; mass: number },
  seconds: number,
  steps = 30,
): string {
  const natural = Math.sqrt(stiffness / mass);
  const ratio = damping / (2 * Math.sqrt(stiffness * mass));
  const damped = natural * Math.sqrt(1 - ratio * ratio);
  const decay = ratio * natural;
  const at = (t: number) =>
    1 - Math.exp(-decay * t) * (Math.cos(damped * t) + (decay / damped) * Math.sin(damped * t));
  const points = Array.from({ length: steps + 1 }, (_, i) =>
    // It ends at rest, whatever is left of the spring's tail.
    i === steps ? 1 : Number(at((i / steps) * seconds).toFixed(3)),
  );
  return `linear(${points.join(", ")})`;
}

/**
 * The springs CSS can use, each with the time it needs to settle. A component
 * sets the same time as its `transition-duration`.
 */
export const cssSprings = {
  open: { spring: springs.width, ms: 600 },
  close: { spring: springs.close, ms: 350 },
} as const;
