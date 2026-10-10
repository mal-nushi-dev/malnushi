import {
  AmbientLight,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Scene,
  ShaderMaterial,
  Shape,
  SphereGeometry,
  SpriteMaterial,
  Vector3,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { createEarth } from "./earth";

export type { Land } from "./earth";

/*
 * What the four travel scenes are drawn with: the site's colors, the plane and
 * the lines, and the Earth (which is earth.ts). The scenes (scenes.ts) are made from these and add
 * only where things sit and how they move.
 *
 * These are three.js objects, not React components: they are drawn into a
 * canvas that is hidden from assistive technology, they have no layout, and
 * the only thing about them that varies is a size.
 */

/** A CSS color as three.js reads it, whatever way the stylesheet wrote it. */
function css(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** The site's colors as they are now: light or dark. */
function palette() {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => css(style.getPropertyValue(name).trim());
  return {
    ocean: token("--line"),
    land: token("--ink-2"),
    moon: token("--ink-2"),
    sun: token("--chart-2"),
    plane: token("--ink"),
    path: token("--chart-1"),
    rest: token("--ink-2"),
  };
}

type Palette = ReturnType<typeof palette>;

/**
 * Every line in the scenes is one of these. `flown` and `remaining` are the
 * two the design specifies: the way covered, solid in `chart.1`, and the way
 * left, dashed in `ink-2`. Everything else is made from them, so changing one
 * changes every line that is made from it, on every card.
 */
export type LineStyle = {
  /** Which of the palette's colors it is drawn in. */
  color: "path" | "rest";
  width: number;
  opacity: number;
  dashed?: boolean;
};

const flown: LineStyle = { color: "path", width: 1.5, opacity: 1 };

export const lineStyles = {
  /** The way covered. */
  flown,
  /** The way left, under the flown line. */
  remaining: { color: "rest", width: 1.5, opacity: 1, dashed: true } satisfies LineStyle,
  /** The air the plane has just left: the flown line, fading with distance. */
  wake: [0.7, 0.45, 0.25, 0.1].map((opacity): LineStyle => ({ ...flown, opacity })),
  /** One circuit of the Earth: the flown line, a soft glow under it, a heavier tail. */
  lap: {
    core: { ...flown, width: flown.width * 1.2, opacity: 0.95 } satisfies LineStyle,
    glow: { ...flown, width: flown.width * 6, opacity: 0.3 } satisfies LineStyle,
    tail: { ...flown, width: flown.width * 2.1 } satisfies LineStyle,
  },
};

const dash = { dashSize: 0.045, gapSize: 0.075 };

/** A soft dot, bright at its middle and gone at its edge: the light at the head of an arc. */
function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

/** An airliner from a capsule and three flat shapes: nose along +x, up along +y. */
function planeGeometry() {
  const flat = (points: [number, number][], thickness: number) => {
    const shape = new Shape();
    points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    const geometry = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    geometry.translate(0, 0, -thickness / 2);
    return geometry;
  };
  const fuselage = new CapsuleGeometry(0.075, 0.85, 6, 16);
  fuselage.rotateZ(-Math.PI / 2);
  const wing: [number, number][] = [
    [0.16, 0],
    [-0.16, 0.62],
    [-0.28, 0.62],
    [-0.12, 0],
    [-0.28, -0.62],
    [-0.16, -0.62],
  ];
  const wings = flat(wing, 0.025);
  wings.rotateX(Math.PI / 2);
  const tail = flat(
    wing.map(([x, y]) => [x * 0.5 - 0.36, y * 0.4] as [number, number]),
    0.02,
  );
  tail.rotateX(Math.PI / 2);
  const fin = flat(
    [
      [-0.28, 0.05],
      [-0.44, 0.3],
      [-0.52, 0.3],
      [-0.46, 0.05],
    ],
    0.02,
  );
  return [fuselage, wings, tail, fin];
}

/**
 * The materials, geometry and builders the four scenes share. Materials are
 * shared too, so a color is set in one place and `recolor` carries it to
 * every scene when the color scheme changes.
 */
export function createKit() {
  let colors = palette();
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(thing: T) => {
    disposables.push(thing);
    return thing;
  };

  /** Everything tinted from the palette, and which of its colors. */
  const tinted: { material: { color: Color }; color: keyof Palette }[] = [];
  const tint = <T extends { color: Color }>(material: T, color: keyof Palette) => {
    material.color.set(colors[color]);
    tinted.push({ material, color });
    return material;
  };

  const earth = createEarth(colors);
  const moonMaterial = tint(keep(new MeshLambertMaterial()), "moon");
  const planeMaterial = tint(keep(new MeshLambertMaterial()), "plane");
  const markerMaterial = tint(keep(new MeshBasicMaterial()), "path");
  // The Sun lights itself: brightest at the middle, darker toward its limb.
  const sunMaterial = keep(
    new ShaderMaterial({
      uniforms: { tint: { value: new Color() } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 tint;
        varying vec3 vNormal;
        void main() {
          float facing = clamp(normalize(vNormal).z, 0.0, 1.0);
          gl_FragColor = vec4(tint * (0.72 + 0.28 * pow(facing, 0.6)), 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  sunMaterial.uniforms.tint.value.set(colors.sun);

  const line = (style: LineStyle) =>
    tint(
      keep(
        new LineMaterial({
          linewidth: style.width,
          dashed: style.dashed ?? false,
          ...dash,
          transparent: style.opacity < 1,
          opacity: style.opacity,
        }),
      ),
      style.color,
    );

  /** The line materials, one per style, built from `lineStyles`. */
  const lines = {
    flown: line(lineStyles.flown),
    remaining: line(lineStyles.remaining),
    wake: lineStyles.wake.map(line),
    lap: {
      core: line(lineStyles.lap.core),
      glow: line(lineStyles.lap.glow),
      tail: line(lineStyles.lap.tail),
      // The light at the head of a circuit.
      head: tint(
        keep(new SpriteMaterial({ map: keep(glowTexture()), transparent: true, depthWrite: false })),
        "path",
      ),
    },
  };

  const sphere = keep(new SphereGeometry(1, 64, 48));
  const planeParts = planeGeometry().map(keep);

  /** A line through `points`, in the material of one of `lines`. */
  function path(points: Vector3[], material: LineMaterial) {
    const geometry = keep(new LineGeometry());
    geometry.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
    const drawn = new Line2(geometry, material);
    drawn.computeLineDistances();
    return drawn;
  }

  /**
   * A straight line between two bodies, flown as far as the share it is given:
   * the way left, dashed, with the way covered over it, and the marker where
   * the two meet.
   */
  function leg(scene: Scene, from: Vector3, to: Vector3) {
    const marker = new Mesh(sphere, markerMaterial);
    marker.scale.setScalar(0.06);
    const rest = path([from, to], lines.remaining);
    // The flown part is the whole line, shortened from its start, so nothing is rebuilt as it grows.
    const covered = path([new Vector3(), to.clone().sub(from)], lines.flown);
    covered.position.copy(from).setZ(from.z + 0.01);
    scene.add(rest, covered, marker);
    return (share: number) => {
      marker.position.copy(from).lerp(to, share);
      covered.scale.setScalar(Math.max(share, 1e-6));
    };
  }

  return {
    sphere,
    lines,
    moonMaterial,
    sunMaterial,
    markerMaterial,

    /** A scene lit from the right, where the Sun is in its own scene. */
    stage() {
      const scene = new Scene();
      const sun = new DirectionalLight(0xffffff, 1.5);
      sun.position.set(5, 2.5, 4);
      scene.add(sun, new AmbientLight(0xffffff, 2));
      return scene;
    },

    /** An Earth of `radius`: see earth.ts. */
    earth: earth.create,

    /** The plane at `size`, nose along +x and up along +y. */
    plane(size: number) {
      const group = new Group();
      for (const part of planeParts) group.add(new Mesh(part, planeMaterial));
      group.scale.setScalar(size);
      return group;
    },

    path,
    leg,

    /** An empty line geometry, which the caller keeps writing to. */
    lineGeometry: () => keep(new LineGeometry()),

    /** The land to wrap the Earth in, once it has loaded. */
    setLand: earth.setLand,

    /** The color scheme changed: read the site's colors again. */
    recolor() {
      colors = palette();
      for (const { material, color } of tinted) material.color.set(colors[color]);
      sunMaterial.uniforms.tint.value.set(colors.sun);
      earth.recolor(colors);
    },

    dispose() {
      earth.dispose();
      for (const thing of disposables) thing.dispose();
    },
  };
}

export type Kit = ReturnType<typeof createKit>;
