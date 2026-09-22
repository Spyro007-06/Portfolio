"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";
import { SYSTEM_MAP_NODES } from "./SystemMap3D";

interface Waypoint {
  p: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
  roll: number;
}

// Aligned with exact measured section layout:
// Hero: 0.000–0.118 · About: 0.118–0.227 · Skills: 0.227–0.426 · Work: 0.426–0.735 · Experience: 0.735–0.972 · Contact: 0.972–1.000
const WAYPOINTS: Waypoint[] = [
  // 1. Hero: The Digital Chamber Establishing View (approx 12m away)
  { p: 0.000, pos: [0.0, 2.8, 12.0],  lookAt: [0.0, 2.0, -10.0], roll: 0.000 },
  // 2. Hero Dolly Forward during first 100vh
  { p: 0.060, pos: [0.0, 2.5, 4.0],   lookAt: [0.0, 2.0, -16.0], roll: 0.000 },
  // 3. Passing through Portal Frame into About "The Archive"
  { p: 0.118, pos: [0.0, 2.3, -4.0],  lookAt: [0.0, 1.9, -24.0], roll: 0.000 },
  // 4. About: Subtle Lateral Tracking through Data Depth Planes
  { p: 0.160, pos: [0.6, 2.2, -14.0], lookAt: [-0.2, 1.8, -30.0], roll: 0.008 },
  { p: 0.220, pos: [-0.5, 2.0, -24.0], lookAt: [0.2, 1.6, -38.0], roll: -0.008 },
  // 5. Skills: System Map Overview (Section 10 & 11)
  { p: 0.245, pos: [0.0, 2.2, -33.5],  lookAt: [0.0, 1.3, -42.5], roll: 0.000 },
  { p: 0.320, pos: [-0.8, 1.8, -36.5], lookAt: [-0.8, 1.2, -43.0], roll: -0.010 },
  { p: 0.390, pos: [0.8, 1.8, -37.0],  lookAt: [0.9, 1.3, -43.5], roll: 0.010 },
  // 6. Transition out of Skills into Showcase Gallery Corridor
  { p: 0.426, pos: [0.0, 2.2, -44.0],  lookAt: [0.0, 1.8, -58.0], roll: 0.000 },
  // 7. Projects: Showcase Gallery Corridors (Section 12, 13, 14)
  { p: 0.510, pos: [1.2, 2.2, -50.0],  lookAt: [-0.4, 1.8, -65.0], roll: 0.008 },
  { p: 0.600, pos: [-1.0, 2.0, -56.0], lookAt: [0.3, 1.7, -70.0], roll: -0.008 },
  { p: 0.690, pos: [0.8, 2.1, -62.0],  lookAt: [-0.2, 1.6, -76.0], roll: 0.006 },
  // 8. Experience: Timeline Engine Horizontal Rails (Section 15)
  // Perfectly centered corridor perspective, grounded guide rails beneath timeline
  { p: 0.760, pos: [0.0, 2.6, -68.0],  lookAt: [0.0, 1.6, -84.0], roll: 0.000 },
  { p: 0.860, pos: [0.0, 2.4, -76.0],  lookAt: [0.0, 1.6, -90.0], roll: 0.000 },
  { p: 0.940, pos: [0.0, 2.2, -82.0],  lookAt: [0.0, 1.6, -94.0], roll: 0.000 },
  // 9. Contact: Approaching The Exit Threshold (Section 19 - empty horizon)
  { p: 0.972, pos: [0.0, 2.0, -84.0],  lookAt: [0.0, 1.5, -94.0], roll: 0.000 },
  // 10. Final Callback: Grand Reverse Pull-back revealing entire chamber (Section 20)
  { p: 1.000, pos: [0.0, 8.5, -42.0],  lookAt: [0.0, 1.5, -88.0], roll: 0.000 },
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

  // Smooth quintic ease-in-out for controlled cinematic movement
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

export default function ArchitecturalCamera() {
  const { camera } = useThree();

  const currentPos = useRef(new THREE.Vector3(0, 2.8, 12.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, -10.0));
  const smoothProgress = useRef(0);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    // Accessibility: Respect prefers-reduced-motion (Section 29)
    if (worldState.reducedMotion) {
      camera.position.set(0, 2.8, 12.0);
      camera.lookAt(0, 2.0, -10.0);
      camera.rotation.z = 0;
      if ("fov" in camera) {
        (camera as THREE.PerspectiveCamera).fov = 42;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
      return;
    }

    timeRef.current += delta;
    const time = timeRef.current;

    // Smoothly damp global progress for fluid scroll reaction
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      worldState.globalProgress,
      3.2,
      delta
    );

    const { pos: targetPos, lookAt: targetLookAt, roll: targetRoll } =
      sampleTrajectory(smoothProgress.current);

    // Dynamic Camera Navigation towards active System Map node during Skills section (Requirement 11)
    const p = smoothProgress.current;
    if (p >= 0.220 && p <= 0.430) {
      const activeIdx = Math.max(0, Math.min(SYSTEM_MAP_NODES.length - 1, worldState.activeSkillIndex ?? 0));
      const nodePos = SYSTEM_MAP_NODES[activeIdx]?.pos ?? [0, 1.4, -41.5];
      const skillsFactor = Math.sin(
        THREE.MathUtils.clamp((p - 0.220) / (0.430 - 0.220), 0, 1) * Math.PI
      );
      targetPos.x += (nodePos[0] * 0.35) * skillsFactor;
      targetPos.y += ((nodePos[1] - 1.4) * 0.3) * skillsFactor;
      targetLookAt.x += (nodePos[0] * 0.75) * skillsFactor;
      targetLookAt.y += ((nodePos[1] - 1.4) * 0.6) * skillsFactor;
    }

    // Subtle autonomous hovering breath (0.15 Hz micro-drift)
    const breathX = Math.sin(time * 0.15) * 0.05;
    const breathY = Math.cos(time * 0.18) * 0.04;

    // Controlled cursor parallax (Section 16 & 23: rotation stays under 3 degrees)
    const mouseX = worldState.mouseX * 0.22;
    const mouseY = worldState.mouseY * 0.14;

    const finalTargetPos = targetPos.clone().add(
      new THREE.Vector3(breathX + mouseX, breathY - mouseY, 0)
    );

    const finalTargetLookAt = targetLookAt.clone().add(
      new THREE.Vector3(mouseX * 0.12, -mouseY * 0.08, 0)
    );

    currentPos.current.lerp(finalTargetPos, Math.min(1, delta * 3.5));
    currentLookAt.current.lerp(finalTargetLookAt, Math.min(1, delta * 3.5));

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // Controlled camera roll under 3 degrees (0.052 rad)
    camera.rotation.z = THREE.MathUtils.clamp(
      targetRoll + Math.sin(time * 0.12) * 0.002,
      -0.035,
      0.035
    );

    // 35mm-equivalent lens (~42 deg FOV) with subtle velocity widening (Section 17 & 23)
    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      const targetFov = 42 + Math.min(4.0, Math.abs(worldState.scrollVelocity) * 2.0);
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, delta * 2.5);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
}
