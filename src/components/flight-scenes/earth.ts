import {
  CanvasTexture,
  Group,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  SRGBColorSpace,
} from "three";

/*
 * The Earth in the four travel scenes, all of it: how it looks, how it is
 * tilted, how fast it turns, and the size things on it are measured from. A
 * scene asks for an Earth of some radius and calls `turn` each frame; it does
 * not decide any of the rest, so a change here is a change on every card.
 *
 * Like the rest of scene-kit.ts these are three.js objects, not React
 * components: drawn into a canvas hidden from assistive technology, no layout.
 */

/** The land, as the polygons in /geo/land.json. */
export type Land = {
  features: { geometry: { type: string; coordinates: number[][][] }; properties: { kind: string } }[];
};

/** The two colors the Earth is painted in. */
export type EarthColors = { ocean: string; land: string };

/** The real tilt of the Earth's axis to its orbit. Which way it leans is a choice: toward the light. */
const tilt = MathUtils.degToRad(23.5);

/**
 * The real Earth turns once in 24 hours, 0.00417° a second: a quarter of a
 * degree a minute, which looks still. The scenes play it faster by this many
 * times, one real hour to a second, so it turns once in 24 seconds.
 */
export const timeLapse = 3600;
const realDegreesPerSecond = 360 / (24 * 60 * 60);
export const spinRadiansPerSecond = MathUtils.degToRad(realDegreesPerSecond * timeLapse);

/** The land on a flat map of the whole Earth, for wrapping round a sphere. */
function texture(land: Land | undefined, colors: EarthColors) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = colors.ocean;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.land;
  for (const feature of land?.features ?? []) {
    if (feature.properties.kind !== "land" || feature.geometry.type !== "Polygon") continue;
    context.beginPath();
    for (const ring of feature.geometry.coordinates) {
      ring.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
    }
    context.fill("evenodd");
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

/**
 * The Earth, once for a set of scenes: they share its material, so the land
 * and the colors are set in one place and every Earth made here follows.
 */
export function createEarth(initial: EarthColors) {
  const geometry = new SphereGeometry(1, 64, 48);
  const material = new MeshLambertMaterial({ map: texture(undefined, initial) });
  let land: Land | undefined;
  let colors = initial;

  function repaint() {
    material.map?.dispose();
    material.map = texture(land, colors);
    material.needsUpdate = true;
  }

  return {
    /** An Earth of `radius`: add `object` to a scene and call `turn` as time passes. */
    create(radius: number) {
      const spin = new Mesh(geometry, material);
      const object = new Group();
      object.add(spin);
      object.scale.setScalar(radius);
      object.rotation.z = -tilt;
      return {
        object,
        radius,
        /** Where `factor` times the radius is, for what sits above the surface. */
        altitude: (factor: number) => radius * factor,
        /** West to east, the same on every card. */
        turn(seconds: number) {
          spin.rotation.y = seconds * spinRadiansPerSecond;
        },
      };
    },

    /** The land to wrap the Earth in, once it has loaded. */
    setLand(shapes: Land) {
      land = shapes;
      repaint();
    },

    /** The color scheme changed. */
    recolor(next: EarthColors) {
      colors = next;
      repaint();
    },

    dispose() {
      material.map?.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}

export type Earth = ReturnType<typeof createEarth>;
