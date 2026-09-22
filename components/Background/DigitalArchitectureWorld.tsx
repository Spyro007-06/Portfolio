"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import ArchitecturalCamera from "./ArchitecturalCamera";
import VolumetricLighting from "./VolumetricLighting";
import ArchitecturalChamber from "./ArchitecturalChamber";
import SystemMap3D from "./SystemMap3D";
import AtmosphericDust from "./AtmosphericDust";

export default function DigitalArchitectureWorld() {
  return (
    <div
      className="digital-architecture-world fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, overflow: "hidden" }}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          fov: 42,
          near: 0.1,
          far: 140,
          position: [0, 2.8, 12.0],
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, 1.75]}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        <ArchitecturalCamera />
        <VolumetricLighting />
        <ArchitecturalChamber />
        <SystemMap3D />
        <AtmosphericDust />
      </Canvas>

      {/* Volumetric Depth Atmosphere & Vignette (Restrained 70–80% dark neutral foundation) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(8, 9, 12, 0.45) 75%, rgba(4, 5, 7, 0.85) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8, 9, 12, 0.6) 0%, transparent 20%, transparent 80%, rgba(8, 9, 12, 0.7) 100%)",
        }}
      />
    </div>
  );
}
