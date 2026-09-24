// WORLD_TIMELINE — the film's edit. Scroll position is not a trigger; it is the camera's
// position in this film. Every scene boundary, camera keyframe and colour change reads from here.
//
// Physical length: the page is SCROLL_LENGTH_VH viewport-heights tall (≈10 per major scene), so
// the user has room to slow down and look. That distance is normalized to 0..1 and mapped onto
// the timeline below. FILM_SECONDS is only a pacing reference (the HUD timecode).

import { PROJECTS } from "../data/portfolio.ts";

export const SCROLL_LENGTH_VH = 90;
export const FILM_SECONDS = 120;

export const WORLD_TIMELINE = {
  signal: { start: 0.0, end: 0.02, title: "Signal" },
  signalField: { start: 0.02, end: 0.10, title: "Signal field" },
  gate: { start: 0.10, end: 0.23, title: "The gate" },
  archive: { start: 0.23, end: 0.37, title: "Archive" },
  workshop: { start: 0.37, end: 0.50, title: "Workshop" },
  projects: { start: 0.50, end: 0.72, title: "Project chamber" },
  lab: { start: 0.72, end: 0.84, title: "Lab" },
  observation: { start: 0.84, end: 0.94, title: "Observation" },
  transmission: { start: 0.94, end: 1.0, title: "Transmission" },
} as const;

export type SceneKey = keyof typeof WORLD_TIMELINE;
export type Span = { start: number; end: number };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** 0 before `start`, 1 after `end`, linear between. */
export const progressBetween = (p: number, start: number, end: number) => clamp01((p - start) / (end - start));

/** Local 0..1 progress through a scene. */
export const sceneProgress = (p: number, scene: SceneKey) => progressBetween(p, WORLD_TIMELINE[scene].start, WORLD_TIMELINE[scene].end);

/** Local progress inside a sub-range of a scene, both given in scene-local 0..1. */
export const within = (p: number, scene: SceneKey, a: number, b: number) => progressBetween(sceneProgress(p, scene), a, b);

/** Project segments are derived from the real project count — never hard-coded. */
export const PROJECT_SPANS: Span[] = PROJECTS.map((_, i) => {
  const { start, end } = WORLD_TIMELINE.projects;
  const len = (end - start) / PROJECTS.length;
  return { start: start + i * len, end: start + (i + 1) * len };
});

/**
 * Scene manager windows: when each scene is mounted. Scenes mount before they begin (so the next
 * place is already visible in the distance) and unmount after the camera has left them.
 */
export const MOUNT: Record<SceneKey, Span> = {
  signal: { start: 0, end: 0.12 },
  signalField: { start: 0, end: 0.20 },
  gate: { start: 0, end: 0.28 }, // the closed gate is in shot from the first frame
  archive: { start: 0.12, end: 0.42 },
  workshop: { start: 0.28, end: 0.55 },
  projects: { start: 0.42, end: 0.78 },
  lab: { start: 0.64, end: 0.90 },
  observation: { start: 0.76, end: 1.0 },
  transmission: { start: 0.86, end: 1.0 },
};

/** Navigation stops (the tiny cinematic index). `at` is where the camera lands. */
export const CHAPTERS: { key: SceneKey; n: string; label: string; at: number }[] = [
  { key: "signalField", n: "01", label: "Signal", at: 0.04 },
  { key: "archive", n: "02", label: "Archive", at: 0.25 },
  { key: "workshop", n: "03", label: "Workshop", at: 0.39 },
  { key: "projects", n: "04", label: "Projects", at: 0.52 },
  { key: "lab", n: "05", label: "Lab", at: 0.745 },
  { key: "observation", n: "06", label: "Observation", at: 0.89 },
  { key: "transmission", n: "07", label: "Contact", at: 0.975 },
];

export const sceneAt = (p: number): SceneKey => {
  const keys = Object.keys(WORLD_TIMELINE) as SceneKey[];
  return keys.find((k) => p < WORLD_TIMELINE[k].end) ?? "transmission";
};

/* ---------- colour script ---------- */
// [progress, background/fog, key light, accent]. Interpolated continuously.
// Each major environment has its own palette, with continuous atmospheric mixing between them.
export const COLOR_SCRIPT: [number, string, string, string][] = [
  [0.0, "#010203", "#162a4d", "#f1eadb"], // signal: near-black, subtle cool rim, warm white beacon
  [0.02, "#02050b", "#284b72", "#ffd9a8"], // signal field start: cool cyan-blue, warm amber destination
  [0.06, "#04070d", "#355e8c", "#ffcaa0"], // signal field mid
  [0.10, "#05080c", "#486b8d", "#ff9e42"], // gate approach: dark steel, cool blue, mechanical amber
  [0.16, "#070a0e", "#cf7438", "#ffae58"], // gate opening: amber interior light spilling
  [0.21, "#060a0f", "#7298a6", "#f1eadb"], // pass through gate: transition to cool archive
  [0.25, "#070b0d", "#6ba3af", "#7fe3e0"], // archive established: concrete grey, desaturated cyan, turquoise
  [0.32, "#080c0e", "#58909e", "#e9e1cf"], // deep archive: ivory, concrete, shafts
  [0.36, "#0c0b0a", "#b86a32", "#ffd4a3"], // archive exit: warm orange light visible in distance
  [0.40, "#0e0906", "#d9772f", "#ff8833"], // workshop: burnt orange, rust, warm industrial
  [0.46, "#0f0a07", "#e68438", "#ffaa4d"], // workshop engine: tungsten amber, kinetic highlights
  [0.49, "#0e060c", "#a83e6b", "#d8508f"], // portal: orange mixing into magenta
  [0.52, "#060810", "#2a6db5", "#3ee6d8"], // chamber P1: charcoal, electric blue & cyan
  [0.58, "#050806", "#68a834", "#c8f04a"], // chamber P2: graphite, acid green
  [0.63, "#080606", "#ba542a", "#ff7a2e"], // chamber P3: black steel, amber/crimson
  [0.68, "#090409", "#94386e", "#d8508f"], // chamber P4: dark red-black, deep violet
  [0.71, "#040706", "#35756a", "#5ce6b0"], // chamber exit: corridor to lab, transitional cyan/green
  [0.74, "#030907", "#429b92", "#c8f04a"], // lab: dark cyan, experimental white, acid green
  [0.80, "#040807", "#3b8d8b", "#bde63b"], // lab experiments: alien cyan, fluorescent yellow-green
  [0.83, "#070807", "#a89f92", "#ecdcb9"], // lab exit: green mixing with soft warm window light
  [0.87, "#0a0a0b", "#dcd2c0", "#f1eadb"], // observation: soft grey, charcoal, warm white (breathing room!)
  [0.92, "#080809", "#c8beb0", "#ffaa66"], // observation: low saturation, calm, distant sun
  [0.94, "#050404", "#9e5c30", "#ff9a4d"], // transition to transmission: light recedes
  [0.97, "#020202", "#ff8a3d", "#ffd2a0"], // transmission: single warm golden key on core
  [0.995, "#000000", "#773315", "#f1eadb"], // fade to near-black
  [1.0, "#000000", "#000000", "#f1eadb"], // black freeze
];
