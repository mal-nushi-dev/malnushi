/*
 * Writes the placeholder photographs in content/photos/ (and the test
 * fixture): a --line fill with a mono label, like ImagePlaceholder, carrying
 * real EXIF so the content layer has something to read. Run by hand:
 *
 *   node scripts/placeholder-photos.mjs
 *
 * Delete the placeholders (and this script) when real photographs replace
 * them. `sharp` is not a project dependency; Next installs it.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");

const body = {
  Make: "FUJIFILM",
  Model: "X-T5",
};

const photos = [
  {
    file: "content/photos/2026-10-02-wren-at-the-window.jpg",
    width: 2400,
    height: 1600,
    taken: "2026:10:02 07:14:09",
    lens: "XF70-300mmF4-5.6 R LM OIS WR",
    focal: "300/1",
    aperture: "56/10",
    shutter: "1/500",
    iso: 800,
  },
  {
    file: "content/photos/2026-09-21-marsh-before-sunrise.jpg",
    width: 2400,
    height: 1350,
    taken: "2026:09:21 06:41:30",
    lens: "XF23mmF2 R WR",
    focal: "23/1",
    aperture: "8/1",
    shutter: "1/60",
    iso: 200,
  },
  {
    file: "content/photos/2026-09-21-heron-in-the-reeds.jpg",
    width: 1600,
    height: 2400,
    taken: "2026:09:21 07:02:44",
    lens: "XF70-300mmF4-5.6 R LM OIS WR",
    focal: "214/1",
    aperture: "5/1",
    shutter: "1/1000",
    iso: 640,
  },
  // No EXIF at all, as from a film scan: its .yml supplies everything.
  {
    file: "content/photos/2026-08-09-uptown-from-the-deck.jpg",
    width: 2400,
    height: 1600,
  },
  {
    file: "src/lib/content/__fixtures__/site/photos/2026-10-02-wren.jpg",
    width: 300,
    height: 200,
    taken: "2026:10:02 07:14:09",
    lens: "XF70-300mmF4-5.6 R LM OIS WR",
    focal: "300/1",
    aperture: "56/10",
    shutter: "1/500",
    iso: 800,
  },
  {
    file: "src/lib/content/__fixtures__/site/photos/2026-08-09-scan.jpg",
    width: 300,
    height: 200,
  },
];

for (const p of photos) {
  const size = Math.round(p.width / 60);
  const label = `PHOTOGRAPH — ${p.width} × ${p.height}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}">
    <rect width="100%" height="100%" fill="#D5D7D2"/>
    <text x="50%" y="50%" fill="#2E2E2E" font-family="JetBrains Mono, Menlo, monospace" font-size="${size}" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  const out = path.join(root, p.file);
  await mkdir(path.dirname(out), { recursive: true });
  let image = sharp(Buffer.from(svg)).jpeg({ quality: 70, mozjpeg: true });
  if (p.taken) {
    image = image.withExif({
      IFD0: body,
      IFD2: {
        DateTimeOriginal: p.taken,
        OffsetTimeOriginal: "-04:00",
        LensModel: p.lens,
        FocalLength: p.focal,
        FNumber: p.aperture,
        ExposureTime: p.shutter,
        ISOSpeedRatings: String(p.iso),
      },
    });
  }
  await image.toFile(out);
  console.log(p.file);
}
