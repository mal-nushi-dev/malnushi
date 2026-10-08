import { describe, expect, it } from "vitest";
import { amount, hoursAndMinutes, miles, times } from "./format";

describe("flight formats", () => {
  it("writes kilometres as whole miles", () => {
    expect(miles(7281)).toBe("4,524");
    expect(miles(0)).toBe("0");
  });

  it("writes minutes as hours and minutes", () => {
    expect(hoursAndMinutes(520)).toBe("8h 40m");
    expect(hoursAndMinutes(65)).toBe("1h 05m");
    expect(hoursAndMinutes(55)).toBe("55m");
  });

  it("shows a ratio to as many places as it needs", () => {
    expect(times(6.4785)).toBe("6.5×");
    expect(times(0.6754)).toBe("0.68×");
    expect(times(0.0017355)).toBe("0.00174×");
    expect(times(12.34)).toBe("12.3×");
    expect(times(0)).toBe("0×");
  });

  it("keeps two figures of a small amount", () => {
    expect(amount(18.643)).toBe("18.6");
    expect(amount(0.737)).toBe("0.74");
    expect(amount(0.0963)).toBe("0.096");
    expect(amount(1234.5)).toBe("1,235");
    expect(amount(2)).toBe("2");
    expect(amount(0)).toBe("0");
  });
});
