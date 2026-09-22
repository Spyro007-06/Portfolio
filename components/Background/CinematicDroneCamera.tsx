"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

interface Waypoint {
  p: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
  roll: number;
}

const WAYPOINTS: Waypoint[] = [
  { p: 0.00, pos: [0.0, 2.2, 5.0], lookAt: [0.0, 0.2, -15.0], roll: 0.00 },
  { p: 0.14, pos: [1.2, 1.8, 3.5], lookAt: [0.3, -0.1, -15.0], roll: 0.015 },
  { p: 0.35, pos: [-2.0, 2.4, 4.0], lookAt: [-0.4, 0.1, -15.0], roll: -0.015 },
  { p: 0.50, pos: [0.0, 2.8, 4.5], lookAt: [0.0, -0.2, -15.0], roll: 0.00 },
  { p: 0.65, pos: [1.8, 1.6, 3.0], lookAt: [0.2, -0.3, -15.0], roll: 0.02 },
  { p: 0.78, pos: [-1.4, 2.0, 3.8], lookAt: [-0.2, -0.1, -15.0], roll: -0.015 },
  { p: 0.90, pos: [1.0, 2.5, 4.2], lookAt: [0.0, 0.0, -15.0], roll: 0.01 },
  { p: 1.00, pos: [0.0, 3.0, 5.5], lookAt: [0.0, 0.1, -15.0], roll: 0.00 },
];

function sampleTrajectory(progress: number) {
  const p = Math.max(0, Math.min(1, progress));

  let i = 0;
  while (i < WAYPOINTS.length - 1 && WAYPOINTS[i + 1].p < p) {
    i++;
  }

  const w1 = WAYPOINTS[i];
  const w2 = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)];

  const span = w2.p - w1.p;
  const t = span <= 0 ? 0 : (p - w1.p) / span;

  // Smooth quintic ease-in-out
  const ease = t * t * t * (t * (t * 6 - 15) + 10);

  const pos = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...w1.pos),
    new THREE.Vector3(...w2.pos),
    ease
  );

  const lookAt = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...w1.lookAt),
    new THREE.Vector3(...w2.lookAt),
    ease
  );

  const roll = THREE.MathUtils.lerp(w1.roll, w2.roll, ease);

  return { pos, lookAt, roll };
}

export default function CinematicDroneCamera() {
  const { camera } = useThree();

  const currentPos = useRef(new THREE.Vector3(0, 2.2, 5.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.2, -15.0));
  const smoothProgress = useRef(0);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;

    // Smoothly damp global progress for weightless momentum
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      worldState.globalProgress,
      3.2,
      delta
    );

    const { pos: targetPos, lookAt: targetLookAt, roll: targetRoll } =
      sampleTrajectory(smoothProgress.current);

    // Subtle autonomous breathing flight
    const breathX = Math.sin(time * 0.16) * 0.15;
    const breathY = Math.cos(time * 0.20) * 0.08;

    // Gentle cursor parallax
    const mouseX = worldState.mouseX * 0.35;
    const mouseY = worldState.mouseY * 0.22;

    const finalTargetPos = targetPos.clone().add(
      new THREE.Vector3(breathX + mouseX, breathY - mouseY, 0)
    );

    const finalTargetLookAt = targetLookAt.clone().add(
      new THREE.Vector3(mouseX * 0.2, -mouseY * 0.15, 0)
    );

    currentPos.current.lerp(finalTargetPos, Math.min(1, delta * 3.5));
    currentLookAt.current.lerp(finalTargetLookAt, Math.min(1, delta * 3.5));

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    camera.rotation.z = targetRoll + Math.sin(time * 0.12) * 0.004;

    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      const targetFov = 42 + Math.min(6, Math.abs(worldState.scrollVelocity) * 2.5);
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, delta * 2.5);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
}
