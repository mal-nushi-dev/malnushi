# 0001. Spring animation with Motion

- **Status:** accepted
- **Date:** 2026-10-03

## Context

The nav plate expands to show search or the menu. The design calls for a two-phase open (widen, then drop), spring physics with a slight overshoot, and transitions that can be interrupted without a visible restart. The motion design itself is in `docs/DESIGN.md` (Nav) and `docs/design-log.md`.

CSS transitions with a fixed `cubic-bezier` cannot overshoot naturally, restart from zero velocity when interrupted, and cannot start one property when another reaches a point in its travel. The project had no animation dependency.

## Decision

1. **Add `motion`** (the package formerly called Framer Motion) as a runtime dependency.
2. **Use motion values and `animate()` only**, imported from `motion`, not the `motion.div` React component. Two motion values (`--p`, width progress, and `--h`, height in px) are written to the plate as CSS variables through a ref. React state (`mode`) only sets the targets, so no animation frame re-renders React.
3. **Animate `width` and `height` directly**, on a plate that is absolutely positioned and has `contain: layout paint`. CSS computes the width from `--p` between two `min()` clamps, so the viewport limit needs no measuring in JavaScript.
4. **Sequence by progress, not delay.** The second phase starts when the first motion value has covered 80% of its travel.

## Alternatives considered

- **CSS `linear()` easing that approximates a spring.** No dependency, but it is a fixed curve: it does not keep velocity when interrupted, and stiffness, damping and mass cannot be set directly.
- **GSAP.** Strong timelines, but its elastic ease is a curve, not a simulation, and its imperative style fits React less well.
- **react-spring.** Real spring physics, but weaker sequencing and less actively maintained.
- **FLIP or transform scaling.** FLIP exists to measure an unknown end layout; our sizes are constants. Scaling distorts the corner radius and shadow, and correcting the radius each frame repaints anyway, so it would not stay on the compositor.
- **SVG goo filter (blur plus alpha threshold).** Only produces a liquid join between two separate shapes; on one plate it just rounds corners. It would also blur text, harden the shadow, and re-rasterize the layer every frame.

## Consequences

- A runtime dependency ships on every page, since the nav is in every layout. The client chunk that contains it is about 24 kB gzipped (that chunk also holds the nav itself).
- Each frame of the transition does layout and paint for one contained box. Measured at a steady 60fps on desktop; not yet profiled on a throttled CPU or a real phone. If it drops frames, the fallback is a `clip-path` reveal for the height phase.
- Future animation on the site should use the same approach (motion values and springs from `motion`) unless a new record says otherwise.
