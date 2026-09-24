"use client";

// Scene manager. A scene is only mounted while the camera is inside its MOUNT window
// (WORLD_TIMELINE + lead/tail), so expensive geometry exists only near the camera.
// React state changes only at window boundaries — never per frame.

import { useEffect, useState, type ReactNode } from "react";
import { film } from "../signals";
import { MOUNT, type SceneKey } from "../timeline";

export function useInWindow(start: number, end: number) {
  const test = (v: number) => v >= start && v <= end;
  const [on, setOn] = useState(() => test(film.get()));
  useEffect(() => film.on("change", (v) => setOn(test(v))), [start, end]); // eslint-disable-line react-hooks/exhaustive-deps
  return on;
}

export default function Mount({ scene, children }: { scene: SceneKey; children: ReactNode }) {
  const w = MOUNT[scene];
  return useInWindow(w.start, w.end) ? <>{children}</> : null;
}
