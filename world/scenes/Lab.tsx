"use client";

// SCENE 06 — THE LAB. After the dark corridor: a low room lit acid and cyan, three machines on
// pedestals. Each reacts to the pointer:
//   E.01 deforming grid — 33×33 vertices, each an independent damped spring pushed by the pointer
//   E.02 type sculpture — the word MOVE cut into 10 stacked slices (real extrusion); it turns
//        toward the pointer on the site's elastic spring and fans its slices apart when touched
//   E.03 signal cloud   — a geodesic point cloud that disperses around the touch point and settles
// Touch: tap-and-drag works the same way (R3F pointer events).

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useSpring } from "motion/react";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Group, IcosahedronGeometry, InstancedMesh, Mesh, Object3D, PlaneGeometry, PointLight, Vector3 } from "three";
import { ACCENT, SPRING } from "@/components/motion/tokens";
import { PLACES, type V3 } from "../layout";
import { M, glow } from "../materials";
import RetroText from "../objects/RetroText";
import { cursor, settings } from "../signals";
import { WORLD_TIMELINE } from "../timeline";

const L = WORLD_TIMELINE.lab;
const at = (local: number) => L.start + (L.end - L.start) * local;

function Caption({ n, title, note, t, pos = [-3.2, -3.6, 1] }: { n: string; title: string; note: string; t: number; pos?: V3 }) {
  return (
    <group position={pos}>
      {/* Architectural caption backplate for high contrast (Section 8 & 18) */}
      <mesh position={[3.2, -0.42, -0.06]}>
        <planeGeometry args={[7.2, 2.1]} />
        <meshBasicMaterial color="#06070a" transparent opacity={0.88} depthWrite={false} fog={false} />
      </mesh>
      <RetroText font="mono" at={t} fontSize={0.3} color={ACCENT.acid}>{`E.${n}`}</RetroText>
      <RetroText at={t + 0.004} position={[0.95, 0.05, 0]} fontSize={0.48} color="#fbf8f1">{title}</RetroText>
      <RetroText font="body" at={t + 0.008} position={[0, -0.58, 0]} fontSize={0.32} maxWidth={6.8} lineHeight={1.48} color="#eae4d6" opacity={0.92}>{note}</RetroText>
    </group>
  );
}

function Pedestal() {
  return (
    <group position={[0, -4.6, 0]}>
      <mesh material={M.darkConcrete}>
        <cylinderGeometry args={[2.4, 2.8, 1.2, 8]} />
      </mesh>
      {/* thin acid green indicator ring embedded into pedestal */}
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow(ACCENT.acid, 1.6)}>
        <ringGeometry args={[2.34, 2.42, 32]} />
      </mesh>
    </group>
  );
}

const hover = (label: string, on: (v: boolean) => void) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => (e.stopPropagation(), cursor.set(label), on(true)),
  onPointerOut: () => (cursor.set(null), on(false)),
});

/* E.01 — every vertex a spring */
function Grid({ pos }: { pos: V3 }) {
  const mesh = useRef<Mesh>(null);
  const S = 32;
  const geo = useMemo(() => new PlaneGeometry(8, 8, S, S), []);
  const sim = useMemo(() => ({ disp: new Float32Array((S + 1) ** 2), vel: new Float32Array((S + 1) ** 2), hit: new Vector3(0, 0, 99) }), []);
  useFrame((_, dt) => {
    const p = geo.attributes.position as BufferAttribute;
    const h = sim.hit;
    const step = Math.min(dt, 1 / 30);
    for (let i = 0; i < p.count; i++) {
      const dx = p.getX(i) - h.x, dy = p.getY(i) - h.y;
      const target = -2.2 * Math.exp(-(dx * dx + dy * dy) / 2.2); // a dent under the pointer
      sim.vel[i] += (target - sim.disp[i]) * 90 * step; // stiffness
      sim.vel[i] *= 1 - 7 * step; // damping
      sim.disp[i] += sim.vel[i] * step;
      p.setZ(i, sim.disp[i]);
    }
    p.needsUpdate = true;
  });
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!mesh.current) return;
    const local = mesh.current.worldToLocal(e.point.clone());
    sim.hit.set(local.x, local.y, 0);
  };
  return (
    <group position={pos} rotation={[-0.35, 0.45, 0]}>
      <Pedestal />
      <mesh
        ref={mesh}
        geometry={geo}
        onPointerMove={move}
        {...hover("Push", () => undefined)}
        onPointerLeave={() => sim.hit.set(0, 0, 99)}
      >
        <meshBasicMaterial color={ACCENT.acid} wireframe transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <Caption n="01" title="DEFORMING GRID" note="1,089 vertices, each an independent damped spring. The pointer is a force." t={at(0.2)} pos={[-1.2, -2.4, 3.2]} />
    </group>
  );
}

