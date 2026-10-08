import { describe, expect, it } from "vitest";
import { greatCircleKm, kmPerMile } from "./distance";

const jfk = { lat: 40.6398, lon: -73.7789 };
const lhr = { lat: 51.4706, lon: -0.4619 };

describe("greatCircleKm", () => {
  it("measures New York to London as about 5,540 km (3,440 miles)", () => {
    expect(greatCircleKm(jfk, lhr)).toBeCloseTo(5540, -1);
    expect(greatCircleKm(jfk, lhr) / kmPerMile).toBeCloseTo(3442, -1);
  });

  it("is the same in both directions, and nothing from a place to itself", () => {
    expect(greatCircleKm(lhr, jfk)).toBeCloseTo(greatCircleKm(jfk, lhr), 9);
    expect(greatCircleKm(jfk, jfk)).toBe(0);
  });

  it("goes the short way across the date line", () => {
    // 2 degrees of longitude on the equator, not 358.
    expect(greatCircleKm({ lat: 0, lon: 179 }, { lat: 0, lon: -179 })).toBeCloseTo(222.4, 0);
  });

  it("measures half the way round as half the circumference", () => {
    expect(greatCircleKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 })).toBeCloseTo(20015, 0);
  });
});
