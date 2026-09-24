// Reusable Cinematic Lighting System
// Provides continuously interpolated, multi-color physical illumination across WORLD_TIMELINE.
// Controls ambient, key light, hemisphere fill, rim backlight, fog, and accents with continuous
// atmospheric color mixing and camera-responsive dynamics.

import { Color, Vector3 } from "three";
import { COLOR_SCRIPT, smooth } from "./timeline.ts";

export type CinematicKeyframe = {
  t: number;
  bg: string;
  ambientColor: string;
  ambientIntensity: number;
  keyColor: string;
  keyIntensity: number;
  keyOffset: [number, number, number];
  fillSky: string;
  fillGround: string;
  fillIntensity: number;
  rimColor: string;
  rimIntensity: number;
  rimOffset: [number, number, number];
  fogColor: string;
  fogDensity: number;
  accent: string;
  emissiveIntensity: number;
};

// Project chamber rule: the key light stays near-neutral (a hint of the project's hue). Colour comes
// from each installation's practical light, its emissives and the rim — so the room reads dark
// and the installation reads as the discovery (≈70% dark / 20% environment / 10% accent).
export const CINEMATIC_LIGHTING: CinematicKeyframe[] = [
  // 1. SIGNAL / BLACK (0–2%): 85% near-black, tiny distant warm-white pin-prick, subtle cool rim
  {
    t: 0.0,
    bg: "#010203",
    ambientColor: "#08101a",
    ambientIntensity: 0.05,
    keyColor: "#182d4a",
    keyIntensity: 0.4,
    keyOffset: [-10, 40, -120],
    fillSky: "#0a1424",
    fillGround: "#010204",
    fillIntensity: 0.15,
    rimColor: "#162a4d",
    rimIntensity: 0.35,
    rimOffset: [30, 20, -100],
    fogColor: "#010203",
    fogDensity: 0.011,
    accent: "#f1eadb",
    emissiveIntensity: 0.2,
  },
  // 2. SIGNAL FIELD (2–10%): Cold cinematic landscape, deep navy, steel blue, muted cyan, warm destination
  {
    t: 0.02,
    bg: "#02050b",
    ambientColor: "#0d1826",
    ambientIntensity: 0.12,
    keyColor: "#2e5682",
    keyIntensity: 1.1,
    keyOffset: [-30, 50, -50],
    fillSky: "#12243d",
    fillGround: "#020408",
    fillIntensity: 0.32,
    rimColor: "#2b5078",
    rimIntensity: 0.65,
    rimOffset: [28, 22, -105],
    fogColor: "#02050b",
    fogDensity: 0.0075,
    accent: "#ffd9a8",
    emissiveIntensity: 0.5,
  },
  {
    t: 0.06,
    bg: "#04070d",
    ambientColor: "#102033",
    ambientIntensity: 0.16,
    keyColor: "#3a689c",
    keyIntensity: 1.5,
    keyOffset: [-35, 55, -45],
    fillSky: "#162d4c",
    fillGround: "#03060a",
    fillIntensity: 0.42,
    rimColor: "#3a6696",
    rimIntensity: 0.85,
    rimOffset: [25, 20, -110],
    fogColor: "#04070d",
    fogDensity: 0.008,
    accent: "#ffcaa0",
    emissiveIntensity: 0.8,
  },
  // 3. THE GATE (10–23%): Graphite, dark steel, mechanical drama, cool blue rim, amber interior leak
  {
    t: 0.10,
    bg: "#05080c",
    ambientColor: "#0a121c",
    ambientIntensity: 0.12,
    keyColor: "#456e9c",
    keyIntensity: 1.6,
    keyOffset: [-25, 45, -35],
    fillSky: "#152233",
    fillGround: "#030406",
    fillIntensity: 0.35,
    rimColor: "#2a527c",
    rimIntensity: 1.0,
    rimOffset: [25, 25, -90],
    fogColor: "#05080c",
    fogDensity: 0.011,
    accent: "#ff9e42",
    emissiveIntensity: 1.0,
  },
  {
    t: 0.15,
    bg: "#06090e",
    ambientColor: "#10161f",
    ambientIntensity: 0.15,
    keyColor: "#ca6f32",
    keyIntensity: 2.1,
    keyOffset: [0, 25, -50],
    fillSky: "#252834",
    fillGround: "#050608",
    fillIntensity: 0.45,
    rimColor: "#3d6899",
    rimIntensity: 1.25,
    rimOffset: [30, 20, -85],
    fogColor: "#06090e",
    fogDensity: 0.014,
    accent: "#ffae58",
    emissiveIntensity: 1.5,
  },
  {
    t: 0.21,
    bg: "#060a0f",
    ambientColor: "#121b22",
    ambientIntensity: 0.18,
    keyColor: "#799baa",
    keyIntensity: 1.7,
    keyOffset: [-15, 40, -40],
    fillSky: "#223344",
    fillGround: "#06080a",
    fillIntensity: 0.5,
    rimColor: "#528e9c",
    rimIntensity: 0.9,
    rimOffset: [20, 20, -100],
    fogColor: "#060a0f",
    fogDensity: 0.015,
    accent: "#f1eadb",
    emissiveIntensity: 1.2,
  },
  // 4. THE ARCHIVE (23–37%): Neutral/cool palette, concrete grey, desaturated cyan, ivory, shafts
  {
    t: 0.25,
    bg: "#070b0d",
    ambientColor: "#121c22",
    ambientIntensity: 0.24,
    keyColor: "#6ba3af",
    keyIntensity: 1.8,
    keyOffset: [-10, 75, -20],
    fillSky: "#1c2e38",
    fillGround: "#070c0e",
    fillIntensity: 0.55,
    rimColor: "#62b3bc",
    rimIntensity: 0.85,
    rimOffset: [35, 30, -90],
    fogColor: "#070b0d",
    fogDensity: 0.016,
    accent: "#7fe3e0",
    emissiveIntensity: 1.0,
  },
  {
    t: 0.32,
    bg: "#080c0e",
    ambientColor: "#131a1e",
    ambientIntensity: 0.22,
    keyColor: "#58909e",
    keyIntensity: 1.7,
    keyOffset: [5, 70, -25],
    fillSky: "#182830",
    fillGround: "#080c0e",
    fillIntensity: 0.5,
    rimColor: "#549aa6",
    rimIntensity: 0.8,
    rimOffset: [30, 25, -95],
    fogColor: "#080c0e",
    fogDensity: 0.015,
    accent: "#e9e1cf",
    emissiveIntensity: 0.9,
  },
  {
    t: 0.36,
    bg: "#0c0b0a",
    ambientColor: "#181412",
    ambientIntensity: 0.2,
    keyColor: "#b86a32",
    keyIntensity: 1.9,
    keyOffset: [-20, 50, -40],
    fillSky: "#242220",
    fillGround: "#090807",
    fillIntensity: 0.45,
    rimColor: "#3a6894",
    rimIntensity: 0.9,
    rimOffset: [25, 20, -100],
    fogColor: "#0c0b0a",
    fogDensity: 0.014,
    accent: "#ffd4a3",
    emissiveIntensity: 1.1,
  },
  // 5. THE WORKSHOP (37–50%): First major warmth change. Burnt orange, rust, dark brown, cool backlight
  {
    t: 0.40,
    bg: "#0e0906",
    ambientColor: "#1c1109",
    ambientIntensity: 0.16,
    keyColor: "#e67d2e",
    keyIntensity: 2.3,
    keyOffset: [-35, 45, -25],
    fillSky: "#2e1c10",
    fillGround: "#080503",
    fillIntensity: 0.4,
    rimColor: "#2e6bb5",
    rimIntensity: 1.4,
    rimOffset: [35, 25, -110],
    fogColor: "#0e0906",
    fogDensity: 0.013,
    accent: "#ff8833",
    emissiveIntensity: 1.6,
  },
  {
    t: 0.46,
    bg: "#0f0a07",
    ambientColor: "#1e130a",
    ambientIntensity: 0.18,
    keyColor: "#f08c38",
    keyIntensity: 2.5,
    keyOffset: [-20, 50, -30],
    fillSky: "#331e12",
    fillGround: "#090604",
    fillIntensity: 0.45,
    rimColor: "#3278c7",
    rimIntensity: 1.3,
    rimOffset: [30, 25, -95],
    fogColor: "#0f0a07",
    fogDensity: 0.012,
    accent: "#ffaa4d",
    emissiveIntensity: 1.8,
  },
  {
    t: 0.49,
    bg: "#0e060c",
    ambientColor: "#160912",
    ambientIntensity: 0.16,
    keyColor: "#c4406a",
    keyIntensity: 2.0,
    keyOffset: [-15, 40, -45],
    fillSky: "#281422",
    fillGround: "#080406",
    fillIntensity: 0.4,
    rimColor: "#7d38a8",
    rimIntensity: 1.1,
    rimOffset: [25, 20, -85],
    fogColor: "#0e060c",
    fogDensity: 0.014,
    accent: "#d8508f",
    emissiveIntensity: 1.5,
  },
  // 6. PROJECT CHAMBER (50–72%): Near-black base, each project has distinct micro-palette
  // Project 1 (Financial Agent): electric blue & cyan on charcoal architecture
  {
    t: 0.52,
    bg: "#060810",
    ambientColor: "#0a0f1c",
    ambientIntensity: 0.12,
    keyColor: "#5c6c7a",
    keyIntensity: 1.25,
    keyOffset: [-30, 45, -35],
    fillSky: "#121a28",
    fillGround: "#040508",
    fillIntensity: 0.35,
    rimColor: "#3ee6d8",
    rimIntensity: 1.1,
    rimOffset: [30, 20, -90],
    fogColor: "#060810",
    fogDensity: 0.014,
    accent: "#3ee6d8",
    emissiveIntensity: 1.6,
  },
  // Project 2 (Voice RAG): acid green & cold white on charcoal
  {
    t: 0.58,
    bg: "#050806",
    ambientColor: "#09120a",
    ambientIntensity: 0.12,
    keyColor: "#6c7a55",
    keyIntensity: 1.25,
    keyOffset: [30, 45, -35],
    fillSky: "#141f12",
    fillGround: "#030604",
    fillIntensity: 0.35,
    rimColor: "#6ae2d8",
    rimIntensity: 1.0,
    rimOffset: [-30, 20, -90],
    fogColor: "#050806",
    fogDensity: 0.014,
    accent: "#c8f04a",
    emissiveIntensity: 1.6,
  },
  // Project 3 (HH Goa): warm amber & crimson on dark steel
  {
    t: 0.63,
    bg: "#080606",
    ambientColor: "#140c0a",
    ambientIntensity: 0.12,
    keyColor: "#826353",
    keyIntensity: 1.25,
    keyOffset: [-30, 45, -35],
    fillSky: "#1e1310",
    fillGround: "#060404",
    fillIntensity: 0.35,
    rimColor: "#ffa052",
    rimIntensity: 1.1,
    rimOffset: [30, 20, -90],
    fogColor: "#080606",
    fogDensity: 0.014,
    accent: "#ff7a2e",
    emissiveIntensity: 1.6,
  },
  // Project 4 (Personalized Music): deep violet & magenta on dark red-black
  {
    t: 0.68,
    bg: "#090409",
    ambientColor: "#140713",
    ambientIntensity: 0.12,
    keyColor: "#7a5a65",
    keyIntensity: 1.25,
    keyOffset: [30, 45, -35],
    fillSky: "#1f0e1c",
    fillGround: "#060305",
    fillIntensity: 0.35,
    rimColor: "#e0559e",
    rimIntensity: 1.1,
    rimOffset: [-30, 20, -90],
    fogColor: "#090409",
    fogDensity: 0.014,
    accent: "#d8508f",
    emissiveIntensity: 1.6,
  },
  // Exit corridor: violet dims into darkness, green/cyan begins emerging ahead
  {
    t: 0.71,
    bg: "#040706",
    ambientColor: "#07100e",
    ambientIntensity: 0.1,
    keyColor: "#32786a",
    keyIntensity: 1.5,
    keyOffset: [0, 35, -50],
    fillSky: "#0d1a16",
    fillGround: "#020403",
    fillIntensity: 0.3,
    rimColor: "#3ee6d8",
    rimIntensity: 0.8,
    rimOffset: [20, 15, -80],
    fogColor: "#040706",
    fogDensity: 0.016,
    accent: "#5ce6b0",
    emissiveIntensity: 1.0,
  },
  // 7. THE LAB (72–84%): Dark cyan, graphite, thin acid green emissive lines, cold white flashes
  {
    t: 0.75,
    bg: "#030907",
    ambientColor: "#081410",
    ambientIntensity: 0.14,
    keyColor: "#4ca89e",
    keyIntensity: 1.8,
    keyOffset: [-25, 50, -35],
    fillSky: "#10201c",
    fillGround: "#030504",
    fillIntensity: 0.35,
    rimColor: "#38c2b5",
    rimIntensity: 1.0,
    rimOffset: [30, 20, -90],
    fogColor: "#030907",
    fogDensity: 0.016,
    accent: "#c8f04a",
    emissiveIntensity: 1.4,
  },
  {
    t: 0.80,
    bg: "#040807",
    ambientColor: "#091410",
    ambientIntensity: 0.15,
    keyColor: "#54b5aa",
    keyIntensity: 1.9,
    keyOffset: [25, 45, -30],
    fillSky: "#122420",
    fillGround: "#030605",
    fillIntensity: 0.38,
    rimColor: "#40d0c0",
    rimIntensity: 1.1,
    rimOffset: [-25, 20, -90],
    fogColor: "#040807",
    fogDensity: 0.015,
    accent: "#bde63b",
    emissiveIntensity: 1.5,
  },
  {
    t: 0.83,
    bg: "#070807",
    ambientColor: "#121411",
    ambientIntensity: 0.18,
    keyColor: "#b5a996",
    keyIntensity: 1.6,
    keyOffset: [0, 30, -50],
    fillSky: "#1c201e",
    fillGround: "#060706",
    fillIntensity: 0.45,
    rimColor: "#d4b285",
    rimIntensity: 0.7,
    rimOffset: [25, 20, -90],
    fogColor: "#070807",
    fogDensity: 0.01,
    accent: "#ecdcb9",
    emissiveIntensity: 0.8,
  },
  // 8. OBSERVATION ROOM (84–94%): Emotional cooldown. Desaturated, soft grey, warm white, breathing room
  {
    t: 0.87,
    bg: "#0a0a0b",
    ambientColor: "#181a1f",
    ambientIntensity: 0.28,
    keyColor: "#e5dac8",
    keyIntensity: 2.2,
    keyOffset: [0, 25, -90],
    fillSky: "#282c32",
    fillGround: "#0d0f11",
    fillIntensity: 0.65,
    rimColor: "#e0cbb2",
    rimIntensity: 0.5,
    rimOffset: [-20, 20, -70],
    fogColor: "#0a0a0b",
    fogDensity: 0.006,
    accent: "#f1eadb",
    emissiveIntensity: 0.15,
  },
  {
    t: 0.92,
    bg: "#080809",
    ambientColor: "#14161a",
    ambientIntensity: 0.25,
    keyColor: "#d8a472",
    keyIntensity: 2.0,
    keyOffset: [0, 20, -90],
    fillSky: "#24282e",
    fillGround: "#0b0c0d",
    fillIntensity: 0.6,
    rimColor: "#d5b894",
    rimIntensity: 0.45,
    rimOffset: [-15, 18, -60],
    fogColor: "#080809",
    fogDensity: 0.007,
    accent: "#ffaa66",
    emissiveIntensity: 0.1,
  },
  // 9. FINAL TRANSMISSION (94–100%): Return to darkness, one central floating object, sacred lighting
  {
    t: 0.94,
    bg: "#040303",
    ambientColor: "#0a0806",
    ambientIntensity: 0.08,
    keyColor: "#c4692e",
    keyIntensity: 1.5,
    keyOffset: [-10, 20, -40],
    fillSky: "#120d09",
    fillGround: "#020202",
    fillIntensity: 0.2,
    rimColor: "#d97836",
    rimIntensity: 0.6,
    rimOffset: [20, 15, -60],
    fogColor: "#040303",
    fogDensity: 0.022,
    accent: "#ff9a4d",
    emissiveIntensity: 0.6,
  },
  {
    t: 0.97,
    bg: "#020202",
    ambientColor: "#060302",
    ambientIntensity: 0.04,
    keyColor: "#ff8a3d",
    keyIntensity: 3.2,
    keyOffset: [-15, 25, -35],
    fillSky: "#080402",
    fillGround: "#000000",
    fillIntensity: 0.1,
    rimColor: "#ffaa5c",
    rimIntensity: 0.8,
    rimOffset: [25, 15, -45],
    fogColor: "#010101",
    fogDensity: 0.038,
    accent: "#ff8a3d",
    emissiveIntensity: 2.2,
  },
  {
    t: 0.995,
    bg: "#000000",
    ambientColor: "#020101",
    ambientIntensity: 0.01,
    keyColor: "#884018",
    keyIntensity: 0.8,
    keyOffset: [-10, 20, -30],
    fillSky: "#000000",
    fillGround: "#000000",
    fillIntensity: 0.02,
    rimColor: "#44200c",
    rimIntensity: 0.2,
    rimOffset: [20, 10, -40],
    fogColor: "#000000",
    fogDensity: 0.048,
    accent: "#f1eadb",
    emissiveIntensity: 0.25,
  },
  {
    t: 1.0,
    bg: "#000000",
    ambientColor: "#020101",
    ambientIntensity: 0.0,
    keyColor: "#884018",
    keyIntensity: 0.0,
    keyOffset: [0, 10, -20],
    fillSky: "#000000",
    fillGround: "#000000",
    fillIntensity: 0.0,
    rimColor: "#44200c",
    rimIntensity: 0.0,
    rimOffset: [0, 10, -20],
    fogColor: "#000000",
    fogDensity: 0.05,
    accent: "#f1eadb",
    emissiveIntensity: 0.0,
  },
];

