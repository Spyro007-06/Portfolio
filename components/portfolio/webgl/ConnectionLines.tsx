"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MAX_LINES       = 900;
const DIST_THRESHOLD  = 0.85;
const MAX_CONN        = 3;

interface ConnectionLinesProps {
  positionBuffer: React.RefObject<Float32Array | null>;
  particleCount: number;
}

export default function ConnectionLines({ positionBuffer, particleCount }: ConnectionLinesProps) {
  const lsRef      = useRef<THREE.LineSegments>(null!);
  const posAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const alphaRef   = useRef<THREE.BufferAttribute | null>(null);

  useEffect(() => {
    if (!lsRef.current) return;

    const positions = new Float32Array(MAX_LINES * 2 * 3);
    const alphas    = new Float32Array(MAX_LINES * 2);

    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    const alphaAttr = new THREE.BufferAttribute(alphas, 1);
    alphaAttr.setUsage(THREE.DynamicDrawUsage);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", posAttr);
    geo.setAttribute("alpha", alphaAttr);
    geo.setDrawRange(0, 0);

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0.7, 0.78, 0.88),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    lsRef.current.geometry = geo;
    lsRef.current.material = mat;
    posAttrRef.current = posAttr;
    alphaRef.current   = alphaAttr;
  }, []);

  useFrame(() => {
    const particles = positionBuffer.current;
    if (!particles || !lsRef.current || !posAttrRef.current) return;

    const geo      = lsRef.current.geometry as THREE.BufferGeometry;
    const posAttr  = posAttrRef.current;
    const posArr   = posAttr.array as Float32Array;
    const dist2Thr = DIST_THRESHOLD * DIST_THRESHOLD;
    let lineCount  = 0;

    for (let i = 0; i < particleCount && lineCount < MAX_LINES; i++) {
      const ix = particles[i * 3];
      const iy = particles[i * 3 + 1];
      const iz = particles[i * 3 + 2];
      let conn = 0;

      for (let j = i + 1; j < particleCount && conn < MAX_CONN && lineCount < MAX_LINES; j++) {
        const dx   = ix - particles[j * 3];
        const dy   = iy - particles[j * 3 + 1];
        const dz   = iz - particles[j * 3 + 2];
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 < dist2Thr) {
          const base = lineCount * 6;
          posArr[base]     = ix;
          posArr[base + 1] = iy;
          posArr[base + 2] = iz;
          posArr[base + 3] = particles[j * 3];
          posArr[base + 4] = particles[j * 3 + 1];
          posArr[base + 5] = particles[j * 3 + 2];
          lineCount++;
          conn++;
        }
      }
    }

    posAttr.needsUpdate = true;
    geo.setDrawRange(0, lineCount * 2);
  });

  return <lineSegments ref={lsRef} />;
}