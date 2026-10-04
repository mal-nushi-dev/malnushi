"use client";

import { animate } from "motion";
import { useEffect, useRef } from "react";
import { spring } from "@/components/nav";
import data from "./masthead-glyphs.json";

// Outlines of "Kodikion." in JetBrains Mono (`from`) and Newsreader (`to`),
// made by scripts/masthead-glyphs.mjs. Each contour has the same number of
// points on both sides, so a letter morphs by moving point to point.
const { text, viewBox, cell, glyphs } = data;
const last = glyphs.length - 1;

const TYPE = 0.07; // seconds per typed character
const HOLD = 0.3; // before typing, and again before the morph
const STAGGER = 0.04; // between letters starting to morph

/** The outline `t` of the way from one set of contours to the other. */
function morph(from: number[][], to: number[][], t: number) {
  let d = "";
  for (let c = 0; c < from.length; c++) {
    const a = from[c];
    const b = to[c];
    for (let i = 0; i < a.length; i += 2) {
      const x = Math.round(a[i] + (b[i] - a[i]) * t);
      const y = Math.round(a[i + 1] + (b[i + 1] - a[i + 1]) * t);
      d += `${i ? "L" : "M"}${x} ${y}`;
    }
    d += "Z";
  }
  return d;
}

/**
 * The blog's nameplate. It is typed in monospace behind a block cursor, then
 * each letter springs into the serif, and the cursor becomes the full stop.
 * The springs are the nav's, so the overshoot matches (docs/adr/0001): motion
 * values write the path data directly and React never re-renders.
 *
 * It is drawn as outlines, not text, so it needs no font to load and its box
 * never changes size. Plays once per page load. With reduced motion, or
 * without JavaScript, the finished serif is shown and nothing moves.
 */
export function Masthead() {
  const paths = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = paths.current as SVGPathElement[];
    const running: { stop: () => void }[] = [];

    // `n` letters typed; the cursor sits in the next cell.
    const type = (n: number) => {
      els.forEach((el, i) => {
        if (i < last) el.setAttribute("opacity", i < n ? "1" : "0");
      });
      els[last].setAttribute("transform", `translate(${(n - last) * cell} 0)`);
    };
    glyphs.forEach((g, i) => els[i].setAttribute("d", g.from.d));
    type(0);

    running.push(
      animate(0, last, {
        duration: last * TYPE,
        delay: HOLD,
        ease: "linear",
        onUpdate: (v) => type(Math.floor(v)),
        onComplete: () => {
          type(last);
          glyphs.forEach((g, i) => {
            const a = animate(0, 1, {
              ...spring.width,
              delay: HOLD + i * STAGGER,
              onUpdate: (t) =>
                els[i].setAttribute("d", morph(g.from.pts, g.to.pts, t)),
            });
            // Settle on the exact outline, curves and all.
            a.then(() => els[i].setAttribute("d", g.to.d));
            running.push(a);
          });
        },
      }),
    );
    return () => running.forEach((a) => a.stop());
  }, []);

  const accent = (i: number) => (i === last ? "text-accent" : undefined);

  return (
    <>
      <h1>
        <span className="sr-only">{text}</span>
        <svg
          aria-hidden
          viewBox={viewBox.join(" ")}
          fill="currentColor"
          className="block w-full overflow-visible text-ink"
        >
          <g data-masthead="live" className="motion-reduce:hidden">
            {glyphs.map((g, i) => (
              <path
                key={i}
                ref={(el) => {
                  paths.current[i] = el;
                }}
                d={g.from.d}
                opacity={i === last ? 1 : 0}
                transform={i === last ? `translate(${-last * cell} 0)` : undefined}
                className={accent(i)}
              />
            ))}
          </g>
          <g data-masthead="static" className="hidden motion-reduce:inline">
            {glyphs.map((g, i) => (
              <path key={i} d={g.to.d} className={accent(i)} />
            ))}
          </g>
        </svg>
      </h1>
      <noscript>
        <style>{`[data-masthead=live]{display:none}[data-masthead=static]{display:inline}`}</style>
      </noscript>
    </>
  );
}
