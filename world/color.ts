// Colour script sampling: one place turns timeline position into the world's palette.
import { Color } from "three";
import { COLOR_SCRIPT, smooth } from "./timeline.ts";

const KEYS = COLOR_SCRIPT.map(([t, bg, light, accent]) => ({ t, bg: new Color(bg), light: new Color(light), accent: new Color(accent) }));

export function colorAt(t: number, out = { bg: new Color(), light: new Color(), accent: new Color() }) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const f = smooth(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  out.bg.copy(a.bg).lerp(b.bg, f);
  out.light.copy(a.light).lerp(b.light, f);
  out.accent.copy(a.accent).lerp(b.accent, f);
  return out;
}
