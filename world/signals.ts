// The signal bus between the page and the world. Module-level Motion values, written by
// <FilmDriver> (DOM side) and read every frame by the camera and scenes (WebGL side).
// No React state is involved in anything continuous.
//
//   scroll → progress (raw 0..1) → spring → film (what the camera actually follows)
//   scroll velocity → velocity (smoothed, px/s)
//   pointer → pointer.x / pointer.y (smoothed, -1..1)

import { motionValue } from "motion/react";
import { useSyncExternalStore } from "react";

export const progress = motionValue(0); // raw scroll progress
export const film = motionValue(0); // spring-smoothed progress: the camera's timeline position
export const velocity = motionValue(0); // smoothed scroll velocity (px/s)
export const pointer = { x: motionValue(0), y: motionValue(0) }; // smoothed, -1..1
export const settings = { reduced: false, mobile: false, live: true };

/* ---------- text focus system: protects typography legibility (Section 14) ---------- */
export type TextImportance = "PRIMARY" | "SECONDARY" | "METADATA" | "DECORATIVE";

/**
 * Evaluates active text importance across the film.
 * When PRIMARY:
 * - DepthOfField bokeh is set to 0 (absolute sharpness)
 * - Chromatic aberration is zeroed on characters
 * - Bloom threshold interaction is restricted so typography never washes out
 * - Dust particle opacity is reduced to keep the clean zone pristine
 */
export function getTextImportance(t: number): TextImportance {
  // Reading windows across the film:
  // 1. Signal Name & Title: 0.02 - 0.095
  if (t >= 0.02 && t <= 0.095) return "PRIMARY";
  // 2. Gate Identity: 0.155 - 0.235
  if (t >= 0.155 && t <= 0.235) return "PRIMARY";
  // 3. Archive (About, Bio record, Experience): 0.24 - 0.375
  if (t >= 0.24 && t <= 0.375) return "PRIMARY";
  // 4. Workshop (Machines 1-4 & Motion Engine): 0.385 - 0.50
  if (t >= 0.385 && t <= 0.50) return "PRIMARY";
  // 5. Project Chamber (P1 - P4): 0.495 - 0.725
  if (t >= 0.495 && t <= 0.725) return "PRIMARY";
  // 6. Lab Experiments: 0.725 - 0.845
  if (t >= 0.725 && t <= 0.845) return "PRIMARY";
  // 7. Observation Principles: 0.845 - 0.945
  if (t >= 0.845 && t <= 0.945) return "PRIMARY";
  // 8. Transmission Contact: 0.940 - 1.0
  if (t >= 0.940 && t <= 1.0) return "PRIMARY";

  return "DECORATIVE";
}

/* ---------- cursor label: 3D objects announce what they are ---------- */
let label: string | null = null;
const subs = new Set<() => void>();
export const cursor = {
  set(v: string | null) {
    if (v === label) return;
    label = v;
    subs.forEach((f) => f());
  },
};
export const useCursorLabel = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => label,
    () => null,
  );

/* ---------- open project (world → DOM detail layer) ---------- */
let openId: string | null = null;
const openSubs = new Set<() => void>();
export const openProject = (id: string | null) => {
  openId = id;
  openSubs.forEach((f) => f());
};
export const useOpenProject = () =>
  useSyncExternalStore(
    (f) => (openSubs.add(f), () => openSubs.delete(f)),
    () => openId,
    () => null,
  );


/* ---------- camera readout (HUD) ---------- */
export const camPos = { x: motionValue(0), y: motionValue(0), z: motionValue(0) };

/* ---------- world ready (loader) ---------- */
let isReady = false;
const readySubs = new Set<() => void>();
export const markReady = () => {
  if (isReady) return;
  isReady = true;
  readySubs.forEach((f) => f());
};
export const useReady = () =>
  useSyncExternalStore(
    (f) => (readySubs.add(f), () => readySubs.delete(f)),
    () => isReady,
    () => false,
  );
