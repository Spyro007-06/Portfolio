"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { worldState, detectQuality } from "@/lib/animation/sceneState";
import { damp } from "@/lib/animation/interpolation";
import ParticleField, { type ParticleFieldHandle } from "./ParticleField";
import ConnectionLines from "./ConnectionLines";
import Terrain from "./Terrain";
import ArchitectureCube from "./ArchitectureCube";
import TechConstellation from "./TechConstellation";
import Singularity from "./Singularity";

function CameraController() {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const targetX = worldState.mouseX * 0.8;
    const targetY = -worldState.mouseY * 0.5;
    const isContact = worldState.scene === "CONTACT";
    // Climax camera push: slowly zoom into singularity at the end of the journey
    const targetZ = isContact ? 2.6 : (5.0 + worldState.globalProgress * -1.6);
    camera.position.x = damp(camera.position.x, targetX, 3, delta);
    camera.position.y = damp(camera.position.y, targetY, 3, delta);
    camera.position.z = damp(camera.position.z, targetZ, 1.8, delta);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ count }: { count: number }) {
  const particleRef  = useRef<ParticleFieldHandle>(null);
  const sharedBuffer = useRef<Float32Array | null>(null);

  return (
    <>
      <CameraController />
      <ParticleField
        ref={particleRef}
        count={count}
        onPositionsReady={(buf) => { sharedBuffer.current = buf; }}
      />
      <ConnectionLines positionBuffer={sharedBuffer} particleCount={count} />
      <Terrain />
      <ArchitectureCube />
      <TechConstellation />
      <Singularity />
    </>
  );
}

export default function WorldCanvas() {
  const [count, setCount] = useState(350);
  const [dpr, setDpr] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    detectQuality();
    setCount(worldState.particleCount);
    const maxDpr = worldState.quality === 'LOW' ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
    setDpr([1, maxDpr]);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
        dpr={dpr}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene count={count} />
        </Suspense>
      </Canvas>
    </div>
  );
}