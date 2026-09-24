"use client";

// SCENES 00–01 — SIGNAL / SIGNAL FIELD.
// Darkness, then a faint point of light high above a structure that fog gives up slowly.
// Composition (from the opening lens): the beacon on the centre line, the facility as a dark
// stepped mass, a few monoliths marking the approach, debris drifting at three distances,
// and the name hanging in the field — it becomes readable only as the camera closes in.

import Edges from "../objects/Edges";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PointLight, SRGBColorSpace } from "three";
import { PERSON } from "@/data/portfolio";
import { PLACES } from "../layout";
import { M } from "../materials";
import RetroText from "../objects/RetroText";
import { film, settings, velocity } from "../signals";
import { progressBetween } from "../timeline";

function Beacon() {
  const core = useRef<Mesh>(null);
  const beam = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const mat = useMemo(() => new MeshBasicMaterial({ color: new Color("#ffe6c2"), toneMapped: false, fog: false }), []);
  const beamMat = useMemo(() => new MeshBasicMaterial({ color: "#9fc4ff", transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }), []);
  useFrame((s) => {
    const t = film.get();
    // the light "arrives": tiny pin-prick by 0.5–1%, beacon by 2%
    const on = 0.08 + progressBetween(t, 0.004, 0.02) * 0.92;
    const pulse = 0.82 + 0.18 * Math.sin(s.clock.elapsedTime * 1.4);
    mat.color.setRGB(1 * on * pulse * 3.2, 0.9 * on * pulse * 3.2, 0.76 * on * pulse * 3.2);
    beamMat.opacity = progressBetween(t, 0.012, 0.035) * 0.08;
    if (core.current) core.current.scale.setScalar(0.35 + on * 0.65);
    if (light.current) light.current.intensity = on * 800;
  });
  return (
    <group position={PLACES.beacon}>
      <mesh ref={core} material={mat}>
        <octahedronGeometry args={[0.9, 0]} />
      </mesh>
      <mesh ref={beam} material={beamMat} position={[0, -3, 0]}>
        <cylinderGeometry args={[0.15, 1.2, 6, 6, 1, true]} />
      </mesh>
      <pointLight ref={light} color="#ffe6c2" intensity={0} distance={55} decay={2} />
    </group>
  );
}

// The facility: a stepped brutalist mass behind the gate. Boxes only — the silhouette does the work.
// The centre is lifted off the ground: the camera's path runs underneath it, into the archive.
const BLOCKS: [number, number, number, number, number, number][] = [
  // x, y(base), z, w, h, d
  [0, 30, -150, 44, 48, 50],
  [-38, 0, -140, 30, 48, 40],
  [38, 0, -140, 30, 48, 40],
  [-64, 0, -125, 22, 26, 34],
  [64, 0, -125, 22, 26, 34],
  [0, 78, -160, 18, 16, 22],
];

function Facility() {
  return (
    <group>
      {BLOCKS.map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y + h / 2, z]} material={M.concrete}>
          <boxGeometry args={[w, h, d]} />
          <Edges threshold={20} color="#f1eadb" transparent opacity={0.06} />
        </mesh>
      ))}
      {/* a slot of warm light along the top edge: the only sign anyone was ever here */}
      <mesh position={[0, 70, -124.9]}>
        <planeGeometry args={[30, 0.35]} />
        <meshBasicMaterial color="#ffb070" toneMapped={false} />
      </mesh>
    </group>
  );
}

// The light field behind the facility: a warm core low on the horizon fading into cold blue.
// Unaffected by fog, so the facility reads as a hard silhouette against it — the establishing shot.
function Backdrop() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 150, 0, 128, 150, 128);
    grad.addColorStop(0, "rgba(255,196,140,0.9)");
    grad.addColorStop(0.18, "rgba(210,150,120,0.45)");
    grad.addColorStop(0.45, "rgba(58,95,143,0.28)");
    grad.addColorStop(1, "rgba(10,16,30,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  const mat = useMemo(() => new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false, opacity: 0 }), [tex]);
  useFrame(() => (mat.opacity = progressBetween(film.get(), 0.015, 0.04) * 0.9)); // light field arrives as camera begins moving
  return (
    <mesh position={[0, 40, -420]} material={mat}>
      <planeGeometry args={[900, 520]} />
    </mesh>
  );
}

