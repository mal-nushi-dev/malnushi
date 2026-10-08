/*
 * Comma-separated text as RFC 4180 has it: a field may be quoted, a quote
 * inside one is doubled, and a quoted field may hold commas and line breaks.
 * The same reading is in scripts/flights.mjs, which cannot import this file.
 */

/** Every row with something in it, as its fields. */
export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length > 0) rows.push([...row, field]);
  return rows.filter((r) => r.some((cell) => cell !== ""));
}

/**
 * The rows under a header, each as an object keyed by it, with the line it
 * is on (the header is line 1) for naming a problem.
 */
export function parseTable(text: string) {
  const [header = [], ...rows] = parseCsv(text.replace(/^﻿/, ""));
  return {
    header,
    rows: rows.map((row, at) => ({
      line: at + 2,
      width: row.length,
      cells: Object.fromEntries(header.map((name, i) => [name, row[i] ?? ""])),
    })),
  };
}
