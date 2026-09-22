"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fbm } from "@/lib/webgl/noise";
import { worldState } from "@/lib/animation/sceneState";
import { lerp, smoothstep } from "@/lib/animation/interpolation";

const GRID_X = 80;
const GRID_Y = 60;

// Scene → terrain height targets
const HEIGHT_TARGETS: Record<string, number> = {
  HERO:        0.4,
  IDENTITY:    1.2,
  WORK:        0.7,
  PHILOSOPHY:  2.2,
  SKILLS:      0.5,
  EXPERIENCE:  0.8,
  ABOUT:       0.4,
  CONTACT:     0.1,
};

export default function Terrain() {
  const meshRef   = useRef<THREE.Mesh>(null!);
  const heightRef = useRef(0.4);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 6, GRID_X, GRID_Y);
    geo.rotateX(-Math.PI * 0.38);
    return geo;
  }, []);

  // Build wireframe geometry from plane
  const wireGeo = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);

  // Store original Y positions for displacement reference
  const origPositions = useMemo(() => {
    const pos  = geometry.attributes.position.array as Float32Array;
    const orig = new Float32Array(pos.length);
    orig.set(pos);
    return orig;
  }, [geometry]);

  useEffect(() => {
    // Build wireframe line geometry imperatively
    if (!meshRef.current) return;
    const positions = wireGeo.attributes.position.array as Float32Array;
    const posAttr   = new THREE.BufferAttribute(new Float32Array(positions.length), 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    posAttr.array.set(positions);
    wireGeo.setAttribute("position", posAttr);
  }, [wireGeo]);

  useFrame(({ clock }) => {
    const t         = clock.getElapsedTime() * 0.08;
    const target    = HEIGHT_TARGETS[worldState.scene] ?? 0.5;
    heightRef.current = lerp(heightRef.current, target, 0.006);
    const h = heightRef.current;

    const pos       = geometry.attributes.position.array as Float32Array;
    const orig      = origPositions;
    const vertCount = pos.length / 3;

    for (let i = 0; i < vertCount; i++) {
      const i3  = i * 3;
      const ox  = orig[i3];
      const oy  = orig[i3 + 2]; // original z before rotation is Y in plane space
      const disp = fbm(ox * 0.3 + t, oy * 0.3, t * 0.5, 4) * h;

      // Displacement goes into the local Y after rotation, which is Z in world space
      // We modify the "z" column of the plane (which after rotateX becomes "y" world)
      pos[i3 + 1] = disp;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // Sync wireframe
    const wirePosAttr = wireGeo.attributes.position as THREE.BufferAttribute;
    if (wirePosAttr) {
      // Re-sample wireframe from updated base geometry
      const wirePositions = wireGeo.attributes.position.array as Float32Array;
      const basePositions = geometry.attributes.position.array as Float32Array;

      // Wireframe samples pairs of vertices from the triangulated faces
      // We approximate by using the geometry position directly
      for (let i = 0; i < wirePositions.length / 3; i++) {
        const vi = Math.floor(i % (geometry.attributes.position.count));
        wirePositions[i * 3]     = basePositions[vi * 3];
        wirePositions[i * 3 + 1] = basePositions[vi * 3 + 1];
        wirePositions[i * 3 + 2] = basePositions[vi * 3 + 2];
      }
      wirePosAttr.needsUpdate = true;
    }
  });

  const opacity = worldState.reducedMotion ? 0.04 : 0.07;

  return (
    <group position={[0, -3.5, -2]}>
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial
          color={0x304050}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}