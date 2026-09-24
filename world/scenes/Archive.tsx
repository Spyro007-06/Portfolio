"use client";

// SCENE 03 — THE ARCHIVE. A hall of towering shelving that fog swallows at 60 m, hundreds of
// dormant panels hanging in the air, and shafts of cold light from somewhere above.
// The story lives on physical structures the camera visits in turn:
//   left wall  → profile statement + the portrait plate (Fig. 01)
//   right wall → the spec record (name, role, location, focus, stack, exploring)
//   high left  → the experience record (AHAL AI, education)
// Nothing ever draws over the photograph.

import { useTexture } from "@react-three/drei";
import Edges from "../objects/Edges";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { AdditiveBlending, Group, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace, type Texture } from "three";
import { EXPLORING, PERSON, TIMELINE } from "@/data/portfolio";
import { PLACES, type V3 } from "../layout";
import { M } from "../materials";
import { useArrival } from "../objects/arrival";
import RetroText from "../objects/RetroText";
import { settings } from "../signals";
import { WORLD_TIMELINE } from "../timeline";

const A = WORLD_TIMELINE.archive;
const at = (local: number) => A.start + (A.end - A.start) * local;
const Z0 = -130, Z1 = -300;
const rand = (i: number, k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;

function Shelving() {
  const ref = useRef<InstancedMesh>(null);
  const cols = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (let z = Z0; z > Z1; z -= 14) for (const x of [-26, 26, -44, 44, -64, 64]) out.push([x, z, 24 + rand(out.length, 1) * 30, 2 + rand(out.length, 2) * 3]);
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new Object3D();
    cols.forEach(([x, z, h, w], i) => {
      o.position.set(x, h / 2, z);
      o.scale.set(w, h, 6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [cols]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols.length]} material={M.concrete}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// dormant panels hanging in the hall, turning very slowly — varied physical material responses (Section 5)
type PanelKind = "matte" | "screen" | "plastic" | "paper";

function Panels() {
  const refMatte = useRef<InstancedMesh>(null);
  const refScreen = useRef<InstancedMesh>(null);
  const refPlastic = useRef<InstancedMesh>(null);
  const refPaper = useRef<InstancedMesh>(null);
  const n = settings.mobile ? 90 : 260;
  const data = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const side = rand(i, 1) > 0.5 ? 1 : -1;
        const r = rand(i, 7);
        const kind: PanelKind = r > 0.82 ? "screen" : r > 0.66 ? "plastic" : r > 0.50 ? "paper" : "matte";
        return {
          x: side * (12 + rand(i, 2) * 50),
          y: 4 + rand(i, 3) * 34,
          z: Z0 - rand(i, 4) * (Z0 - Z1),
          r: rand(i, 5) * 6,
          w: 1 + rand(i, 6) * 3,
          kind,
        };
      }),
    [n],
  );
  const counts = useMemo(() => {
    const c = { matte: 0, screen: 0, plastic: 0, paper: 0 };
    data.forEach((d) => c[d.kind]++);
    return c;
  }, [data]);

  const o = useMemo(() => new Object3D(), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.04;
    let idxMatte = 0, idxScreen = 0, idxPlastic = 0, idxPaper = 0;
    data.forEach((d) => {
      o.position.set(d.x, d.y + Math.sin(t * 3 + d.r) * 0.3, d.z);
      o.rotation.set(0, d.r + t * (d.kind === "screen" ? 0.5 : 0.2), 0);
      o.scale.set(d.w, d.w * 0.62, 0.08);
      o.updateMatrix();
      if (d.kind === "matte") refMatte.current?.setMatrixAt(idxMatte++, o.matrix);
      else if (d.kind === "screen") refScreen.current?.setMatrixAt(idxScreen++, o.matrix);
      else if (d.kind === "plastic") refPlastic.current?.setMatrixAt(idxPlastic++, o.matrix);
      else if (d.kind === "paper") refPaper.current?.setMatrixAt(idxPaper++, o.matrix);
    });
    if (refMatte.current) refMatte.current.instanceMatrix.needsUpdate = true;
    if (refScreen.current) refScreen.current.instanceMatrix.needsUpdate = true;
    if (refPlastic.current) refPlastic.current.instanceMatrix.needsUpdate = true;
    if (refPaper.current) refPaper.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={refMatte} args={[undefined, undefined, counts.matte]} material={M.panel} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={refScreen} args={[undefined, undefined, counts.screen]} material={M.screen} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={refPlastic} args={[undefined, undefined, counts.plastic]} material={M.translucentPlastic} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={refPaper} args={[undefined, undefined, counts.paper]} material={M.paper} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </>
  );
}

