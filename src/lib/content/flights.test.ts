// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadContent } from "./load";
import { createQueries } from "./query";
import { flights, folder, problemsOf, site } from "./testing";

const header = flights.csv.split("\n")[0];
const dtw = "Detroit / Detroit Metropolitan Wayne Co (DTW/KDTW)";
const vie = "Vienna / Schwechat (VIE/LOWW)";

/** The small site, with these rows as its flights. */
const withRows = (...rows: string[]) =>
  folder({ ...site(), "flights/flights.csv": [header, ...rows, ""].join("\n") });

describe("flights", async () => {
  const q = createQueries(await loadContent(await folder(site())));

  it("reads a row into a flight between two airports", () => {
    const out = q.need("flight", "2026-01-10-dtw-vie");
    expect(out.title).toBe("Detroit to Vienna");
    expect(out.date).toBe("2026-01-10");
    expect(out.url).toBe("/collections/travels/log#2026-01-10-dtw-vie");
    expect(out.source).toBe("flights/flights.csv");
    expect(out.data.from).toEqual({
      iata: "DTW",
      icao: "KDTW",
      city: "Detroit",
      name: "Detroit Metropolitan Wayne Co",
      ...flights.airports.KDTW,
    });
    expect(out.data).toMatchObject({
      minutes: 520,
      airline: "Delta Air Lines",
      aircraft: "Airbus A330-300",
      seat: "Window",
      cabin: "Economy",
      reason: "Leisure",
    });
  });

  it("measures the distance along the great circle", () => {
    // Detroit to Vienna is about 7,280 km (4,525 miles).
    expect(q.need("flight", "2026-01-10-dtw-vie").data.km).toBeCloseTo(7281, -1);
  });

  it("leaves out what the diary did not record", () => {
    const back = q.need("flight", "2026-01-20-vie-dtw");
    for (const key of ["airline", "aircraft", "seat", "cabin", "reason"]) {
      expect(key in back.data, key).toBe(false);
      expect(key in back.facets, key).toBe(false);
    }
    expect(back.facets).toEqual({
      from: "VIE",
      to: "DTW",
      place: "Detroit",
      country: "United States",
      km: Math.round(back.data.km),
    });
  });

  it("is the rows of the travels collection, oldest first", () => {
    expect(q.members(q.need("collection", "travels")).map((e) => e.ref)).toEqual([
      "flight:2026-01-10-dtw-vie",
      "flight:2026-01-20-vie-dtw",
    ]);
  });

  it("stays out of the stream of everything", () => {
    expect(q.stream().some((e) => e.kind === "flight")).toBe(false);
  });

  it("numbers the same leg flown twice in a day", async () => {
    const row = `2026-02-01,${dtw},${vie},08:40:00, (/), (),0,1,0`;
    const twice = createQueries(await loadContent(await withRows(row, row)));
    expect(twice.list("flight", { oldestFirst: true }).map((e) => e.id).sort()).toEqual([
      "2026-02-01-dtw-vie",
      "2026-02-01-dtw-vie-2",
    ]);
  });

  it("names an airport by its ICAO code when it has no IATA code", async () => {
    const q = createQueries(
      await loadContent(
        await withRows(`2026-02-01,Somewhere / Field (/KDTW),${vie},01:00:00, (/), (),0,1,0`),
      ),
    );
    expect(q.need("flight", "2026-02-01-kdtw-vie").facets.from).toBe("KDTW");
  });
});

describe("a problem in the flights", () => {
  it("names the line and the field", async () => {
    const root = await withRows(
      `01/02/2026,${dtw},${vie},08:40:00, (/), (),0,1,0`,
      `2026-02-01,Detroit,${vie},8h, (/), (),4,6,5`,
    );
    expect(await problemsOf(root)).toEqual([
      "flights/flights.csv: line 2: Date: use YYYY-MM-DD",
      'flights/flights.csv: line 3: From: use "City / Airport (IATA/ICAO)"',
      "flights/flights.csv: line 3: Duration: use HH:MM:SS",
      "flights/flights.csv: line 3: Seat type: use a number from 0 to 3",
      "flights/flights.csv: line 3: Flight class: use a number from 0 to 5",
      "flights/flights.csv: line 3: Flight reason: use a number from 0 to 4",
    ]);
  });

  it("says so when a row is short", async () => {
    expect(await problemsOf(await withRows(`2026-02-01,${dtw},${vie}`))).toEqual([
      "flights/flights.csv: line 2: has 3 fields, and the header has 9",
    ]);
  });

  it("says how to place an airport that airports.json does not have", async () => {
    const root = await withRows(
      `2026-02-01,${dtw},London / Heathrow (LHR/EGLL),07:30:00, (/), (),0,1,0`,
    );
    expect(await problemsOf(root)).toEqual([
      "flights/airports.json: has no EGLL. Run `npm run flights` again: see scripts/flights.mjs",
    ]);
  });

  it("checks where airports.json puts an airport", async () => {
    const root = await folder({
      ...site(),
      "flights/airports.json": JSON.stringify({
        ...flights.airports,
        KDTW: { ...flights.airports.KDTW, lat: 91 },
      }),
    });
    expect((await problemsOf(root))[0]).toMatch(/^flights\/airports\.json: KDTW\.lat: /);
  });

  it("wants nothing else in the folder", async () => {
    const root = await folder({ ...site(), "flights/export.csv": "Date\n" });
    expect(await problemsOf(root)).toEqual([
      "flights/export.csv: expected flights.csv and airports.json only",
    ]);
  });
});
