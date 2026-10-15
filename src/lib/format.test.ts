import { describe, expect, it } from "vitest";
import { count, counted, noun, numbered } from "./format";

describe("count", () => {
  it("writes whole numbers with separators", () => {
    expect(count(161324.4)).toBe("161,324");
    expect(count(0)).toBe("0");
  });
});

describe("noun", () => {
  it("chooses the word by the number, without the number", () => {
    expect(noun(1, "Year", "Years")).toBe("Year");
    expect(noun(0, "Year", "Years")).toBe("Years");
  });
});

describe("counted", () => {
  it("chooses the noun by the number", () => {
    expect(counted(1, "flight has", "flights have")).toBe("1 flight has");
    expect(counted(0, "bird", "birds")).toBe("0 birds");
    expect(counted(1204, "bird", "birds")).toBe("1,204 birds");
  });
});

describe("numbered", () => {
  it("pads to the width, and leaves a longer number whole", () => {
    expect(numbered(7, 3)).toBe("007");
    expect(numbered(12, 2)).toBe("12");
    expect(numbered(1234, 3)).toBe("1234");
  });
});
