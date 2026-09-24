// Ordered dither + gentle palette quantization: the "early renderer" signature.
// Strength is kept low so it reads as texture on gradients and fog, never as noise on type.
import { Effect } from "postprocessing";
import { Uniform } from "three";

const frag = /* glsl */ `
uniform float strength;
uniform float levels;

float bayer4(vec2 p) {
  vec2 q = mod(p, 4.0);
  int i = int(q.x) + int(q.y) * 4;
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return float(m[i]) / 16.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 cell = floor(uv * resolution / 2.0); // 2×2 px dither cells
  float d = bayer4(cell) - 0.5;
  vec3 q = floor(inputColor.rgb * levels + d + 0.5) / levels;
  outputColor = vec4(mix(inputColor.rgb, q, strength), inputColor.a);
}
`;

export class RetroEffect extends Effect {
  constructor({ strength = 0.35, levels = 24 } = {}) {
    super("RetroEffect", frag, {
      uniforms: new Map<string, Uniform>([
        ["strength", new Uniform(strength)],
        ["levels", new Uniform(levels)],
      ]),
    });
  }
}
