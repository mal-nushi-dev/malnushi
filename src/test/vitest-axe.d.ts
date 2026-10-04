import type { AxeMatchers } from "vitest-axe/matchers";

// vitest-axe still augments the old `Vi` namespace, which Vitest 5 ignores.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
declare module "vitest" {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
