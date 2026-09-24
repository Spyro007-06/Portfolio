"use client";

// SCENE 05 — THE PROJECT CHAMBER. A long hall of dark columns and architectural installations.
// Each project has its own distinct micro color identity and architectural materiality:
//   P1 Financial: deep charcoal architecture, electric blue & cyan lighting
//   P2 Voice:     near-black architecture, acid green & cold white accents
//   P3 HH Goa:    dark steel architecture, warm amber & crimson highlights
//   P4 Music:     dark red-black architecture, deep violet & magenta lighting
//
// Exit transition:
//   - Accent lighting decays
//   - Emissive surfaces dim
//   - Luminous fragments inherit the project's accent color and travel into darkness
//   - The next project begins introducing its own color in the distance before camera reaches it
// Hover tilts the whole installation toward the pointer on springs; click opens its dossier.

import Edges from "../objects/Edges";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useSpring } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Color, Group, InstancedMesh, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PointLight, Vector3 } from "three";
import { PROJECTS, type Project } from "@/data/portfolio";
import { ACCENT, SPRING } from "@/components/motion/tokens";
import { INSTALLATIONS } from "../layout";
import { M } from "../materials";
import Exhibit from "../objects/Exhibits";
import RetroText from "../objects/RetroText";
import { cursor, film, openProject, pointer, settings } from "../signals";
import { PROJECT_SPANS, progressBetween, smooth } from "../timeline";

const FW = 14, FH = 8.6;

// Distinct physical base materials per installation (Section 7)
const ARCH_BASES: Record<string, { plinth: MeshStandardMaterial; frame: MeshStandardMaterial; edgeColor: string }> = {
  financial: {
    plinth: new MeshStandardMaterial({ color: "#121418", roughness: 0.85, metalness: 0.1, flatShading: true }),
    frame: new MeshStandardMaterial({ color: "#202530", roughness: 0.45, metalness: 0.4, flatShading: true }),
    edgeColor: "#3ee6d8",
  },
  voice: {
    plinth: new MeshStandardMaterial({ color: "#090c0a", roughness: 0.9, metalness: 0.05, flatShading: true }),
    frame: new MeshStandardMaterial({ color: "#181d19", roughness: 0.5, metalness: 0.3, flatShading: true }),
    edgeColor: "#c8f04a",
  },
  hhgoa: {
    plinth: new MeshStandardMaterial({ color: "#1a1614", roughness: 0.75, metalness: 0.25, flatShading: true }),
    frame: new MeshStandardMaterial({ color: "#362a22", roughness: 0.4, metalness: 0.5, flatShading: true }),
    edgeColor: "#ff7a2e",
  },
  music: {
    plinth: new MeshStandardMaterial({ color: "#140a12", roughness: 0.85, metalness: 0.15, flatShading: true }),
    frame: new MeshStandardMaterial({ color: "#2e1828", roughness: 0.45, metalness: 0.4, flatShading: true }),
    edgeColor: "#d8508f",
  },
};

