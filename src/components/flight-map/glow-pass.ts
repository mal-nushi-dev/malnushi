import type { PostProcessEffect } from "@deck.gl/core";

/*
 * The map's one post-processing pass: a soft glow. Each pixel takes a little
 * of the light around it, sampled on two rings, and adds it to itself, so a
 * bright pulse on an arc bleeds slightly into what is next to it. The page
 * shows through wherever nothing is drawn, so the pass keeps the alpha it
 * was given and widens it only as far as the glow reaches.
 *
 * In luma.gl's shader-pass form, for deck.gl's `PostProcessEffect`.
 */
export const glowPass: ConstructorParameters<typeof PostProcessEffect>[0] = {
  name: "glow",
  fs: `\
layout(std140) uniform glowUniforms {
  float strength;
  float radius;
} glow;

vec4 glow_sampleColor(sampler2D source, vec2 texSize, vec2 texCoord) {
  vec4 base = texture(source, texCoord);
  vec4 around = vec4(0.0);
  float total = 0.0;
  for (int ring = 1; ring <= 2; ring++) {
    float reach = glow.radius * float(ring) / 2.0;
    float weight = 1.0 / float(ring);
    for (int i = 0; i < 8; i++) {
      float angle = 6.2831853 * float(i) / 8.0;
      vec2 offset = vec2(cos(angle), sin(angle)) * reach / texSize;
      around += texture(source, texCoord + offset) * weight;
      total += weight;
    }
  }
  around /= total;
  // The buffer is premultiplied: adding the neighbours' color and alpha
  // together keeps the glow from darkening where it falls on nothing.
  return base + around * glow.strength * (1.0 - base.a * 0.5);
}
`,
  uniformTypes: {
    strength: "f32",
    radius: "f32",
  },
  passes: [{ sampler: true }],
};
