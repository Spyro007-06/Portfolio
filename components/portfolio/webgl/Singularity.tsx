"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "@/lib/animation/sceneState";
import { lerp } from "@/lib/animation/interpolation";

interface Ring {
  mesh: THREE.Mesh | null;
  radius: number;
  speed: number;
  axis: THREE.Vector3;
  opacity: number;
}

export default function Singularity() {
  const groupRef  = useRef<THREE.Group>(null!);
  const scaleRef  = useRef(0);
  const ring1Ref  = useRef<THREE.Mesh>(null!);
  const ring2Ref  = useRef<THREE.Mesh>(null!);
  const ring3Ref  = useRef<THREE.Mesh>(null!);
  const lightRef  = useRef<THREE.PointLight>(null!);

  const rings: Ring[] = [
    { mesh: null, radius: 0.38, speed: 0.4,  axis: new THREE.Vector3(0, 1, 0),           opacity: 0.55 },
    { mesh: null, radius: 0.72, speed: -0.25, axis: new THREE.Vector3(0.5, 0.87, 0),      opacity: 0.35 },
    { mesh: null, radius: 1.25, speed: 0.15, axis: new THREE.Vector3(0.3, 0.5, 0.81),    opacity: 0.20 },
  ];

  useFrame(({ clock }) => {
    const t         = clock.getElapsedTime();
    const isContact = worldState.scene === 'CONTACT';
    const targetScale = isContact ? 1.0 : 0.0;
    scaleRef.current  = lerp(scaleRef.current, targetScale, 0.025);

    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(scaleRef.current);

    // Rotate rings independently
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * rings[0].speed;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * rings[1].speed;
      ring2Ref.current.rotation.x = t * 0.1;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * rings[2].speed;
      ring3Ref.current.rotation.x = t * 0.07;
    }

    // Subtle light pulse
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + Math.sin(t * 2.1) * 0.1;
    }
  });

  const ringGeo = (r: number) => new THREE.TorusGeometry(r, 0.004, 6, 80);

  return (
    <group ref={groupRef} scale={0}>
      {/* Central glow */}
      <pointLight ref={lightRef} color="#4A9EFF" intensity={0.3} distance={4} />
      <mesh>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#4A9EFF" />
      </mesh>

      {/* Ring 1 — inner */}
      <mesh ref={ring1Ref} geometry={ringGeo(rings[0].radius)}>
        <meshBasicMaterial color="#6AB5FF" transparent opacity={rings[0].opacity} depthWrite={false} />
      </mesh>

      {/* Ring 2 — middle */}
      <mesh ref={ring2Ref} geometry={ringGeo(rings[1].radius)}>
        <meshBasicMaterial color="#4A9EFF" transparent opacity={rings[1].opacity} depthWrite={false} />
      </mesh>

      {/* Ring 3 — outer */}
      <mesh ref={ring3Ref} geometry={ringGeo(rings[2].radius)}>
        <meshBasicMaterial color="#2A6ECC" transparent opacity={rings[2].opacity} depthWrite={false} />
      </mesh>
    </group>
  );
}