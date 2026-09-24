// Where things are in the world (metres). The camera path and the scenes both read these, so a
// shot always frames the object it was written for. The journey runs down −Z.

import { PROJECTS } from "../data/portfolio.ts";

export type V3 = [number, number, number];

export const PLACES = {
  beacon: [0, 62, -122] as V3, // the faint signal, just above the gate lintel
  name: [0, 24, -30] as V3, // the name, hanging in the field
  gate: [0, 0, -100] as V3, // gate threshold (ground level)
  gateText: [0, 16, -124] as V3, // lines sit above the camera path: it passes beneath them
  archiveAbout: [-17, 12.5, -180] as V3, // structures are placed by their top edge
  archiveBio: [17, 12.5, -212] as V3,
  archiveExp: [-13, 21, -246] as V3,
  workshopHero: [7, 5, -316] as V3,
  motionEngine: [0, 10, -420] as V3,
  portal: [0, 9, -478] as V3,
  labGrid: [-9, 6, -860] as V3,
  labType: [9, 7, -880] as V3,
  labCloud: [-7, 8, -902] as V3,
  window: [0, 12, -1004] as V3,
  observationText: [3, 12, -996] as V3,
  core: [-92, 10, -990] as V3,
};

// Project installations: alternating sides, spaced down the chamber.
export const INSTALLATIONS: V3[] = PROJECTS.map((_, i) => [i % 2 ? 8 : -8, 9, -560 - i * 72]);

// Workshop machines, one per skill group.
export const MACHINES: V3[] = [
  [-14, 5, -352],
  [14, 5, -366],
  [-12, 5, -392],
  [13, 5, -404],
];
