/**
 * The page transition's engine: the nav's own springs, on a page.
 *
 * React calls `runPageTransition` once the browser's snapshots of the old and
 * new page are ready. Three motion values run on `springs` (src/lib/motion.ts)
 * exactly as the nav's plate does, and every change is written to the root
 * element as CSS variables that globals.css reads:
 *
 * - the box the page shows through widens first, then drops once the width
 *   has covered 80% of its travel (opening), or the other way (closing);
 * - a plate (a pseudo-element of its own) holds that box in sage or in the
 *   page's color, and fades out late: the container leads, the content waits;
 * - the page settles a few px with a small spring as its content arrives.
 *
 * The browser's transition lives as long as a keep-alive animation on the
 * group, which is cancelled when the springs have settled. The engine ends
 * itself: React's own cleanup arrives at once, because no CSS animation runs.
 */
import { animate, motionValue, type MotionValue } from "motion";
import { reducedMotion, springs } from "./motion";
import { plateOrigin, resetTransition, takeOrigin, type Origin, SAGE } from "./page-origin";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The second phase starts once the first has covered this much of its travel. */
const OVERLAP = 0.8;
/** Most the bar thins while its width is moving, in px (as the nav). */
const SQUASH = 4;
/** How far the page settles from, in px. */
const SETTLE = 18;
/** The page's own small spring as its content arrives. */
const settle = { type: "spring", stiffness: 170, damping: 15, mass: 1 } as const;
const arrive = { type: "spring", stiffness: 120, damping: 20, mass: 1 } as const;

export type Progress = {
  /** Width phase, 0 to 1 */
  p: number;
  /** Drop phase, 0 to 1 */
  q: number;
  /** Content arrived, 0 to 1 */
  c: number;
  /** Settle offset in px */
  dy: number;
  /** Thinning in px */
  squash: number;
};

/** The CSS variables for one frame. Pure, so it can be tested. */
export function frame(
  o: Origin,
  width: number,
  height: number,
  { p, q, c, dy, squash }: Progress,
  closing: boolean,
) {
  const l = lerp(o.box.l, 0, p);
  const r = lerp(o.box.r, width, p);
  const t = lerp(o.box.t, 0, q) + squash / 2;
  const b = lerp(o.box.b, height, q) - squash / 2;
  const rad = Math.max(0, lerp(o.rad, 0, clamp01(p)));
  const rb = Math.max(0, lerp(o.rb, 0, clamp01(q)));
  const round = `round ${rad}px ${rad}px ${rb}px ${rb}px`;
  const box = (shift: number) =>
    `inset(${t - shift}px ${width - r}px calc(100% - ${b - shift}px) ${l}px ${round})`;
  // The plate holds the box until the content has arrived. Closing, it also
  // lets go as it lands, so the spine beneath is what is seen at rest.
  let fill = 1 - clamp01(c * 1.3);
  if (closing) fill *= clamp01(p / 0.35);
  return {
    // Settling moves the page, so its clip moves back by the same amount.
    open: box(dy),
    close: box(0),
    dy,
    plate: { l, t, w: r - l, h: b - t, rad: `${rad}px ${rad}px ${rb}px ${rb}px` },
    fill,
    ghost: clamp01(1 - c * 5),
  };
}

type Pseudo = { animate(keyframes: Keyframe[], options: number): Animation };
type Instance = { group: Pseudo };

/* The transition that is playing: one at a time, and it ends itself. */
let active: { finish: () => void; at: number } | null = null;

/**
 * Plays the transition. Returns a cleanup, which React calls when the
 * transition ends or is cancelled.
 */
