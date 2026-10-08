/*
 * Brings a my.flightradar24.com export into the content folder:
 *
 *   npm run flights -- ~/Downloads/flightdiary_….csv path/to/airports.csv
 *
 * The second file is OurAirports' airports.csv (public domain):
 * https://davidmegginson.github.io/ourairports-data/airports.csv
 *
 * It writes two files, both committed:
 *
 *   content/flights/flights.csv    the export, with only the columns the site
 *                                  draws from
 *   content/flights/airports.json  where each airport in it is, by ICAO code
 *
 * This repository is public, so the export itself is never committed. Flight
 * numbers, registrations, seat numbers, notes and clock times are left out,
 * and so is any flight dated after today: a booked flight says where its
 * passenger will be.
 *
 * Runs by hand, when flights are added. See
 * docs/adr/0010-flight-map-and-flight-data.md.
 */
import fs from "node:fs";
import path from "node:path";

const KEEP = [
  "Date",
  "From",
  "To",
  "Duration",
  "Airline",
  "Aircraft",
  "Seat type",
  "Flight class",
  "Flight reason",
];

const CONTINENTS = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

/** RFC 4180: quoted fields, doubled quotes, commas and line breaks inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
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

function toCsv(rows) {
  const cell = (value) => (/[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value);
  return `${rows.map((row) => row.map(cell).join(",")).join("\n")}\n`;
}

function table(file) {
  const [header, ...rows] = parseCsv(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  return rows.map((row) => Object.fromEntries(header.map((name, i) => [name, row[i] ?? ""])));
}

const [exported, ourAirports] = process.argv.slice(2);
if (!exported || !ourAirports) {
  console.error("Usage: npm run flights -- <flightdiary export .csv> <OurAirports airports.csv>");
  process.exit(1);
}

const today = new Date().toLocaleDateString("en-CA");
const all = table(exported);
const missing = KEEP.filter((name) => all.length > 0 && !(name in all[0]));
if (missing.length > 0) {
  console.error(`The export has no column named: ${missing.join(", ")}`);
  process.exit(1);
}
const flights = all.filter((flight) => flight.Date <= today);

const codes = new Set();
for (const flight of flights) {
  for (const end of [flight.From, flight.To]) {
    const icao = /\([A-Z0-9]*\/([A-Z0-9]{4})\)\s*$/.exec(end)?.[1];
    if (!icao) {
      console.error(`${flight.Date}: cannot read an ICAO code from "${end}"`);
      process.exit(1);
    }
    codes.add(icao);
  }
}

const region = new Intl.DisplayNames(["en"], { type: "region" });
const airports = {};
for (const airport of table(ourAirports)) {
  const code = [airport.icao_code, airport.ident, airport.gps_code].find((c) => codes.has(c));
  if (!code || airports[code]) continue;
  airports[code] = {
    lat: Number(Number(airport.latitude_deg).toFixed(4)),
    lon: Number(Number(airport.longitude_deg).toFixed(4)),
    countryCode: airport.iso_country,
    country: region.of(airport.iso_country),
    continent: CONTINENTS[airport.continent],
  };
}
const unknown = [...codes].filter((code) => !airports[code]);
if (unknown.length > 0) {
  console.error(`OurAirports has no airport for: ${unknown.join(", ")}`);
  process.exit(1);
}

const out = path.join(import.meta.dirname, "../content/flights");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "flights.csv"),
  toCsv([KEEP, ...flights.map((flight) => KEEP.map((name) => flight[name]))]),
);
const sorted = Object.fromEntries(Object.entries(airports).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(path.join(out, "airports.json"), `${JSON.stringify(sorted, null, 2)}\n`);

console.log(
  `${flights.length} flights between ${codes.size} airports` +
    (all.length > flights.length ? `; left out ${all.length - flights.length} dated after ${today}` : ""),
);
