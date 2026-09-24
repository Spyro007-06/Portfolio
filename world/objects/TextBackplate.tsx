"use client";

// TextBackplate: an architectural, cinematic contrast plate.
// Provides localized background dimming, subtle edge contrast, and a soft dark gradient
// behind typography without generic glassmorphism cards. Ensures text glyphs pop with
// pristine contrast even against complex 3D environments, lights, or moving machinery.

import Edges from "./Edges";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace } from "three";
import { useArrival } from "./arrival";

type Props = {
  w: number;
  h: number;
  at?: number;
  until?: number;
  depth?: number;
  accentColor?: string;
  edgeOpacity?: number;
  vignette?: boolean;
  opacity?: number;
  position?: [number, number, number];
};

export default function TextBackplate({
  w,
  h,
  at,
  until,
  depth = 0.12,
  accentColor = "#f1eadb",
  edgeOpacity = 0.16,
  vignette = true,
  opacity = 0.88,
  position = [0, 0, 0],
}: Props) {
  const meshRef = useRef<Mesh>(null);
  const shown = useArrival(at, until);

  // Soft localized vignette texture to avoid harsh rectangular cuts
  const vignetteTex = useMemo(() => {
    if (!vignette || typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
    grad.addColorStop(0, "rgba(9, 10, 13, 0.95)");
    grad.addColorStop(0.65, "rgba(9, 10, 13, 0.85)");
    grad.addColorStop(1, "rgba(7, 8, 10, 0.5)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [vignette]);

  const mat = useMemo(() => {
    if (vignetteTex) {
      return new MeshBasicMaterial({
        map: vignetteTex,
        transparent: true,
        opacity: opacity,
        side: DoubleSide,
        depthWrite: false,
        fog: false,
      });
    }
    return new MeshStandardMaterial({
      color: "#090a0d",
      roughness: 0.92,
      metalness: 0.05,
      transparent: true,
      opacity: opacity,
      side: DoubleSide,
      depthWrite: false,
    });
  }, [vignetteTex, opacity]);

  useFrame(() => {
    const s = shown.get();
    if (meshRef.current) {
      meshRef.current.visible = s > 0.001;
      mat.opacity = s * opacity;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} material={mat}>
        <boxGeometry args={[w, h, depth]} />
        <Edges threshold={15} color={accentColor} transparent opacity={edgeOpacity} />
      </mesh>
    </group>
  );
}
