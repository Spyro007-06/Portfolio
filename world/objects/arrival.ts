"use client";

// useArrival(at): a 0..1 Motion value that plays in (timed, eased) when the camera passes `at` on
// the film timeline and plays out when it goes back. Reveals are time-based on purpose: type and
// frames arrive at their own pace (DUR.slow), while the camera stays scroll-driven.

import { animate, motionValue } from "motion/react";
import { useEffect, useMemo } from "react";
import { DUR, EASE } from "@/components/motion/tokens";
import { film, settings } from "../signals";

export function useArrival(at?: number, until?: number, duration: number = DUR.slow) {
  const v = useMemo(() => motionValue(at === undefined ? 1 : 0), [at]);
  useEffect(() => {
    if (at === undefined && until === undefined) return;
    const want = (p: number) => (at === undefined || p >= at) && (until === undefined || p < until);
    let on = want(film.get());
    v.set(on ? 1 : 0);
    return film.on("change", (p) => {
      const next = want(p);
      if (next === on) return;
      on = next;
      animate(v, next ? 1 : 0, settings.reduced ? { duration: 0 } : { duration: next ? duration : DUR.medium, ease: EASE.out });
    });
  }, [at, until, v, duration]);
  return v;
}
