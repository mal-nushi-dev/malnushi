/*
 * How numbers are written on the site. Charts, collections and lists all
 * read from here, so a count looks the same wherever it appears.
 */

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 161324.4 as "161,324". */
export function count(value: number) {
  return whole.format(value);
}

/** The word for `n` of something, without the number: "Year", "Years". */
export function noun(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/** A number and its noun: "1 flight has", "123 flights have", "1,204 birds". */
export function counted(n: number, one: string, many: string) {
  return `${count(n)} ${noun(n, one, many)}`;
}

/** A position in a list, padded to a fixed width: `numbered(7, 3)` is "007". */
export function numbered(n: number, width: number) {
  return String(n).padStart(width, "0");
}
