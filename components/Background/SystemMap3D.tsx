"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

export interface SystemNodeDef {
  id: string;
  name: string;
  pos: [number, number, number];
  category: "core" | "framework" | "visual" | "system";
  code: string;
  hasAmberIndicator?: boolean;
}

export const SYSTEM_MAP_NODES: SystemNodeDef[] = [
  { id: "arch",  name: "FRONTEND ARCHITECTURE", pos: [0.0, 1.4, -41.5],  category: "core",      code: "ARCH_01", hasAmberIndicator: true },
  { id: "react", name: "REACT",                 pos: [-3.0, 0.6, -42.5], category: "framework", code: "REACT_02" },
  { id: "next",  name: "NEXT.JS",               pos: [-4.2, 2.3, -44.0], category: "framework", code: "NEXT_03" },
  { id: "ts",    name: "TYPESCRIPT",            pos: [-1.6, 2.9, -43.0], category: "core",      code: "TS_04",   hasAmberIndicator: true },
  { id: "js",    name: "JAVASCRIPT",            pos: [-3.5, -1.0, -42.5],category: "core",      code: "JS_05" },
  { id: "gsap",  name: "GSAP",                  pos: [2.6, 0.4, -42.5],  category: "visual",    code: "GSAP_06" },
  { id: "webgl", name: "WEBGL",                 pos: [4.2, 2.0, -43.8],  category: "visual",    code: "GL_07",   hasAmberIndicator: true },
  { id: "ds",    name: "DESIGN SYSTEMS",        pos: [1.8, 2.7, -44.2],  category: "system",    code: "DS_08" },
  { id: "perf",  name: "PERFORMANCE",           pos: [3.4, -0.9, -42.5], category: "system",    code: "PERF_09", hasAmberIndicator: true },
  { id: "a11y",  name: "ACCESSIBILITY",         pos: [0.0, -1.4, -41.8], category: "system",    code: "A11Y_10" },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], // Arch -> React
  [1, 2], // React -> Next.js
  [0, 3], // Arch -> TypeScript
  [3, 4], // TS -> JS
  [0, 5], // Arch -> GSAP
  [5, 6], // GSAP -> WebGL
  [0, 7], // Arch -> Design Systems
  [0, 8], // Arch -> Performance
  [0, 9], // Arch -> Accessibility
  [1, 7], // React -> Design Systems
  [2, 8], // Next.js -> Performance
  [6, 8], // WebGL -> Performance
];