function Shafts() {
  const mat = useMemo(() => new MeshBasicMaterial({ color: "#9cc3cc", transparent: true, opacity: 0.045, blending: AdditiveBlending, depthWrite: false }), []);
  return (
    <>
      {[[-6, -165], [9, -228], [-3, -275]].map(([x, z], i) => (
        <mesh key={i} position={[x, 22, z]} rotation={[0, 0, 0.12 * (i - 1)]} material={mat}>
          <cylinderGeometry args={[1.2, 7, 46, 8, 1, true]} />
        </mesh>
      ))}
    </>
  );
}

// Vertical archive towers well beyond the visitable aisle — taller than anything the camera
// approaches directly, receding into fog at the hall's far end. The archive should feel like
// it goes up and out much further than the shelving the camera actually passes (world-building pass).
const TOWERS: [number, number, number, number][] = [
  [-95, -160, 110, 7],
  [98, -190, 130, 8],
  [-118, -230, 90, 6],
  [110, -260, 145, 9],
];

function Towers() {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new Object3D();
    TOWERS.forEach(([x, z, h, w], i) => {
      o.position.set(x, h / 2, z);
      o.scale.set(w, h, w);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, TOWERS.length]} material={M.darkConcrete} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// Suspended walkways crossing the aisle overhead, and a service elevator sliding slowly up one
// tower's face. Most of the archive stays monumental and still; only a few systems move
// (Section 10, world-building pass): the elevator on a ~16s cycle, the ring below on 46s+.
function Walkways() {
  const spans: [number, number][] = [
    [-178, 34],
    [-244, 30],
  ];
  return (
    <>
      {spans.map(([z, y], i) => (
        <group key={i}>
          <mesh position={[0, y, z]} material={M.metal}>
            <boxGeometry args={[54, 0.5, 2.4]} />
          </mesh>
          {[-27, 27].map((x) => (
            <mesh key={x} position={[x, y / 2, z]} material={M.brushedMetal}>
              <boxGeometry args={[0.3, y, 0.3]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function ServiceElevator() {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const cycle = (Math.sin((s.clock.elapsedTime * Math.PI * 2) / 16) + 1) / 2; // ~16s round trip
    g.position.y = 6 + cycle * 40;
  });
  return (
    <group ref={ref} position={[64, 6, -205]}>
      <mesh material={M.brushedMetal}>
        <boxGeometry args={[3.4, 2.6, 3.4]} />
        <Edges color="#f1eadb" transparent opacity={0.15} />
      </mesh>
      <pointLight color="#ffcf9e" intensity={80} distance={10} decay={2} />
    </group>
  );
}

// A slowly rotating storage ring hanging mid-hall, carrying a handful of crates — one of the
// few things in the archive that visibly moves, and it takes its time doing it.
function RotatingRing() {
  const ref = useRef<Group>(null);
  useFrame((s) => void (ref.current && (ref.current.rotation.y = (s.clock.elapsedTime * Math.PI * 2) / 46))); // ~46s per turn
  const crates = useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), []);
  return (
    <group ref={ref} position={[0, 42, -215]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.metal}>
        <torusGeometry args={[16, 0.35, 6, 24]} />
      </mesh>
      {crates.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 16, 0, Math.sin(a) * 16]} material={M.panel}>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
        </mesh>
      ))}
    </group>
  );
}

/** A physical information structure: frame, backing, a lit top edge that draws on arrival. */
function Structure({ at: t, position, rotationY, w, h, children }: { at: number; position: V3; rotationY: number; w: number; h: number; children: ReactNode }) {
  const bar = useRef<Group>(null);
  const shown = useArrival(t);
  const matteBacking = useMemo(() => new MeshStandardMaterial({ color: "#080a0d", roughness: 0.96, metalness: 0.02 }), []);
  useFrame(() => bar.current && bar.current.scale.set(Math.max(0.001, shown.get()), 1, 1));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Matte non-glare backing plate preventing specular glare (Section 8) */}
      <mesh position={[0, -h / 2, -0.35]} material={matteBacking}>
        <boxGeometry args={[w + 1.4, h + 1.4, 0.5]} />
        <Edges color="#f1eadb" transparent opacity={0.18} />
      </mesh>
      {/* Localized contrast plane immediately behind typography */}
      <mesh position={[0, -h / 2, -0.08]}>
        <planeGeometry args={[w + 1.2, h + 1.2]} />
        <meshBasicMaterial color="#050608" transparent opacity={0.85} depthWrite={false} fog={false} />
      </mesh>
      {/* Translucent protective visor strip above the header */}
      <mesh position={[0, 0.95, -0.1]} material={M.translucentPlastic}>
        <boxGeometry args={[w + 1.4, 0.35, 0.05]} />
      </mesh>
      <group ref={bar} position={[-w / 2 - 0.7, 0.7, 0]}>
        <mesh position={[(w + 1.4) / 2, 0, 0]}>
          <planeGeometry args={[w + 1.4, 0.08]} />
          <meshBasicMaterial color="#7fe3e0" toneMapped={false} />
        </mesh>
      </group>
      <group position={[-w / 2, 0, 0]}>{children}</group>
    </group>
  );
}

