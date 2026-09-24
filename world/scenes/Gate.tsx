"use client";

// SCENE 02 — THE GATE. A wall with a 26 m opening; two slabs close it. The camera's position sets
// how open the gate *should* be; a heavy Motion spring decides how open it *is* — so it lags,
// overshoots slightly and settles like something with mass. A seam of warm light widens with it.
// Inside, in the dark: the title as physical type, which the camera then flies past.

import Edges from "../objects/Edges";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "motion/react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, PointLight } from "three";
import { PERSON } from "@/data/portfolio";
import { SPRING } from "@/components/motion/tokens";
import { PLACES } from "../layout";
import { M } from "../materials";
import RetroText from "../objects/RetroText";
import { film, settings } from "../signals";
import { WORLD_TIMELINE, within } from "../timeline";

const W = 26, H = 44, Z0 = PLACES.gate[2];
const g = WORLD_TIMELINE.gate;
const at = (local: number) => g.start + (g.end - g.start) * local;

/** A single warning light with its own blink phase — several of these must never sync up. */
function WarningLight({ position, color, phase }: { position: [number, number, number]; color: string; phase: number }) {
  const mat = useMemo(() => new MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.6 }), [color]);
  useFrame((s) => (mat.opacity = 0.25 + 0.55 * Math.max(0, Math.sin(s.clock.elapsedTime * 0.9 + phase))));
  return (
    <mesh position={position} material={mat}>
      <planeGeometry args={[0.5, 0.16]} />
    </mesh>
  );
}

// The Gate is one entrance into a much larger complex: flanking towers, an overhead gantry
// tying them together, service pipes on the wall faces, a walkway, and smaller housings further
// out implying the facility keeps going past what the camera passes through (world-building pass).
const TOWER_X = 58, TOWER_H = 95, TOWER_Z = Z0 - 8;
const HOUSINGS: [number, number, number, number, number][] = [
  // x, z, w, h, d
  [96, Z0 - 20, 14, 34, 16],
  [-104, Z0 - 30, 12, 26, 14],
  [128, Z0 - 46, 10, 44, 12],
  [-88, Z0 - 52, 9, 20, 10],
  [116, Z0 + 10, 11, 30, 11],
];

