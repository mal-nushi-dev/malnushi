import { configureAxe } from "vitest-axe";

/** jsdom has no layout or CSS, so color contrast cannot be computed here. */
export const axe = configureAxe({
  rules: { "color-contrast": { enabled: false } },
});