export default function SystemMap3D() {
  const groupRef = useRef<THREE.Group>(null);
  const activeLightRef = useRef<THREE.PointLight>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const ringRefs = useRef<(THREE.LineSegments | null)[]>([]);
  const coreMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const timeRef = useRef(0);
  const currentActiveLerp = useRef(0);

  // Determine which nodes are connected to each node
  const neighborMatrix = useMemo(() => {
    const matrix: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false));
    CONNECTIONS.forEach(([a, b]) => {
      matrix[a][b] = true;
      matrix[b][a] = true;
    });
    return matrix;
  }, []);

  // Procedural Connection Geometry
  const linesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    CONNECTIONS.forEach(([fromIdx, toIdx]) => {
      points.push(new THREE.Vector3(...SYSTEM_MAP_NODES[fromIdx].pos));
      points.push(new THREE.Vector3(...SYSTEM_MAP_NODES[toIdx].pos));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // Connection Shader: Inactive connections are very subtle blue; active connections pulse with luminous cyan
  const lineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActive: { value: 0 },
        uActiveNodePos: { value: new THREE.Vector3(0, 0, -42) },
        uColorDim: { value: new THREE.Color("#0c1c2e") },
        uColorPulse: { value: new THREE.Color("#65D6E8") },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uActive;
        uniform vec3 uActiveNodePos;
        uniform vec3 uColorDim;
        uniform vec3 uColorPulse;
        varying vec3 vWorldPosition;

        void main() {
          // Traveling data pulse along connection bus
          float pulse = sin(length(vWorldPosition.xy) * 3.2 - uTime * 3.8) * 0.5 + 0.5;
          pulse = pow(pulse, 5.0);

          // Proximity to active node
          float dActive = length(vWorldPosition - uActiveNodePos);
          float proximity = exp(-dActive * 0.42);

          // Inactive lines: subtle deep blue (#0c1c2e); active lines: luminous cyan
          vec3 col = mix(uColorDim, uColorPulse, pulse * 0.65 + proximity * 0.75);
          float alpha = (0.16 + pulse * 0.65 + proximity * 0.70) * uActive;

          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Node hierarchy materials created per node for distinct state transitions
  const nodeMaterials = useMemo(() => {
    return SYSTEM_MAP_NODES.map(() => ({
      core: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#181C23"),
        emissive: new THREE.Color("#0A0D12"),
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      }),
      gem: new THREE.MeshBasicMaterial({
        color: new THREE.Color("#4F7CFF"),
      }),
      ring: new THREE.LineBasicMaterial({
        color: new THREE.Color("#2A3B52"),
        transparent: true,
        opacity: 0.6,
      }),
    }));
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    const p = worldState.globalProgress;

    // Active strictly within Skills range (0.220 – 0.425)
    const inSkillsRange = p >= 0.220 && p <= 0.425;
    const skillsActive = inSkillsRange
      ? THREE.MathUtils.smoothstep(p, 0.220, 0.255) * (1.0 - THREE.MathUtils.smoothstep(p, 0.390, 0.425))
      : 0.0;
    currentActiveLerp.current = THREE.MathUtils.lerp(currentActiveLerp.current, skillsActive, Math.min(1, delta * 6));

    if (!groupRef.current) return;

    if (!inSkillsRange || currentActiveLerp.current < 0.01) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.65, 1.0, currentActiveLerp.current));

    const activeIdx = Math.max(0, Math.min(SYSTEM_MAP_NODES.length - 1, worldState.activeSkillIndex ?? 0));
    const activePos = SYSTEM_MAP_NODES[activeIdx]?.pos ?? [0, 1.4, -41.5];

    if (lineMaterial.uniforms) {
      lineMaterial.uniforms.uTime.value = time;
      lineMaterial.uniforms.uActive.value = currentActiveLerp.current;
      lineMaterial.uniforms.uActiveNodePos.value.set(...activePos);
    }

    // Dynamic point light at active node position casting reflected cyan light on nearby architecture
    if (activeLightRef.current) {
      activeLightRef.current.position.set(activePos[0], activePos[1], activePos[2] + 0.6);
      activeLightRef.current.intensity = THREE.MathUtils.lerp(
        activeLightRef.current.intensity,
        1.8 * currentActiveLerp.current,
        delta * 3.5
      );
    }

    // Node Visual Hierarchy Update:
    // Inactive: muted graphite (#181C23)
    // Available (connected to active): cool blue (#4F7CFF)
    // Active: bright cyan (#65D6E8) / soft white (#F2F0EA)
    // Important technical indicators: small amber highlights (#C58B52)
    nodeRefs.current.forEach((nodeGroup, idx) => {
      if (!nodeGroup) return;

      const isActive = idx === activeIdx;
      const isAvailable = neighborMatrix[activeIdx]?.[idx] ?? false;
      const mats = nodeMaterials[idx];

      let targetScale = 0.88;
      if (isActive) {
        targetScale = 1.55;
        // Active node: Bright cyan core with high emissive glow
        mats.core.color.lerp(new THREE.Color("#65D6E8"), delta * 5.0);
        mats.core.emissive.lerp(new THREE.Color("#2078A8"), delta * 5.0);
        mats.core.emissiveIntensity = 1.2;
        mats.gem.color.lerp(new THREE.Color("#F2F0EA"), delta * 5.0); // Soft white inner glint
        mats.ring.color.lerp(new THREE.Color("#88EDF8"), delta * 5.0);
        mats.ring.opacity = 0.95;
      } else if (isAvailable) {
        targetScale = 1.15;
        // Available node: Cool blue with subtle readiness pulse
        mats.core.color.lerp(new THREE.Color("#284B8C"), delta * 4.0);
        mats.core.emissive.lerp(new THREE.Color("#122A58"), delta * 4.0);
        mats.core.emissiveIntensity = 0.5;
        mats.gem.color.lerp(new THREE.Color("#8BB0FF"), delta * 4.0);
        mats.ring.color.lerp(new THREE.Color("#4F7CFF"), delta * 4.0);
        mats.ring.opacity = 0.70;
      } else {
        targetScale = 0.86;
        // Inactive node: Muted graphite slowly returning to neutral state
        mats.core.color.lerp(new THREE.Color("#181C23"), delta * 3.0);
        mats.core.emissive.lerp(new THREE.Color("#0A0D12"), delta * 3.0);
        mats.core.emissiveIntensity = 0.15;
        mats.gem.color.lerp(new THREE.Color("#3A4250"), delta * 3.0);
        mats.ring.color.lerp(new THREE.Color("#222A36"), delta * 3.0);
        mats.ring.opacity = 0.40;
      }

      nodeGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4.5);

      // Spin ring
      const ring = ringRefs.current[idx];
      if (ring) {
        const spinSpeed = isActive ? 1.8 : (isAvailable ? 0.8 : 0.35);
        ring.rotation.z += delta * spinSpeed;
      }
    });

    // Spatial hovering breath
    groupRef.current.position.y = Math.sin(time * 0.4) * 0.06;
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Active Node Illuminator Point Light casting reflected cyan light on architecture */}
      <pointLight
        ref={activeLightRef}
        color="#65D6E8"
        intensity={0}
        distance={14}
        decay={2}
      />

      {/* Interconnecting Procedural Lines */}
      <lineSegments geometry={linesGeometry} material={lineMaterial} />

      {/* 10 Architectural System Nodes with Strict Visual Hierarchy */}
      {SYSTEM_MAP_NODES.map((node, i) => (
        <group
          key={node.id}
          ref={(el) => { nodeRefs.current[i] = el; }}
          position={node.pos}
        >
          {/* Octahedron Node Core */}
          <mesh
            ref={(el) => { coreMeshRefs.current[i] = el; }}
            material={nodeMaterials[i].core}
          >
            <octahedronGeometry args={[0.22, 0]} />
          </mesh>

          {/* Inner Glint Gem */}
          <mesh material={nodeMaterials[i].gem}>
            <octahedronGeometry args={[0.08, 0]} />
          </mesh>

          {/* Concentric Signal Ring */}
          <lineSegments
            ref={(el) => { ringRefs.current[i] = el; }}
            rotation={[0, 0, i * 0.35]}
            material={nodeMaterials[i].ring}
          >
            <ringGeometry args={[0.34, 0.38, 28]} />
          </lineSegments>

          {/* Important Technical Indicators: Small Amber Highlights (#C58B52) on key nodes */}
          {node.hasAmberIndicator && (
            <lineSegments rotation={[Math.PI / 4, 0, i * 0.5]}>
              <ringGeometry args={[0.42, 0.44, 16]} />
              <lineBasicMaterial color="#C58B52" transparent opacity={0.75} />
            </lineSegments>
          )}
        </group>
      ))}
    </group>
  );
}