function Portrait({ tex }: { tex: Texture }) {
  tex.colorSpace = SRGBColorSpace;
  const shown = useArrival(at(0.2));
  const mat = useMemo(() => new MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true, fog: false }), [tex]);
  useFrame(() => (mat.opacity = shown.get()));
  return (
    <group position={[-19, 8, -197]} rotation={[0, Math.PI / 2 - 0.15, 0]}>
      {/* Dark backing */}
      <mesh position={[0, 0, -0.55]} material={M.darkConcrete}>
        <boxGeometry args={[7.4, 9.0, 0.2]} />
      </mesh>
      {/* Brushed metal frame */}
      <mesh position={[0, 0, -0.3]} material={M.brushedMetal}>
        <boxGeometry args={[6.8, 8.4, 0.4]} />
        <Edges color="#f1eadb" transparent opacity={0.18} />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[6, 7.5]} />
      </mesh>
      <RetroText font="mono" at={at(0.24)} position={[-3, -4.1, 0]} fontSize={0.32} color="#ffd9a8" opacity={0.85}>
        {`FIG. 01 — ${PERSON.name.toUpperCase()}  ·  ${PERSON.coords}`}
      </RetroText>
    </group>
  );
}

const work = TIMELINE.find((t) => t.kind === "Work")!;
const edu = TIMELINE.find((t) => t.kind === "Education")!;
const SPEC: [string, string][] = [
  ["NAME", PERSON.name],
  ["ROLE", PERSON.title],
  ["LOCATION", PERSON.location],
  ["FOCUS", "Frontend engineering × AI products"],
  ["STACK", "HTML · CSS · JavaScript · REST APIs · LLMs"],
  ["EXPLORING", EXPLORING.join(" · ")],
];

