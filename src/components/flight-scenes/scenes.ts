import {
  type BufferGeometry,
  Group,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  type Scene,
  Sprite,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { InterleavedBufferAttribute } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { clamp, reducedMotion } from "@/lib/motion";
import { createKit, type Land } from "./scene-kit";

/*
 * The four small scenes on the travels page: a plane over the Earth, the way
 * to the Moon, the laps around the Earth, and the way to the Sun. What they
 * are drawn with (colors, Earth, plane, lines) is in scene-kit.ts; here is
 * only where things sit and how they move.
 *
 * One WebGL context draws all four. It renders each scene to a canvas that is
 * never on the page, and copies the picture to that card's own 2D canvas, so
 * the page holds one more GPU context, not four. See
 * docs/adr/0011-three-js-for-the-travel-scenes.md.
 *
 * The bodies are not to scale with the distances between them: at true scale
 * the Earth is a thirtieth of the way to the Moon and far less than a pixel
 * of the way to the Sun. What is true in each is how far along its line the
 * marker sits, and how many times the path goes round.
 */

export type Ratios = { toMoon: number; aroundEarth: number; toSun: number };

/** A scene is named by the `data-scene` of the canvas it is drawn into. */
export type SceneName = "flights" | "moon" | "earth" | "sun";

const sceneNames: SceneName[] = ["flights", "moon", "earth", "sun"];

/** What the camera sees at z = 0: 3:2, a little under 7.5 units across. */
const view = { fov: 28, distance: 10 };

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export type Scenes = { dispose: () => void };

/**
 * Draws each scene into the canvas inside `container` that names it with
 * `data-scene`. A scene with no canvas is not drawn, so cards can be added,
 * removed and reordered without touching this. Returns undefined when the
 * browser has no WebGL to draw with.
 */
export function mountScenes(container: HTMLElement, ratios: Ratios): Scenes | undefined {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return undefined;
  }
  renderer.setClearColor(0x000000, 0);

  const kit = createKit();
  const { sphere, lines, stage, earth, plane, path, leg } = kit;

  // 1. Flights: a plane held over the Earth, which turns under it, with a trail behind.
  const flights = (() => {
    const scene = stage();
    const globe = earth(2.3);
    globe.object.position.set(2.2, -2.3, 0);
    const radius = globe.altitude(1.14);
    // Where the plane is, seen from the Earth's middle, and the way it is heading.
    const out = new Vector3(-0.5, 0.62, 0.6).normalize();
    const heading = new Vector3(1, 0.45, 0);
    heading.addScaledVector(out, -heading.dot(out)).normalize();
    const flight = new Group();
    flight.position.copy(globe.object.position);
    const flyer = plane(1);
    flyer.position.copy(out).multiplyScalar(radius);
    flyer.quaternion.setFromRotationMatrix(
      new Matrix4().makeBasis(heading, out, heading.clone().cross(out)),
    );
    flight.add(flyer);
    const arc = 0.16;
    lines.wake.forEach((material, i) => {
      const points = Array.from({ length: 13 }, (_, step) => {
        const angle = 0.2 + (i + step / 12) * arc;
        return out
          .clone()
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(heading, -Math.sin(angle))
          .multiplyScalar(radius);
      });
      flight.add(path(points, material));
    });
    const across = heading.clone().cross(out);
    scene.add(globe.object, flight);
    return {
      scene,
      update(seconds: number) {
        globe.turn(seconds);
        // It rides the air a little.
        flight.setRotationFromAxisAngle(across, Math.sin(seconds * 0.6) * 0.012);
      },
    };
  })();

  // 2. The Moon: its real size beside the Earth's, and the line between them.
  const moon = (() => {
    const scene = stage();
    const globe = earth(0.55);
    globe.object.position.set(-2.9, -1.2, 0);
    const body = new Mesh(sphere, kit.moonMaterial);
    body.scale.setScalar(0.55 * 0.2727);
    body.position.set(2.9, -1.2, 0);
    scene.add(globe.object, body);
    const fly = leg(scene, new Vector3(-2.35, -1.2, 0), new Vector3(2.75, -1.2, 0));
    return {
      scene,
      update(seconds: number, intro: number) {
        globe.turn(seconds);
        fly(ratios.toMoon * easeInOut(clamp(intro / 2.4)));
      },
    };
  })();

  // 3. The Earth: one closed circuit of the globe for every whole time round, each a glowing arc
  // on a thin shell just above it. They all pass through the start, each turned a little from the
  // last, so they fan out like meridians and can be counted. The plane flies them one after the
  // other, nose on the path, coming back to the start at the end of each.
  const laps = (() => {
    const scene = stage();
    const globe = earth(1.8);
    const center = new Vector3(1.5, -0.2, 0);
    globe.object.position.copy(center);
        const period = 8;
    const samples = 160;
    const step = (Math.PI * 2) / samples;
    // Whole times round only: 6.5 is six lines. A little under one is still drawn as one.
    const count = Math.max(1, Math.floor(ratios.aroundEarth));
    // The first circuit lies in a plane through the Earth's middle, tilted so it is seen as an ellipse.
    const normal = new Vector3(0.55, 0.7, 0.35).normalize();
    const start = new Vector3().crossVectors(normal, new Vector3(0, 0, 1)).normalize();
    const side0 = new Vector3().crossVectors(normal, start);
    // The others are that plane turned about the line to the start, so every one passes through it.
    const sides = Array.from({ length: count }, (_, k) =>
      side0.clone().applyAxisAngle(start, (k * Math.PI) / count),
    );
    // Just above the surface, rising and falling a little as it goes round: a closed curve.
    const at = (lap: number, theta: number) => {
      const r = globe.altitude(1.12 + 0.06 * Math.sin(theta));
      return start
        .clone()
        .multiplyScalar(Math.cos(theta))
        .addScaledVector(sides[lap], Math.sin(theta))
        .multiplyScalar(r)
        .add(center);
    };

    const loops = sides.map((_, lap) => {
      const geometry = kit.lineGeometry();
      geometry.setPositions(
        Array.from({ length: samples + 1 }, (_, i) => at(lap, i * step)).flatMap((p) => [p.x, p.y, p.z]),
      );
      return { geometry, glow: new Line2(geometry, lines.lap.glow), core: new Line2(geometry, lines.lap.core) };
    });

    // The tail is rewritten in place each frame, so its bounds are not known: never cull it.
    const tailSegments = 16;
    const tailGeometry = kit.lineGeometry();
    tailGeometry.setPositions(new Array<number>(3 * (tailSegments + 1)).fill(0));
    const tailBuffer = (tailGeometry.attributes.instanceStart as InterleavedBufferAttribute).data;
    const tailArray = tailBuffer.array as Float32Array;
    const tail = new Line2(tailGeometry, lines.lap.tail);
    tail.frustumCulled = false;

    const head = new Sprite(lines.lap.head);
    head.scale.setScalar(0.4);
    const flyer = plane(0.5);
    scene.add(globe.object, ...loops.flatMap((loop) => [loop.glow, loop.core]), tail, head, flyer);

    // The arcs draw themselves in one after another; the plane sets off when the last has.
    const stagger = 0.3;
    const draw = 2.2;
    const ready = draw + stagger * (count - 1);

    const basis = new Matrix4();
    const forward = new Vector3();
    const up = new Vector3();
    const side = new Vector3();
    return {
      scene,
      update(seconds: number, intro: number) {
        // Still: the finished picture, with the plane part way round the first.
        const time = Number.isFinite(intro) ? intro : ready + period * 0.3;
        loops.forEach((loop, lap) => {
          const drawn = easeInOut(clamp((time - lap * stagger) / draw));
          loop.geometry.instanceCount = Math.round(drawn * samples);
        });
        const flying = time >= ready;
        flyer.visible = flying;
        head.visible = flying;
        tail.visible = flying;
        globe.turn(seconds);
        if (!flying) return;

        const circuits = (time - ready) / period;
        const lap = Math.floor(circuits) % count;
        const theta = (circuits % 1) * Math.PI * 2;

        const here = at(lap, theta);
        head.position.copy(here);
        // Each tail segment runs from one point of the path to the one just before it.
        for (let k = 0; k < tailSegments; k++) {
          const a = at(lap, theta - k * step);
          const b = at(lap, theta - (k + 1) * step);
          tailArray.set([a.x, a.y, a.z, b.x, b.y, b.z], 6 * k);
        }
        tailBuffer.needsUpdate = true;

        // Nose along the path, and the plane's top away from the Earth's middle.
        forward.copy(at(lap, theta + 0.01)).sub(at(lap, theta - 0.01)).normalize();
        up.copy(here).sub(center).normalize();
        up.addScaledVector(forward, -up.dot(forward)).normalize();
        side.crossVectors(forward, up);
        flyer.position.copy(here);
        flyer.quaternion.setFromRotationMatrix(basis.makeBasis(forward, up, side));
      },
    };
  })();

  // 4. The Sun: so far off that everything flown is still beside the Earth.
  const sun = (() => {
    const scene = stage();
    const globe = earth(0.16);
    globe.object.position.set(-3.1, -1.2, 0);
    const body = new Mesh(sphere, kit.sunMaterial);
    body.scale.setScalar(3.4);
    body.position.set(5.6, -0.4, 0);
    scene.add(globe.object, body);
    const fly = leg(scene, new Vector3(-2.94, -1.2, 0), new Vector3(2.3, -1.2, 0));
    fly(ratios.toSun);
    return {
      scene,
      update(seconds: number) {
        globe.turn(seconds);
      },
    };
  })();

  const scenes: Record<SceneName, { scene: Scene; update: (seconds: number, intro: number) => void }> = {
    flights,
    moon,
    earth: laps,
    sun,
  };
  // Each scene's canvas, by name.
  const targets = sceneNames.flatMap((name) => {
    const canvas = container.querySelector<HTMLCanvasElement>(`canvas[data-scene="${name}"]`);
    const context = canvas?.getContext("2d");
    return canvas && context ? [{ name, canvas, context }] : [];
  });
  const camera = new PerspectiveCamera(view.fov, 1.5, 0.1, 50);
  camera.position.z = view.distance;
  const size = new Vector2();

  const still = reducedMotion();
  let frame = 0;
  let shown = false;
  let started: number | undefined;
  let last = 0;

  function draw(now: number) {
    const ratio = Math.min(window.devicePixelRatio, 2);
    // With motion reduced the scenes are drawn once, as they end up.
    const seconds = still ? 0 : now / 1000;
    const intro = still ? Infinity : started === undefined ? 0 : (now - started) / 1000;
    for (const { name, canvas, context } of targets) {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) continue;
      const w = Math.round(width * ratio);
      const h = Math.round(height * ratio);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      renderer.getDrawingBufferSize(size);
      if (size.x !== w || size.y !== h) {
        renderer.setPixelRatio(1);
        renderer.setSize(w, h, false);
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const { scene, update } = scenes[name];
      update(seconds, intro);
      renderer.render(scene, camera);
      context.clearRect(0, 0, w, h);
      context.drawImage(renderer.domElement, 0, 0);
    }
  }

  function loop(now: number) {
    frame = requestAnimationFrame(loop);
    // The laps draw at the screen's rate; after that the scenes barely move.
    const settled = started !== undefined && now - started > 8000;
    if (settled && now - last < 32) return;
    last = now;
    draw(now);
  }

  function run() {
    cancelAnimationFrame(frame);
    if (still) draw(0);
    else if (shown && !document.hidden) {
      started ??= performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  const watcher = new IntersectionObserver(
    (entries) => {
      shown = entries.some((entry) => entry.isIntersecting);
      run();
    },
    { threshold: 0.15 },
  );
  watcher.observe(container);
  const resized = new ResizeObserver(() => still && draw(0));
  resized.observe(container);

  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  const recolored = () => {
    kit.recolor();
    if (still) draw(0);
  };
  scheme.addEventListener("change", recolored);
  document.addEventListener("visibilitychange", run);

  let gone = false;
  fetch("/geo/land.json")
    .then((response) => response.json())
    .then((shapes: Land) => {
      if (gone) return;
      kit.setLand(shapes);
      if (still) draw(0);
    })
    .catch(() => {
      // The Earth stays a plain sphere.
    });

  draw(0);

  return {
    dispose() {
      gone = true;
      cancelAnimationFrame(frame);
      watcher.disconnect();
      resized.disconnect();
      scheme.removeEventListener("change", recolored);
      document.removeEventListener("visibilitychange", run);
      kit.dispose();
      renderer.dispose();
      for (const { scene } of Object.values(scenes)) {
        scene.traverse((child) => {
          if (child instanceof Mesh || child instanceof Line2) (child.geometry as BufferGeometry).dispose();
        });
      }
    },
  };
}
