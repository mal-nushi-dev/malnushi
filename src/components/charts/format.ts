const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 161324.4 as "161,324". */
export function count(value: number) {
  return whole.format(value);
}

/** A share of a whole as a percentage: "95%", and "<1%" for a sliver. */
export function percent(part: number, total: number) {
  if (total === 0) return "0%";
  const share = (part / total) * 100;
  return share > 0 && share < 0.5 ? "<1%" : `${Math.round(share)}%`;
}

/**
 * A tidy top for an axis that starts at nothing: the first of 1, 2, 5, 10,
 * 20, 50… that four even steps reach the largest value with.
 */
export function axisTop(max: number, steps = 4) {
  if (max <= 0) return steps;
  for (let scale = 1; ; scale *= 10) {
    for (const base of [1, 2, 5]) {
      const step = base * scale;
      if (step * steps >= max) return step * steps;
    }
  }
}
