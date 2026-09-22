"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

const WaveShader = {
  uniforms: {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uVelocity: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uBaseColor: { value: new THREE.Color("#030507") },
    uSurfaceColor: { value: new THREE.Color("#08121a") },
    uRimColor: { value: new THREE.Color("#3a7fd5") },
    uCyanColor: { value: new THREE.Color("#4fe3ff") },
    uFogColor: { value: new THREE.Color("#030607") },
    uFogDensity: { value: 0.045 },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform vec2 uMouse;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying float vElevation;
    varying float vViewDistance;

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

    float getElevation(vec3 pos, float scroll, float time) {
      vec3 p = pos * 0.065;
      float t = time * 0.09;

      // Primary sweeping dune wave
      float elevation = snoise(vec3(p.x * 0.8, p.y - t * 0.6, t * 0.25)) * 1.55;

      // Secondary cross harmonic
      elevation += snoise(vec3(p.x * 1.6 + t * 0.15, p.y * 1.5 - t * 0.4, t * 0.35)) * 0.65;

      // Tertiary micro ripples
      elevation += snoise(vec3(p.x * 3.4, p.y * 3.2 + t * 0.5, t * 0.6)) * 0.2;

      // Scroll harmonic modulation: structured ripples along the journey
      float scrollWave = sin(pos.x * 0.12 + scroll * 6.28) * cos(pos.y * 0.10 + scroll * 4.2);
      elevation += scrollWave * 0.35 * (0.3 + 0.7 * sin(scroll * 3.1415));

      // Subtle mouse wake
      float mouseDist = length(pos.xy - uMouse * 16.0);
      elevation += exp(-mouseDist * 0.25) * sin(mouseDist * 1.2 - time * 2.0) * 0.25;

      return elevation;
    }

    void main() {
      vUv = uv;

      vec3 displacedPosition = position;
      // On horizontal plane, z displacement is the height
      float elevation = getElevation(position, uScroll, uTime);
      displacedPosition.z += elevation;

      vElevation = elevation;

      // Finite difference normal computation
      float delta = 0.08;
      float eX = getElevation(position + vec3(delta, 0.0, 0.0), uScroll, uTime);
      float eY = getElevation(position + vec3(0.0, delta, 0.0), uScroll, uTime);
      vec3 computedNormal = normalize(vec3(
        (elevation - eX) / delta,
        (elevation - eY) / delta,
        1.0
      ));

      vNormal = normalize(normalMatrix * computedNormal);

      vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 viewPosition = viewMatrix * worldPosition;
      vViewPosition = -viewPosition.xyz;
      vViewDistance = length(viewPosition.xyz);

      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uBaseColor;
    uniform vec3 uSurfaceColor;
    uniform vec3 uRimColor;
    uniform vec3 uCyanColor;
    uniform vec3 uFogColor;
    uniform float uFogDensity;
    uniform float uScroll;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying float vElevation;
    varying float vViewDistance;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Sharp, elegant grazing Fresnel on crests
      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, 4.5);

      // Key grazing rim light
      vec3 lightDir = normalize(vec3(-0.4, 0.7, 0.6));
      float diff = max(dot(normal, lightDir), 0.0);

      // Specular glint on liquid dark obsidian
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVector), 0.0), 48.0);

      // Height modulation: crests catch subtle light, valleys remain pure midnight black
      float crestRatio = smoothstep(-0.4, 1.8, vElevation);

      // Base tone is pitch black with subtle dark graphite sheen on ridges
      vec3 color = mix(uBaseColor, uSurfaceColor, crestRatio * 0.6);

      // Grazing rim light in refined celestial blue
      vec3 rim = mix(uRimColor, uCyanColor, fresnel * 0.4);
      color += rim * (fresnel * 0.65 + diff * 0.18) * crestRatio;

      // Pinpoint specular glint
      color += uCyanColor * spec * 0.45 * crestRatio;

      // Traveling photonic pulses along wave crests
      float pulse = sin(vWorldPosition.x * 0.15 + vWorldPosition.y * 0.12 - uTime * 0.7 + uScroll * 5.0) * 0.5 + 0.5;
      pulse = pow(pulse, 12.0);
      color += uCyanColor * pulse * 0.25 * crestRatio;

      // Exponential fog to dissolve into background void
      float fogFactor = 1.0 - exp(-vViewDistance * vViewDistance * uFogDensity * uFogDensity);
      color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export default function TopographicalWaveField() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Broad, expansive plane geometry (120 x 120 units, 240 x 240 segments)
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(120, 120, 240, 240);
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(WaveShader.uniforms),
      vertexShader: WaveShader.vertexShader,
      fragmentShader: WaveShader.fragmentShader,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
    });
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
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.8, -12]}
    />
  );
}