/* E.02 — type as an object */
function Sculpture({ pos }: { pos: V3 }) {
  const rig = useRef<Group>(null);
  const slices = useRef<(Group | null)[]>([]);
  const ry = useSpring(0, SPRING.elastic);
  const rx = useSpring(0, SPRING.elastic);
  const spread = useSpring(0, SPRING.soft);
  useFrame((st) => {
    if (!rig.current) return;
    const idle = settings.reduced ? 0 : Math.sin(st.clock.elapsedTime * 0.4) * 0.35;
    rig.current.rotation.set(rx.get(), ry.get() + idle - 0.4, 0);
    slices.current.forEach((s, k) => s && (s.position.z = -k * (0.12 + spread.get() * 0.35)));
  });
  const move = (e: ThreeEvent<PointerEvent>) => {
    const local = rig.current!.worldToLocal(e.point.clone());
    ry.set(local.x * 0.16);
    rx.set(-local.y * 0.12);
  };
  return (
    <group position={pos}>
      <Pedestal />
      <group ref={rig}>
        {Array.from({ length: 10 }, (_, k) => (
          <group key={k} ref={(g) => void (slices.current[k] = g)}>
            <RetroText anchorX="center" anchorY="middle" fontSize={3.2} color={k === 0 ? "#f1eadb" : k < 3 ? ACCENT.acid : ACCENT.cyan} opacity={k === 0 ? 1 : 0.85 - k * 0.07}>
              MOVE
            </RetroText>
          </group>
        ))}
        {/* invisible hit volume so the whole sculpture is grabbable */}
        <mesh
          visible={false}
          onPointerMove={move}
          {...hover("Rotate", (v) => (spread.set(v ? 1 : 0), !v && (rx.set(0), ry.set(0))))}
        >
          <boxGeometry args={[9, 3.6, 3]} />
        </mesh>
      </group>
      <Caption n="02" title="TYPE SCULPTURE" note={`Ten slices of one word. Turns on the elastic spring (k${SPRING.elastic.stiffness} c${SPRING.elastic.damping}); fans open when touched.`} t={at(0.45)} />
    </group>
  );
}

