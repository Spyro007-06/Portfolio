"use client";

import { useEffect, useRef } from "react";
import { worldState } from "@/lib/animation/sceneState";

const SMOOTH = 0.12; // Mouse smoothing factor

export function useMouseForce() {
  const rawX  = useRef(0);
  const rawY  = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.current = (e.clientX / window.innerWidth)  * 2 - 1;
      rawY.current = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      worldState.mouseX += (rawX.current - worldState.mouseX) * SMOOTH;
      worldState.mouseY += (rawY.current - worldState.mouseY) * SMOOTH;
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);
}