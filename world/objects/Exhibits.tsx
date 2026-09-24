"use client";

// The four exhibits: each project rendered as a small 3D composition built from its own content
// (there are no screenshots in the repo). Local space: a 13 × 8 m panel centred at the origin,
// facing +Z. `live` = the pointer is on the installation.

import { useFrame } from "@react-three/fiber";
import { useSpring } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from "three";
import type { Project } from "@/data/portfolio";
import { ACCENT, SPRING } from "@/components/motion/tokens";
import { M, glow } from "../materials";
import Polyline from "./Polyline";
import RetroText from "./RetroText";

type P = { p: Project; live: boolean };
const cache = new Map<string, MeshBasicMaterial>();
const flat = (c: string, o = 1) => {
  const k = `${c}/${o}`;
  if (!cache.has(k)) cache.set(k, new MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false }));
  return cache.get(k)!;
};

/* 01 — the question, answered by a balance line crossing a safety margin */
function Financial({ p }: P) {
  const dot = useRef<Mesh>(null);
  const pts = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const x = -5.6 + (i / 47) * 11.2;
    return new Vector3(x, 1.2 + Math.sin(i * 0.35) * 0.9 - i * 0.055 + Math.sin(i * 1.3) * 0.2, 0.05);
  }), []);
  useFrame((s) => {
    const k = (s.clock.elapsedTime * 0.12) % 1;
    const i = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1)));
    dot.current?.position.lerpVectors(pts[i], pts[i + 1], k * (pts.length - 1) - i);
  });
  const band = useMemo(() => flat(ACCENT.cyan, 0.12), []);
  const grid = useMemo(() => Array.from({ length: 12 }, (_, i) => -5.5 + i), []);
  return (
    <group>
      <mesh material={flat("#061416")}>
        <planeGeometry args={[13, 8]} />
      </mesh>
      {grid.map((x) => (
        <Polyline key={x} points={[[x, -3.8, 0.02], [x, 3.8, 0.02]]} color={ACCENT.cyan} opacity={0.1} />
      ))}
      <mesh position={[0, -2.1, 0.03]} material={band}>
        <planeGeometry args={[12.6, 2.6]} />
      </mesh>
      <Polyline points={[[-6.3, -0.8, 0.04], [6.3, -0.8, 0.04]]} color={ACCENT.cyan} dashed dashSize={0.25} gapSize={0.2} />
      <Polyline points={pts} color="#f1eadb" />
      <mesh ref={dot} material={glow(ACCENT.cyan, 3)}>
        <octahedronGeometry args={[0.16, 0]} />
      </mesh>
      <RetroText font="mono" position={[-6, 3.6, 0.05]} fontSize={0.26} opacity={0.6}>BALANCE → 30 DAYS</RetroText>
      <RetroText font="mono" anchorX="right" position={[6, 3.6, 0.05]} fontSize={0.26} opacity={0.6}>{p.subtitle.toUpperCase()}</RetroText>
      <RetroText anchorX="right" position={[6, 3.1, 0.06]} fontSize={1.6} color={ACCENT.cyan}>WAIT.</RetroText>
      <RetroText font="mono" anchorX="right" position={[6, -0.95, 0.05]} fontSize={0.24} color={ACCENT.cyan}>SAFETY MARGIN</RetroText>
      <RetroText font="mono" position={[-6, -3.3, 0.05]} fontSize={0.24} opacity={0.5}>RECURRING −   UPCOMING −   INCOME +</RetroText>
      {/* physical identity: a console ledge jutting toward the viewer, not just a flat screen
          (Section 14, world-building pass) — three status toggles that idle at different rates */}
      <mesh position={[0, -4.05, 0.5]} rotation={[-0.35, 0, 0]} material={M.darkConcrete}>
        <boxGeometry args={[7.4, 0.9, 1.1]} />
      </mesh>
      {[-2.4, 0, 2.4].map((x, i) => (
        <ConsoleLight key={x} position={[x, -3.75, 0.95]} color={i === 1 ? ACCENT.cyan : "#ffd9a8"} phase={i * 2.1} />
      ))}
    </group>
  );
}

/** A small physical indicator with its own idle phase — used on installation consoles. */
function ConsoleLight({ position, color, phase }: { position: [number, number, number]; color: string; phase: number }) {
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#000", emissive: color, emissiveIntensity: 1, flatShading: true }), [color]);
  useFrame((s) => void (mat.emissiveIntensity = 0.6 + 1.4 * Math.max(0, Math.sin(s.clock.elapsedTime * 0.8 + phase))));
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={[0.32, 0.14, 0.14]} />
    </mesh>
  );
}