/* E.03 — a cloud that makes room for you */
function Cloud({ pos }: { pos: V3 }) {
  const { geo, base, off, vel } = useMemo(() => {
    const ico = new IcosahedronGeometry(2.6, settings.mobile ? 3 : 4);
    const src = ico.attributes.position as BufferAttribute;
    // dedupe shared vertices
    const seen = new Map<string, number>();
    const list: number[] = [];
    for (let i = 0; i < src.count; i++) {
      const k = `${src.getX(i).toFixed(3)},${src.getY(i).toFixed(3)},${src.getZ(i).toFixed(3)}`;
      if (!seen.has(k)) (seen.set(k, list.length / 3), list.push(src.getX(i), src.getY(i), src.getZ(i)));
    }
    const base = new Float32Array(list);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(list), 3));
    return { geo: g, base, off: new Float32Array(list.length), vel: new Float32Array(list.length) };
  }, []);
  const hit = useMemo(() => new Vector3(0, 0, 99), []);
  const rig = useRef<Group>(null);
  useFrame((st, dt) => {
    const a = geo.attributes.position as BufferAttribute;
    const arr = a.array as Float32Array;
    const step = Math.min(dt, 1 / 30);
    for (let i = 0; i < base.length; i += 3) {
      const dx = base[i] - hit.x, dy = base[i + 1] - hit.y, dz = base[i + 2] - hit.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const push = 2.4 * Math.exp(-d2 / 1.4);
      const n = Math.sqrt(base[i] ** 2 + base[i + 1] ** 2 + base[i + 2] ** 2) || 1;
      for (let ax = 0; ax < 3; ax++) {
        const target = (base[i + ax] / n) * push;
        vel[i + ax] += (target - off[i + ax]) * 60 * step;
        vel[i + ax] *= 1 - 6 * step;
        off[i + ax] += vel[i + ax] * step;
        arr[i + ax] = base[i + ax] + off[i + ax];
      }
    }
    a.needsUpdate = true;
    if (rig.current && !settings.reduced) rig.current.rotation.y = st.clock.elapsedTime * 0.12;
  });
  const move = (e: ThreeEvent<PointerEvent>) => rig.current && hit.copy(rig.current.worldToLocal(e.point.clone()));
  return (
    <group position={pos}>
      <Pedestal />
      <group ref={rig}>
        <points geometry={geo}>
          <pointsMaterial color={ACCENT.cyan} size={0.07} sizeAttenuation toneMapped={false} />
        </points>
        <mesh onPointerMove={move} {...hover("Explore", () => undefined)} onPointerLeave={() => hit.set(0, 0, 99)}>
          <sphereGeometry args={[2.8, 16, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <Caption n="03" title="SIGNAL CLOUD" note="A geodesic of points. Each keeps its place with a spring and makes room where you touch it." t={at(0.7)} />
    </group>
  );
}

function Flash() {
  const light = useRef<PointLight>(null);
  useFrame((st) => {
    if (!light.current || settings.reduced) return;
    const pulse = Math.sin(st.clock.elapsedTime * 1.6);
    light.current.intensity = pulse > 0.95 ? Math.pow((pulse - 0.95) / 0.05, 2) * 2600 : 0;
  });
  return <pointLight ref={light} position={[0, 16, -870]} color="#f0f6ff" intensity={0} distance={55} decay={2} />;
}

// A handful of small instruments drifting through the room at their own slow, independent
// orbits — the lab keeps measuring things whether or not the pointer is nearby (Section 16).
function FloatingMeasures() {
  const ref = useRef<InstancedMesh>(null);
  const n = settings.mobile ? 8 : 14;
  const data = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const r = (k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
        return { x: -22 + r(1) * 44, y: 4 + r(2) * 16, z: -850 - r(3) * 55, r: 4 + r(4) * 6, speed: 0.1 + r(5) * 0.2, phase: r(6) * 6.3 };
      }),
    [n],
  );
  const o = useMemo(() => new Object3D(), []);
  useFrame((s) => {
    const m = ref.current;
    if (!m) return;
    const t = s.clock.elapsedTime;
    data.forEach((d, i) => {
      o.position.set(d.x + Math.cos(t * d.speed + d.phase) * d.r, d.y + Math.sin(t * d.speed * 1.3 + d.phase) * 1.4, d.z);
      o.rotation.set(t * d.speed, t * d.speed * 0.7, 0);
      o.scale.setScalar(0.22);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} material={glow(ACCENT.cyan, 0.7)} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
}

// A procedural branching structure in one corner — a static mathematical pattern rather than
// scattered decoration (Section 16 & 17: "hand-designed hero, procedural supporting detail").
function Branching() {
  const segs = useMemo(() => {
    const out: { pos: V3; rot: V3; len: number }[] = [];
    const grow = (x: number, y: number, z: number, dx: number, dy: number, dz: number, len: number, depth: number) => {
      if (depth > 4 || len < 0.6) return;
      const ex = x + dx * len, ey = y + dy * len, ez = z + dz * len;
      out.push({ pos: [(x + ex) / 2, (y + ey) / 2, (z + ez) / 2], rot: [Math.atan2(dz, dy), 0, -Math.atan2(dx, dy)], len });
      const branches = depth < 2 ? 3 : 2;
      for (let i = 0; i < branches; i++) {
        const a = (i / branches) * Math.PI * 2 + depth;
        const spread = 0.55;
        grow(ex, ey, ez, dx + Math.cos(a) * spread, dy + 0.7, dz + Math.sin(a) * spread, len * 0.68, depth + 1);
      }
    };
    grow(0, 0, 0, 0, 1, 0, 4.2, 0);
    return out;
  }, []);
  return (
    <group position={[20, -4.6, -862]}>
      {segs.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} material={M.brushedMetal}>
          <cylinderGeometry args={[0.06, 0.1, s.len, 5]} />
        </mesh>
      ))}
    </group>
  );
}

