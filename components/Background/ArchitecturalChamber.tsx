"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

// Luminous Edge Shader with Depth-Based Color Separation and Proximity Fading
const LuminousEdgeShader = {
  uniforms: {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uGlobalOpacity: { value: 1.0 },
    uColorSection: { value: new THREE.Color("#4F7CFF") },
    uFogDensity: { value: 0.018 },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    varying vec3 vWorldPosition;
    varying float vDist;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      vec4 viewPosition = viewMatrix * worldPosition;
      vDist = length(viewPosition.xyz);

      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform float uGlobalOpacity;
    uniform vec3 uColorSection;
    uniform float uFogDensity;

    varying vec3 vWorldPosition;
    varying float vDist;

    void main() {
      // Gentle photonic pulse traveling along structural rails
      float pulse = sin(vWorldPosition.z * 0.18 + uTime * 1.8 - uScroll * 6.0) * 0.5 + 0.5;
      pulse = pow(pulse, 5.0);

      // Depth-Based Color Hierarchy:
      // Foreground (z > 0): neutral graphite & silver glints
      // Midground (0 > z > -48): electric blue & cyan reflections
      // Background (-48 > z > -80): violet & indigo atmospheric tones
      // Distant (z <= -80): soft amber & champagne warmth
      vec3 colDepth;
      if (vWorldPosition.z > 0.0) {
        // Foreground: clean neutral graphite with silver glints
        colDepth = mix(vec3(0.32, 0.38, 0.45), vec3(0.88, 0.92, 0.96), pulse * 0.35);
      } else if (vWorldPosition.z > -48.0) {
        // Midground: electric blue & cyan reflections
        float tMid = clamp(-vWorldPosition.z / 48.0, 0.0, 1.0);
        vec3 midCol = mix(vec3(0.31, 0.49, 1.0), vec3(0.40, 0.84, 0.91), tMid);
        colDepth = mix(vec3(0.18, 0.25, 0.35), midCol, 0.45 + pulse * 0.55);
      } else if (vWorldPosition.z > -80.0) {
        // Background: violet and indigo tones
        float tDeep = clamp((-vWorldPosition.z - 48.0) / 32.0, 0.0, 1.0);
        vec3 deepCol = mix(vec3(0.47, 0.40, 0.85), vec3(0.20, 0.19, 0.42), tDeep);
        colDepth = mix(deepCol, vec3(0.68, 0.60, 0.95), pulse * 0.45);
      } else {
        // Distant: soft amber and champagne warmth
        colDepth = mix(vec3(0.77, 0.55, 0.32), vec3(0.85, 0.72, 0.48), pulse * 0.55);
      }

      // Blend with active section lighting atmosphere
      vec3 col = mix(colDepth, uColorSection, 0.45);
      col = mix(col, vec3(0.96, 0.96, 1.0), pulse * 0.28);

      // Depth fog
      float fogFactor = exp(-vDist * vDist * uFogDensity * uFogDensity);

      // Camera proximity fade: smoothly dissolves lines within 5m of lens
      float nearFade = smoothstep(4.0, 8.5, vDist);

      float alpha = fogFactor * nearFade * uGlobalOpacity * (0.48 + pulse * 0.52);

      gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    }
  `,
};

export default function ArchitecturalChamber() {
  const groupRef = useRef<THREE.Group>(null);
  const transitionFrameRef = useRef<THREE.Group>(null);
  const aboutPlanesRef = useRef<THREE.Group>(null);
  const centralDeckRef = useRef<THREE.Mesh>(null);

  // 1. Perspective Guide Rails (Floor & Ceiling rails stretching Z: 14 to -95)
  const railsGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const zStart = 14;
    const zEnd = -95;

    // Floor longitudinal perspective rails
    const floorX = [-18, -10, -4, 4, 10, 18];
    floorX.forEach((x) => {
      points.push(new THREE.Vector3(x, -3.8, zStart));
      points.push(new THREE.Vector3(x, -3.8, zEnd));
    });

    // Ceiling longitudinal perspective rails
    const ceilX = [-16, -8, 8, 16];
    ceilX.forEach((x) => {
      points.push(new THREE.Vector3(x, 11.5, zStart));
      points.push(new THREE.Vector3(x, 11.5, zEnd));
    });

    // Cross-connecting floor structural ties spaced evenly
    for (let z = 10; z >= -90; z -= 12.0) {
      points.push(new THREE.Vector3(-18, -3.8, z));
      points.push(new THREE.Vector3(18, -3.8, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // 2. Grand Monumental Portal Frames (4 strategic architectural gateways)
  const portalFrames = useMemo(() => {
    return [
      { z: 8, width: 32, height: 14.0, isTransition: false },
      { z: -4, width: 34, height: 14.5, isTransition: true },
      { z: -28, width: 36, height: 15.0, isTransition: false },
      { z: -48, width: 38, height: 15.5, isTransition: false },
    ];
  }, []);

  // 3. Structural Slabs (Horizontal floor and ceiling tiers)
  const structuralPlanes = useMemo(() => {
    return [
      { pos: [-16, -3.9, 0], size: [12, 0.25, 20] },
      { pos: [16, -3.9, -12], size: [12, 0.25, 20] },
      { pos: [-14, 11.2, -26], size: [10, 0.2, 18] },
      { pos: [14, 11.2, -32], size: [10, 0.2, 18] },
      { pos: [0, -4.0, -52], size: [34, 0.3, 30] },
      { pos: [-18, -3.9, -72], size: [10, 0.25, 22] },
      { pos: [18, -3.9, -72], size: [10, 0.25, 22] },
    ];
  }, []);

  // 4. Distant Tower Monoliths (Peripheral horizon framing at X = ±22)
  const distantMonoliths = useMemo(() => {
    return [
      { pos: [-22, 12, -90], size: [3.2, 38, 3.2] },
      { pos: [-14, 15, -96], size: [4.0, 44, 4.0] },
      { pos: [14, 14, -94], size: [3.8, 42, 3.8] },
      { pos: [22, 11, -88], size: [3.2, 36, 3.2] },
    ];
  }, []);

  // -----------------------------------------------------------------
  // MATERIAL DIFFERENTIATION SYSTEM
  // Specification:
  // ~40% Matte dark architectural surfaces
  // ~25% Dark metallic surfaces
  // ~20% Slightly reflective surfaces
  // ~10% Translucent / glass-like surfaces
  //  ~5% Brighter accent surfaces
  // -----------------------------------------------------------------
  const edgeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(LuminousEdgeShader.uniforms),
      vertexShader: LuminousEdgeShader.vertexShader,
      fragmentShader: LuminousEdgeShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // ~40% Matte Dark Architectural Surface (Graphite stone/concrete foundation)
  const matteDarkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#080B10"),
      roughness: 0.92,
      metalness: 0.08,
      emissive: new THREE.Color("#010204"),
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  // ~25% Dark Metallic Surface (Columns, monoliths, frame inner linings)
  const darkMetallicMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#161C26"),
      roughness: 0.38,
      metalness: 0.84,
      emissive: new THREE.Color("#030508"),
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  // ~20% Slightly Reflective Surface (Walking decks, central foundation plate)
  const reflectiveMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#111722"),
      roughness: 0.22,
      metalness: 0.48,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      transparent: true,
      opacity: 0.82,
    });
  }, []);

  // ~10% Translucent / Glass-like Surface (Ceiling acoustic/light baffles)
  const translucentGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#152232"),
      roughness: 0.16,
      transmission: 0.65,
      thickness: 1.2,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
  }, []);

  // ~5% Brighter Accent Surface (Threshold markers, datum trims)
  const accentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#223348"),
      roughness: 0.42,
      metalness: 0.65,
      emissive: new THREE.Color("#0d1b2a"),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.90,
    });
  }, []);

  // Color working object
  const tempSectionColor = useMemo(() => new THREE.Color("#4F7CFF"), []);

  useFrame((_, delta) => {
    const p = worldState.globalProgress;
    const lp = worldState.lightingProgress || p;

    // Contact dissolution & Grand Pullback callback
    let archAlpha = 1.0;
    if (p > 0.985) {
      archAlpha = Math.min(1.0, (p - 0.985) / 0.015);
    } else if (p > 0.935) {
      archAlpha = Math.max(0.0, 1.0 - (p - 0.935) / 0.035);
    }

    // Determine active section color for luminous edges
    if (lp < 0.118) {
      tempSectionColor.set("#4F7CFF"); // Hero Electric Blue
    } else if (lp < 0.227) {
      tempSectionColor.set("#65D6E8"); // About Desaturated Cyan
    } else if (lp < 0.426) {
      tempSectionColor.set("#52B5FF"); // Skills Tech Cyan
    } else if (lp < 0.735) {
      // Work per-project palette
      const workSpan = 0.735 - 0.426;
      const rawP = ((lp - 0.426) / workSpan) * 4;
      const pIdx = Math.min(3, Math.floor(rawP));
      if (pIdx === 0) tempSectionColor.set("#4F7CFF"); // P1 Cobalt
      else if (pIdx === 1) tempSectionColor.set("#7867D8"); // P2 Violet
      else if (pIdx === 2) tempSectionColor.set("#C58B52"); // P3 Amber
      else tempSectionColor.set("#A45B8A"); // P4 Muted Magenta
    } else if (lp < 0.950) {
      tempSectionColor.set("#7867D8"); // Experience Violet
    } else {
      tempSectionColor.set("#D8B77A"); // Contact Champagne
    }

    if (edgeMaterial.uniforms) {
      edgeMaterial.uniforms.uTime.value += delta;
      edgeMaterial.uniforms.uScroll.value = THREE.MathUtils.lerp(
        edgeMaterial.uniforms.uScroll.value,
        p,
        0.08
      );
      edgeMaterial.uniforms.uGlobalOpacity.value = THREE.MathUtils.lerp(
        edgeMaterial.uniforms.uGlobalOpacity.value,
        archAlpha,
        delta * 3.5
      );
      edgeMaterial.uniforms.uColorSection.value.lerp(tempSectionColor, delta * 3.0);
    }

    // Update material opacities for exit threshold
    const targetMatAlpha = 0.85 * archAlpha;
    matteDarkMaterial.opacity = THREE.MathUtils.lerp(matteDarkMaterial.opacity, targetMatAlpha, delta * 3.5);
    darkMetallicMaterial.opacity = THREE.MathUtils.lerp(darkMetallicMaterial.opacity, targetMatAlpha, delta * 3.5);
    reflectiveMaterial.opacity = THREE.MathUtils.lerp(reflectiveMaterial.opacity, 0.82 * archAlpha, delta * 3.5);
    translucentGlassMaterial.opacity = THREE.MathUtils.lerp(translucentGlassMaterial.opacity, 0.55 * archAlpha, delta * 3.5);
    accentMaterial.opacity = THREE.MathUtils.lerp(accentMaterial.opacity, 0.90 * archAlpha, delta * 3.5);

    // Subtle autonomous spatial breathing
    if (groupRef.current) {
      const breath = Math.sin(edgeMaterial.uniforms.uTime.value * 0.15) * 0.0015;
      groupRef.current.rotation.y = breath;
    }

    // About Section Scroll Behavior:
    // "architectural surfaces should subtly rotate relative to the camera.
    // Some planes become more visible. Others disappear into shadow.
    // Cyan reflections should move across surfaces according to the virtual light direction."
    if (aboutPlanesRef.current) {
      if (p >= 0.110 && p <= 0.240) {
        const aboutFactor = Math.sin(
          THREE.MathUtils.clamp((p - 0.110) / (0.240 - 0.110), 0, 1) * Math.PI
        );
        aboutPlanesRef.current.rotation.y = aboutFactor * 0.038;
        aboutPlanesRef.current.rotation.x = aboutFactor * 0.018;
      } else {
        aboutPlanesRef.current.rotation.y = 0;
        aboutPlanesRef.current.rotation.x = 0;
      }
    }

    // About portal frame elevation
    if (transitionFrameRef.current) {
      const offset = (p - 0.18) * 10.0;
      transitionFrameRef.current.position.y = 3.2 + Math.sin(offset) * 0.6;
    }

    // Project Section Reflected Light on Central Foundation Deck
    if (centralDeckRef.current && centralDeckRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      if (p >= 0.426 && p <= 0.735) {
        centralDeckRef.current.material.emissive.copy(tempSectionColor);
        centralDeckRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
          centralDeckRef.current.material.emissiveIntensity,
          0.35,
          delta * 2.5
        );
      } else {
        centralDeckRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
          centralDeckRef.current.material.emissiveIntensity,
          0.02,
          delta * 2.5
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Perspective Guide Rails with Depth-Based Color Separation */}
      <lineSegments geometry={railsGeometry} material={edgeMaterial} />

      {/* 2. Grand Monumental Portal Frames (Matte Dark Structure + Dark Metallic Inset + Accent Edges) */}
      {portalFrames.map((frame, i) => (
        <group
          key={i}
          ref={frame.isTransition ? transitionFrameRef : undefined}
          position={[0, 3.2, frame.z]}
        >
          {/* Top Beam: Matte Dark Exterior Structure (~40% ratio) */}
          <mesh position={[0, frame.height / 2, 0]} material={matteDarkMaterial}>
            <boxGeometry args={[frame.width, 0.22, 0.45]} />
          </mesh>
          {/* Top Beam Inner Metallic Soffit (~25% ratio) */}
          <mesh position={[0, frame.height / 2 - 0.12, 0]} material={darkMetallicMaterial}>
            <boxGeometry args={[frame.width - 0.6, 0.06, 0.38]} />
          </mesh>
          <lineSegments position={[0, frame.height / 2, 0]} material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(frame.width, 0.22, 0.45)]} />
          </lineSegments>

          {/* Left Column: Dark Metallic Column Core (~25% ratio) */}
          <mesh position={[-frame.width / 2, 0, 0]} material={darkMetallicMaterial}>
            <boxGeometry args={[0.26, frame.height, 0.45]} />
          </mesh>
          <lineSegments position={[-frame.width / 2, 0, 0]} material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(0.26, frame.height, 0.45)]} />
          </lineSegments>

          {/* Right Column: Dark Metallic Column Core (~25% ratio) */}
          <mesh position={[frame.width / 2, 0, 0]} material={darkMetallicMaterial}>
            <boxGeometry args={[0.26, frame.height, 0.45]} />
          </mesh>
          <lineSegments position={[frame.width / 2, 0, 0]} material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(0.26, frame.height, 0.45)]} />
          </lineSegments>

          {/* Frame Base Accent Plinths (~5% ratio) */}
          <mesh position={[-frame.width / 2, -frame.height / 2 + 0.3, 0]} material={accentMaterial}>
            <boxGeometry args={[0.34, 0.6, 0.52]} />
          </mesh>
          <mesh position={[frame.width / 2, -frame.height / 2 + 0.3, 0]} material={accentMaterial}>
            <boxGeometry args={[0.34, 0.6, 0.52]} />
          </mesh>
        </group>
      ))}

      {/* 3. Floating Structural Slabs with Material Separation & About Rotating Group */}
      <group ref={aboutPlanesRef}>
        {/* Floor Plinth Left (z: 0) — Matte foundation + slightly reflective walking deck */}
        <group position={[-16, -3.9, 0]}>
          <mesh material={matteDarkMaterial}>
            <boxGeometry args={[12, 0.25, 20]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} material={reflectiveMaterial}>
            <boxGeometry args={[11.6, 0.02, 19.6]} />
          </mesh>
          <lineSegments material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(12, 0.25, 20)]} />
          </lineSegments>
        </group>

        {/* Floor Plinth Right (z: -12) — Matte foundation + slightly reflective walking deck */}
        <group position={[16, -3.9, -12]}>
          <mesh material={matteDarkMaterial}>
            <boxGeometry args={[12, 0.25, 20]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} material={reflectiveMaterial}>
            <boxGeometry args={[11.6, 0.02, 19.6]} />
          </mesh>
          <lineSegments material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(12, 0.25, 20)]} />
          </lineSegments>
        </group>

        {/* High Ceiling Canopy Left (z: -26) — Dark metallic structure + translucent glass baffle (~10% ratio) */}
        <group position={[-14, 11.2, -26]}>
          <mesh material={darkMetallicMaterial}>
            <boxGeometry args={[10, 0.2, 18]} />
          </mesh>
          <mesh position={[0, -0.22, 0]} material={translucentGlassMaterial}>
            <boxGeometry args={[9.4, 0.04, 17.4]} />
          </mesh>
          <lineSegments material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(10, 0.2, 18)]} />
          </lineSegments>
        </group>

        {/* High Ceiling Canopy Right (z: -32) — Dark metallic structure + translucent glass baffle (~10% ratio) */}
        <group position={[14, 11.2, -32]}>
          <mesh material={darkMetallicMaterial}>
            <boxGeometry args={[10, 0.2, 18]} />
          </mesh>
          <mesh position={[0, -0.22, 0]} material={translucentGlassMaterial}>
            <boxGeometry args={[9.4, 0.04, 17.4]} />
          </mesh>
          <lineSegments material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(10, 0.2, 18)]} />
          </lineSegments>
        </group>
      </group>

      {/* Deep Central Foundation Slab (z: -52) — Reflective deck catching project preview reflections */}
      <group position={[0, -4.0, -52]}>
        <mesh material={matteDarkMaterial}>
          <boxGeometry args={[34, 0.3, 30]} />
        </mesh>
        <mesh ref={centralDeckRef} position={[0, 0.16, 0]} material={reflectiveMaterial}>
          <boxGeometry args={[33.4, 0.02, 29.4]} />
        </mesh>
        <lineSegments material={edgeMaterial}>
          <edgesGeometry args={[new THREE.BoxGeometry(34, 0.3, 30)]} />
        </lineSegments>
      </group>

      {/* Terraced Floor Slabs flanking Experience Corridor (z: -72) */}
      <group position={[-18, -3.9, -72]}>
        <mesh material={matteDarkMaterial}>
          <boxGeometry args={[10, 0.25, 22]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={reflectiveMaterial}>
          <boxGeometry args={[9.6, 0.02, 21.6]} />
        </mesh>
        <lineSegments material={edgeMaterial}>
          <edgesGeometry args={[new THREE.BoxGeometry(10, 0.25, 22)]} />
        </lineSegments>
      </group>

      <group position={[18, -3.9, -72]}>
        <mesh material={matteDarkMaterial}>
          <boxGeometry args={[10, 0.25, 22]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={reflectiveMaterial}>
          <boxGeometry args={[9.6, 0.02, 21.6]} />
        </mesh>
        <lineSegments material={edgeMaterial}>
          <edgesGeometry args={[new THREE.BoxGeometry(10, 0.25, 22)]} />
        </lineSegments>
      </group>

      {/* 4. Distant Tower Monoliths (Peripheral Horizon Framing) — Dark Metallic Finish */}
      {distantMonoliths.map((mono, i) => (
        <group key={i} position={mono.pos as [number, number, number]}>
          <mesh material={darkMetallicMaterial}>
            <boxGeometry args={mono.size as [number, number, number]} />
          </mesh>
          <lineSegments material={edgeMaterial}>
            <edgesGeometry args={[new THREE.BoxGeometry(...(mono.size as [number, number, number]))]} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
