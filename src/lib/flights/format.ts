import { kmPerMile } from "./distance";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Kilometres as whole miles: "4,524". */
export function miles(km: number) {
  return whole.format(km / kmPerMile);
}

/** Minutes as hours and minutes: "8h 40m", "55m". */
export function hoursAndMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours === 0 ? `${rest}m` : `${hours}h ${String(rest).padStart(2, "0")}m`;
}

/**
 * How many times over, to as many places as it takes to show something:
 * "6.5×" around the Earth, "0.68×" to the Moon, "0.00174×" to the Sun.
 */
export function times(ratio: number) {
  if (ratio === 0) return "0×";
  const places = ratio >= 1 ? 1 : ratio >= 0.1 ? 2 : Math.ceil(-Math.log10(ratio)) + 2;
  return `${ratio.toFixed(places)}×`;
}

/** A small amount to two figures, a large one whole: "18.6", "0.74", "0.096". */
export function amount(value: number) {
  if (value === 0) return "0";
  if (value >= 100) return whole.format(value);
  if (value >= 10) return value.toFixed(1);
  return value.toPrecision(2).replace(/\.?0+$/, "");
}
