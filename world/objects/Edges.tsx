"use client";

// Hairline edges for a mesh, drawn with a basic line material so they sit *in* the fog.
// (drei's <Edges> renders fat lines whose material ignores fog, which breaks the atmosphere.)
// Usage: place inside a <mesh>; it outlines the parent's geometry.

import { useLayoutEffect, useMemo, useRef } from "react";
import { EdgesGeometry, LineBasicMaterial, LineSegments, Mesh } from "three";

type Props = { color?: string; opacity?: number; threshold?: number; transparent?: boolean; material?: LineBasicMaterial };

export default function Edges({ color = "#f1eadb", opacity = 1, threshold = 15, material }: Props) {
  const ref = useRef<LineSegments>(null);
  const defaultMat = useMemo(() => new LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }), [color, opacity]);
  const mat = material ?? defaultMat;
  useLayoutEffect(() => {
    const seg = ref.current!;
    const parent = seg.parent as Mesh | null;
    if (!parent?.geometry) return;
    const g = new EdgesGeometry(parent.geometry, threshold);
    seg.geometry = g;
    return () => g.dispose();
  }, [threshold]);
  return <lineSegments ref={ref} material={mat} raycast={() => null} />;
}
