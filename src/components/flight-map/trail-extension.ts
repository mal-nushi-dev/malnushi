import { LayerExtension, type Layer, type UpdateParameters } from "@deck.gl/core";

/*
 * A pulse of light that travels each arc, written into the arc layer's own
 * shaders. Every arc is drawn dimmed, and a short bright head with a longer
 * fading tail runs along it from one end to the other. Each arc starts at
 * its own point in the cycle, so they do not all pulse together.
 *
 * The arc's vertex shader already hands the fragment shader how far along
 * the arc it is (`geometry.uv.x`, 0 at the source and 1 at the target), so
 * this needs only the time and each arc's phase.
 */

export type TrailProps = {
  /** Seconds, from any start. Stop advancing it and the pulses stand still. */
  trailTime?: number;
  /** How much of an arc the tail covers, 0 to 1. */
  trailLength?: number;
  /** Seconds for a pulse to cross an arc. */
  trailPeriod?: number;
  /** How bright an arc is away from its pulse, 0 to 1. */
  trailRest?: number;
  /**
   * How far a pulse is lifted toward white, 0 to 1. On a dark page that is
   * what makes it light; on a light page it would wash the pulse out, so
   * there it is 0 and the pulse is the arc at full strength.
   */
  trailLift?: number;
  /** Whether the pulses are drawn at all. Off, the arcs are plain lines. */
  trailEnabled?: boolean;
};

const uniformBlock = `\
layout(std140) uniform trailUniforms {
  float time;
  float length;
  float period;
  float rest;
  float lift;
  float enabled;
} trail;
`;

const trailUniforms = {
  name: "trail",
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    time: "f32",
    length: "f32",
    period: "f32",
    rest: "f32",
    lift: "f32",
    enabled: "f32",
  },
} as const;

export class FlightTrailExtension extends LayerExtension {
  static extensionName = "FlightTrailExtension";
  static defaultProps = {
    trailTime: 0,
    trailLength: 0.35,
    trailPeriod: 6,
    trailRest: 0.35,
    trailLift: 0.55,
    trailEnabled: true,
  };

  getShaders() {
    return {
      modules: [trailUniforms],
      inject: {
        "vs:#decl": "in float instanceTrailPhases;\nout float vTrailPhase;",
        "vs:#main-end": "vTrailPhase = instanceTrailPhases;",
        "fs:#decl": "in float vTrailPhase;",
        "fs:DECKGL_FILTER_COLOR": `\
if (trail.enabled > 0.5) {
  // Where the head of the pulse is along this arc, 0 to 1 and round again.
  float head = fract(trail.time / trail.period + vTrailPhase);
  // How far behind the head this fragment is, wrapping past the start.
  float behind = fract(head - geometry.uv.x);
  float tail = 1.0 - smoothstep(0.0, trail.length, behind);
  float glow = tail * tail;
  color.rgb = mix(color.rgb, vec3(1.0), glow * trail.lift);
  color.a *= mix(trail.rest, 1.0, glow);
}
`,
      },
    };
  }

  initializeState(this: Layer) {
    this.getAttributeManager()?.addInstanced({
      instanceTrailPhases: {
        size: 1,
        accessor: "getTrailPhase",
        defaultValue: 0,
      },
    });
  }

  updateState(this: Layer<TrailProps>, { props }: UpdateParameters<Layer<TrailProps>>) {
    this.setShaderModuleProps({
      trail: {
        time: props.trailTime,
        length: props.trailLength,
        period: props.trailPeriod,
        rest: props.trailRest,
        lift: props.trailLift,
        enabled: props.trailEnabled ? 1 : 0,
      },
    });
  }
}
