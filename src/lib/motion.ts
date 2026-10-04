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
