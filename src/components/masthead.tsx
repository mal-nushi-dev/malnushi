"use client";

import { animate } from "motion";
import { useLayoutEffect, useRef } from "react";
import { clamp, lerpArray, reducedMotion, springs } from "@/lib/motion";
import data from "./masthead-glyphs.json";

// Outlines of "Kodikion." in JetBrains Mono (`from`) and Newsreader (`to`),
// made by scripts/masthead-glyphs.mjs. Each contour has the same number of
// points on both sides, so a letter morphs by moving point to point.
const { text, viewBox, cell, glyphs } = data;
const last = glyphs.length - 1;

const TYPE = 0.07; // seconds per typed character
const POWER = 0.3; // the screen warming up, before typing
const STAGGER = 0.04; // between letters starting to morph
const BLINK = 0.5; // one cursor blink

// The terminal. Colours and shape are this component's own, not site tokens:
// the screen is dark in light and dark mode alike.
const PHOSPHOR = [125, 255, 155]; // a P39-style green
const HOT = [226, 255, 232]; // a letter just struck / cathode line
const WIDE = 4150; // half the screen's width, in outline units
const MID = -500; // the screen's centre line
const HIGH = 600; // half its height
const BULGE = 0.11; // barrel distortion at the screen's edge, in mono

const INV_WIDE = 1 / WIDE;
const INV_HIGH = 1 / HIGH;

// The screen: a clean, continuous pill-shaped terminal enclosure.
// Uses exact circular arcs and straight lines so the outer bezel stroke
// maintains 100% constant, uniform thickness with zero ripples, bumps, or corner pinching.
const [L, R, T, B] = [-WIDE, WIDE, MID - HIGH, MID + HIGH];
const Cr = 480; // continuous pill corner radius
const SCREEN =
  `M${L + Cr} ${T}H${R - Cr}A${Cr} ${Cr} 0 0 1 ${R} ${T + Cr}` +
  `V${B - Cr}A${Cr} ${Cr} 0 0 1 ${R - Cr} ${B}` +
  `H${L + Cr}A${Cr} ${Cr} 0 0 1 ${L} ${B - Cr}` +
  `V${T + Cr}A${Cr} ${Cr} 0 0 1 ${L + Cr} ${T}Z`;

const rgb = (c: number[]) => `rgb(${c.map(Math.round).join(",")})`;
const rgbOf = (el: Element) =>
  (getComputedStyle(el).color.match(/[\d.]+/g) ?? ["46", "46", "46"])
    .slice(0, 3)
    .map(Number);

/**
 * The outline `t` of the way from one set of contours to the other, shifted
 * `dx` sideways, then bulged by `k` as if seen on a convex screen: points
 * are pulled toward the centre the further out they are.
 */
function morph(from: number[][], to: number[][], t: number, dx = 0, k = 0) {
  let d = "";
  for (let c = 0; c < from.length; c++) {
    const a = from[c];
    const b = to[c];
    for (let i = 0; i < a.length; i += 2) {
      let x = a[i] + (b[i] - a[i]) * t + dx;
      let y = a[i + 1] + (b[i + 1] - a[i + 1]) * t;
      if (k) {
        const rx = x * INV_WIDE;
        const ry = (y - MID) * INV_HIGH;
        const f = 1 / (1 + k * (rx * rx + ry * ry));
        x *= f;
        y = MID + (y - MID) * f;
      }
      d += `${i ? "L" : "M"}${Math.round(x)} ${Math.round(y)}`;
    }
    d += "Z";
  }
  return d;
}

/**
 * The blog's nameplate. A dark, convex terminal screen warms up behind it and
 * the name is typed in monospace, in green phosphor, behind a block cursor.
 * After cursor pauses each letter springs into the serif, the screen fades, and
 * the cursor becomes the full stop. Pressing it plays the morph again, serif
 * to monospace and back.
 *
 * Springs come from @/lib/motion (ADR 0001). The transition to the Newsreader
 * serif outline is completely liquid and seamless: as letters spring into place,
 * the exact cubic bezier serif outlines cross-fade in during motion, eliminating
 * any delayed snap or polygon pop.
 */
