"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "@/lib/animation/sceneState";
import { lerp } from "@/lib/animation/interpolation";

export default function ArchitectureCube() {
  const groupRef  = useRef<THREE.Group>(null!);
  const outerRef  = useRef<THREE.Mesh>(null!);
  const middleRef = useRef<THREE.Mesh>(null!);
  const innerRef  = useRef<THREE.Mesh>(null!);
  const scaleRef  = useRef(0);
  const sepRef    = useRef(0);

  useFrame((_, delta) => {
    const isWork = worldState.scene === "WORK";
    scaleRef.current = lerp(scaleRef.current, isWork ? 1 : 0, 0.05);

    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(scaleRef.current);

    if (scaleRef.current > 0.01) {
      // Calculate layer separation based on scene scroll progress
      const progress = worldState.sceneProgress;
      const targetSep = Math.sin(progress * Math.PI) * 0.45;
      sepRef.current = lerp(sepRef.current, targetSep, 0.08);

      const sep = sepRef.current;

      if (!worldState.reducedMotion) {
        if (outerRef.current) {
          outerRef.current.rotation.y += delta * 0.2;
          outerRef.current.rotation.x = Math.sin(progress * Math.PI * 2) * 0.15;
          outerRef.current.position.x = sep * 0.5;
          outerRef.current.position.y = sep * 0.3;
        }
        if (middleRef.current) {
          middleRef.current.rotation.y -= delta * 0.32;
          middleRef.current.rotation.z += delta * 0.12;
          middleRef.current.position.x = -sep * 0.3;
          middleRef.current.position.y = -sep * 0.2;
        }
        if (innerRef.current) {
          innerRef.current.rotation.y += delta * 0.5;
          innerRef.current.rotation.x += delta * 0.3;
          innerRef.current.position.z = sep * 0.4;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[2.6, 0.2, -2.8]} scale={0}>
      {/* Outer — Security Layer */}
      <mesh ref={outerRef}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshBasicMaterial color="#4A9EFF" wireframe transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {/* Middle — Architecture Layer */}
      <mesh ref={middleRef}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshBasicMaterial color="#6AB5FF" wireframe transparent opacity={0.24} depthWrite={false} />
      </mesh>

      {/* Inner — Performance Layer */}
      <mesh ref={innerRef}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial color="#99D5FF" wireframe transparent opacity={0.38} depthWrite={false} />
      </mesh>

      <pointLight color="#4A9EFF" intensity={0.4} distance={6} decay={2} />
    </group>
  );
}