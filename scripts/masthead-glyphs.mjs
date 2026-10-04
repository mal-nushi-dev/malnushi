/*
 * Generates the outlines the "Kodikion." masthead morphs between:
 * JetBrains Mono (start) and Newsreader (end), from the font files Next has
 * already built.
 *
 *   npm run build                       (so .next/static/media has the fonts)
 *   node scripts/masthead-glyphs.mjs > src/app/components/writing/masthead-glyphs.json
 *
 * Needs `fontkit`, `wawoff2` and `paper`, which are not project dependencies:
 * this runs by hand, only when the word or the fonts change. Install them
 * somewhere outside the repo and run a copy of this file there, passing the
 * repo's .next/static/media as the first argument.
 *
 * A morph needs both shapes to have the same number of points, so every
 * contour is resampled to POINTS points by arc length, starting at the point
 * nearest the contour's bottom-left corner. The exact outlines are kept too
 * (`d`), and are what is drawn at rest.
 */
import * as fontkit from "fontkit";
import fs from "node:fs";
import path from "node:path";
import paper from "paper/dist/paper-core.js";
import wawoff2 from "wawoff2";

const TEXT = "Kodikion.";
const CAP = 1000; // both fonts are scaled so a capital is this tall
const POINTS = 128; // per contour
const TRACKING = -0.025; // em, as on type.h1
const PAD = 24;

const dir = process.argv[2] ?? ".next/static/media";
paper.setup(new paper.Size(1, 1));

// Unpacked to TTF first: fontkit cannot take a variation instance of a WOFF2.
async function find(family) {
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".woff2")) continue;
    const woff2 = fs.readFileSync(path.join(dir, f));
    const font = fontkit.create(Buffer.from(await wawoff2.decompress(woff2)));
    if (
      font.familyName.startsWith(family) &&
      !/italic/i.test(font.familyName + font.subfamilyName) &&
      [...TEXT].every((c) => font.hasGlyphForCodePoint(c.codePointAt(0)))
    )
      return font;
  }
  throw new Error(`No ${family} file with "${TEXT}" in ${dir}`);
}

/**
 * A glyph as clean contours in the output space (y down, scaled, moved to
 * `x`). Newsreader is a variable font and builds letters from overlapping
 * pieces (its K is a stem and two arms; its d is one path that crosses
 * itself), so the pieces are merged into plain outlines and counters first.
 * Largest contour first.
 */
function outline(svgPath, scale, x) {
  const item = paper.PathItem.create(svgPath);
  item.fillRule = "nonzero";
  const clean = item.resolveCrossings().reorient(true, true);
  clean.scale(scale, -scale, new paper.Point(0, 0));
  clean.translate(new paper.Point(x, 0));
  const contours = clean.children ?? [clean];
  return [...contours].sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
}

const r = (n) => Math.round(n);

/** Exact path data, absolute and rounded. */
function pathData(contours) {
  return contours
    .map((c) => {
      let d = `M${r(c.firstSegment.point.x)} ${r(c.firstSegment.point.y)}`;
      for (const curve of c.curves) {
        const { point1: a, point2: b, handle1: h1, handle2: h2 } = curve;
        d += curve.isStraight()
          ? `L${r(b.x)} ${r(b.y)}`
          : `C${r(a.x + h1.x)} ${r(a.y + h1.y)} ${r(b.x + h2.x)} ${r(b.y + h2.y)} ${r(b.x)} ${r(b.y)}`;
      }
      return d + "Z";
    })
    .join("");
}

/** POINTS points along the contour at equal distances, as a flat x,y list. */
function resample(c, clockwise) {
  const fine = 1024;
  let ring = Array.from({ length: fine }, (_, i) => c.getPointAt((c.length * i) / fine));
  // Same winding on both sides, or the shape would turn inside out mid-morph.
  if (c.clockwise !== clockwise) ring.reverse();
  // Start nearest the bottom-left corner of the contour's box.
  const corner = c.bounds.bottomLeft;
  let start = 0;
  ring.forEach((p, i) => {
    if (p.getDistance(corner) < ring[start].getDistance(corner)) start = i;
  });
  ring = [...ring.slice(start), ...ring.slice(0, start)];
  const flat = [];
  for (let k = 0; k < POINTS; k++) {
    const p = ring[Math.round((fine * k) / POINTS)];
    flat.push(r(p.x), r(p.y));
  }
  return flat;
}

const mono = await find("JetBrains Mono");
// Display cut: the optical size the browser picks at this size, regular weight.
const serif = (await find("Newsreader")).getVariation({ wght: 400, opsz: 72 });

// "K" is flat-topped, so its height is the cap height.
const sm = CAP / mono.glyphForCodePoint(75).bbox.maxY;
const ss = CAP / serif.glyphForCodePoint(75).bbox.maxY;

// Mono: a fixed grid of cells, centered on x = 0.
const cell = mono.glyphForCodePoint(75).advanceWidth * sm;
const monoLeft = (-cell * TEXT.length) / 2;

// Serif: laid out with kerning, tightened, then centered on its ink.
const run = serif.layout(TEXT);
const serifX = [];
let x = 0;
run.positions.forEach((p) => {
  serifX.push(x + p.xOffset);
  x += p.xAdvance + TRACKING * serif.unitsPerEm;
});
const inkMin = serifX[0] + run.glyphs[0].bbox.minX;
const inkMax = serifX.at(-1) + run.glyphs.at(-1).bbox.maxX;
const serifShift = -((inkMin + inkMax) / 2) * ss;

const glyphs = [];
let bounds = null;

[...TEXT].forEach((ch, i) => {
  const cellLeft = monoLeft + i * cell;
  const to = outline(run.glyphs[i].path.toSVG(), ss, serifShift + serifX[i] * ss);

  // The full stop starts life as the block cursor in the last cell.
  const from =
    i === TEXT.length - 1
      ? [new paper.Path.Rectangle(new paper.Point(cellLeft + cell * 0.1, -CAP), new paper.Size(cell * 0.8, CAP))]
      : outline(mono.glyphForCodePoint(ch.codePointAt(0)).path.toSVG(), sm, cellLeft);

  if (from.length !== to.length)
    throw new Error(`"${ch}": ${from.length} contours in mono, ${to.length} in serif`);

  for (const c of [...from, ...to]) bounds = bounds ? bounds.unite(c.bounds) : c.bounds;

  glyphs.push({
    ch,
    from: { d: pathData(from), pts: from.map((c, j) => resample(c, to[j].clockwise)) },
    to: { d: pathData(to), pts: to.map((c) => resample(c, c.clockwise)) },
  });
});

// The box fits the serif word (the resting state) and the height of both;
// the wider mono word overflows it sideways while it plays.
const serifXs = glyphs.flatMap((g) => g.to.pts.flat().filter((_, i) => i % 2 === 0));
const half = Math.ceil(Math.max(...serifXs.map(Math.abs))) + PAD;
const top = Math.floor(bounds.top) - PAD;
const bottom = Math.ceil(bounds.bottom) + PAD;

process.stdout.write(
  JSON.stringify({
    text: TEXT,
    viewBox: [-half, top, half * 2, bottom - top],
    cell: Math.round(cell),
    glyphs,
  }) + "\n",
);
