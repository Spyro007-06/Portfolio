"use client";

// SCENE 07 — OBSERVATION. The silence. A tall empty room, one wall almost entirely window.
// Outside: the world, as three layers of mountain silhouette graded by distance (atmospheric
// perspective, painted rather than fogged so it survives the room's thin fog), a low sun, and
// cloud bands drifting across at walking pace. Light falls through the mullions onto the floor.
// Only the principles appear, near the glass. A doorway in the left wall leads into the dark.

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Group, MeshBasicMaterial, Shape, ShapeGeometry } from "three";
import { PRINCIPLES } from "@/data/portfolio";
import { PLACES } from "../layout";
import { M } from "../materials";
import RetroText from "../objects/RetroText";
import { settings } from "../signals";
import { WORLD_TIMELINE } from "../timeline";

const O = WORLD_TIMELINE.observation;
const at = (local: number) => O.start + (O.end - O.start) * local;
const WZ = PLACES.window[2];

function Ridge({ z, color, amp, seed, y0 }: { z: number; color: string; amp: number; seed: number; y0: number }) {
  const geo = useMemo(() => {
    const s = new Shape();
    s.moveTo(-900, -200);
    for (let x = -900; x <= 900; x += 45) {
      const h = Math.abs(Math.sin(x * 0.004 + seed) * amp + Math.sin(x * 0.013 + seed * 3) * amp * 0.45);
      s.lineTo(x, y0 + h);
    }
    s.lineTo(900, -200);
    return new ShapeGeometry(s);
  }, [amp, seed, y0]);
  const mat = useMemo(() => new MeshBasicMaterial({ color, fog: false }), [color]);
  return <mesh geometry={geo} material={mat} position={[0, 0, z]} />;
}

