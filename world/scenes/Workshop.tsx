"use client";

// SCENE 04 — THE WORKSHOP. Warmer, busier: gantries overhead, a gear the size of a house turning
// right past the lens (strongest parallax in the film), and four working machines — one per real
// skill group, each a different mechanism — with their skills stamped on a plate beside them.
// Machines run faster when the camera is near and when you scroll fast.
//
// Then the MOTION ENGINE: four rings chase the same target angle, each through a different spring
// from this site's own tokens (physical / soft / heavy / elastic). The difference between them *is*
// the exhibit. Beyond it, the portal to the project chamber.

import Edges from "../objects/Edges";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring, type MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import { Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { SKILLS } from "@/data/portfolio";
import { ACCENT, SPRING } from "@/components/motion/tokens";
import { MACHINES, PLACES, type V3 } from "../layout";
import { M, glow } from "../materials";
import Polyline from "../objects/Polyline";
import RetroText from "../objects/RetroText";
import { film, pointer, settings, velocity } from "../signals";
import { WORLD_TIMELINE, progressBetween, smooth } from "../timeline";

const W = WORLD_TIMELINE.workshop;
const at = (local: number) => W.start + (W.end - W.start) * local;

/** shared machine clock: advances faster near the camera and with scroll speed */
function useDrive(pos: V3) {
  const camera = useThree((s) => s.camera);
  const t = useRef(0);
  const p = useMemo(() => new Vector3(...pos), [pos]);
  return (dt: number) => {
    const d = camera.position.distanceTo(p);
    const near = Math.max(0, 1 - d / 40);
    const rate = settings.reduced ? 0.15 : 0.35 + near * 1.2 + Math.min(2.5, Math.abs(velocity.get()) / 900);
    t.current += dt * rate;
    return t.current;
  };
}

function Gear() {
  const ref = useRef<Group>(null);
  const drive = useDrive(PLACES.workshopHero);
  useFrame((_, dt) => ref.current && (ref.current.rotation.z = drive(dt) * 0.25));
  const teeth = 20;
  return (
    <group position={PLACES.workshopHero} rotation={[0, -0.5, 0]}>
      <group ref={ref}>
        <mesh material={M.metal} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[7, 7, 1.6, teeth, 1]} />
          <Edges threshold={20} color="#ffe3c4" transparent opacity={0.12} />
        </mesh>
        {Array.from({ length: teeth }, (_, i) => {
          const a = (i / teeth) * Math.PI * 2;
          return (
            <mesh key={i} material={M.metal} position={[Math.cos(a) * 7.6, Math.sin(a) * 7.6, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[1.4, 1, 1.4]} />
            </mesh>
          );
        })}
        <mesh material={M.brass} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 2.4, 8, 1]} />
        </mesh>
      </group>
      <mesh material={M.darkConcrete} position={[0, -6, 0]}>
        <boxGeometry args={[3, 12, 3]} />
      </mesh>
    </group>
  );
}

