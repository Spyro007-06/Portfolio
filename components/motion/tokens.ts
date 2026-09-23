// The motion language. Every animation on the site draws from these — nothing else
// should hard-code a duration, ease, or spring.
//
// Hierarchy: the larger the thing that moves, the slower and heavier it is.
//   FAST       → micro-interactions (hover tints, cursor labels)
//   MEDIUM     → UI transitions (nav, panels, context changes)
//   SLOW       → content reveals (headlines, images)
//   CINEMATIC  → scene-level changes (intro, project detail, section handoffs)
//   SPRING.*   → anything the pointer or a gesture touches: physics, not time.

import type { Transition } from "motion/react";

export const EASE = {
  // Long deceleration: things arrive and settle. Our default "out".
  out: [0.16, 1, 0.3, 1],
  // Symmetric, for things that leave and arrive (scene swaps).
  inOut: [0.76, 0, 0.24, 1],
  // Quick acceleration away: exits.
  in: [0.7, 0, 0.84, 0],
} as const;

export const DUR = { fast: 0.18, medium: 0.45, slow: 0.9, cinematic: 1.4 } as const;

// Distance hierarchy (px). Small things travel little; big things travel far.
export const DIST = { sm: 12, md: 40, lg: 120 } as const;

export const STAGGER = { tight: 0.025, base: 0.07, loose: 0.14 } as const;

export const SPRING = {
  // Pointer-bound, near-instant, no overshoot. The cursor dot.
  cursor: { type: "spring", stiffness: 1100, damping: 60, mass: 0.3 },
  // Delayed follower: visible lag, slight settle.
  follow: { type: "spring", stiffness: 190, damping: 22, mass: 0.6 },
  // Buttons, magnetic pulls, hover shifts. Crisp.
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  // Panels and layers. Soft landing.
  soft: { type: "spring", stiffness: 170, damping: 26, mass: 1 },
  // Big surfaces (project detail). Weighty.
  heavy: { type: "spring", stiffness: 90, damping: 20, mass: 1.2 },
  // Smoothing for scroll-derived values (velocity, progress). Not user-visible bounce.
  smooth: { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0005 },
} as const satisfies Record<string, Transition | object>;

export const T = {
  fast: { duration: DUR.fast, ease: EASE.out },
  medium: { duration: DUR.medium, ease: EASE.out },
  slow: { duration: DUR.slow, ease: EASE.out },
  cinematic: { duration: DUR.cinematic, ease: EASE.inOut },
} satisfies Record<string, Transition>;

// Accent families. Color is an event: these appear on interaction/state, not as paint.
export const ACCENT = {
  blue: "#3D6BFF",
  acid: "#C6F432",
  orange: "#FF6A2B",
  bone: "#EDEAE3",
} as const;
