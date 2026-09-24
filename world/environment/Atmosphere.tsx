"use client";

// Atmosphere: the colour script made physical. Background, exponential fog and the key light
// follow the camera's film position; fog density is written per scene (thick in the archive,
// thin in the observation room, near-total in the final dark).
// Lighting is deliberately uneven: a low ambient, one hard key from ahead-left (long silhouettes),
// a cool rim from behind. Scenes add their own practical lights.

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AmbientLight, Color, DirectionalLight, FogExp2, HemisphereLight, Vector3 } from "three";
import { createLightingState, sampleCinematicLighting } from "../lighting";
import { setGlowLevel } from "../materials";
import { film, pointer, settings, velocity } from "../signals";

export default function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const ambient = useRef<AmbientLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);

  const state = useMemo(() => createLightingState(), []);
  const fog = useMemo(() => new FogExp2("#000", 0.015), []);
  const bg = useMemo(() => new Color(), []);
  const keyOff = useMemo(() => new Vector3(), []);
  const rimOff = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const t = film.get();
    sampleCinematicLighting(t, state);

    if (scene.fog !== fog) scene.fog = fog;
    scene.background = bg.copy(state.bg);
    fog.color.copy(state.fogColor);
    fog.density = state.fogDensity;
    setGlowLevel(state.emissiveIntensity);

    // Camera movement and velocity reactivity (Section 12)
    const vNorm = settings.reduced ? 0 : Math.min(1, Math.abs(velocity.get()) / 1200);
    const ptrX = settings.live ? pointer.x.get() : 0;
    const ptrY = settings.live ? pointer.y.get() : 0;

    if (ambient.current) {
      ambient.current.color.copy(state.ambientColor);
      ambient.current.intensity = state.ambientIntensity;
    }

    if (hemi.current) {
      hemi.current.color.copy(state.fillSky);
      hemi.current.groundColor.copy(state.fillGround);
      hemi.current.intensity = state.fillIntensity;
    }

    if (key.current) {
      key.current.color.copy(state.keyColor);
      key.current.intensity = state.keyIntensity;
      // Key light offset pivots subtly with look-around
      keyOff.copy(state.keyOffset);
      keyOff.x += ptrX * 7;
      keyOff.y += ptrY * 4;
      key.current.position.copy(camera.position).add(keyOff);
      key.current.target.position.copy(camera.position).add(new Vector3(0, 0, -60));
      key.current.target.updateMatrixWorld();
    }

    if (rim.current) {
      rim.current.color.copy(state.rimColor);
      // As camera travels fast, rim light catches edges more strongly
      rim.current.intensity = state.rimIntensity * (1 + vNorm * 0.4);
      rimOff.copy(state.rimOffset);
      rimOff.x -= ptrX * 9;
      rim.current.position.copy(camera.position).add(rimOff);
      rim.current.target.position.copy(camera.position).add(new Vector3(0, 0, -40));
      rim.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.16} />
      <hemisphereLight ref={hemi} args={["#12243d", "#020408", 0.5]} />
      <directionalLight ref={key} intensity={1.6} />
      <directionalLight ref={rim} intensity={0.9} />
    </>
  );
}
