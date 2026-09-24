// The motion + space language. Every animation, depth offset and accent on the site draws
// from here — nothing else should hard-code a duration, spring, Z value or colour.
//
// Time hierarchy: the larger the thing, the slower and heavier it moves.
//   MICRO → cursor labels, tints · FAST → hovers · MEDIUM → UI transitions
//   SLOW → content reveals · CINEMATIC → scene changes
// Springs: anything a pointer or gesture touches uses physics, not time.

import type { Transition } from "motion/react";

export const EASE = {
  out: [0.16, 1, 0.3, 1], // long deceleration: arrive and settle
  inOut: [0.76, 0, 0.24, 1], // scene swaps
  in: [0.7, 0, 0.84, 0], // exits
} as const;

export const DUR = { micro: 0.12, fast: 0.2, medium: 0.45, slow: 0.9, cinematic: 1.4 } as const;

export const STAGGER = { tight: 0.025, base: 0.07, loose: 0.14 } as const;

export const SPRING = {
  soft: { type: "spring", stiffness: 170, damping: 26, mass: 1 }, // panels, layers
  physical: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 }, // buttons, magnets, tilt
  heavy: { type: "spring", stiffness: 90, damping: 20, mass: 1.2 }, // large planes, detail view
  elastic: { type: "spring", stiffness: 300, damping: 11, mass: 0.8 }, // playful overshoot, Lab only
  cursor: { type: "spring", stiffness: 1100, damping: 60, mass: 0.3 }, // pointer dot
  follow: { type: "spring", stiffness: 190, damping: 22, mass: 0.6 }, // follower ring, camera
  smooth: { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0005 }, // smoothing scroll-derived values
} as const;

export const T = {
  micro: { duration: DUR.micro, ease: EASE.out },
  fast: { duration: DUR.fast, ease: EASE.out },
  medium: { duration: DUR.medium, ease: EASE.out },
  slow: { duration: DUR.slow, ease: EASE.out },
  cinematic: { duration: DUR.cinematic, ease: EASE.inOut },
} satisfies Record<string, Transition>;

// Accent families. In the world, colour comes from the colour script (world/timeline.ts);
// these are the fixed accents used by projects, skill groups and the Lab.
export const ACCENT = {
  cyan: "#3EE6D8",
  orange: "#FF7A2E",
  magenta: "#D8508F",
  acid: "#C8F04A",
  ivory: "#F1EADB",
} as const;
export type AccentKey = keyof typeof ACCENT;
