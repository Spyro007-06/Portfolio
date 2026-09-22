"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "@/lib/animation/sceneState";
import { lerp } from "@/lib/animation/interpolation";

interface TechNodeData {
  label: string;
  orbitRadius: number;
  speed: number;
  offset: number;
  yScale: number;
  color: string;
}

const TECH_NODES: TechNodeData[] = [
  { label: "React",       orbitRadius: 1.1, speed: 0.25, offset: 0.0, yScale: 0.35, color: "#61DAFB" },
  { label: "Next.js",     orbitRadius: 1.5, speed: -0.18,offset: 1.2, yScale: 0.45, color: "#FFFFFF" },
  { label: "TypeScript",  orbitRadius: 1.2, speed: 0.22, offset: 2.4, yScale: 0.3,  color: "#3178C6" },
  { label: "AI / LLMs",   orbitRadius: 1.8, speed: -0.15,offset: 3.6, yScale: 0.5,  color: "#4A9EFF" },
  { label: "Three.js",    orbitRadius: 1.4, speed: 0.19, offset: 4.8, yScale: 0.4,  color: "#7EE787" },
  { label: "Python",      orbitRadius: 1.6, speed: -0.21,offset: 5.7, yScale: 0.38, color: "#FFD43B" },
];

export default function TechConstellation() {
  const groupRef      = useRef<THREE.Group>(null!);
  const lineGeoRef    = useRef<THREE.BufferGeometry>(null!);
  const scaleRef      = useRef(0);
  const nodeMeshes    = useRef<(THREE.Mesh | null)[]>([]);

  // Preallocate line buffer: center to each node + ring segments (6 lines * 2 vertices * 3 floats = 36 floats)
  const linePositions = useMemo(() => new Float32Array((TECH_NODES.length + TECH_NODES.length) * 2 * 3), []);

  useFrame(({ clock }, delta) => {
    const isSkills = worldState.scene === "SKILLS";
    scaleRef.current = lerp(scaleRef.current, isSkills ? 1 : 0, 0.05);

    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(scaleRef.current);

    if (scaleRef.current < 0.01) return;

    const t = clock.getElapsedTime();
    const mx = worldState.mouseX * 0.5;
    const my = -worldState.mouseY * 0.3;

    // Center is (0, 0, 0)
    let lineIdx = 0;

    TECH_NODES.forEach((node, i) => {
      const mesh = nodeMeshes.current[i];
      if (!mesh) return;

      const angle = t * node.speed * 0.3 + node.offset;
      // Calculate target with gentle spring towards mouse
      const targetX = Math.cos(angle) * node.orbitRadius + mx * 0.2;
      const targetY = Math.sin(angle) * node.orbitRadius * node.yScale + my * 0.2;
      const targetZ = Math.sin(angle * 0.8) * 0.3;

      mesh.position.x = lerp(mesh.position.x, targetX, 0.08);
      mesh.position.y = lerp(mesh.position.y, targetY, 0.08);
      mesh.position.z = lerp(mesh.position.z, targetZ, 0.08);

      // Line from center (0,0,0) to node
      const p = linePositions;
      p[lineIdx++] = 0;
      p[lineIdx++] = 0;
      p[lineIdx++] = 0;
      p[lineIdx++] = mesh.position.x;
      p[lineIdx++] = mesh.position.y;
      p[lineIdx++] = mesh.position.z;

      // Line to next node in ring
      const nextIdx = (i + 1) % TECH_NODES.length;
      const nextMesh = nodeMeshes.current[nextIdx];
      if (nextMesh) {
        p[lineIdx++] = mesh.position.x;
        p[lineIdx++] = mesh.position.y;
        p[lineIdx++] = mesh.position.z;
        p[lineIdx++] = nextMesh.position.x;
        p[lineIdx++] = nextMesh.position.y;
        p[lineIdx++] = nextMesh.position.z;
      }
    });

    if (lineGeoRef.current) {
      const posAttr = lineGeoRef.current.getAttribute("position") as THREE.BufferAttribute;
      if (posAttr) {
        posAttr.needsUpdate = true;
      }
    }
  });

  // Set up geometry imperatively in useEffect for R3F v9 compatibility
  useEffect(() => {
    if (!lineGeoRef.current) return;
    const attr = new THREE.BufferAttribute(linePositions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    lineGeoRef.current.setAttribute("position", attr);
  }, [linePositions]);

  const isSkills = worldState.scene === "SKILLS";
  if (!isSkills && scaleRef.current < 0.05) return null;

  return (
    <group ref={groupRef} position={[-1.2, 0.1, -1.8]} scale={0}>
      {/* Center T Monogram Node - Core sphere with glowing outer ring */}
      <group>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#4A9EFF" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.12, 24]} />
          <meshBasicMaterial color="#4A9EFF" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Dynamic Connecting Lines */}
      <lineSegments>
        <bufferGeometry ref={lineGeoRef} />
        <lineBasicMaterial
          color="#4A9EFF"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Orbiting Technology Nodes */}
      {TECH_NODES.map((node, i) => (
        <mesh
          key={node.label}
          ref={(el) => { nodeMeshes.current[i] = el; }}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={node.color} />
        </mesh>
      ))}

      {/* Center Point Light */}
      <pointLight color="#4A9EFF" intensity={0.4} distance={4} decay={2} />
    </group>
  );
}