const PARSED = CINEMATIC_LIGHTING.map((k) => ({
  t: k.t,
  bg: new Color(k.bg),
  ambientColor: new Color(k.ambientColor),
  ambientIntensity: k.ambientIntensity,
  keyColor: new Color(k.keyColor),
  keyIntensity: k.keyIntensity,
  keyOffset: new Vector3(...k.keyOffset),
  fillSky: new Color(k.fillSky),
  fillGround: new Color(k.fillGround),
  fillIntensity: k.fillIntensity,
  rimColor: new Color(k.rimColor),
  rimIntensity: k.rimIntensity,
  rimOffset: new Vector3(...k.rimOffset),
  fogColor: new Color(k.fogColor),
  fogDensity: k.fogDensity,
  accent: new Color(k.accent),
  emissiveIntensity: k.emissiveIntensity,
}));

export type InterpolatedLighting = {
  bg: Color;
  ambientColor: Color;
  ambientIntensity: number;
  keyColor: Color;
  keyIntensity: number;
  keyOffset: Vector3;
  fillSky: Color;
  fillGround: Color;
  fillIntensity: number;
  rimColor: Color;
  rimIntensity: number;
  rimOffset: Vector3;
  fogColor: Color;
  fogDensity: number;
  accent: Color;
  emissiveIntensity: number;
};

