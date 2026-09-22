"use client";

import { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noise3D } from "@/lib/webgl/noise";
import { worldState } from "@/lib/animation/sceneState";
import { MORPH_TARGETS } from "@/lib/webgl/particles";
import { lerp } from "@/lib/animation/interpolation";

const LERP_SPEED   = 0.018;
const NOISE_AMP    = 0.012;
const NOISE_FREQ   = 0.25;
const NOISE_TIME   = 0.06;
const MOUSE_RADIUS = 1.4;
const MOUSE_FORCE  = 0.008;

export interface ParticleFieldHandle {
  positionBuffer: Float32Array;
}

interface ParticleFieldProps {
  count: number;
  onPositionsReady?: (buf: Float32Array) => void;
}

const ParticleField = forwardRef<ParticleFieldHandle, ParticleFieldProps>(
  function ParticleField({ count, onPositionsReady }, ref) {
    const geoRef      = useRef<THREE.BufferGeometry>(null!);
    const matRef      = useRef<THREE.PointsMaterial>(null!);

    // Build all morph targets once
    const morphTargets = useMemo(
      () => MORPH_TARGETS.map((gen) => gen(count)),
      [count]
    );

    // Working lerp buffer (current animated positions)
    const currentPos = useMemo(() => {
      const arr = new Float32Array(count * 3);
      arr.set(morphTargets[0]);
      return arr;
    }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

    // Velocity buffer for mouse spring-back
    const velocities = useMemo(() => new Float32Array(count * 3), [count]);

    // Rendered output buffer (shared with ConnectionLines)
    const renderedPos = useMemo(() => new Float32Array(count * 3), [count]);

    // Per-particle noise offsets for organic variation
    const noiseOffsets = useMemo(() => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) arr[i] = Math.random() * 100;
      return arr;
    }, [count]);

    // Colors — low-opacity off-white / cool gray
    const colors = useMemo(() => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const isAccent = Math.random() < 0.08; // 8% chance of blue accent
        if (isAccent) {
          arr[i * 3]     = 0.29; // #4A9EFF → r=74/255
          arr[i * 3 + 1] = 0.62; // g=158/255
          arr[i * 3 + 2] = 1.0;  // b=255/255
        } else {
          const v        = 0.65 + Math.random() * 0.25;
          arr[i * 3]     = v;
          arr[i * 3 + 1] = v;
          arr[i * 3 + 2] = v;
        }
      }
      return arr;
    }, [count]);

    // Sizes — varied per particle
    const sizes = useMemo(() => {
      const arr = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        arr[i] = 0.025 + Math.random() * 0.045;
      }
      return arr;
    }, [count]);

    useImperativeHandle(ref, () => ({ positionBuffer: renderedPos }), [renderedPos]);

    // Set up geometry imperatively (R3F v9 compatible)
    useEffect(() => {
      const geo = geoRef.current;
      if (!geo) return;

      const posAttr = new THREE.BufferAttribute(renderedPos, 3);
      posAttr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute("position", posAttr);
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      onPositionsReady?.(renderedPos);
    }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

    useFrame(({ clock }) => {
      const geo = geoRef.current;
      if (!geo) return;
      const posAttr = geo.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!posAttr) return;

      const t         = clock.getElapsedTime();
      const target    = morphTargets[Math.min(worldState.particleTarget, MORPH_TARGETS.length - 1)];
      const out       = posAttr.array as Float32Array;
      const mx        = worldState.mouseX * 2.5;
      const my        = -worldState.mouseY * 1.8;
      const velScale  = worldState.reducedMotion ? 0 : 1;
      const turbulence = Math.abs(worldState.scrollVelocity) * 0.03 * velScale;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Lerp toward morph target
        currentPos[i3]     = lerp(currentPos[i3],     target[i3],     LERP_SPEED);
        currentPos[i3 + 1] = lerp(currentPos[i3 + 1], target[i3 + 1], LERP_SPEED);
        currentPos[i3 + 2] = lerp(currentPos[i3 + 2], target[i3 + 2], LERP_SPEED);

        if (!worldState.reducedMotion) {
          // Simplex noise drift
          const nx = noise3D(
            currentPos[i3]     * NOISE_FREQ + noiseOffsets[i3],
            currentPos[i3 + 1] * NOISE_FREQ + noiseOffsets[i3 + 1],
            t * NOISE_TIME
          );
          const ny = noise3D(
            currentPos[i3 + 1] * NOISE_FREQ + noiseOffsets[i3 + 1] + 50,
            currentPos[i3 + 2] * NOISE_FREQ + noiseOffsets[i3 + 2],
            t * NOISE_TIME + 3
          );
          const nz = noise3D(
            currentPos[i3 + 2] * NOISE_FREQ + noiseOffsets[i3 + 2] + 100,
            currentPos[i3]     * NOISE_FREQ,
            t * NOISE_TIME + 6
          );

          // Mouse force field
          const dx = currentPos[i3]     - mx;
          const dy = currentPos[i3 + 1] - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let fx = 0, fy = 0;
          if (dist < MOUSE_RADIUS && dist > 0.001) {
            const force = (1 - dist / MOUSE_RADIUS) * (1 - dist / MOUSE_RADIUS);
            fx = (dx / dist) * force * MOUSE_FORCE;
            fy = (dy / dist) * force * MOUSE_FORCE;
          }

          // Spring back to current position
          velocities[i3]     = velocities[i3]     * 0.85 + fx;
          velocities[i3 + 1] = velocities[i3 + 1] * 0.85 + fy;
          velocities[i3 + 2] = velocities[i3 + 2] * 0.85;

          out[i3]     = currentPos[i3]     + nx * (NOISE_AMP + turbulence) + velocities[i3];
          out[i3 + 1] = currentPos[i3 + 1] + ny * (NOISE_AMP + turbulence) + velocities[i3 + 1];
          out[i3 + 2] = currentPos[i3 + 2] + nz * NOISE_AMP * 0.5         + velocities[i3 + 2];
        } else {
          out[i3]     = currentPos[i3];
          out[i3 + 1] = currentPos[i3 + 1];
          out[i3 + 2] = currentPos[i3 + 2];
        }
      }

      // Keep renderedPos in sync (for ConnectionLines)
      renderedPos.set(out);
      posAttr.needsUpdate = true;
    });

    return (
      <points>
        <bufferGeometry ref={geoRef} />
        <pointsMaterial
          ref={matRef}
          size={0.04}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    );
  }
);

export default ParticleField;