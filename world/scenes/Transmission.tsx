"use client";

// SCENE 08 — FINAL TRANSMISSION. An enormous dark room; one object in the middle of it.
// The object is the world's core in miniature — a faceted, warm-lit orb inside two rings — and
// it is excluded from fog, so when everything else goes dark at the very end it is the last thing
// left (the room's darkness comes from Atmosphere's fog ramp). Sequence (from WORLD_TIMELINE): approach in silence → it brightens and debris begins to
// orbit → the line arrives in depth → contact points surface around it → the world fades.
// The film opened with "SIGNAL RECEIVED"; it closes by asking for one back.

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PointLight } from "three";
import { PERSON } from "@/data/portfolio";
import { ACCENT } from "@/components/motion/tokens";
import { PLACES } from "../layout";
import { useArrival } from "../objects/arrival";
import RetroText from "../objects/RetroText";
import { cursor, film, settings } from "../signals";
import { WORLD_TIMELINE, smooth, within } from "../timeline";

const T = WORLD_TIMELINE.transmission;
const at = (local: number) => T.start + (T.end - T.start) * local;

const LINKS = [
  { label: "EMAIL", value: PERSON.email, href: `mailto:${PERSON.email}`, cursor: "Write", pos: [0, 6.6, 12] },
  { label: "GITHUB", value: "Spyro007-06", href: PERSON.github, cursor: "Open", pos: [0, -5.6, 12] },
  { label: "LINKEDIN", value: "tharun-b-l", href: PERSON.linkedin, cursor: "Open", pos: [0, -5.6, -12] },
  { label: "RESUME", value: "On request", href: `mailto:${PERSON.email}?subject=Resume%20request`, cursor: "Request", pos: [0, 6.6, -12] },
] as const;

function Orb() {
  const rig = useRef<Group>(null);
  const r1 = useRef<Group>(null);
  const r2 = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const orbit = useRef<InstancedMesh>(null);
  const beam = useRef<Mesh>(null);
  const beamMat = useMemo(() => new MeshBasicMaterial({ color: "#ff9a4d", transparent: true, opacity: 0, depthWrite: false, fog: false }), []);
  const skin = useMemo(() => new MeshStandardMaterial({ color: "#2a2018", emissive: "#ff8a3d", emissiveIntensity: 0.25, flatShading: true, roughness: 0.6, fog: false }), []);
  const ring = useMemo(() => new MeshStandardMaterial({ color: "#f1eadb", emissive: "#f1eadb", emissiveIntensity: 0.4, flatShading: true, fog: false }), []);
  const o = useMemo(() => new Object3D(), []);
  const N = settings.mobile ? 24 : 60;
  useFrame((st, dt) => {
    const f = film.get();
    const bright = within(f, "transmission", 0.25, 0.55);
    // At the very end (98.5% to 100%), warm light slowly decreases, fading to freeze (Section 10)
    const endFade = 1 - smooth(within(f, "transmission", 0.88, 0.995));
    skin.emissiveIntensity = (0.12 + bright * 0.45) * endFade;
    ring.emissiveIntensity = 0.4 * endFade; // the rings go dark with the light, not after it
    ring.color.setScalar(0.08 + 0.87 * endFade);
    if (light.current) light.current.intensity = (120 + bright * 850) * endFade;
    beamMat.opacity = within(f, "transmission", 0.25, 0.6) * endFade * 0.04;
    const spin = settings.reduced ? 0 : dt;
    if (rig.current) rig.current.rotation.y += spin * 0.15;
    if (r1.current) r1.current.rotation.x += spin * 0.3;
    if (r2.current) r2.current.rotation.z -= spin * 0.22;
    // debris begins to orbit once the object has woken
    const orbitOn = within(f, "transmission", 0.35, 0.55) * endFade;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + t * (0.12 + (i % 5) * 0.03);
      const r = 4.2 + (i % 7) * 0.45;
      o.position.set(Math.cos(a) * r, Math.sin(a * 2 + i) * 1.8, Math.sin(a) * r);
      o.rotation.set(t + i, t * 0.7, 0);
      o.scale.setScalar(orbitOn * (0.08 + (i % 3) * 0.05));
      o.updateMatrix();
      orbit.current?.setMatrixAt(i, o.matrix);
    }
    if (orbit.current) orbit.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <group ref={rig}>
        <mesh material={skin}>
          <icosahedronGeometry args={[1.9, 1]} />
        </mesh>
      </group>
      {/* subtle volumetric beam illuminating the core */}
      <mesh ref={beam} material={beamMat} position={[0, 10, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 3.2, 20, 16, 1, true]} />
      </mesh>
      <group ref={r1}>
        <mesh material={ring}><torusGeometry args={[3.4, 0.05, 3, 64]} /></mesh>
      </group>
      <group ref={r2} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh material={ring}><torusGeometry args={[3.9, 0.04, 3, 64]} /></mesh>
      </group>
      <instancedMesh ref={orbit} args={[undefined, undefined, N]} material={ring}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <pointLight ref={light} color="#ff8a3d" intensity={120} distance={80} decay={2} />
    </group>
  );
}