// A small cluster of angular translucent shards — a "crystalline computing structure" reading
// as strange geometry that doesn't belong to ordinary architecture (Section 16).
function CrystalCluster() {
  const shards = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const r = (k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
        return { pos: [r(1) * 2.4 - 1.2, r(2) * 2.6, r(3) * 2 - 1] as V3, rot: [r(4) * Math.PI, r(5) * Math.PI, 0] as V3, s: 0.7 + r(6) * 1.1 };
      }),
    [],
  );
  const ref = useRef<Group>(null);
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.05));
  return (
    <group ref={ref} position={[-20, -2, -874]}>
      {shards.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot} scale={c.s} material={M.translucentPlastic}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group>
      <mesh position={[0, 20, -880]} material={M.darkConcrete}>
        <boxGeometry args={[60, 1, 100]} />
      </mesh>
      {[-26, 26].map((x) => (
        <mesh key={x} position={[x, 10, -880]} material={M.darkConcrete}>
          <boxGeometry args={[1, 20, 100]} />
        </mesh>
      ))}
      {/* the exit toward the observation room: soft warm daylight leaking through doorway */}
      {[-16, 16].map((x) => (
        <mesh key={x} position={[x, 10, -930]} material={M.darkConcrete}>
          <boxGeometry args={[20, 20, 1]} />
        </mesh>
      ))}
      <pointLight position={[0, 14, -932]} color="#ecdcb9" intensity={1400} distance={42} decay={2} />
      {/* Cold white / dark cyan experimental room illumination; green is reserved for procedural elements (Section 8) */}
      <pointLight position={[-8, 14, -860]} color="#b4dce2" intensity={900} distance={40} decay={2} />
      <pointLight position={[8, 12, -885]} color="#245d6e" intensity={1600} distance={52} decay={2} />
      <pointLight position={[0, 16, -840]} color="#1b424d" intensity={1400} distance={55} decay={2} />
      <Flash />
    </group>
  );
}

export default function Lab() {
  return (
    <group>
      <Room />
      <FloatingMeasures />
      <Branching />
      <CrystalCluster />
      <Grid pos={PLACES.labGrid} />
      <Sculpture pos={PLACES.labType} />
      <Cloud pos={PLACES.labCloud} />
      {/* Architectural backing for Lab title */}
      <mesh position={[0, 15.6, -906]}>
        <planeGeometry args={[28, 6]} />
        <meshBasicMaterial color="#06070a" transparent opacity={0.7} depthWrite={false} fog={false} />
      </mesh>
      <RetroText at={at(0.05)} anchorX="center" position={[0, 17, -905]} fontSize={2.6} color="#fbf8f1" opacity={0.95}>
        THE LAB
      </RetroText>
      <RetroText font="mono" at={at(0.08)} anchorX="center" position={[0, 14.2, -905]} fontSize={0.36} color={ACCENT.acid}>
        EXPERIMENTS IN MOTION AND INTERACTION · TOUCH THEM
      </RetroText>
    </group>
  );
}
