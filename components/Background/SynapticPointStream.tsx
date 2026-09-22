"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

const PointStreamShader = {
  uniforms: {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uVelocity: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorCore: { value: new THREE.Color("#3e88e8") },
    uColorGlint: { value: new THREE.Color("#a6f0ff") },
    uFogDensity: { value: 0.045 },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform vec2 uMouse;

    attribute float aPhase;
    attribute float aScale;
    attribute float aSpeed;

    varying vec3 vWorldPosition;
    varying float vElevation;
    varying float vAlpha;
    varying float vDist;

    // Simplex 3D noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    void main() {
      vec3 pos = position;

      float t = uTime * (0.08 + aSpeed * 0.04);
      vec3 p = pos * 0.065;

      float elevation = snoise(vec3(p.x * 0.8, p.y - t * 0.6, t * 0.25)) * 1.55;
      elevation += snoise(vec3(p.x * 1.6 + t * 0.15, p.y * 1.5 - t * 0.4, t * 0.35)) * 0.65;
      elevation += snoise(vec3(p.x * 3.4, p.y * 3.2 + t * 0.5, t * 0.6)) * 0.2;

      float scrollWave = sin(pos.x * 0.12 + uScroll * 6.28) * cos(pos.y * 0.10 + uScroll * 4.2);
      elevation += scrollWave * 0.35 * (0.3 + 0.7 * sin(uScroll * 3.1415));

      // Displace slightly above wave surface
      pos.z += elevation + 0.04;

      vElevation = elevation;

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 viewPosition = viewMatrix * worldPosition;
      vDist = length(viewPosition.xyz);

      // Distance attenuation & subtle scale
      float baseSize = 2.0 * aScale;
      gl_PointSize = baseSize * (22.0 / -viewPosition.z);
      gl_PointSize = clamp(gl_PointSize, 1.0, 4.5);

      // Point visibility strictly on wave crests
      float crestGlow = smoothstep(-0.2, 1.6, elevation);
      vAlpha = crestGlow * (0.4 + 0.6 * sin(aPhase + uTime * 1.6));

      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorCore;
    uniform vec3 uColorGlint;
    uniform float uFogDensity;
    uniform float uTime;

    varying vec3 vWorldPosition;
    varying float vElevation;
    varying float vAlpha;
    varying float vDist;

    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float distSq = dot(center, center);
      if (distSq > 0.25) discard;

      float radialAlpha = smoothstep(0.25, 0.02, distSq);

      float glint = pow(sin(vWorldPosition.x * 0.4 + vWorldPosition.y * 0.3 + uTime * 2.0) * 0.5 + 0.5, 14.0);
      vec3 col = mix(uColorCore, uColorGlint, glint * 0.8);

      float fogFactor = exp(-vDist * vDist * uFogDensity * uFogDensity);
      float finalAlpha = radialAlpha * vAlpha * fogFactor * 0.7;

      gl_FragColor = vec4(col, finalAlpha);
    }
  `,
};

export default function SynapticPointStream() {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 30000;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 2] = 0;

      phases[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.4 + Math.random() * 0.7;
      speeds[i] = 0.6 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PointStreamShader.uniforms),
      vertexShader: PointStreamShader.vertexShader,
      fragmentShader: PointStreamShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    if (!material.uniforms) return;

    material.uniforms.uTime.value += delta;
    material.uniforms.uScroll.value = THREE.MathUtils.lerp(
      material.uniforms.uScroll.value,
      worldState.globalProgress,
      0.08
    );
    material.uniforms.uVelocity.value = THREE.MathUtils.lerp(
      material.uniforms.uVelocity.value,
      worldState.scrollVelocity,
      0.1
    );
    material.uniforms.uMouse.value.lerp(
      new THREE.Vector2(worldState.mouseX, worldState.mouseY),
      0.05
    );
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.8, -12]}
    />
  );
}
