// The world's material library. Everything is flat-shaded: faceted light is the look of early CGI.
// Shared instances keep draw state small.
import { Color, LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial } from "three";

const std = (color: string, extra: Partial<MeshStandardMaterial> = {}) =>
  Object.assign(new MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.05, flatShading: true }), extra);

export const M = {
  concrete: std("#1c1d20"),
  darkConcrete: std("#111215"),
  floor: std("#0e0f11", { roughness: 0.75, metalness: 0.2 }),
  metal: std("#3a3530", { roughness: 0.55, metalness: 0.3 }), // low metalness: no env map, so keep it diffuse enough to catch practical light
  brushedMetal: std("#2c3035", { roughness: 0.32, metalness: 0.7 }),
  darkReflective: std("#0b0d10", { roughness: 0.18, metalness: 0.45 }),
  paper: std("#eae4d6", { roughness: 0.96, metalness: 0.02 }),
  translucentPlastic: new MeshStandardMaterial({
    color: "#7aa4ae",
    roughness: 0.38,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35,
    flatShading: true,
  }),
  brass: std("#8a6230", { roughness: 0.45, metalness: 0.35 }),
  panel: std("#0c0d10", { roughness: 0.6 }),
  ivory: std("#e9e1cf"),
  screen: new MeshStandardMaterial({
    color: "#6b9da8",
    roughness: 0.15,
    metalness: 0.25,
    transparent: true,
    opacity: 0.25,
    flatShading: true,
  }),
  line: new LineBasicMaterial({ color: "#f1eadb", transparent: true, opacity: 0.16 }),
};

const glows = new Map<string, MeshStandardMaterial>();
/** Self-lit, flat-shaded. Cached by colour + intensity so render loops never allocate materials. */
export const glow = (color: string, intensity = 2) => {
  const k = `${color}/${intensity}`;
  if (!glows.has(k)) {
    const m = new MeshStandardMaterial({ color: "#000", emissive: color, emissiveIntensity: intensity, flatShading: true });
    m.userData.base = intensity;
    glows.set(k, m);
  }
  return glows.get(k)!;
};

/** Scene-level emissive multiplier from the lighting system: signage and practicals dim or flare with the scene. */
export const setGlowLevel = (level: number) => glows.forEach((m) => (m.emissiveIntensity = m.userData.base * level));
