"use client";

import { useEffect, useRef } from "react";
import { worldState } from "@/lib/animation/sceneState";

const MAX_VELOCITY = 60;   // px/frame considered "max"
const DAMPING      = 0.88; // velocity decay each frame

export function useScrollVelocity() {
  const prevY   = useRef(0);
  const velRef  = useRef(0);
  const rafId   = useRef<number>(0);

  useEffect(() => {
    prevY.current = window.scrollY;

    const tick = () => {
      const currentY = window.scrollY;
      const raw      = currentY - prevY.current;
      velRef.current = velRef.current * DAMPING + raw * (1 - DAMPING);
      prevY.current  = currentY;

      // Normalize to -1..1
      worldState.scrollVelocity = Math.max(-1, Math.min(1, velRef.current / MAX_VELOCITY));

      // Add/remove fast-scroll class for chromatic aberration
      const fast = Math.abs(worldState.scrollVelocity) > 0.35;
      document.body.classList.toggle("scroll-fast", fast);

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);
}