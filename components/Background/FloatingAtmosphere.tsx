"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const EmberShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#6bb8ff") },
    uGlint: { value: new THREE.Color("#dcf2ff") },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aPhase;
    attribute float aScale;
    attribute vec3 aVelocity;

    varying float vAlpha;

    void main() {
      vec3 pos = position;

      // Gentle continuous vertical buoyancy with organic looping
      float t = uTime * aVelocity.y;
      pos.y = mod(pos.y + t + 10.0, 24.0) - 10.0;

      // Gentle horizontal drift
      pos.x += sin(uTime * 0.4 + aPhase) * aVelocity.x * 2.0;
      pos.z += cos(uTime * 0.35 + aPhase) * aVelocity.z * 2.0;

      vec4 viewPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
      
      // Soft twinkle cycle
      vAlpha = (0.2 + 0.8 * pow(sin(uTime * 1.8 + aPhase) * 0.5 + 0.5, 3.0)) * aScale;

      gl_PointSize = (18.0 * aScale) / -viewPosition.z;
      gl_PointSize = clamp(gl_PointSize, 1.5, 9.0);

      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uGlint;
    varying float vAlpha;

    void main() {
      // Soft Gaussian bokeh particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distSq = dot(coord, coord);
      if (distSq > 0.25) discard;

      float radial = smoothstep(0.25, 0.01, distSq);
      vec3 col = mix(uColor, uGlint, smoothstep(0.1, 0.0, distSq));

      gl_FragColor = vec4(col, radial * vAlpha * 0.4);
    }
  `,
};

export default function FloatingAtmosphere() {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = -Math.random() * 25 + 5;

      phases[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.4 + Math.random() * 0.8;

      velocities[i * 3 + 0] = 0.2 + Math.random() * 0.3; // drift X
      velocities[i * 3 + 1] = 0.3 + Math.random() * 0.4; // drift Y (upward)
      velocities[i * 3 + 2] = 0.15 + Math.random() * 0.25; // drift Z
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(EmberShader.uniforms),
      vertexShader: EmberShader.vertexShader,
      fragmentShader: EmberShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
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