/* 02 — a voice becomes a waveform becomes a pipeline */
function Voice({ p, live }: P) {
  const ref = useRef<InstancedMesh>(null);
  const runner = useRef<Mesh>(null);
  const n = 44;
  const o = useMemo(() => new Object3D(), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime * (live ? 3.2 : 1.4);
    for (let i = 0; i < n; i++) {
      const h = 0.25 + Math.abs(Math.sin(i * 1.7 + t) * Math.cos(i * 0.45 + t * 0.6)) * 3.2;
      o.position.set(-5.6 + (i / (n - 1)) * 11.2, 0.9, 0.1);
      o.scale.set(0.16, h, 0.16);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    if (runner.current) runner.current.position.x = -5 + ((s.clock.elapsedTime * (live ? 0.5 : 0.22)) % 1) * 10;
  });
  const steps = p.flow!.steps;
  return (
    <group>
      <mesh material={flat("#060606")}>
        <planeGeometry args={[13, 8]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={glow(ACCENT.acid, 1.6)}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <Polyline points={[[-5, -2.6, 0.05], [5, -2.6, 0.05]]} color="#f1eadb" opacity={0.2} />
      <mesh ref={runner} position={[-5, -2.6, 0.1]} material={glow(ACCENT.acid, 3)}>
        <octahedronGeometry args={[0.14, 0]} />
      </mesh>
      {steps.map((s, i) => {
        const x = -5 + (i / (steps.length - 1)) * 10;
        return (
          <group key={s} position={[x, -2.6, 0.06]}>
            <mesh material={M.ivory}>
              <torusGeometry args={[0.2, 0.04, 3, 12]} />
            </mesh>
            <RetroText font="mono" anchorX="center" position={[0, -0.4, 0]} fontSize={0.24} opacity={0.75}>{s.toUpperCase()}</RetroText>
          </group>
        );
      })}
      <RetroText font="body" position={[-6, 3.6, 0.05]} fontSize={0.42} opacity={0.85}>{`“${p.subtitle}”`}</RetroText>
      {/* physical identity: a listening horn suspended above the panel, slowly scanning
          (Section 14, world-building pass) — a real object, not just a flat waveform */}
      <Horn live={live} />
    </group>
  );
}

function Horn({ live }: { live: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((s) => (ref.current!.rotation.y = Math.sin(s.clock.elapsedTime * (live ? 0.7 : 0.3)) * 0.4));
  return (
    <group ref={ref} position={[0, 4.6, 1.4]} rotation={[0.5, 0, 0]}>
      <mesh material={M.brushedMetal}>
        <cylinderGeometry args={[0.14, 0.85, 1.4, 16, 1, true]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} material={glow(ACCENT.acid, 1.2)}>
        <sphereGeometry args={[0.16, 10, 8]} />
      </mesh>
    </group>
  );
}

/* 03 — the artefact itself: a Builder ID on an orange field */
const QR = Array.from({ length: 81 }, (_, i) => (i * 37 + (i >> 2) * 11) % 7 < 3);
function Identity({ p, live }: P) {
  const card = useRef<Group>(null);
  const turn = useSpring(-0.14, SPRING.soft);
  const qr = useRef<InstancedMesh>(null);
  useEffect(() => turn.set(live ? 0 : -0.14), [live, turn]);
  useFrame(() => card.current && (card.current.rotation.z = turn.get()));
  const cells = useMemo(() => QR.map((on, i) => ({ on, x: i % 9, y: Math.floor(i / 9) })).filter((c) => c.on), []);
  useFrame(() => {
    const m = qr.current;
    if (!m || m.userData.done) return;
    const o = new Object3D();
    cells.forEach((c, i) => {
      o.position.set(c.x * 0.13, -c.y * 0.13, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.userData.done = true;
  });
  return (
    <group>
      <mesh material={flat("#0c0d10")}>
        <planeGeometry args={[13, 8]} />
      </mesh>
      <RetroText position={[-6.3, -1.2, 0.02]} fontSize={4.4} color="#1a1c22" opacity={0.6}>GOA</RetroText>
      <RetroText font="mono" anchorX="right" position={[6, 3.6, 0.05]} fontSize={0.26} color={ACCENT.orange}>
        {p.flow!.steps.map((s) => s.toUpperCase()).join("   ")}
      </RetroText>
      <group ref={card} position={[0, 0.2, 0.4]}>
        <mesh material={flat("#14151a")}>
          <boxGeometry args={[5.4, 3.4, 0.12]} />
        </mesh>
        <RetroText font="mono" position={[-2.4, 1.45, 0.08]} fontSize={0.2} opacity={0.6}>BUILDER ID</RetroText>
        <RetroText font="mono" anchorX="right" position={[2.4, 1.45, 0.08]} fontSize={0.2} color={ACCENT.orange}>{p.title.replace("HH ", "")}</RetroText>
        <mesh position={[-1.5, 0, 0.08]} material={flat(ACCENT.orange)}>
          <ringGeometry args={[0.72, 0.78, 24]} />
        </mesh>
        <mesh position={[-1.5, 0, 0.07]} material={flat("#2a2a2c")}>
          <circleGeometry args={[0.7, 24]} />
        </mesh>
        {[0.45, 0.05, -0.35].map((y, i) => (
          <mesh key={y} position={[0.6 + (i === 1 ? -0.25 : 0), y, 0.08]} material={flat(i === 2 ? ACCENT.orange : "#f1eadb", i === 1 ? 0.35 : 0.85)}>
            <planeGeometry args={[i === 1 ? 1.3 : 1.8, 0.16]} />
          </mesh>
        ))}
        <instancedMesh ref={qr} args={[undefined, undefined, cells.length]} position={[1.4, -0.55, 0.08]} material={flat("#f1eadb")}>
          <planeGeometry args={[0.11, 0.11]} />
        </instancedMesh>
        <RetroText font="mono" position={[-2.4, -1.3, 0.08]} fontSize={0.16} opacity={0.5}>NAME · ROLE · TITLE</RetroText>
      </group>
      {/* physical identity: a photo-booth arch overhead with a flash that pops occasionally —
          this reads as a booth you'd step into, not a wall screen (Section 14, world-building pass) */}
      <BoothArch />
    </group>
  );
}

function BoothArch() {
  const flash = useRef<Mesh>(null);
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#000", emissive: "#fff6e6", emissiveIntensity: 0.4, flatShading: true }), []);
  useFrame((s) => {
    const pop = Math.pow(Math.max(0, Math.sin(s.clock.elapsedTime * 0.35)), 24);
    mat.emissiveIntensity = 0.4 + pop * 6;
  });
  return (
    <group position={[0, 3.6, 1.2]}>
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, -1.4, 0]} material={M.metal}>
          <boxGeometry args={[0.3, 3, 0.3]} />
        </mesh>
      ))}
      <mesh material={M.metal}>
        <boxGeometry args={[6.3, 0.3, 0.3]} />
      </mesh>
      <mesh ref={flash} position={[0, 0.35, 0]} material={mat}>
        <sphereGeometry args={[0.22, 12, 10]} />
      </mesh>
    </group>
  );
}