export function runPageTransition(instance: Instance, types: string[]): () => void {
  // React can report one transition as an enter, an exit and a share, within
  // the same frame. A later call is a new transition: the old one lets go.
  const now = performance.now();
  if (active && now - active.at < 100) return () => {};
  active?.finish();
  if (reducedMotion()) {
    resetTransition();
    return () => {};
  }

  const root = document.documentElement;
  const closing = types.includes("nav-back");
  const taken = takeOrigin();
  const o: Origin = taken?.origin ?? plateOrigin(root.clientWidth);
  const width = root.clientWidth;
  const height = window.innerHeight;
  const narrow = window.matchMedia("(max-width: 632px)").matches;

  const keep = instance.group.animate([{ opacity: 1 }, { opacity: 1 }], 8000);

  const p = motionValue(closing ? 1 : 0);
  const q = motionValue(closing ? 1 : 0);
  const c = motionValue(closing ? 1 : 0);
  const dy = motionValue(closing ? 0 : SETTLE);
  const all: MotionValue<number>[] = [p, q, c, dy];
  const playing: { stop(): void; then(cb: () => void): unknown }[] = [];
  const timers: number[] = [];
  let ended = false;

  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set("--vt-color", o.spine ? SAGE : "var(--bg)");
  set("--vt-gw", `${o.box.r - o.box.l}px`);

  const paint = () => {
    const squash = narrow ? 0 : Math.min(SQUASH, Math.abs(p.getVelocity()) * 0.5);
    const f = frame(o, width, height, {
      p: p.get(),
      q: q.get(),
      c: c.get(),
      dy: dy.get(),
      squash,
    }, closing);
    set(closing ? "--vt-clip-close" : "--vt-clip-open", closing ? f.close : f.open);
    set("--vt-dy", `${f.dy}px`);
    set("--vt-pl", `${f.plate.l}px`);
    set("--vt-pt", `${f.plate.t}px`);
    set("--vt-pw", `${f.plate.w}px`);
    set("--vt-ph", `${f.plate.h}px`);
    set("--vt-prad", f.plate.rad);
    set("--vt-fill", String(f.fill));
    set("--vt-ghost", String(o.spine && !closing ? f.ghost : 0));
  };
  const offs = all.map((mv) => mv.on("change", paint));

  const finish = () => {
    if (ended) return;
    ended = true;
    if (active?.finish === finish) active = null;
    timers.forEach((t) => window.clearTimeout(t));
    playing.forEach((a) => a.stop());
    offs.forEach((off) => off());
    keep.cancel();
    resetTransition();
  };

  const run = (mv: MotionValue<number>, to: number, spring: object) => {
    const a = animate(mv, to, spring);
    playing.push(a);
    return new Promise<void>((resolve) => a.then(() => resolve()));
  };

  active = { finish, at: now };
  paint();
  const done: Promise<void>[] = [];

  if (!closing) {
    // Widen; the drop follows once the width has covered most of its travel.
    done.push(run(p, 1, springs.width));
    const off = p.on("change", (v) => {
      if (v < OVERLAP && !narrow) return;
      off();
      done.push(run(q, 1, springs.height));
      timers.push(
        window.setTimeout(() => {
          done.push(run(c, 1, arrive));
          done.push(run(dy, 0, settle));
        }, 150),
      );
    });
    // On a narrow viewport the plate is already full width: drop at once.
    if (narrow) p.jump(1);
  } else {
    // Content out, then height first, and the width at 80% of that travel.
    done.push(run(c, 0, springs.close));
    timers.push(
      window.setTimeout(() => {
        done.push(run(q, 0, springs.close));
        const off = q.on("change", (v) => {
          if (v > 1 - OVERLAP) return;
          off();
          done.push(run(p, 0, springs.close));
        });
      }, 60),
    );
  }

  // The longest the springs can take, then let the transition go.
  const guard = window.setTimeout(finish, 2000);
  timers.push(guard);
  const settled = window.setInterval(() => {
    const idle = all.every((mv) => !mv.isAnimating());
    const phases = closing ? p.get() === 0 && q.get() === 0 : q.get() === 1 && c.get() === 1;
    if (idle && phases && ended === false) {
      window.clearInterval(settled);
      finish();
    }
  }, 50);
  timers.push(settled);

  // Not `finish`: React calls what is returned as soon as it finds no CSS
  // animation on the transition, and there are none; the engine's own
  // keep-alive and springs decide when it is over.
  return () => {};
}