function Gantries() {
  const ref = useRef<InstancedMesh>(null);
  const beams = useMemo(() => Array.from({ length: 12 }, (_, i) => -300 - i * 15), []);
  useFrame(() => {
    const m = ref.current;
    if (!m || m.userData.done) return;
    const o = new Object3D();
    beams.forEach((z, i) => {
      o.position.set(0, 24, z);
      o.scale.set(70, 1.2, 1.6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.userData.done = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, beams.length]} material={M.metal}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// Vertical support legs under the gantry, and a handful of asynchronous indicator lights along
// its length — the ceiling structure was floating on nothing before (world-building pass).
function GantrySupports() {
  const ref = useRef<InstancedMesh>(null);
  const legZs = useMemo(() => Array.from({ length: 12 }, (_, i) => -300 - i * 15).filter((_, i) => i % 3 === 0), []);
  const positions = useMemo(() => legZs.flatMap((z) => [[-34, z] as const, [34, z] as const]), [legZs]);
  useFrame(() => {
    const m = ref.current;
    if (!m || m.userData.done) return;
    const o = new Object3D();
    positions.forEach(([x, z], i) => {
      o.position.set(x, 12, z);
      o.scale.set(1.2, 24, 1.2);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.userData.done = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} material={M.metal} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function GantryLight({ position, phase }: { position: V3; phase: number }) {
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#000", emissive: "#ff9e42", emissiveIntensity: 1, flatShading: true }), []);
  useFrame((s) => (mat.emissiveIntensity = 0.5 + 1.6 * Math.max(0, Math.sin(s.clock.elapsedTime * 0.7 + phase))));
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={[0.5, 0.3, 0.5]} />
    </mesh>
  );
}

// A slow conveyor at floor level carrying crates down the aisle's edge — the workshop keeps
// working whether or not the camera is looking at it (Section 12, world-building pass).
function Conveyor() {
  const ref = useRef<InstancedMesh>(null);
  const n = 8;
  const Z_START = -330, LEN = 90;
  useFrame((s) => {
    const m = ref.current;
    if (!m) return;
    const o = new Object3D();
    for (let i = 0; i < n; i++) {
      const z = Z_START - (((s.clock.elapsedTime * 3 + i * (LEN / n)) % LEN));
      o.position.set(28, 1.4, z);
      o.scale.setScalar(1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh position={[28, 0.5, Z_START - LEN / 2]} material={M.darkConcrete}>
        <boxGeometry args={[2.4, 1, LEN]} />
        <Edges threshold={20} color="#f1eadb" transparent opacity={0.08} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={M.metal} frustumCulled={false}>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
      </instancedMesh>
    </group>
  );
}

// One large slow-swinging mechanical arm — background activity distinct from the four
// skill machines, discovered rather than announced (Section 12).
function MechArm() {
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.25;
    if (shoulder.current) shoulder.current.rotation.y = Math.sin(t) * 0.6;
    if (elbow.current) elbow.current.rotation.z = 0.3 + Math.sin(t * 1.4) * 0.4;
  });
  return (
    <group position={[-24, 0, -332]}>
      <mesh material={M.darkConcrete} position={[0, 3, 0]}>
        <cylinderGeometry args={[1.4, 1.6, 6, 8]} />
      </mesh>
      <group ref={shoulder} position={[0, 6, 0]}>
        <mesh material={M.metal} position={[3, 0, 0]}>
          <boxGeometry args={[6, 1.1, 1.1]} />
          <Edges color="#f1eadb" transparent opacity={0.1} />
        </mesh>
        <group ref={elbow} position={[6, 0, 0]}>
          <mesh material={M.brushedMetal} position={[2.4, 0, 0]}>
            <boxGeometry args={[4.8, 0.9, 0.9]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// A large cooling fan mounted high on the structure, turning steadily — one of the ambient
// systems that keeps the workshop feeling alive without competing with the hero machines.
function CoolingFan() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => ref.current && (ref.current.rotation.z += dt * 1.6));
  const blades = useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), []);
  return (
    <group position={[33, 27, -452]} rotation={[0, -0.4, 0]}>
      <mesh material={M.darkConcrete}>
        <cylinderGeometry args={[4.6, 4.6, 1, 16, 1, true]} />
        <Edges color="#f1eadb" transparent opacity={0.1} />
      </mesh>
      <group ref={ref}>
        {blades.map((a, i) => (
          <mesh key={i} material={M.metal} rotation={[0, 0, a]} position={[Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0]}>
            <boxGeometry args={[3, 0.9, 0.12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Stacked storage containers — static clutter that makes the floor read as a working space
// rather than a stage set (Section 6 & 19).
const CRATES: [number, number, number, number][] = [
  [-30, -398, 0, 0],
  [-30, -398, 3.2, 0.4],
  [-27.2, -400, 0, -0.3],
];

function StorageStack() {
  return (
    <>
      {CRATES.map(([x, z, y, r], i) => (
        <mesh key={i} position={[x, y + 1.4, z]} rotation={[0, r, 0]} material={i % 2 ? M.metal : M.darkConcrete}>
          <boxGeometry args={[3.4, 2.6, 3.4]} />
          <Edges color="#f1eadb" transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  );
}

/* ---------- one mechanism per skill group ---------- */

function Loom({ color, drive }: { color: string; drive: (dt: number) => number }) {
  // Frontend: bars sliding in a frame — layout, in motion
  const bars = useRef<(Mesh | null)[]>([]);
  const mat = useMemo(() => glow(color, 1.4), [color]);
  useFrame((_, dt) => {
    const t = drive(dt);
    bars.current.forEach((b, i) => b && (b.position.x = Math.sin(t * 1.4 + i * 0.9) * 1.6));
  });
  return (
    <group>
      <mesh material={M.metal} position={[0, 3.5, 0]}>
        <boxGeometry args={[5, 7, 0.4]} />
        <Edges color="#f1eadb" transparent opacity={0.1} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={(m) => void (bars.current[i] = m)} material={i % 2 ? mat : M.ivory} position={[0, 0.9 + i * 1.05, 0.4]}>
          <boxGeometry args={[1.4 + (i % 3) * 0.6, 0.5, 0.3]} />
        </mesh>
      ))}
    </group>
  );
}

function Graph({ color, drive }: { color: string; drive: (dt: number) => number }) {
  // AI systems: a faceted core with nodes in orbit, linked back to it
  const ring = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const mat = useMemo(() => glow(color, 0.9), [color]);
  useFrame((_, dt) => {
    const t = drive(dt);
    if (ring.current) ring.current.rotation.set(t * 0.3, t * 0.5, 0);
    if (core.current) core.current.rotation.set(t * 0.2, t * 0.35, 0);
  });
  const nodes: V3[] = Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 2.6, Math.sin(i * 1.7) * 0.8, Math.sin((i / 6) * Math.PI * 2) * 2.6]);
  return (
    <group position={[0, 3.5, 0]}>
      <mesh ref={core} material={mat}>
        <icosahedronGeometry args={[1.2, 0]} />
      </mesh>
      <group ref={ring}>
        {nodes.map((p, i) => (
          <group key={i}>
            <mesh position={p} material={M.ivory}>
              <octahedronGeometry args={[0.28, 0]} />
            </mesh>
            <Polyline points={[[0, 0, 0], p]} color={color} opacity={0.5} />
          </group>
        ))}
      </group>
    </group>
  );
}

function Pump({ color, drive }: { color: string; drive: (dt: number) => number }) {
  // Development: two pistons working a block — the plumbing between frontend and backend
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const mat = useMemo(() => glow(color, 1.1), [color]);
  useFrame((_, dt) => {
    const t = drive(dt) * 2.2;
    if (a.current) a.current.position.y = 4.4 + Math.max(0, Math.sin(t)) * 1.6;
    if (b.current) b.current.position.y = 4.4 + Math.max(0, Math.sin(t + Math.PI)) * 1.6;
  });
  return (
    <group>
      <mesh material={M.metal} position={[0, 1.5, 0]}>
        <boxGeometry args={[4.4, 3, 2.4]} />
        <Edges color="#f1eadb" transparent opacity={0.1} />
      </mesh>
      {[-1, 1].map((x, i) => (
        <mesh key={x} ref={i ? b : a} material={i ? M.brass : mat} position={[x, 4.4, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 3, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function Drum({ drive }: { drive: (dt: number) => number }) {
  // Workflow: a drum turning over and over — the daily loop
  const ref = useRef<Group>(null);
  useFrame((_, dt) => ref.current && (ref.current.rotation.x = drive(dt) * 0.8));
  return (
    <group position={[0, 3.4, 0]}>
      <group ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={M.metal}>
          <cylinderGeometry args={[1.8, 1.8, 4.2, 8]} />
          <Edges threshold={20} color="#f1eadb" transparent opacity={0.14} />
        </mesh>
        {[-1.2, 0, 1.2].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={M.ivory}>
            <cylinderGeometry args={[1.86, 1.86, 0.2, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Machine({ i }: { i: number }) {
  const g = SKILLS[i];
  const pos = MACHINES[i];
  const color = ACCENT[g.accent];
  const drive = useDrive(pos);
  const facing = pos[0] < 0 ? 0.55 : -0.55; // turned toward the aisle
  const mech = [<Loom key="l" color={color} drive={drive} />, <Graph key="g" color={color} drive={drive} />, <Pump key="p" color={color} drive={drive} />, <Drum key="d" drive={drive} />][i];
  const side = pos[0] < 0 ? 1 : -1;

  // Card timing: the backing plate now fades in with its own text instead of sitting there
  // fully opaque from the moment the Workshop mounts — it no longer clutters the aisle before
  // the camera ever reaches this machine (spacing fix). Once shown it stays, same as the text.
  const enter = at(0.18 + i * 0.06);
  const backing = useMemo(() => new MeshStandardMaterial({ color: "#111215", roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0 }), []);
  const panel = useMemo(() => new MeshBasicMaterial({ color: "#07080b", transparent: true, opacity: 0, depthWrite: false, fog: false }), []);
  useFrame(() => {
    const shown = smooth(progressBetween(film.get(), enter, enter + 0.015));
    backing.opacity = shown;
    panel.opacity = shown * 0.88;
  });

  return (
    <group position={pos} rotation={[0, facing, 0]}>
      <mesh material={M.darkConcrete} position={[0, -0.5, 0]}>
        <boxGeometry args={[7, 1, 5]} />
      </mesh>
      <group position={[0, 0, 0]}>{mech}</group>
      {/* the plate: a single clean offset (not doubled) keeps it beside the machine instead of
          crossing into the aisle the camera flies down — this was the obstruction (spacing fix) */}
      <group position={[side * 8, 6.5, 0.2]} rotation={[0, -side * 0.25, 0]}>
        <mesh position={[side * 4.4, -3.6, -0.15]} material={backing}>
          <boxGeometry args={[8.8, 8.6, 0.2]} />
          <Edges threshold={15} color={color} transparent opacity={0.25} />
        </mesh>
        <mesh position={[side * 4.4, -3.6, -0.04]} material={panel}>
          <planeGeometry args={[8.6, 8.4]} />
        </mesh>
        <RetroText font="mono" at={enter} anchorX={side > 0 ? "left" : "right"} fontSize={0.34} color={color}>
          {`0${i + 1} — CAPABILITY RECORD`}
        </RetroText>
        <RetroText at={enter + 0.006} anchorX={side > 0 ? "left" : "right"} position={[0, -0.55, 0]} fontSize={g.group.length > 9 ? 0.95 : 1.1} maxWidth={8.2} color="#fbf8f1">
          {g.group.toUpperCase()}
        </RetroText>
        <RetroText font="mono" at={enter + 0.012} anchorX={side > 0 ? "left" : "right"} textAlign={side > 0 ? "left" : "right"} position={[0, -2.0, 0]} fontSize={0.32} lineHeight={1.7} maxWidth={8.2} color="#fbf8f1" opacity={0.95}>
          {g.items.map((s) => s.name.toUpperCase()).join("\n")}
        </RetroText>
      </group>
      <pointLight position={[0, 6, 3]} color={color} intensity={350} distance={18} decay={2} />
    </group>
  );
}

/* ---------- the Motion engine ---------- */

const PRESETS = ["physical", "soft", "heavy", "elastic"] as const;

function EngineRing({ k, spring, target }: { k: number; spring: (typeof PRESETS)[number]; target: MotionValue<number> }) {
  const ref = useRef<Group>(null);
  const cfg = SPRING[spring];
  const angle = useSpring(target, cfg);
  const prevAngle = useRef(0);
  const indMat1 = useMemo(() => new MeshStandardMaterial({ color: "#000", emissive: "#ffaa4d", emissiveIntensity: 1.4, flatShading: true }), []);
  const indMat2 = useMemo(() => new MeshStandardMaterial({ color: "#000", emissive: "#ff7a2e", emissiveIntensity: 1.2, flatShading: true }), []);
  const mat = useMemo(() => (k === 0 ? glow(ACCENT.orange, 1.8) : new MeshStandardMaterial({ color: "#3a332c", metalness: 0.7, roughness: 0.35, flatShading: true })), [k]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const cur = angle.get();
    ref.current.rotation.z = (cur * Math.PI) / 180;
    // Calculate motion activation speed: warm amber highlights flare when spring systems activate (Section 6)
    const angVel = dt > 0 ? Math.abs(cur - prevAngle.current) / dt : 0;
    prevAngle.current = cur;
    const active = Math.min(1, angVel / 180);
    indMat1.emissiveIntensity = 1.2 + active * 2.4;
    indMat2.emissiveIntensity = 1.0 + active * 1.8;
  });

  const r = 2.4 + k * 1.25;
  return (
    <group rotation={[0, 0, 0]}>
      <group ref={ref}>
        <mesh material={mat}>
          <torusGeometry args={[r, 0.16 + (3 - k) * 0.04, 4, 36]} />
        </mesh>
        {/* glowing timing indicator markers that flare when motion activates */}
        <mesh position={[r, 0, 0]} material={indMat1}>
          <boxGeometry args={[0.7, 0.34, 0.34]} />
        </mesh>
        <mesh position={[-r, 0, 0]} material={indMat2}>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
        </mesh>
      </group>
      <RetroText font="mono" at={at(0.68 + k * 0.02)} position={[r + 0.6, -0.1 - k * 0.02, 0.2]} fontSize={0.22} opacity={0.75}>
        {`${spring.toUpperCase()}  k${cfg.stiffness} c${cfg.damping} m${cfg.mass}`}
      </RetroText>
    </group>
  );
}

function Engine() {
  const target = useSpring(0, { stiffness: 10000, damping: 1000 }); // effectively instant; the rings do the physics
  const clock = useRef(0);
  useFrame((_, dt) => {
    // the target steps a quarter-turn every two seconds (a mechanism ticking), plus the pointer
    clock.current += dt;
    const steps = settings.reduced ? 0 : Math.floor(clock.current / 2);
    target.set(steps * 90 + pointer.x.get() * 45);
  });
  return (
    <group position={PLACES.motionEngine}>
      {/* the word sits behind the rings: they pass in front of it */}
      <RetroText at={at(0.62)} anchorX="center" anchorY="middle" position={[0, 0, -3]} fontSize={5.4} color="#ffe3c4" opacity={0.9}>
        MOTION
      </RetroText>
      {PRESETS.map((p, k) => (
        <EngineRing key={p} k={k} spring={p} target={target} />
      ))}
      <mesh material={M.brass}>
        <icosahedronGeometry args={[0.9, 0]} />
      </mesh>
      <mesh position={[0, -8.4, -0.1]}>
        <planeGeometry args={[26, 1.4]} />
        <meshBasicMaterial color="#07080b" transparent opacity={0.75} depthWrite={false} fog={false} />
      </mesh>
      <RetroText font="mono" at={at(0.72)} anchorX="center" position={[0, -8.4, 0]} fontSize={0.36} color="#fbf8f1" opacity={0.95}>
        ONE TARGET · FOUR SPRINGS · EVERY MOVEMENT IN THIS WORLD RUNS ON THEM
      </RetroText>
      <pointLight position={[0, 2, 8]} color="#ffb070" intensity={1500} distance={36} decay={2} />
    </group>
  );
}

function Portal() {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const inner = useMemo(() => glow(ACCENT.magenta, 2.4), []);
  useFrame((_, dt) => {
    const v = 1 + Math.min(3, Math.abs(velocity.get()) / 900);
    if (a.current) a.current.rotation.z += dt * 0.08 * v;
    if (b.current) b.current.rotation.z -= dt * 0.12 * v;
  });
  return (
    <group position={PLACES.portal}>
      <mesh ref={a} material={M.metal}>
        <torusGeometry args={[11, 1.1, 5, 40]} />
        <Edges threshold={20} color="#c2306a" transparent opacity={0.25} />
      </mesh>
      <mesh ref={b} material={inner}>
        <torusGeometry args={[9.6, 0.08, 3, 60]} />
      </mesh>
      {/* transitional violet light leaking into the workshop from the upcoming chamber */}
      <pointLight position={[0, 0, -4]} color="#b537f2" intensity={1400} distance={35} decay={2} />
    </group>
  );
}

export default function Workshop() {
  return (
    <group>
      <Gear />
      <Gantries />
      <GantrySupports />
      {[-321, -351, -381, -411, -441].map((z, i) => (
        <GantryLight key={z} position={[i % 2 ? -34 : 34, 24.8, z]} phase={i * 1.9} />
      ))}
      <Conveyor />
      <MechArm />
      <CoolingFan />
      <StorageStack />
      {SKILLS.map((_, i) => (
        <Machine key={i} i={i} />
      ))}
      <Engine />
      <Portal />
      {/* Warm industrial key illumination */}
      <pointLight position={[0, 18, -340]} color="#d9772f" intensity={5500} distance={140} decay={2} />
      {/* Cool blue backlight behind machinery creating WARM ORANGE + COOL BLUE BACKLIGHT contrast */}
      <pointLight position={[0, 24, -420]} color="#2d6ec4" intensity={4200} distance={130} decay={2} />
      {/* Gantry edge practicals */}
      <pointLight position={[-16, 22, -325]} color="#ff8a3d" intensity={1600} distance={45} decay={2} />
      <pointLight position={[16, 22, -375]} color="#ff8a3d" intensity={1600} distance={45} decay={2} />
    </group>
  );
}