/* 04 — ivory plate: a record that turns, and the interface copy that learns */
function Music({ p, live }: P) {
  const disc = useRef<Group>(null);
  useFrame((_, dt) => disc.current && (disc.current.rotation.z -= dt * (live ? 2.4 : 0.6)));
  return (
    <group>
      <mesh material={flat("#0e0d10")}>
        <planeGeometry args={[13, 8]} />
      </mesh>
      <group ref={disc} position={[3.4, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={flat("#0a0a0b")}>
          <cylinderGeometry args={[3.3, 3.3, 0.1, 48]} />
        </mesh>
        {[1.6, 2.1, 2.6, 3.0].map((r) => (
          <mesh key={r} position={[0, 0, 0.06]} material={flat("#222026")}>
            <ringGeometry args={[r, r + 0.03, 48]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.07]} material={flat(ACCENT.magenta)}>
          <circleGeometry args={[1.0, 32]} />
        </mesh>
        <mesh position={[0, 2.3, 0.08]} material={flat("#f1eadb", 0.5)}>
          <planeGeometry args={[0.04, 0.6]} />
        </mesh>
      </group>
      {/* physical identity: a tonearm resting on the disc, reaching out of the flat plane
          (Section 14, world-building pass) — this is a record player, not a spinning icon */}
      <Tonearm live={live} />
      <mesh position={[5.9, 3.1, 0.15]} material={M.brushedMetal}>
        <cylinderGeometry args={[0.16, 0.16, 0.9, 8]} />
      </mesh>
      {p.points.slice(0, 4).map((s, i) => (
        <group key={s} position={[-6, 1.9 - i * 0.95, 0.05]}>
          <RetroText font="mono" fontSize={0.2} color="#f1eadb" opacity={0.5}>{`0${i + 1}`}</RetroText>
          <RetroText position={[0.55, 0.14, 0]} fontSize={0.52} color="#f1eadb" opacity={i === 0 || live ? 1 : 0.45}>{s}</RetroText>
        </group>
      ))}
      <RetroText font="mono" position={[-6, -3.3, 0.05]} fontSize={0.22} color={ACCENT.magenta} opacity={0.8}>{p.subtitle.toUpperCase()}</RetroText>
    </group>
  );
}

function Tonearm({ live }: { live: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    // tracks slowly inward across the disc, faster while the installation is live
    const track = (Math.sin(s.clock.elapsedTime * (live ? 0.18 : 0.06)) + 1) / 2;
    if (ref.current) ref.current.rotation.z = -0.15 - track * 0.55;
  });
  return (
    <group ref={ref} position={[5.9, 3.1, 0.3]}>
      <mesh position={[-1.8, -0.55, 0]} rotation={[0, 0, 0.3]} material={M.brushedMetal}>
        <boxGeometry args={[3.6, 0.12, 0.12]} />
      </mesh>
      <mesh position={[-3.3, -1.0, 0]} material={M.metal}>
        <boxGeometry args={[0.3, 0.22, 0.3]} />
      </mesh>
    </group>
  );
}

const MAP = { financial: Financial, voice: Voice, hhgoa: Identity, music: Music } as const;

export default function Exhibit({ p, live }: P) {
  const C = MAP[p.id as keyof typeof MAP];
  return <C p={p} live={live} />;
}
