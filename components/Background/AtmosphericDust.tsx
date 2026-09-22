"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const DustShader = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aPhase;
    attribute float aScale;
    attribute vec3 aVelocity;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec3 pos = position;

      // Slow organic drift in the architectural chamber
      float t = uTime * aVelocity.z;
      pos.z = mod(pos.z + t + 20.0, 110.0) - 90.0;
      pos.y += sin(uTime * 0.3 + aPhase) * aVelocity.y * 1.5;
      pos.x += cos(uTime * 0.25 + aPhase) * aVelocity.x * 1.5;

      vec4 viewPos = viewMatrix * modelMatrix * vec4(pos, 1.0);

      // Depth-Based Color Separation in Atmosphere:
      // Foreground: cool silver/graphite
      // Midground: electric blue & muted cyan
      // Background: violet & indigo
      // Deep distant horizon: subtle warm champagne & amber
      if (pos.z > -10.0) {
        vColor = vec3(0.60, 0.68, 0.76); // cool silver/graphite
      } else if (pos.z > -50.0) {
        vColor = mix(vec3(0.31, 0.49, 1.0), vec3(0.40, 0.84, 0.91), sin(aPhase) * 0.5 + 0.5);
      } else if (pos.z > -80.0) {
        vColor = mix(vec3(0.47, 0.40, 0.85), vec3(0.20, 0.19, 0.42), cos(aPhase) * 0.5 + 0.5);
      } else {
        vColor = vec3(0.85, 0.72, 0.48); // warm champagne/amber
      }

      // Subtle atmospheric twinkle
      vAlpha = (0.12 + 0.38 * pow(sin(uTime * 1.2 + aPhase) * 0.5 + 0.5, 2.0)) * aScale;

      gl_PointSize = clamp((13.0 * aScale) / -viewPos.z, 1.0, 4.5);
      gl_Position = projectionMatrix * viewPos;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distSq = dot(coord, coord);
      if (distSq > 0.25) discard;

      float radial = smoothstep(0.25, 0.02, distSq);
      gl_FragColor = vec4(vColor, radial * vAlpha * 0.35);
    }
  `,
};

export default function AtmosphericDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 14 - 3;
      positions[i * 3 + 2] = -Math.random() * 95 + 10;

      phases[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.5 + Math.random() * 0.8;

      velocities[i * 3 + 0] = 0.15 + Math.random() * 0.2;
      velocities[i * 3 + 1] = 0.12 + Math.random() * 0.18;
      velocities[i * 3 + 2] = 0.35 + Math.random() * 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(DustShader.uniforms),
      vertexShader: DustShader.vertexShader,
      fragmentShader: DustShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    if (material.uniforms) {
      material.uniforms.uTime.value += delta;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