function Installation({ p, i }: { p: Project; i: number }) {
  const at = INSTALLATIONS[i];
  const span = PROJECT_SPANS[i];
  const side = Math.sign(at[0]); // −1 left of the aisle, +1 right
  const len = span.end - span.start;
  const t = (local: number) => span.start + len * local;
  const accent = ACCENT[p.accent];
  const arch = ARCH_BASES[p.id] ?? {
    plinth: M.darkConcrete,
    frame: M.metal,
    edgeColor: accent,
  };

  const rig = useRef<Group>(null);
  const plane = useRef<Group>(null);
  const bars = useRef<(Group | null)[]>([]);
  const lightRef = useRef<PointLight>(null);
  const floorLightRef = useRef<Mesh>(null);
  const floorMat = useMemo(() => new MeshBasicMaterial({ color: accent, toneMapped: false, transparent: true, opacity: 1 }), [accent]);
  const edgeMat = useMemo(() => new LineBasicMaterial({ color: arch.edgeColor, transparent: true, opacity: 0.35 }), [arch.edgeColor]);
  const panelMat = useMemo(() => new MeshBasicMaterial({ color: "#06070a", transparent: true, opacity: 0.92, depthWrite: false }), []);

  const [live, setLive] = useState(false);
  const tiltX = useSpring(0, SPRING.physical);
  const tiltY = useSpring(0, SPRING.physical);

  useFrame(() => {
    const f = film.get();
    const exit = settings.reduced ? 0 : smooth(progressBetween(f, t(0.74), t(1.05)));

    // Continuous physical lighting transitions (Section 7 & 18):
    // 1. Next structure begins introducing color before the camera reaches it
    // 2. When leaving, accent lighting decays and emissive surfaces dim into darkness
    const approach = progressBetween(f, span.start - 0.065, span.start + 0.015);
    const exitDim = 1 - progressBetween(f, span.start + len * 0.72, span.end + 0.025);
    const dynamicBrightness = approach * exitDim;

    if (lightRef.current) lightRef.current.intensity = dynamicBrightness * 750; // a pool on the plinth, not a flooded floor
    floorMat.opacity = Math.max(0.04, dynamicBrightness * 1.0);
    edgeMat.opacity = Math.max(0.04, dynamicBrightness * 0.35);
    panelMat.opacity = Math.max(0, dynamicBrightness * 0.92);

    if (live) {
      tiltY.set(pointer.x.get() * 0.12);
      tiltX.set(pointer.y.get() * 0.08);
    }
    if (rig.current) {
      rig.current.rotation.y = -side * 0.22 + tiltY.get() + exit * side * 0.7;
      rig.current.rotation.x = tiltX.get();
    }
    if (plane.current) plane.current.rotation.x = -exit * 1.35; // image plane folds down
    bars.current.forEach((b, k) => {
      if (!b) return;
      const out = [[0, 1], [0, -1], [-1, 0], [1, 0]][k];
      b.position.set(out[0] * (FW / 2 + exit * 7), out[1] * (FH / 2 + exit * 5), exit * (k % 2 ? 4 : -3));
      b.rotation.set(exit * (k + 1) * 0.5, exit * (k % 2 ? 0.8 : -0.6), exit * (k - 1.5) * 0.4);
    });
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLive(true);
    cursor.set("View");
  };
  const out = () => {
    setLive(false);
    tiltX.set(0);
    tiltY.set(0);
    cursor.set(null);
  };
  // Responsive positioning: on mobile, draw closer to center aisle and scale to prevent viewport edge clipping (Section 17, 18, 22)
  const textX = settings.mobile ? -side * 4.6 : -side * (FW / 2 + 1.0);
  const anchor = side < 0 ? "left" : "right";
  const textAt = span.start - 0.045;
  const textUntil = span.end + 0.03;

  return (
    <group position={at}>
      {/* architectural plinth + dynamically dimming floor light */}
      <mesh position={[0, -FH / 2 - 3.4, 0]} material={arch.plinth}>
        <boxGeometry args={[FW + 2, 1.2, 5]} />
      </mesh>
      <mesh ref={floorLightRef} position={[0, -FH / 2 - 2.78, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <planeGeometry args={[FW, 0.08]} />
      </mesh>
      {/* gallery spot: high and in front, so the colour lands on the piece rather than pooling on the floor */}
      <pointLight ref={lightRef} position={[-side * 3, 11, 7]} color={accent} intensity={0} distance={22} decay={2} />

      <group ref={rig} onPointerOver={over} onPointerOut={out} onClick={() => openProject(p.id)}>
        {/* deepest layer: the exhibit */}
        <group ref={plane} position={[0, -FH / 2 + 0.3, -1.4]}>
          <group position={[0, FH / 2 - 0.3, 0]}>
            <Exhibit p={p} live={live} />
          </group>
        </group>
        {/* the frame, in four bars with project micro-identity material */}
        {[0, 1, 2, 3].map((k) => (
          <group key={k} ref={(g) => void (bars.current[k] = g)}>
            <mesh material={arch.frame}>
              <boxGeometry args={k < 2 ? [FW + 0.8, 0.4, 0.8] : [0.4, FH + 0.8, 0.8]} />
              <Edges material={edgeMat} />
            </mesh>
          </group>
        ))}

        {/* Dedicated architectural display panel for project typography (Section 8, 17, 18, 22) */}
        <group position={[textX, FH / 2, 0]} scale={settings.mobile ? [0.76, 0.76, 0.76] : [1, 1, 1]}>
          <mesh position={[side < 0 ? 5.8 : -5.8, -5.6, -0.1]} material={arch.plinth}>
            <boxGeometry args={[12.4, 12.8, 0.2]} />
            <Edges threshold={15} material={edgeMat} />
          </mesh>
          <mesh position={[side < 0 ? 5.8 : -5.8, -5.6, -0.01]} material={panelMat}>
            <planeGeometry args={[12.2, 12.6]} />
          </mesh>

          {/* Strict hierarchy and decoupled spacing eliminate text collisions and bottom overflow (Section 5 & 17).
              Gap to ROLE sized for the worst-case 2-line title wrap at fontSize 1.1 (~2.3 units tall) so long
              titles like "AI Financial Agent" never collide with the metadata line beneath them. */}
          <RetroText font="mono" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -0.35, 0.1]} fontSize={0.34} color={accent}>
            {`PROJECT ${p.idx} / 0${PROJECTS.length}  ·  ${p.category.toUpperCase()}`}
          </RetroText>
          <RetroText at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -0.95, 0.1]} fontSize={p.title.length > 18 ? 0.92 : 1.1} maxWidth={11.0} lineHeight={1.05} color="#fbf8f1">
            {p.title.toUpperCase()}
          </RetroText>
          <RetroText font="mono" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -3.5, 0.1]} fontSize={0.32} color="#ffd9a8" opacity={0.95}>
            {`ROLE: FRONTEND DEVELOPER & BUILDER   ·   YEAR: ${p.year}`}
          </RetroText>
          <RetroText font="body" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -4.2, 0.1]} fontSize={0.36} maxWidth={11.0} lineHeight={1.42} color="#eae4d6" opacity={0.92}>
            {p.desc}
          </RetroText>
          <RetroText font="mono" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -7.7, 0.1]} fontSize={0.31} maxWidth={11.0} lineHeight={1.45} color={accent}>
            {`STACK: ${p.points.join("  ·  ").toUpperCase()}`}
          </RetroText>
          <RetroText font="mono" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -9.2, 0.1]} fontSize={0.30} color="#c2bcaf" opacity={0.95}>
            {`DOMAIN: ${p.domain.toUpperCase()}   ·   ${p.link ? "SOURCE: GITHUB ↗" : "SOURCE: PRIVATE"}`}
          </RetroText>
          <RetroText font="mono" at={textAt} until={textUntil} anchorX={anchor} textAlign={anchor} position={[0, -10.3, 0.1]} fontSize={0.32} color={accent}>
            [ CLICK INSTALLATION TO OPEN FULL DOSSIER ]
          </RetroText>
        </group>
      </group>
    </group>
  );
}

