/**
 * Where a page transition starts, and what is set before it runs.
 *
 * By default a page opens out of the nav plate. A link marked
 * `data-vt-origin` has the page open out of that link instead (the spine
 * becomes the page), and the way back closes into it. A link marked
 * `data-vt-back` goes up a level: the page closes.
 *
 * Everything the browser needs for the first frame is set here, at the press,
 * because the transition's own script only runs once its snapshots are ready.
 */

/** A box in CSS px, from the top left of the viewport. */
export type Box = { l: number; t: number; r: number; b: number };

/** Where a transition starts: a box, its corners, and whether it is a spine. */
export type Origin = { box: Box; rad: number; rb: number; spine: boolean };

/** The nav plate's footprint: 600 x 72 (or the viewport less 16px each side), 24px down. */
export function plateOrigin(width: number): Origin {
  const w = Math.min(600, width - 32);
  const l = (width - w) / 2;
  return { box: { l, t: 24, r: l + w, b: 96 }, rad: 14, rb: 14, spine: false };
}

/** Radii (px) of an element's top and bottom corners. */
function radiiOf(el: Element) {
  const style = getComputedStyle(el);
  return {
    top: parseFloat(style.borderTopLeftRadius) || 0,
    bottom: parseFloat(style.borderBottomLeftRadius) || 0,
  };
}

/** The sage of an open spine and the nav's plate (`color.sage.700`). */
export const SAGE = "#4d5749";

/** The names the transition's CSS looks for. */
const PLATE = "vt-plate";

/* The one thing the engine takes: set at the press, used when it runs. */
let pending: { origin: Origin | null; closing: boolean } | null = null;

/** What a press set up, once. The engine calls it when its snapshots are ready. */
export function takeOrigin() {
  const taken = pending;
  pending = null;
  return taken;
}

const VARS = [
  "--vt-clip-open",
  "--vt-clip-close",
  "--vt-dy",
  "--vt-pl",
  "--vt-pt",
  "--vt-pw",
  "--vt-ph",
  "--vt-prad",
  "--vt-prb",
  "--vt-fill",
  "--vt-ghost",
  "--vt-gw",
  "--vt-color",
];

/** Back to nothing set: the CSS defaults. */
export function resetTransition(root: HTMLElement = document.documentElement) {
  VARS.forEach((v) => root.style.removeProperty(v));
  document.querySelectorAll<HTMLElement>(`[data-vt-named]`).forEach((el) => {
    el.style.removeProperty("view-transition-name");
    el.removeAttribute("data-vt-named");
  });
}

function name(el: HTMLElement) {
  el.style.setProperty("view-transition-name", PLATE);
  el.setAttribute("data-vt-named", "");
}

/**
 * Listens for presses on links and sets up the transition they start.
 * `current` is the path of the page on screen; the router has not changed it
 * yet when a press arrives. Returns the cleanup.
 */
export function trackOrigins(
  current: () => string,
  root: HTMLElement = document.documentElement,
): () => void {
  // Where a page was entered from, by the page it led to, in page coordinates.
  const entered = new Map<string, { from: string; box: Box; rad: number; rb: number }>();
  const plate = () => document.getElementById(PLATE);

  const returning = (to: string) => {
    const e = entered.get(current());
    return e?.from === to ? e : undefined;
  };

  const onClick = (e: MouseEvent) => {
    resetTransition(root);
    pending = null;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === current()) return;

    const closing = link.hasAttribute("data-vt-back");
    const width = root.clientWidth;
    let origin: Origin | null = null;

    if (!closing && link.hasAttribute("data-vt-origin")) {
      const r = link.getBoundingClientRect();
      const radii = radiiOf(link);
      origin = {
        box: { l: r.left, t: r.top, r: r.right, b: r.bottom },
        rad: radii.top,
        rb: radii.bottom,
        spine: true,
      };
      // The link is the plate: its own open look is the snapshot.
      name(link);
      entered.set(url.pathname, {
        from: current(),
        box: { l: r.left, t: r.top + scrollY, r: r.right, b: r.bottom + scrollY },
        rad: radii.top,
        rb: radii.bottom,
      });
    } else {
      const back = returning(url.pathname);
      if (back) {
        origin = { box: back.box, rad: back.rad, rb: back.rb, spine: true };
      }
      const el = plate();
      if (el) name(el);
    }
    pending = { origin, closing };
    if (closing) return;

    // First frame of an opening: the page clipped to where it starts, under a
    // plate of that size, so nothing shows before the engine's own first frame.
    const o = origin ?? plateOrigin(width);
    const { l, t, r, b } = o.box;
    root.style.setProperty(
      "--vt-clip-open",
      `inset(${t}px ${width - r}px calc(100% - ${b}px) ${l}px round ${o.rad}px ${o.rad}px ${o.rb}px ${o.rb}px)`,
    );
    root.style.setProperty("--vt-dy", "18px");
    const px = (n: number) => `${n}px`;
    root.style.setProperty("--vt-pl", px(l));
    root.style.setProperty("--vt-pt", px(t));
    root.style.setProperty("--vt-pw", px(r - l));
    root.style.setProperty("--vt-ph", px(b - t));
    root.style.setProperty("--vt-prad", `${o.rad}px ${o.rad}px ${o.rb}px ${o.rb}px`);
    root.style.setProperty("--vt-fill", "1");
    root.style.setProperty("--vt-ghost", o.spine ? "1" : "0");
    root.style.setProperty("--vt-gw", px(r - l));
    root.style.setProperty("--vt-color", o.spine ? SAGE : "var(--bg)");
  };

  document.addEventListener("click", onClick, true);
  return () => {
    document.removeEventListener("click", onClick, true);
    resetTransition(root);
  };
}