function Contact({ l, k }: { l: (typeof LINKS)[number]; k: number }) {
  const g = useRef<Group>(null);
  const cardArrival = at(0.24 + k * 0.04);
  const shown = useArrival(cardArrival);
  const bgMat = useMemo(() => new MeshBasicMaterial({ color: "#06070a", transparent: true, opacity: 0, depthWrite: false, fog: false }), []);
  const edgeMat = useMemo(() => new MeshBasicMaterial({ color: "#ff9e42", transparent: true, opacity: 0, depthWrite: false, fog: false }), []);

  useFrame((st) => {
    if (g.current && !settings.reduced) {
      g.current.position.y = l.pos[1] + Math.sin(st.clock.elapsedTime * 0.6 + k) * 0.2;
    }
    // the plate stays opaque (a dark plate on a dark room disappears on its own); only the border fades,
    // otherwise the border behind it would show through as a fill
    const fade = 1 - within(film.get(), "transmission", 0.9, 1);
    bgMat.opacity = shown.get() * 0.95;
    edgeMat.opacity = shown.get() * 0.35 * fade;
  });

  const go = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (l.href.startsWith("http")) window.open(l.href, "_blank", "noopener,noreferrer");
    else window.location.href = l.href;
  };
  // rotated to face the camera, local +x is screen-right: items on the left (+z) grow inward to the right
  const anchor = l.pos[2] > 0 ? "left" : "right";
  return (
    <group ref={g} position={l.pos as unknown as [number, number, number]}>
      <group rotation={[0, Math.PI / 2, 0]}>
        {/* Architectural contact card backplate with crisp high-contrast border (Section 8, 19, 20) */}
        <mesh position={[anchor === "left" ? 3.4 : -3.4, -0.65, -0.08]} material={bgMat}>
          <planeGeometry args={[7.8, 2.3]} />
        </mesh>
        {/* the amber edge sits *behind* the plate and 0.08 larger: a hairline border, not a fill */}
        <mesh position={[anchor === "left" ? 3.4 : -3.4, -0.65, -0.1]} material={edgeMat}>
          <planeGeometry args={[7.88, 2.38]} />
        </mesh>

        <RetroText dim={[at(0.9), 1]} font="mono" at={cardArrival} anchorX={anchor} textAlign={anchor} fontSize={0.34} color="#ffa654">
          {`0${k + 1} — ${l.label}`}
        </RetroText>
        <RetroText dim={[at(0.9), 1]} font="body" at={cardArrival} anchorX={anchor} textAlign={anchor} position={[0, -0.55, 0]} fontSize={0.68} color="#fbf8f1">
          {l.value}
        </RetroText>
        {/* generous hit area */}
        <mesh
          position={[anchor === "left" ? 3.4 : -3.4, -0.65, 0]}
          onClick={go}
          onPointerOver={(e) => (e.stopPropagation(), cursor.set(l.cursor))}
          onPointerOut={() => cursor.set(null)}
        >
          <planeGeometry args={[7.8, 2.3]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function Transmission() {
  return (
    <group position={PLACES.core}>
      {/* Core orb positioned beneath typography to ensure an unobstructed clean zone (Section 1 & 18) */}
      <group position={[0, -4.8, 0]}>
        <Orb />
      </group>

      {/* Typography clean zone: permanently readable hero title with dedicated backplate */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 4.8, -0.3]}>
          <planeGeometry args={[24, 11]} />
          <meshBasicMaterial color="#06070a" transparent opacity={0.7} depthWrite={false} fog={false} />
        </mesh>
        <RetroText dim={[at(0.9), 1]} at={at(0.12)} anchorX="center" position={[0, 8.2, 0]} fontSize={2.4} color="#eae4d6">
          SEND A
        </RetroText>
        <RetroText dim={[at(0.9), 1]} at={at(0.16)} anchorX="center" position={[0, 5.0, 0]} fontSize={3.6} color="#fbf8f1">
          SIGNAL
        </RetroText>
        <RetroText dim={[at(0.9), 1]} at={at(0.20)} anchorX="center" position={[0, 1.8, 0]} fontSize={2.6} color={ACCENT.orange}>
          BACK.
        </RetroText>
      </group>

      {LINKS.map((l, k) => (
        <Contact key={l.label} l={l} k={k} />
      ))}
    </group>
  );
}
