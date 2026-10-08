import { describe, expect, it } from "vitest";
import { parseCsv, parseTable } from "./csv";

describe("parseCsv", () => {
  it("splits rows and fields", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps a comma, a quote and a line break that are inside quotes", () => {
    expect(parseCsv('"Detroit, MI","say ""hi""","two\nlines"\n')).toEqual([
      ["Detroit, MI", 'say "hi"', "two\nlines"],
    ]);
  });

  it("keeps an empty field, and a field that is only spaces", () => {
    expect(parseCsv('2005-12-01,," (/)",\n')).toEqual([["2005-12-01", "", " (/)", ""]]);
  });

  it("reads Windows line endings and a last line without one", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("drops lines with nothing on them", () => {
    expect(parseCsv("\na\n\n\nb\n")).toEqual([["a"], ["b"]]);
  });
});

describe("parseTable", () => {
  it("keys each row by the header and says which line it is on", () => {
    const { header, rows } = parseTable('﻿Date,"Flight class"\n2005-12-01,1\n\n2005-12-02,3\n');
    expect(header).toEqual(["Date", "Flight class"]);
    expect(rows).toEqual([
      { line: 2, width: 2, cells: { Date: "2005-12-01", "Flight class": "1" } },
      { line: 3, width: 2, cells: { Date: "2005-12-02", "Flight class": "3" } },
    ]);
  });

  it("has no rows for an empty file", () => {
    expect(parseTable("")).toEqual({ header: [], rows: [] });
  });
});