function Complex() {
  const pipes = useRef<InstancedMesh>(null);
  const pipePositions = useMemo(() => {
    const out: [number, number][] = [];
    for (const bx of [-25, 25]) for (const dx of [-8, 0, 8]) out.push([bx + dx, Z0]);
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = pipes.current!;
    const o = new Object3D();
    pipePositions.forEach(([x, z], i) => {
      o.position.set(x, H / 2 + 1, z + 6.1);
      o.scale.set(1, H + 2, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pipePositions]);

  return (
    <group>
      {/* flanking towers — the wall is only a fraction of what's actually here */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * TOWER_X, TOWER_H / 2, TOWER_Z]} material={M.darkConcrete}>
          <boxGeometry args={[11, TOWER_H, 11]} />
          <Edges threshold={20} color="#f1eadb" transparent opacity={0.08} />
        </mesh>
      ))}
      {/* the gantry tying both towers together overhead */}
      <mesh position={[0, TOWER_H + 2, TOWER_Z]} material={M.metal}>
        <boxGeometry args={[TOWER_X * 2 + 11, 3, 6]} />
        <Edges threshold={20} color="#f1eadb" transparent opacity={0.1} />
      </mesh>
      {/* two sagging service cables slung beneath it */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, TOWER_H - 2.5, TOWER_Z + side * 3.5]} rotation={[0, 0, Math.PI / 2]} material={M.brushedMetal}>
          <cylinderGeometry args={[0.18, 0.18, TOWER_X * 2 + 11, 6]} />
        </mesh>
      ))}
      {/* service pipes run up the wall faces the camera actually sees */}
      <instancedMesh ref={pipes} args={[undefined, undefined, pipePositions.length]} material={M.brushedMetal} frustumCulled={false}>
        <cylinderGeometry args={[0.22, 0.22, 1, 8]} />
      </instancedMesh>
      {/* a mid-height walkway between the towers, with diagonal support struts */}
      <mesh position={[0, 54, TOWER_Z + 5]} material={M.metal}>
        <boxGeometry args={[TOWER_X * 2 - 20, 0.6, 3.2]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (TOWER_X - 2), 44, TOWER_Z + 5]} rotation={[0, 0, side * 0.5]} material={M.metal}>
          <boxGeometry args={[0.5, 22, 0.5]} />
        </mesh>
      ))}
      {/* worn warning strips — asynchronous phases, never all lit at once */}
      {[-1, 1].flatMap((side) =>
        [18, 40, 66].map((y, i) => (
          <WarningLight key={`${side}-${y}`} position={[side * (TOWER_X - 5.6), y, TOWER_Z + 5.6]} color={i === 1 ? "#ff5a3c" : "#ff9e42"} phase={side * 2 + i * 1.7} />
        )),
      )}
      {/* smaller housings further out: the facility keeps going past the frame */}
      {HOUSINGS.map(([x, z, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} material={M.darkConcrete}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Gate() {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const open = useSpring(0, { ...SPRING.heavy, stiffness: 40, damping: 14 }); // doors are heavy
  const seam = useMemo(() => new MeshBasicMaterial({ color: "#ffb070", toneMapped: false }), []);
  const seamRef = useRef<Mesh>(null);

  const backLight = useRef<PointLight>(null);

  useFrame((s) => {
    const t = film.get();
    // 10–12%: Gate begins opening; 12–17%: opens to half; 17–22%: fully open as we pass
    const target = within(t, "gate", 0.08, 0.45) * 0.5 + within(t, "gate", 0.45, 0.85) * 0.5;
    if (settings.reduced) open.jump(target);
    else open.set(target);
    const o = open.get();
    const tremor = settings.reduced ? 0 : within(t, "gate", 0.02, 0.12) * (1 - within(t, "gate", 0.12, 0.18)) * Math.sin(s.clock.elapsedTime * 42) * 0.04;
    if (left.current) left.current.position.x = -W / 4 - o * (W / 2 + 1) + tremor;
    if (right.current) right.current.position.x = W / 4 + o * (W / 2 + 1) - tremor;
    // the seam is the crack between closed doors: it flares as they part, illuminating the interior
    const crack = o < 0.002 ? 0.2 : Math.max(0, 1 - o / 0.2);
    seam.color.setRGB(1.6 * crack, 1.0 * crack, 0.6 * crack);
    if (seamRef.current) {
      seamRef.current.visible = crack > 0.01;
      seamRef.current.scale.x = 1 + o * 40;
    }
    if (light.current) light.current.intensity = o * 7500;
    if (backLight.current) backLight.current.intensity = (1 - o * 0.4) * 1600;
  });

  const door = (isRight: boolean) => (
    <group>
      <mesh material={M.metal}>
        <boxGeometry args={[W / 2, H, 2.2, 3, 6, 1]} />
        <Edges threshold={15} color="#f1eadb" transparent opacity={0.12} />
      </mesh>
      {/* thin amber practical indicator lights embedded into moving machinery (Section 4) */}
      <mesh position={[isRight ? -W / 4 + 0.35 : W / 4 - 0.35, 0, 1.12]}>
        <planeGeometry args={[0.18, H * 0.75]} />
        <meshBasicMaterial color="#ff9e42" toneMapped={false} />
      </mesh>
      <mesh position={[0, -H * 0.2, 1.12]}>
        <planeGeometry args={[W / 2 - 0.8, 0.12]} />
        <meshBasicMaterial color="#ffae58" toneMapped={false} />
      </mesh>
    </group>
  );

  return (
    <group>
      <Complex />
      {/* the wall, cut open */}
      <mesh position={[-(W / 2 + 12), 29, Z0 - 6]} material={M.darkConcrete}>
        <boxGeometry args={[24, 58, 12]} />
      </mesh>
      <mesh position={[W / 2 + 12, 29, Z0 - 6]} material={M.darkConcrete}>
        <boxGeometry args={[24, 58, 12]} />
      </mesh>
      <mesh position={[0, H + 7, Z0 - 6]} material={M.darkConcrete}>
        <boxGeometry args={[W, 14, 12]} />
        <Edges threshold={15} color="#f1eadb" transparent opacity={0.08} />
      </mesh>
      {/* thin amber practical indicator lights embedded into machinery */}
      {[-W / 2 + 0.3, W / 2 - 0.3].map((x) => (
        <mesh key={x} position={[x, H / 2, Z0 - 0.8]}>
          <planeGeometry args={[0.15, H * 0.7]} />
          <meshBasicMaterial color="#ff9e42" toneMapped={false} />
        </mesh>
      ))}
      {/* the doors */}
      <group ref={left} position={[-W / 4, H / 2, Z0 - 1]}>{door(false)}</group>
      <group ref={right} position={[W / 4, H / 2, Z0 - 1]}>{door(true)}</group>
      {/* the seam of light between them, and what it spills onto */}
      <mesh ref={seamRef} position={[0, H / 2, Z0 - 2.5]} material={seam}>
        <planeGeometry args={[0.25, H]} />
      </mesh>
      {/* interior warm leaking light and cool blue backlight from behind */}
      <pointLight ref={light} position={[0, 14, Z0 - 22]} color="#ff9e42" intensity={0} distance={65} decay={2} />
      <pointLight ref={backLight} position={[0, 16, Z0 - 36]} color="#2a527c" intensity={1600} distance={55} decay={2} />

      {/* the title, waiting inside in the dark */}
      <group position={PLACES.gateText}>
        {/* Cinematic dedicated text lighting (Section 9) */}
        <pointLight position={[0, 4, 8]} color="#fff1db" intensity={1200} distance={32} decay={2} />
        {/* Subtle localized dark backplate to prevent backlight blowout (Section 8) */}
        <mesh position={[0, -1, -14]}>
          <planeGeometry args={[44, 26]} />
          <meshBasicMaterial color="#07080a" transparent opacity={0.65} depthWrite={false} fog={false} />
        </mesh>
        <RetroText at={at(0.60)} anchorX="center" position={[0, 6, 0]} fontSize={5.2} rise={1.2} color="#fbf8f1">
          FRONTEND
        </RetroText>
        <RetroText at={at(0.66)} anchorX="center" position={[0, 0.8, -6]} fontSize={5.2} rise={1.2} color="#fbf8f1">
          DEVELOPER
        </RetroText>
        <RetroText at={at(0.72)} anchorX="center" position={[0, -5, -12]} fontSize={3.4} color="#ffd9a8" rise={1}>
          × AI BUILDER
        </RetroText>
        <RetroText font="mono" at={at(0.78)} anchorX="center" position={[0, -9.5, -12]} fontSize={0.9} color="#e5dfd3" opacity={0.9}>
          {`MOTION / INTERACTION  ·  ${PERSON.name.toUpperCase()}`}
        </RetroText>
      </group>
    </group>
  );
}