function Monoliths() {
  const spots: [number, number, number, number][] = [
    [-22, -10, 0.2, 18],
    [26, 18, -0.3, 24],
    [-30, 38, 0.1, 30],
    [18, -52, 0.4, 14],
    [-16, -70, -0.2, 20],
  ];
  return (
    <>
      {spots.map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, h / 2, z]} rotation={[0, r, 0]} material={M.darkConcrete}>
          <boxGeometry args={[2.2, h, 6]} />
        </mesh>
      ))}
    </>
  );
}

// Debris: small low-poly fragments at three depths, turning slowly; they spin up with scroll speed.
function Debris() {
  const ref = useRef<InstancedMesh>(null);
  const n = settings.mobile ? 50 : 140;
  const data = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const r = (k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
        let x = (r(1) * 2 - 1) * 110;
        let y = 6 + r(2) * 50;
        const z = 40 - r(3) * 200;
        // Clean zone: deflect debris away from the primary name typography (Section 18)
        if (Math.abs(x) < 32 && y > 14 && y < 34 && Math.abs(z - (-30)) < 18) {
          x = (x < 0 ? -1 : 1) * (34 + Math.abs(x));
        }
        return { x, y, z, s: 0.3 + r(4) * 1.6, w: 0.05 + r(5) * 0.2, ph: r(6) * 6 };
      }),
    [n],
  );
  const o = useMemo(() => new Object3D(), []);
  const spin = useRef(0);
  useFrame((st, dt) => {
    const m = ref.current;
    if (!m) return;
    spin.current += dt * (1 + Math.min(4, Math.abs(velocity.get()) / 700));
    const t = st.clock.elapsedTime;
    data.forEach((d, i) => {
      o.position.set(d.x + Math.sin(t * 0.05 + d.ph) * 2, d.y + Math.sin(t * 0.2 + d.ph) * 0.6, d.z);
      o.rotation.set(spin.current * d.w + d.ph, spin.current * d.w * 0.7, 0);
      o.scale.setScalar(d.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} material={M.metal} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
}

// Distant skyline: silhouettes far beyond the facility, well outside anywhere the camera
// travels — the world keeps going after the frame ends. Reveals only once the field begins
// (stays out of the near-empty 0–2% signal moment) and fades with fog as it should.
const SKYLINE: [number, number, number, number, number][] = [
  [-160, -320, 10, 70, 10],
  [140, -360, 8, 110, 8],
  [-90, -460, 14, 55, 14],
  [200, -420, 9, 90, 9],
  [-220, -520, 11, 130, 11],
  [70, -580, 7, 60, 7],
  [-40, -640, 16, 95, 16],
  [230, -540, 8, 75, 8],
];

function Skyline() {
  const ref = useRef<InstancedMesh>(null);
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#0c0d10", roughness: 0.92, metalness: 0.08, transparent: true, opacity: 0 }), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new Object3D();
    SKYLINE.forEach(([x, z, w, h, d], i) => {
      o.position.set(x, h / 2 - 2, z);
      o.scale.set(w, h, d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(() => (mat.opacity = progressBetween(film.get(), 0.02, 0.07) * 0.85));
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SKYLINE.length]} material={mat} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// Distant world lights: tiny points scattered among the skyline implying activity far away —
// not decoration, evidence the field continues past what the camera ever reaches.
// Per-light phase/amplitude keeps most of them barely perceptible; a few catch brighter.
function DistantLights() {
  const n = settings.mobile ? 18 : 36;
  const { geo, base, seeds, out } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const base = new Float32Array(n * 3);
    const out = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    const palette = [
      [1, 0.35, 0.28], // warning red
      [1, 0.74, 0.42], // amber lamp
      [0.42, 0.7, 1], // cool signal blue
    ];
    for (let i = 0; i < n; i++) {
      const r = (k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
      pos[i * 3] = (r(1) * 2 - 1) * 260;
      pos[i * 3 + 1] = 5 + r(2) * 130;
      pos[i * 3 + 2] = -300 - r(3) * 380;
      const c = palette[i % palette.length];
      base[i * 3] = c[0];
      base[i * 3 + 1] = c[1];
      base[i * 3 + 2] = c[2];
      seeds[i] = r(4) * 10;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3));
    geo.setAttribute("color", new BufferAttribute(out.slice(), 3));
    return { geo, base, seeds, out };
  }, [n]);

  useFrame((s) => {
    const reveal = progressBetween(film.get(), 0.025, 0.075);
    const attr = geo.attributes.color as BufferAttribute;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const tw = reveal * (0.35 + 0.65 * Math.max(0, Math.sin(t * (0.5 + seeds[i] * 0.08) + seeds[i])));
      out[i * 3] = base[i * 3] * tw;
      out[i * 3 + 1] = base[i * 3 + 1] * tw;
      out[i * 3 + 2] = base[i * 3 + 2] * tw;
    }
    attr.array.set(out);
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={2.4} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={AdditiveBlending} fog={false} toneMapped={false} />
    </points>
  );
}

// Foreground struts: a few large dark silhouettes close to the camera's path, at the edges of
// frame — peripheral depth cues (Section 1, world-building pass), not obstacles. They stay out
// of the beacon/name clean zone and only settle in once the field opens.
const STRUTS: [number, number, number, number, number, number][] = [
  [-26, 30, 3, 22, 3, 0.15],
  [24, -6, 4, 30, 3, -0.1],
  [-34, -34, 3.5, 18, 3.5, 0.25],
];

function ForegroundStruts() {
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#15161a", roughness: 0.7, metalness: 0.25, transparent: true, opacity: 0 }), []);
  useFrame(() => (mat.opacity = progressBetween(film.get(), 0.02, 0.05)));
  return (
    <>
      {STRUTS.map(([x, z, w, h, d, r], i) => (
        <mesh key={i} position={[x, h / 2 - 1, z]} rotation={[0, r, 0]} material={mat}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
    </>
  );
}

export default function Signal() {
  return (
    <group>
      <Backdrop />
      <Beacon />
      <Facility />
      <Monoliths />
      <Debris />
      <Skyline />
      <DistantLights />
      <ForegroundStruts />
      {/* tiny technical typography, far away, before anything is explained */}
      <RetroText font="mono" at={0.016} position={[4, 31, -112]} fontSize={0.9} color="#b5d5ff" opacity={0.85}>
        {`SIGNAL RECEIVED  ·  ${PERSON.coords}`}
      </RetroText>
      {/* Adaptive subtle dark backplate ensuring pristine contrast against distant beacon (Section 8) */}
      <mesh position={[0, 22.8, -31.5]}>
        <planeGeometry args={[settings.mobile ? 38 : 56, 18]} />
        <meshBasicMaterial color="#08090d" transparent opacity={0.6} depthWrite={false} fog={false} />
      </mesh>
      {/* the name, hanging in the field — responsive sizing guarantees zero clipping on mobile (Section 6 & 22) */}
      <RetroText
        at={0.045}
        position={[0, settings.mobile ? 25.5 : 27, -30]}
        anchorX="center"
        fontSize={settings.mobile ? 4.8 : 8.5}
        rise={2}
        color="#fbf8f1"
      >
        {PERSON.name.toUpperCase()}
      </RetroText>
      <RetroText
        font="mono"
        at={0.065}
        position={[0, settings.mobile ? 19.8 : 18.6, -30]}
        anchorX="center"
        fontSize={settings.mobile ? 0.72 : 1.05}
        color="#ffd9a8"
        opacity={0.95}
      >
        {`${PERSON.title.toUpperCase()}   ·   ${PERSON.location.toUpperCase()}`}
      </RetroText>
    </group>
  );
}
