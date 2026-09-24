"use client";

// Foreground layer: dust hanging in the air around the camera. It is world-fixed (so it parallaxes
// against the camera — the strongest depth cue we have) and wraps around the camera in a box.
// Scroll velocity streams it past the lens; at rest it only drifts.

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Points } from "three";
import { film, getTextImportance, settings, velocity } from "../signals";

const R = 26; // half-size of the wrap box (m)

export default function Dust() {
  const camera = useThree((s) => s.camera);
  const ref = useRef<Points>(null);
  const { geo, seeds } = useMemo(() => {
    const n = settings.mobile ? 420 : 1300;
    const pos = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * R;
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * R;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * R;
      seeds[i] = Math.random() * 100;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3));
    return { geo, seeds };
  }, []);

  const matRef = useRef<any>(null);

  useFrame((state, dt) => {
    const a = geo.attributes.position as BufferAttribute;
    const arr = a.array as Float32Array;
    const c = camera.position;
    const t = state.clock.elapsedTime;
    const stream = settings.reduced ? 0 : Math.min(40, Math.abs(velocity.get()) / 60) * dt;

    // Reduce dust density in text clean zones (Section 14 & 18)
    const isPrimary = getTextImportance(film.get()) === "PRIMARY";
    if (matRef.current) {
      const targetOp = isPrimary ? 0.12 : 0.52;
      matRef.current.opacity += (targetOp - matRef.current.opacity) * Math.min(1, dt * 5);
    }

    for (let i = 0; i < seeds.length; i++) {
      const k = i * 3, s = seeds[i];
      arr[k] += Math.sin(t * 0.13 + s) * 0.004;
      arr[k + 1] += Math.cos(t * 0.11 + s) * 0.003;
      arr[k + 2] += stream * (0.5 + (s % 1));
      for (let ax = 0; ax < 3; ax++) {
        const d = arr[k + ax] - c.getComponent(ax);
        arr[k + ax] = c.getComponent(ax) + ((((d + R) % (2 * R)) + 2 * R) % (2 * R)) - R;
      }
    }
    a.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial ref={matRef} size={0.06} color="#f1eadb" transparent opacity={0.52} sizeAttenuation depthWrite={false} />
    </points>
  );
}