function Sky() {
  const clouds = useRef<Group>(null);
  const band = useMemo(() => new MeshBasicMaterial({ color: "#e8dcc6", transparent: true, opacity: 0.07, fog: false, depthWrite: false }), []);
  useFrame((_, dt) => {
    if (!clouds.current || settings.reduced) return;
    clouds.current.children.forEach((c, i) => {
      c.position.x += dt * (1.2 + i * 0.5);
      if (c.position.x > 700) c.position.x = -700;
    });
  });
  return (
    <group>
      <mesh position={[0, 0, -1700]}>
        <planeGeometry args={[4000, 1400]} />
        <meshBasicMaterial color="#2b2622" fog={false} />
      </mesh>
      <mesh position={[60, 110, -1650]}>
        <circleGeometry args={[46, 24]} />
        <meshBasicMaterial color="#ffc28a" fog={false} toneMapped={false} />
      </mesh>
      <group ref={clouds}>
        {[[-300, 190, -1600, 700, 14], [120, 150, -1560, 500, 9], [-80, 240, -1620, 900, 20], [400, 120, -1540, 420, 7]].map(([x, y, z, w, h], i) => (
          <mesh key={i} position={[x, y, z]} material={band}>
            <planeGeometry args={[w, h]} />
          </mesh>
        ))}
      </group>
      <Ridge z={-1500} color="#4a3f36" amp={110} seed={1.2} y0={-10} />
      <Ridge z={-1350} color="#2e2823" amp={90} seed={2.7} y0={-30} />
      <Ridge z={-1200} color="#171412" amp={60} seed={4.1} y0={-40} />
      {/* a recurring landmark on the skyline — the same facility silhouette glimpsed back in the
          Signal Field and the Gate, so the world outside this window is the world already
          travelled through, not a disconnected backdrop (Section 26, world-building pass) */}
      {[[-260, 95], [340, 130], [-40, 75]].map(([x, h], i) => (
        <mesh key={i} position={[x, -40 + h / 2, -1190]}>
          <boxGeometry args={[10, h, 10]} />
          <meshBasicMaterial color="#100e0c" fog={false} />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  const shaft = useMemo(() => new MeshBasicMaterial({ color: "#ffd9a8", transparent: true, opacity: 0.05, blending: AdditiveBlending, depthWrite: false }), []);
  return (
    <group>
      {/* window wall: frame around a 40 × 22 opening, with mullions */}
      <mesh position={[0, 27.5, WZ]} material={M.darkConcrete}><boxGeometry args={[64, 9, 1.4]} /></mesh>
      <mesh position={[0, 0.5, WZ]} material={M.darkConcrete}><boxGeometry args={[64, 1, 1.4]} /></mesh>
      {[-26, 26].map((x) => (
        <mesh key={x} position={[x, 14, WZ]} material={M.darkConcrete}><boxGeometry args={[12, 28, 1.4]} /></mesh>
      ))}
      {[-13.3, -6.6, 0, 6.6, 13.3].map((x) => (
        <mesh key={x} position={[x, 12, WZ]} material={M.metal}><boxGeometry args={[0.35, 22, 0.5]} /></mesh>
      ))}
      <mesh position={[0, 16, WZ]} material={M.metal}><boxGeometry args={[40, 0.3, 0.5]} /></mesh>
      {/* side walls; the left one has the doorway into the dark */}
      <mesh position={[31, 16, -972]} material={M.darkConcrete}><boxGeometry args={[1, 32, 64]} /></mesh>
      <mesh position={[-31, 16, -958]} material={M.darkConcrete}><boxGeometry args={[1, 32, 36]} /></mesh>
      <mesh position={[-31, 16, -999]} material={M.darkConcrete}><boxGeometry args={[1, 32, 10]} /></mesh>
      <mesh position={[-31, 26, -987]} material={M.darkConcrete}><boxGeometry args={[1, 12, 14]} /></mesh>
      <mesh position={[0, 32, -972]} material={M.darkConcrete}><boxGeometry args={[64, 1, 64]} /></mesh>
      {/* light through the glass, lying across the floor */}
      {[-10, 0, 10].map((x, i) => (
        <mesh key={x} position={[x + 4, 0.08, -985]} rotation={[-Math.PI / 2, 0, 0.18]} material={shaft}>
          <planeGeometry args={[5.4, 30 + i * 4]} />
        </mesh>
      ))}
      <pointLight position={[0, 14, WZ + 6]} color="#ffd2a0" intensity={3000} distance={70} decay={2} />
    </group>
  );
}

export default function Observation() {
  return (
    <group>
      <Sky />
      <Room />
      <group position={PLACES.observationText} scale={settings.mobile ? [0.72, 0.72, 0.72] : [1, 1, 1]}>
        {/* Dedicated soft key light for principles typography (Section 9) */}
        <pointLight position={[8, -2, 6]} color="#ffe9d1" intensity={700} distance={24} decay={2} />
        {/* Subtle architectural contrast backplate centered behind typography with generous margins (Section 8 & 18) */}
        <mesh position={[8.25, -4.8, -0.2]}>
          <planeGeometry args={[21, 13.5]} />
          <meshBasicMaterial color="#08080b" transparent opacity={0.88} depthWrite={false} fog={false} />
        </mesh>
        <RetroText font="mono" at={at(0.20)} fontSize={0.36} color="#7fe3e0">
          OBSERVATION — HOW I WORK / CORE PRINCIPLES
        </RetroText>
        <RetroText at={at(0.24)} position={[0, -0.85, 0]} fontSize={0.92} maxWidth={16.5} lineHeight={1.0} color="#fbf8f1">
          {`01 — ${PRINCIPLES[0].title.toUpperCase()}.`}
        </RetroText>
        <RetroText font="body" at={at(0.26)} position={[0, -1.8, 0]} fontSize={0.42} maxWidth={16.5} lineHeight={1.5} color="#eae4d6" opacity={0.95}>
          {PRINCIPLES[0].copy}
        </RetroText>
        {PRINCIPLES.slice(1).map((p, i) => (
          <group key={p.title} position={[0, -3.45 - i * 1.65, 0]}>
            <RetroText
              font="mono"
              at={at(0.28 + i * 0.04)}
              position={[0, 0, 0]}
              fontSize={0.34}
              color="#ffd9a8"
            >
              {`0${i + 2} — ${p.title.toUpperCase()}`}
            </RetroText>
            <RetroText
              font="body"
              at={at(0.28 + i * 0.04)}
              position={[0, -0.42, 0]}
              fontSize={0.40}
              maxWidth={16.5}
              lineHeight={1.5}
              color="#eae4d6"
              opacity={0.92}
            >
              {p.copy}
            </RetroText>
          </group>
        ))}
      </group>
    </group>
  );
}