/** Shards: leave installation i at exit and gather around installation i+1, self-luminous in the dark */
function Shards() {
  const ref = useRef<InstancedMesh>(null);
  const per = settings.mobile ? 14 : 32;
  const n = per * PROJECTS.length;
  const seeds = useMemo(() => Array.from({ length: n }, (_, k) => ({ a: (k * 2.39996) % (Math.PI * 2), r: 0.6 + ((k * 0.618) % 1), s: 0.22 + ((k * 0.37) % 1) * 0.55 })), [n]);
  const pColors = useMemo(() => PROJECTS.map((pr) => new Color(ACCENT[pr.accent])), []);
  const clr = useMemo(() => new Color(), []);
  const o = useMemo(() => new Object3D(), []);
  const from = useMemo(() => new Vector3(), []);
  const to = useMemo(() => new Vector3(), []);
  // Self-luminous basic material so fragments visibly carry color into the dark void between installations
  const shardMat = useMemo(() => new MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.95 }), []);

  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const f = film.get();
    seeds.forEach((sd, k) => {
      const i = Math.floor(k / per);
      const span = PROJECT_SPANS[i];
      const len = span.end - span.start;
      const e = progressBetween(f, span.start + len * 0.74, span.start + len * 1.55);
      const a = INSTALLATIONS[i], b = INSTALLATIONS[i + 1] ?? [0, 9, a[2] - 90];
      const side = Math.sign(a[0]);
      // Clean zone: bias shard trajectories away from the aisle text panel (Section 18)
      const shardXOffset = Math.cos(sd.a) * (FW / 2) * sd.r + side * 1.5;
      from.set(a[0] + shardXOffset, a[1] + Math.sin(sd.a) * (FH / 2) * sd.r, a[2]);
      to.set(b[0] + Math.cos(sd.a) * (FW / 2 + 3) * sd.r + side * 1.5, b[1] + Math.sin(sd.a) * (FH / 2 + 3) * sd.r, b[2] - 2);
      const k2 = smooth(e);
      o.position.lerpVectors(from, to, k2);
      o.position.y += Math.sin(k2 * Math.PI) * 8 * sd.r; // arc
      const vis = e > 0 && e < 1 ? Math.sin(e * Math.PI) : 0;
      o.scale.setScalar(vis * sd.s);
      o.rotation.set(st.clock.elapsedTime * sd.r + k, k2 * 6, 0);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);

      // Shards inherit current project color and decay into darkness
      clr.copy(pColors[i]).multiplyScalar(Math.max(0.08, vis * 1.5));
      m.setColorAt(k, clr);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} material={shardMat} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
}