export default function Archive() {
  const tex = useTexture("/images/profile.jpg");
  return (
    <group>
      <Shelving />
      <Panels />
      <Shafts />
      <Towers />
      <Walkways />
      <ServiceElevator />
      <RotatingRing />
      <pointLight position={[0, 20, -200]} color="#8fc6d0" intensity={3600} distance={110} decay={2} />
      {/* subtle warm practical lights near structures for warm/cool material contrast */}
      <pointLight position={[-14, 9, -168]} color="#ffe2c4" intensity={400} distance={28} decay={2} />
      <pointLight position={[14, 9, -200]} color="#ffe2c4" intensity={400} distance={28} decay={2} />

      {/* LEFT WALL — profile */}
      <Structure at={at(0.18)} position={PLACES.archiveAbout} rotationY={Math.PI / 2 - 0.12} w={14} h={11.5}>
        <RetroText font="mono" at={at(0.2)} fontSize={0.36} color="#7fe3e0">ARCHIVE / 01 — PROFILE</RetroText>
        <RetroText at={at(0.22)} position={[0, -0.9, 0]} fontSize={settings.mobile ? 1.3 : 1.55} lineHeight={0.95} color="#fbf8f1">
          {"UNDERSTAND\nTHE PROBLEM."}
        </RetroText>
        <RetroText at={at(0.25)} position={[0, -4.0, 0]} fontSize={settings.mobile ? 0.9 : 1.05} color="#7fe3e0">
          THEN MAKE IT SIMPLE.
        </RetroText>
        <RetroText font="body" at={at(0.29)} position={[0, -5.6, 0]} fontSize={settings.mobile ? 0.42 : 0.48} lineHeight={1.52} maxWidth={settings.mobile ? 11.5 : 13.2} color="#fbf8f1" opacity={0.92}>
          {`I'm Tharun — a frontend developer and CSE student in Coimbatore. ${PERSON.statement} I learn fastest by turning ideas into working products, then iterating.`}
        </RetroText>
      </Structure>
      <Portrait tex={tex} />

      {/* RIGHT WALL — the record (expanded h=12.2 and tuned row spacing prevents bottom overflow, Section 5 & 18) */}
      <Structure at={at(0.4)} position={PLACES.archiveBio} rotationY={-Math.PI / 2 + 0.12} w={14} h={12.4}>
        <RetroText font="mono" at={at(0.42)} fontSize={0.36} color="#7fe3e0">ARCHIVE / 02 — RECORD</RetroText>
        {SPEC.map(([k, v], i) => {
          const isLast = i === SPEC.length - 1;
          const yPos = -1.1 - i * 1.35;
          return (
            <group key={k} position={[0, yPos, 0]}>
              <RetroText font="mono" at={at(0.44 + i * 0.015)} fontSize={0.32} color="#7fe3e0" opacity={0.9}>{k}</RetroText>
              <RetroText
                font="body"
                at={at(0.45 + i * 0.015)}
                position={[settings.mobile ? 2.6 : 3.0, 0.04, 0]}
                fontSize={isLast ? (settings.mobile ? 0.32 : 0.40) : (settings.mobile ? 0.38 : 0.46)}
                maxWidth={isLast ? (settings.mobile ? 9.2 : 10.8) : (settings.mobile ? 9.8 : 11.2)}
                lineHeight={isLast ? 1.35 : 1.45}
                color="#fbf8f1"
                opacity={0.95}
              >
                {v}
              </RetroText>
            </group>
          );
        })}
      </Structure>

      {/* HIGH LEFT — experience (expanded h=13.0 and decoupled vertical offsets eliminate text collision, Section 5 & 18) */}
      <Structure at={at(0.62)} position={PLACES.archiveExp} rotationY={Math.PI / 2 - 0.35} w={14} h={13.2}>
        <RetroText font="mono" at={at(0.64)} fontSize={0.36} color="#7fe3e0">{`ARCHIVE / 03 — EXPERIENCE`}</RetroText>
        <RetroText font="mono" at={at(0.66)} position={[0, -0.9, 0]} fontSize={0.36} color="#ffd9a8">{`${work.period.toUpperCase()}  ·  ${work.org}`}</RetroText>
        <RetroText at={at(0.68)} position={[0, -1.6, 0]} fontSize={settings.mobile ? 1.15 : 1.38} color="#fbf8f1">{work.role.toUpperCase()}</RetroText>
        <RetroText font="body" at={at(0.71)} position={[0, -3.3, 0]} fontSize={0.42} lineHeight={1.45} maxWidth={settings.mobile ? 11.5 : 12.8} color="#eae4d6" opacity={0.92}>{work.desc}</RetroText>
        <RetroText font="mono" at={at(0.74)} position={[0, -6.1, 0]} fontSize={0.32} lineHeight={1.75} color="#dcd5c8" opacity={0.9}>
          {work.focus.map((f) => `▸ ${f.toUpperCase()}`).join("\n")}
        </RetroText>
        <RetroText font="mono" at={at(0.78)} position={[0, -8.7, 0]} fontSize={0.34} color="#ffd9a8">{`${edu.period.toUpperCase()}  ·  EDUCATION`}</RetroText>
        <RetroText font="body" at={at(0.8)} position={[0, -9.4, 0]} fontSize={0.44} maxWidth={settings.mobile ? 11.5 : 12.8} color="#fbf8f1">{`${edu.role} — ${edu.org}`}</RetroText>
      </Structure>

      {/* the far opening: the workshop's warm light physically leaking in */}
      <mesh position={[0, 14, -302]}>
        <planeGeometry args={[18, 26]} />
        <meshBasicMaterial color="#d9772f" toneMapped={false} transparent opacity={0.38} />
      </mesh>
      <pointLight position={[0, 14, -304]} color="#e67d2e" intensity={1800} distance={50} decay={2} />
    </group>
  );
}
