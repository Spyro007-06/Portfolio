"use client";

// A plain GL line (1px, fog-aware). drei's <Line> draws fat lines whose material ignores fog,
// which lets distant objects shine through the atmosphere.

import { useLayoutEffect, useMemo } from "react";
import { BufferGeometry, Line as ThreeLine, LineBasicMaterial, LineDashedMaterial, Vector3 } from "three";

type Pt = [number, number, number] | Vector3;
type Props = { points: Pt[]; color?: string; opacity?: number; dashed?: boolean; dashSize?: number; gapSize?: number };

export default function Polyline({ points, color = "#f1eadb", opacity = 1, dashed, dashSize = 0.25, gapSize = 0.2 }: Props) {
  const geo = useMemo(() => new BufferGeometry().setFromPoints(points.map((p) => (p instanceof Vector3 ? p : new Vector3(...p)))), [points]);
  const mat = useMemo(
    () =>
      dashed
        ? new LineDashedMaterial({ color, dashSize, gapSize, transparent: opacity < 1, opacity })
        : new LineBasicMaterial({ color, transparent: opacity < 1, opacity }),
    [color, opacity, dashed, dashSize, gapSize],
  );
  const line = useMemo(() => new ThreeLine(geo, mat), [geo, mat]);
  useLayoutEffect(() => void (dashed && line.computeLineDistances()), [dashed, line]);
  return <primitive object={line} />;
}