/** Hall aisle runners segmented by project to avoid monolithic global color (Section 1 & 7) */
function HallRunners() {
  const mats = useMemo(
    () =>
      PROJECTS.map(
        (pr) =>
          new MeshBasicMaterial({
            color: ACCENT[pr.accent],
            toneMapped: false,
            transparent: true,
            opacity: 0.15,
          }),
      ),
    [],
  );

  useFrame(() => {
    const f = film.get();
    PROJECT_SPANS.forEach((span, i) => {
      const len = span.end - span.start;
      const approach = progressBetween(f, span.start - 0.05, span.start + 0.02);
      const exitDim = 1 - progressBetween(f, span.start + len * 0.75, span.end + 0.03);
      mats[i].opacity = 0.08 + approach * exitDim * 0.55;
    });
  });

  return (
    <>
      {PROJECTS.map((p, i) => {
        const at = INSTALLATIONS[i];
        return (
          <group key={p.id}>
            {[-17, 17].map((x) => (
              <mesh key={x} position={[x, 0.05, at[2]]} rotation={[-Math.PI / 2, 0, 0]} material={mats[i]}>
                <planeGeometry args={[0.12, 68]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

function Hall() {
  const ref = useRef<InstancedMesh>(null);
  const cols = useMemo(() => {
    const out: [number, number][] = [];
    for (let z = -500; z > -790; z -= 18) out.push([-30, z], [30, z]);
    return out;
  }, []);
  useFrame(() => {
    const m = ref.current;
    if (!m || m.userData.done) return;
    const o = new Object3D();
    cols.forEach(([x, z], i) => {
      o.position.set(x, 20, z);
      o.scale.set(3, 40, 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.userData.done = true;
  });
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, cols.length]} material={M.concrete}>
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
      </instancedMesh>
      <HallRunners />
      {/* the dark corridor out, toward the lab */}
      {[-9, 9].map((x) => (
        <mesh key={x} position={[x, 8, -800]} material={M.darkConcrete}>
          <boxGeometry args={[1, 16, 40]} />
        </mesh>
      ))}
      <mesh position={[0, 16.5, -800]} material={M.darkConcrete}>
        <boxGeometry args={[19, 1, 40]} />
      </mesh>
    </>
  );
}

export default function Projects() {
  return (
    <group>
      <Hall />
      {PROJECTS.map((p, i) => (
        <Installation key={p.id} p={p} i={i} />
      ))}
      <Shards />
    </group>
  );
}
