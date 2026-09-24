// The shot list. Each keyframe: [timeline position, camera position, look target, fov].
// Positions and targets are threaded through centripetal Catmull-Rom splines, so the camera
// curves between shots instead of travelling in straight lines. Project shots are generated
// from the real project count.

import { CatmullRomCurve3, Vector3 } from "three";
import { INSTALLATIONS, MACHINES, PLACES, type V3 } from "../layout.ts";
import { PROJECT_SPANS, lerp, smooth } from "../timeline.ts";

type Key = [t: number, pos: V3, look: V3, fov: number];

const P = PLACES;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const projectShots: Key[] = PROJECT_SPANS.flatMap(({ start, end }, i) => {
  const at = INSTALLATIONS[i];
  const side = Math.sign(at[0]);
  const len = end - start;
  // the installation's text stands on the aisle side (−side); aim between frame and text
  const mid = add(at, [-side * 5, -0.5, 0]);
  return [
    // arrival: ~34 m out, the title barely legible
    [start, [-side * 2, 9, at[2] + 34], mid, 40],
    // peak: frame on one side of the lens, its typography on the other
    [start + len * 0.62, [mid[0] - side * 1.5, 9.4, at[2] + 24], mid, 46],
  ] as Key[];
});

export const SHOTS: Key[] = [
  // SIGNAL / BLACK — 0–1%: near-black, small anticipation; 1–2%: distant signal appears
  [0.0, [0, 5, 118], [0, 22, -100], 30],
  [0.015, [0, 5.15, 116.5], [0, 22, -100], 30.5],
  // SIGNAL FIELD — 2–4%: accelerate; 4–6%: environment visible; 6–8%: large structure; 8–10%: align Gate
  [0.035, [0, 5.8, 96], [0, 22, -100], 33],
  [0.055, [-6, 8.8, 56], P.name, 38],
  [0.075, [2.5, 8.4, 12], [0, 14, -100], 42],
  [0.098, [0, 9, -46], [0, 12, -100], 46],
  // THE GATE — 10–12%: Gate begins opening; 12%+: camera enters the world
  [0.125, [0, 9, -58], [0, 11.5, -105], 46],
  [0.16, [0, 9, -74], [0, 11, -110], 46],
  [0.195, [0, 8.5, -90], P.gateText, 44],
  [0.23, [0, 6.5, -112], [0, 8, -160], 48],
  // ARCHIVE — wide establishing, lateral moves to the information structures, then up
  [0.255, [0, 6, -140], [0, 11, -200], 54],
  // structures hang from their top edge: aim at their centres
  [0.285, [-2, 6.5, -168], add(P.archiveAbout, [0, -6, 0]), 48],
  [0.315, [2, 7, -200], add(P.archiveBio, [0, -5.5, 0]), 48],
  [0.345, [5, 15, -220], add(P.archiveExp, [0, -6, 0]), 50],
  [0.37, [0, 9, -288], [0, 7, -340], 52],
  // WORKSHOP — close pass by a machine, through the tech machines, hold on the Motion engine
  [0.395, [9, 5.5, -306], add(P.workshopHero, [-4, 1, -20]), 56],
  // machines: aim at the mechanism + its plate (≈5 m above the pedestal), from ~16 m
  [0.418, [2, 8, -342], add(MACHINES[0], [1, 5, 0]), 50],
  [0.435, [-2, 8, -356], add(MACHINES[1], [-1, 5, 0]), 50],
  [0.450, [2, 8.5, -380], add(MACHINES[2], [3, 5, 0]), 50],
  [0.465, [2, 10, -400], P.motionEngine, 44],
  [0.478, [-2, 10.5, -404], P.motionEngine, 42],
  [0.488, [5, 9, -446], P.portal, 50],
  [0.496, [0, 9, -482], [0, 9, -540], 50],
  // PROJECT CHAMBER
  ...projectShots,
  // LAB — dark corridor, then a wide room and three experiments
  [0.72, [0, 8, -802], [0, 7, -860], 52],
  [0.75, [-3, 7, -842], P.labGrid, 44],
  [0.78, [4, 7.5, -864], P.labType, 44],
  [0.81, [-2, 8.5, -886], P.labCloud, 44],
  [0.84, [0, 9, -928], [0, 10, -990], 50],
  // OBSERVATION — silence: barely moving, then turn away from the window
  [0.88, [0, 10, -958], P.window, 52],
  [0.91, [4, 10.5, -976], add(P.observationText, [6, -2, 0]), 48],
  [0.93, [-4, 10.5, -984], [-60, 10, -990], 46],
  // FINAL TRANSMISSION — into the dark, toward the one object, then freeze
  [0.95, [-34, 10, -989], P.core, 42],
  [0.975, [-56, 10, -990], P.core, 40],
  [1.0, [-63, 10, -990], P.core, 40],
];

const v = (a: V3) => new Vector3(...a);
const posCurve = new CatmullRomCurve3(SHOTS.map((s) => v(s[1])), false, "centripetal");
const lookCurve = new CatmullRomCurve3(SHOTS.map((s) => v(s[2])), false, "centripetal");
const N = SHOTS.length - 1;

/** Timeline position → curve parameter. Each segment is half-eased so shots breathe at keyframes. */
function param(t: number) {
  let i = 0;
  while (i < N - 1 && t > SHOTS[i + 1][0]) i++;
  const [t0] = SHOTS[i], [t1] = SHOTS[i + 1];
  const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return { u: (i + lerp(f, smooth(f), 0.5)) / N, i, f };
}

export function sample(t: number, pos: Vector3, look: Vector3) {
  const { u, i, f } = param(t);
  posCurve.getPoint(u, pos);
  lookCurve.getPoint(u, look);
  return lerp(SHOTS[i][3], SHOTS[i + 1][3], smooth(f)); // fov
}
