"use client";

// Post: the film stock. Grain, a trace of scanline, ordered dither, bloom on the few emissive
// things, a vignette. Chromatic aberration is velocity-driven: still frames are clean, fast
// travel smears the edges, and it settles with the velocity spring.
// Desktop adds depth of field focused on whatever the camera is looking at.
// Phones get tone mapping, grain and vignette only.

import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, Scanline, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { BlendFunction, ToneMappingMode, type ChromaticAberrationEffect, type DepthOfFieldEffect } from "postprocessing";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";
import { focus } from "../camera/focus";
import { film, getTextImportance, settings, velocity } from "../signals";
import { RetroEffect } from "./RetroEffect";

export default function Post() {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const dof = useRef<DepthOfFieldEffect>(null);
  // Restrained retro dither: subtle film texture, never noise on glyphs (Section 24)
  const retro = useMemo(() => new RetroEffect({ strength: 0.06, levels: 48 }), []);
  const offset = useMemo(() => new Vector2(0, 0), []);

  useFrame(() => {
    const t = film.get();
    const importance = getTextImportance(t);
    const isPrimary = importance === "PRIMARY";

    // Chromatic aberration is strictly zeroed whenever text is in focus (Section 11)
    if (isPrimary || settings.reduced) {
      offset.set(0, 0);
    } else {
      const v = Math.min(1, Math.abs(velocity.get()) / 2400);
      offset.set(v * 0.0016, v * 0.001);
    }
    if (ca.current) ca.current.offset = offset;

    // Depth of field guard (Section 3 & 14):
    // Zero bokeh blur whenever reading text; subtle ambient blur only during travel transitions
    if (dof.current) {
      if (dof.current.target) dof.current.target.copy(focus);
      // Disable DOF completely on primary text to ensure crisp screen-space readability.
      const targetBokeh = isPrimary ? 0 : 0.45;
      dof.current.bokehScale = targetBokeh;
    }
  });

  if (settings.mobile) {
    return (
      <EffectComposer multisampling={0}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.2} />
        <Vignette offset={0.32} darkness={0.7} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0}>
      {/* Target depth of field: zeroed on text so portfolio content is never blurred */}
      <DepthOfField ref={dof} target={[0, 0, 0]} focalLength={0.02} bokehScale={0} height={480} />
      {/* High threshold ensures text itself never blooms into an illegible blob (Section 10) */}
      <Bloom mipmapBlur intensity={0.32} luminanceThreshold={1.02} luminanceSmoothing={0.12} />
      {/* HDR → display range before anything that quantizes colour */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation modulationOffset={0.55} />
      <primitive object={retro} />
      {/* Scanline density & opacity tuned to avoid cutting lines through font glyphs (Section 24) */}
      <Scanline density={1.5} opacity={0.012} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />
      <Vignette offset={0.3} darkness={0.72} />
    </EffectComposer>
  );
}