export function Masthead() {
  const screen = useRef<SVGGElement>(null);
  const cathodeBeam = useRef<SVGLineElement>(null);
  const cursorGhost = useRef<SVGPathElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  // Per letter: [far, near, halo, morph, serif]
  const layers = useRef<(SVGPathElement | null)[][]>(glyphs.map(() => []));
  const button = useRef<HTMLButtonElement>(null);
  const replay = useRef<() => void>(() => {});

  // A layout effect, so its cleanup runs in the same commit that clears the
  // refs. With a plain effect the cleanup comes later, and a frame or a
  // spring update in between would reach for a letter that is gone.
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const g = groups.current as SVGGElement[];
    const layer = layers.current as SVGPathElement[][];
    const running: { stop: () => void }[] = [];
    let dead = false;
    let busy = false;
    let frame = 0;
    let before = 0;

    // Where every letter is: its spring (0 mono, 1 serif), the two late
    // copies of that, how freshly it was struck, and a sideways shift (the
    // cursor's, while typing).
    const n = glyphs.length;
    const t = glyphs.map(() => 0);
    const late1 = glyphs.map(() => 0);
    const late2 = glyphs.map(() => 0);
    const heat = glyphs.map(() => 0);
    const settled = glyphs.map(() => false);
    const resting = glyphs.map(() => false);
    let shift = -last * cell;
    let power = 0;
    let beamPower = 0;
    let cursorTrail = 0;
    let cursorTrailX = shift;
    let ink: number[][] = [];
    const shown: string[][] = glyphs.map(() => ["", "", "", "", ""]);

    // Ring buffer of recent paths per glyph (history of main outline)
    // Avoids 18 redundant morph calculations per frame (66% computation savings)
    const pathHistory: string[][] = glyphs.map(() => []);

    const set = (el: Element, name: string, value: string, i: number, at: number) => {
      if (shown[i][at] === value) return;
      shown[i][at] = value;
      el.setAttribute(name, value);
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - before) / 1000);
      before = now;
      const [a1, a2] = [1 - Math.exp(-dt / 0.05), 1 - Math.exp(-dt / 0.12)];
      const cool = Math.exp(-dt / 0.1);
      cursorTrail *= Math.exp(-dt / 0.12);
      let level = 0;
      let moving = false;

      glyphs.forEach((gl, i) => {
        late1[i] += (t[i] - late1[i]) * a1;
        late2[i] += (t[i] - late2[i]) * a2;
        heat[i] *= cool;

        const s = clamp(1 - t[i]);
        level += s;
        const [far, near, halo, morphEl, serifEl] = layer[i];

        // Back at rest in the serif: the exact outline is already 100% visible, no glow.
        const rest =
          settled[i] && Math.abs(late2[i] - 1) < 0.002 && heat[i] < 0.01;
        if (rest) {
          if (!resting[i]) {
            resting[i] = true;
            serifEl.setAttribute("opacity", "1");
            morphEl.setAttribute("opacity", "0");
            [far, near, halo].forEach((el) => el.setAttribute("opacity", "0"));
            if (i !== last && g[i]) g[i].style.transform = "";
          }
          return;
        }
        resting[i] = false;
        moving = true;

        const dx = i === last ? shift : 0;
        const h = clamp(heat[i]);

        // CLAMP morph to [0, 1] so letterform contours are never distorted by spring overshoot
        const tShape = clamp(t[i], 0, 1);
        const d = morph(gl.from.pts, gl.to.pts, tShape, dx, BULGE * s);

        // Physical bounce: route spring overshoot (t[i] > 1) to elastic vertical settling
        const overshoot = Math.max(0, t[i] - 1);
        if (overshoot > 0 && i !== last && g[i]) {
          g[i].style.transform = `translateY(${(-overshoot * 20).toFixed(1)}px)`;
        } else if (i !== last && g[i] && g[i].style.transform) {
          g[i].style.transform = "";
        }

        // Update history buffer for ghost persistence
        const hist = pathHistory[i];
        hist.unshift(d);
        if (hist.length > 6) hist.pop();

        const glow = lerpArray(PHOSPHOR, HOT, h);

        // Perceptual color blend: hold vibrant phosphor green during morph, then cool to ink
        const phosphorWeight = Math.pow(s, 0.7);
        const baseColor = lerpArray(ink[i], PHOSPHOR, phosphorWeight);
        const finalColor = lerpArray(baseColor, HOT, h);

        set(morphEl, "d", d, i, 3);
        morphEl.setAttribute("fill", rgb(finalColor));

        // Seamless liquid cross-fade into exact Newsreader serif during motion (tShape from 0.55 to 1.0).
        // This eliminates ANY delayed snap or pop into the serif font!
        const serifFade = clamp((tShape - 0.55) / 0.4);
        serifEl.setAttribute("opacity", String(serifFade));
        morphEl.setAttribute("opacity", String(1 - serifFade * 0.85));

        // Soft phosphor halo
        set(halo, "d", d, i, 2);
        halo.setAttribute("stroke", rgb(glow));
        halo.setAttribute("stroke-width", String(28 + 60 * h));
        halo.setAttribute("opacity", String(0.28 * s * (1 + 1.8 * h)));

        // Ghost trails reuse cached previous frames (temporal persistence)
        const c1 = clamp(1 - late1[i]);
        const c2 = clamp(1 - late2[i]);
        const nearD = hist[1] ?? d;
        const farD = hist[4] ?? hist[hist.length - 1] ?? d;

        set(near, "d", nearD, i, 1);
        near.setAttribute("fill", rgb(glow));
        near.setAttribute("opacity", String(0.32 * c1));

        set(far, "d", farD, i, 0);
        far.setAttribute("fill", rgb(glow));
        far.setAttribute("opacity", String(0.14 * c2));
      });

      // Cursor afterglow trail
      if (cursorGhost.current) {
        if (cursorTrail > 0.02) {
          cursorGhost.current.setAttribute("opacity", String(cursorTrail * 0.45));
          cursorGhost.current.setAttribute("transform", `translate(${cursorTrailX} 0)`);
        } else {
          cursorGhost.current.setAttribute("opacity", "0");
        }
      }

      // Cathode ray warm-up beam
      if (cathodeBeam.current) {
        if (beamPower > 0.01 && beamPower < 0.99) {
          cathodeBeam.current.setAttribute("opacity", String(Math.sin(beamPower * Math.PI) * 0.9));
          cathodeBeam.current.setAttribute("stroke-width", String(Math.max(2, (1 - beamPower) * 20)));
        } else {
          cathodeBeam.current.setAttribute("opacity", "0");
        }
      }

      // Screen opacity: stays grounded until morph begins, then dissolves smoothly
      const screenFade = clamp(level / (n * 0.6));
      screen.current!.setAttribute("opacity", String(power * screenFade));

      return moving || cursorTrail > 0.02 || beamPower > 0.01;
    };

    const run = (now: number) => {
      frame = 0;
      if (dead) return;
      const moving = render(now);
      if (moving || busy) frame = requestAnimationFrame(run);
    };

    const wake = () => {
      ink = glyphs.map((_, i) => rgbOf(i === last ? g[last] : g[0]));
      if (!frame) {
        before = performance.now();
        frame = requestAnimationFrame(run);
      }
    };

    // `m` letters typed; the cursor sits in the next cell. A letter just
    // struck flares.
    let typed = 0;
    const type = (m: number) => {
      g.forEach((el, i) => {
        if (i < last) el.style.opacity = i < m ? "1" : "0";
      });
      for (let i = typed; i < m; i++) heat[i] = 1;
      if (m > typed) {
        // Flash cursor afterglow trail at previous location
        cursorTrailX = shift;
        cursorTrail = 1;
      }
      typed = m;
      shift = (m - last) * cell;
    };

    // Every letter springs to the serif or to the mono, each one a beat after
    // the one before.
    const swing = (toSerif: boolean) =>
      Promise.all(
        glyphs.map((_, i) => {
          settled[i] = false;
          const a = animate(toSerif ? 0 : 1, toSerif ? 1 : 0, {
            ...springs.width,
            delay: i * STAGGER,
            onUpdate: (v) => {
              t[i] = v;
            },
          });
          running.push(a);
          return a.then(() => {
            t[i] = toSerif ? 1 : 0;
            settled[i] = toSerif;
          });
        }),
      );

    // The cursor: on at once, off with the quick decay of a phosphor.
    const blink = async (count = 1) => {
      const a = animate(
        g[last],
        { opacity: [1, 1, 0, 0, 1] },
        {
          duration: BLINK,
          times: [0, 0.45, 0.58, 0.95, 1],
          ease: ["linear", "easeOut", "linear", "linear"],
          repeat: count - 1,
        },
      );
      running.push(a);
      await a;
      g[last].style.opacity = "1";
    };

    const intro = async () => {
      g[last].removeAttribute("transform"); // the shift is in the geometry now
      wake();
      g[last].style.opacity = "0";

      // Cathode screen warm-up with beam expansion
      const on = animate(0, 1, {
        duration: POWER,
        ease: "easeOut",
        onUpdate: (v) => {
          power = v;
          beamPower = v;
          g[last].style.opacity = String(v);
        },
      });
      running.push(on);
      await on;
      beamPower = 0;
      if (dead) return;

      const typing = animate(0, last, {
        duration: last * TYPE,
        ease: "linear",
        onUpdate: (v) => type(Math.floor(v)),
      });
      running.push(typing);
      await typing;
      if (dead) return;

      type(last);
      await blink(2); // Two blinks on initial intro
      if (dead) return;

      await swing(true);
    };

    replay.current = async () => {
      if (busy || dead) return;
      busy = true;
      // Re-ignite phosphors gently on replay
      for (let i = 0; i < n; i++) heat[i] = 0.4;
      wake();
      await swing(false);
      if (!dead) await blink(1); // One crisp blink on replay
      if (!dead) await swing(true);
      busy = false;
    };

    busy = true;
    intro().then(() => {
      busy = false;
      wake();
    });
    if (button.current) button.current.hidden = false;

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      running.forEach((a) => a.stop());
    };
  }, []);

  const accent = (i: number) => (i === last ? "text-accent" : undefined);

  return (
    <div className="relative">
      <h1>
        <span className="sr-only">{text}</span>
        <svg
          aria-hidden
          viewBox={viewBox.join(" ")}
          fill="currentColor"
          className="block w-full overflow-visible text-ink"
        >
          <defs>
            <radialGradient id="masthead-glass" cx="0.5" cy="0.5" r="0.7">
              <stop offset="0" stopColor="#15211a" />
              <stop offset="0.65" stopColor="#0b120d" />
              <stop offset="1" stopColor="#040604" />
            </radialGradient>
            <radialGradient id="masthead-glare" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <pattern
              id="masthead-lines"
              width="100"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="3" fill="#000" opacity="0.22" />
            </pattern>
          </defs>
          <g data-masthead="live" className="motion-reduce:hidden">
            <g ref={screen} opacity="0" pointerEvents="none">
              <path
                d={SCREEN}
                fill="url(#masthead-glass)"
                stroke="#454a44"
                strokeWidth="80"
                strokeLinejoin="round"
              />
              <path d={SCREEN} fill="url(#masthead-lines)" />
              <ellipse
                cx={-WIDE * 0.42}
                cy={T + 200}
                rx="1500"
                ry="150"
                fill="url(#masthead-glare)"
              />
              <line
                ref={cathodeBeam}
                x1={-WIDE * 0.92}
                y1={MID}
                x2={WIDE * 0.92}
                y2={MID}
                stroke="#d0ffd8"
                strokeWidth="6"
                opacity="0"
              />
            </g>
            <path
              ref={cursorGhost}
              d={glyphs[last].from.d}
              fill={rgb(PHOSPHOR)}
              opacity="0"
              pointerEvents="none"
            />
            {glyphs.map((gl, i) => (
              <g
                key={i}
                ref={(el) => {
                  groups.current[i] = el;
                }}
                opacity={i === last ? 1 : 0}
                transform={i === last ? `translate(${-last * cell} 0)` : undefined}
                className={accent(i)}
              >
                {[0, 1, 2, 3, 4].map((k) => (
                  <path
                    key={k}
                    ref={(el) => {
                      layers.current[i][k] = el;
                    }}
                    d={k === 4 ? gl.to.d : gl.from.d}
                    opacity={k === 3 ? (i === last ? 1 : 0) : 0}
                    fill={k === 2 ? "none" : undefined}
                    strokeLinejoin={k === 2 ? "round" : undefined}
                    className={k >= 3 ? accent(i) : undefined}
                  />
                ))}
              </g>
            ))}
          </g>
          <g data-masthead="static" className="hidden motion-reduce:inline">
            {glyphs.map((gl, i) => (
              <path key={i} d={gl.to.d} className={accent(i)} />
            ))}
          </g>
        </svg>
      </h1>
      {/* Shown by the effect, so it exists only where the animation does. */}
      <button
        ref={button}
        type="button"
        hidden
        aria-label="Play the masthead animation again"
        onClick={() => replay.current()}
        className="absolute inset-0 cursor-pointer"
      />
      <noscript>
        <style>{`[data-masthead=live]{display:none}[data-masthead=static]{display:inline}`}</style>
      </noscript>
    </div>
  );
}
