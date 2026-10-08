/** The Earth's mean radius (IUGG), in kilometres. */
const earthRadius = 6371.0088;

export const kmPerMile = 1.609344;

type Point = { lat: number; lon: number };

/** Kilometres between two points along the great circle, by the haversine formula. */
export function greatCircleKm(a: Point, b: Point) {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}
