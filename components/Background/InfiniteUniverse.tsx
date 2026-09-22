"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import CinematicDroneCamera from "./CinematicDroneCamera";
import TopographicalWaveField from "./TopographicalWaveField";
import SynapticPointStream from "./SynapticPointStream";
import FloatingAtmosphere from "./FloatingAtmosphere";

export default function InfiniteUniverse() {
  return (
    <div
      className="infinite-universe-container fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, overflow: "hidden" }}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          fov: 42,
          near: 0.1,
          far: 50,
          position: [0, 2.2, 5.0],
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 1.75]}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        <CinematicDroneCamera />
        <ambientLight intensity={0.15} color="#030508" />
        <directionalLight
          position={[-6, 8, -4]}
          intensity={0.85}
          color="#3a7fd5"
        />
        <directionalLight
          position={[6, 5, 6]}
          intensity={0.25}
          color="#4fe3ff"
        />

        <TopographicalWaveField />
        <SynapticPointStream />
        <FloatingAtmosphere />
      </Canvas>

      {/* Subtle top edge gradient to keep header navigation calm & pristine */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3, 6, 7, 0.75) 0%, rgba(3, 6, 7, 0.2) 22%, transparent 45%, rgba(3, 6, 7, 0.4) 100%)",
        }}
      />
    </div>
  );
}