export function createLightingState(): InterpolatedLighting {
  return {
    bg: new Color(),
    ambientColor: new Color(),
    ambientIntensity: 0.16,
    keyColor: new Color(),
    keyIntensity: 1.6,
    keyOffset: new Vector3(),
    fillSky: new Color(),
    fillGround: new Color(),
    fillIntensity: 0.5,
    rimColor: new Color(),
    rimIntensity: 0.9,
    rimOffset: new Vector3(),
    fogColor: new Color(),
    fogDensity: 0.015,
    accent: new Color(),
    emissiveIntensity: 1.0,
  };
}

export function sampleCinematicLighting(t: number, out: InterpolatedLighting): InterpolatedLighting {
  let i = 0;
  while (i < PARSED.length - 2 && t > PARSED[i + 1].t) i++;
  const a = PARSED[i];
  const b = PARSED[i + 1];
  const f = smooth(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));

  out.bg.copy(a.bg).lerp(b.bg, f);
  out.ambientColor.copy(a.ambientColor).lerp(b.ambientColor, f);
  out.ambientIntensity = a.ambientIntensity + (b.ambientIntensity - a.ambientIntensity) * f;

  out.keyColor.copy(a.keyColor).lerp(b.keyColor, f);
  out.keyIntensity = a.keyIntensity + (b.keyIntensity - a.keyIntensity) * f;
  out.keyOffset.copy(a.keyOffset).lerp(b.keyOffset, f);

  out.fillSky.copy(a.fillSky).lerp(b.fillSky, f);
  out.fillGround.copy(a.fillGround).lerp(b.fillGround, f);
  out.fillIntensity = a.fillIntensity + (b.fillIntensity - a.fillIntensity) * f;

  out.rimColor.copy(a.rimColor).lerp(b.rimColor, f);
  out.rimIntensity = a.rimIntensity + (b.rimIntensity - a.rimIntensity) * f;
  out.rimOffset.copy(a.rimOffset).lerp(b.rimOffset, f);

  out.fogColor.copy(a.fogColor).lerp(b.fogColor, f);
  out.fogDensity = a.fogDensity + (b.fogDensity - a.fogDensity) * f;

  out.accent.copy(a.accent).lerp(b.accent, f);
  out.emissiveIntensity = a.emissiveIntensity + (b.emissiveIntensity - a.emissiveIntensity) * f;

  return out;
}
