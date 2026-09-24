"use client";

// The land the facility sits on: one low-poly plane along the whole journey. Flat where the
// camera travels, rising into faceted ridges at the sides — a valley that fog swallows.
// Deterministic displacement (sums of sines): designed, repeatable, no noise library.

import { useMemo } from "react";
import { PlaneGeometry } from "three";
import { M } from "../materials";
import { settings } from "../signals";

export default function Terrain() {
  const geo = useMemo(() => {
    const seg = settings.mobile ? [40, 120] : [70, 220];
    const g = new PlaneGeometry(420, 1500, seg[0], seg[1]);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -520);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      // the valley bends left and widens at the end of the journey, where the final chamber is
      const k = Math.min(1, Math.max(0, (-900 - z) / 70));
      const bendK = k * k * (3 - 2 * k);
      const cx = -50 * bendK, half = 34 + 40 * bendK;
      const edge = Math.max(0, Math.abs(x - cx) - half) / 60; // 0 in the valley, rising outward
      const h = Math.sin(x * 0.045 + z * 0.021) * 4 + Math.sin(z * 0.013 - x * 0.03) * 7 + Math.cos(x * 0.11) * 2;
      p.setY(i, edge * edge * 22 + edge * h - 0.2 + (edge === 0 ? Math.sin(x * 0.7 + z * 0.3) * 0.06 : 0));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={M.floor} receiveShadow />;
}
