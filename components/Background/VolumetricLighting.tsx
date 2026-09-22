"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { worldState } from "@/lib/animation/sceneState";

// Canonical Art-Directed Palette
const PALETTE = {
  graphite: new THREE.Color("#08090C"),
  deepCharcoal: new THREE.Color("#101217"),
  softGraphite: new THREE.Color("#181C23"),
  electricBlue: new THREE.Color("#4F7CFF"),
  deepCobalt: new THREE.Color("#243B80"),
  mutedCyan: new THREE.Color("#65D6E8"),
  silverCyan: new THREE.Color("#88C2D8"),
  violet: new THREE.Color("#7867D8"),
  indigo: new THREE.Color("#34306B"),
  warmChampagne: new THREE.Color("#D8B77A"),
  softAmber: new THREE.Color("#C58B52"),
  mutedMagenta: new THREE.Color("#A45B8A"),
  burgundyCharcoal: new THREE.Color("#140A12"),
  warmWhite: new THREE.Color("#F2F0EA"),
  coolGrey: new THREE.Color("#A7ADB8"),
  nearBlack: new THREE.Color("#040507"),
};

export default function VolumetricLighting() {
  const { scene } = useThree();

  // Canonical Light Sources
  // LIGHT 01: Large cool blue source from upper-left
  const light01Ref = useRef<THREE.DirectionalLight>(null);
  // LIGHT 02: Deep violet source behind the environment
  const light02Ref = useRef<THREE.DirectionalLight>(null);
  // LIGHT 03: Small warm amber source deeper in the scene
  const light03Ref = useRef<THREE.PointLight>(null);
  // LIGHT 04: Very subtle neutral white fill
  const light04Ref = useRef<THREE.DirectionalLight>(null);

  // Project Preview Reflected Light (Integrates preview card lighting with architecture)
  const projectBounceRef = useRef<THREE.PointLight>(null);

  // Contact Large Soft Warm Light
  const contactWarmRef = useRef<THREE.PointLight>(null);

  // Localized Cursor Interaction Light (100–200px reaction)
  const cursorLightRef = useRef<THREE.PointLight>(null);

  // Reusable Color Working Instances (Zero GC allocations)
  const currentKeyColor = useMemo(() => new THREE.Color("#4F7CFF"), []);
  const currentVioletColor = useMemo(() => new THREE.Color("#7867D8"), []);
  const currentAmberColor = useMemo(() => new THREE.Color("#C58B52"), []);
  const currentBgColor = useMemo(() => new THREE.Color("#08090C"), []);
  const currentProjectBounceColor = useMemo(() => new THREE.Color("#4F7CFF"), []);

  useFrame((_, delta) => {
    const p = worldState.globalProgress;
    const lp = worldState.lightingProgress || p;
    const ap = worldState.atmosphereProgress || p;

    // -------------------------------------------------------------
    // 1. COMPUTE SECTION LIGHTING RELATIONSHIPS & COLOR INTERPOLATION
    // -------------------------------------------------------------
    let targetKeyColor = PALETTE.electricBlue;
    let targetKeyIntensity = 1.35;

    let targetVioletIntensity = 0.45;
    let targetAmberIntensity = 0.15;
    let targetFillIntensity = 0.22;
    let targetFogDensity = 0.018;
    let targetBgColor = PALETTE.graphite;

    let targetBounceIntensity = 0.0;
    let targetBounceColor = PALETTE.electricBlue;
    let targetBounceZ = -52.0;

    let targetContactWarm = 0.0;

    if (lp < 0.118) {
      // ----------------- HERO (0.000 – 0.118) -----------------
      // Graphite + Electric Blue + Subtle Violet
      // Blue creates tech feeling, violet creates depth in distance
      const heroT = Math.min(1, lp / 0.118);
      targetKeyColor = PALETTE.electricBlue;
      targetKeyIntensity = 1.40 - heroT * 0.15;
      // Violet starts subtle in distant depth, then increases towards 0.118
      targetVioletIntensity = 0.35 + heroT * 0.40;
      // Warm amber begins faintly appearing in the distance (Hero scroll transition)
      targetAmberIntensity = 0.08 + heroT * 0.22;
      targetFillIntensity = 0.20;
      targetFogDensity = 0.019;
      targetBgColor = PALETTE.graphite;
    } else if (lp < 0.227) {
      // ----------------- ABOUT (0.118 – 0.227) -----------------
      // Shift toward: Charcoal + Desaturated Cyan + Silver
      // Cleaner, editorial, reduced violet, soft cyan reflections
      const aboutT = (lp - 0.118) / (0.227 - 0.118);
      targetKeyColor = PALETTE.silverCyan;
      targetKeyIntensity = 1.15;
      // Violet is reduced
      targetVioletIntensity = 0.20 * (1 - aboutT * 0.5);
      // Soft amber is restrained in the deep distance
      targetAmberIntensity = 0.18;
      targetFillIntensity = 0.28; // Brighter neutral fill around editorial content
      targetFogDensity = 0.016;
      targetBgColor = PALETTE.deepCharcoal;
    } else if (lp < 0.426) {
      // ------------- SKILLS / SYSTEM MAP (0.227 – 0.426) -------------
      // Deep Navy + Cyan + Small Amber Accents
      const skillsT = (lp - 0.227) / (0.426 - 0.227);
      targetKeyColor = PALETTE.mutedCyan;
      targetKeyIntensity = 1.25;
      targetVioletIntensity = 0.30;
      // Small amber highlights illuminate active indicators
      targetAmberIntensity = 0.35 + Math.sin(skillsT * Math.PI) * 0.25;
      targetFillIntensity = 0.22;
      targetFogDensity = 0.018;
      targetBgColor = PALETTE.deepCharcoal;
    } else if (lp < 0.735) {
      // ----------------- PROJECTS (0.426 – 0.735) -----------------
      // Continuous travelling interpolation across the 4 individual project atmospheres
      // P1 (0.426–0.503): Cobalt + Cyan + Graphite
      // P2 (0.503–0.581): Violet + Indigo + Warm White
      // P3 (0.581–0.658): Amber + Graphite + Deep Blue
      // P4 (0.658–0.735): Muted Magenta + Violet + Charcoal
      const workSpan = 0.735 - 0.426;
      const rawProjectProg = ((lp - 0.426) / workSpan) * 4; // 0 to 4
      const pIdx = Math.min(3, Math.floor(rawProjectProg));
      const pFraction = rawProjectProg - pIdx;

      targetFillIntensity = 0.18;
      targetFogDensity = 0.017;
      targetBounceIntensity = 0.65; // Preview plane reflected light onto architecture

      if (pIdx === 0) {
        // Project 01: Cobalt + Cyan
        targetKeyColor = PALETTE.mutedCyan;
        targetBounceColor = PALETTE.mutedCyan;
        targetVioletIntensity = 0.30 + pFraction * 0.45; // Interpolating towards violet
        targetAmberIntensity = 0.12;
        targetBounceZ = -48.0;
        targetBgColor = PALETTE.graphite;
      } else if (pIdx === 1) {
        // Project 02: Violet + Indigo
        targetKeyColor = PALETTE.violet;
        targetBounceColor = PALETTE.violet;
        targetVioletIntensity = 0.85 - pFraction * 0.40;
        targetAmberIntensity = 0.15 + pFraction * 0.55; // Interpolating towards amber
        targetBounceZ = -54.0;
        targetBgColor = PALETTE.deepCharcoal;
      } else if (pIdx === 2) {
        // Project 03: Amber + Deep Blue
        targetKeyColor = PALETTE.softAmber;
        targetBounceColor = PALETTE.softAmber;
        targetVioletIntensity = 0.25;
        targetAmberIntensity = 0.85 - pFraction * 0.40;
        targetBounceZ = -60.0;
        targetBgColor = PALETTE.graphite;
      } else {
        // Project 04: Muted Magenta + Violet
        targetKeyColor = PALETTE.mutedMagenta;
        targetBounceColor = PALETTE.mutedMagenta;
        targetVioletIntensity = 0.60;
        targetAmberIntensity = 0.20;
        targetBounceZ = -66.0;
        targetBgColor = PALETTE.deepCharcoal;
      }
    } else if (lp < 0.950) {
      // --------------- EXPERIENCE (0.735 – 0.950) ---------------
      // Deep Charcoal + Burgundy Undertone + Violet + Cool White
      const expT = (lp - 0.735) / (0.950 - 0.735);
      targetKeyColor = PALETTE.violet;
      targetKeyIntensity = 1.10;
      targetVioletIntensity = 0.55;
      // Active milestones receive restrained warm highlight
      targetAmberIntensity = 0.40;
      targetFillIntensity = 0.20;
      targetFogDensity = 0.019;
      targetBgColor = PALETTE.burgundyCharcoal;
    } else {
      // ----------------- CONTACT (0.950 – 1.000) -----------------
      // Near Black + Graphite + Champagne + Soft Amber
      // Reduce blue, reduce violet, introduce large soft warm light source
      const contactT = Math.min(1, (lp - 0.950) / 0.050);
      targetKeyColor = PALETTE.softGraphite;
      targetKeyIntensity = 0.40 * (1 - contactT * 0.6);
      targetVioletIntensity = 0.10 * (1 - contactT);
      targetAmberIntensity = 0.05;
      targetFillIntensity = 0.10;
      targetFogDensity = 0.022;
      targetBgColor = PALETTE.nearBlack;

      // Large soft warm light source on the horizon
      targetContactWarm = 1.6 * contactT;
    }

    // -------------------------------------------------------------
    // 2. SMOOTH PHYSICAL INTERPOLATION (NO ABRUPT COLOR SWITCHES)
    // -------------------------------------------------------------
    const lerpSpeed = Math.min(1, delta * 3.0);

    currentKeyColor.lerp(targetKeyColor, lerpSpeed);
    currentVioletColor.lerp(PALETTE.violet, lerpSpeed);
    currentAmberColor.lerp(PALETTE.softAmber, lerpSpeed);
    currentBgColor.lerp(targetBgColor, lerpSpeed);
    currentProjectBounceColor.lerp(targetBounceColor, lerpSpeed);

    // Apply Background & Volumetric Fog
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(currentBgColor);
    }
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.copy(currentBgColor);
      (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(
        (scene.fog as THREE.FogExp2).density,
        targetFogDensity,
        delta * 2.0
      );
    }

    // LIGHT 01: Cool blue / section key light from upper-left
    if (light01Ref.current) {
      light01Ref.current.color.copy(currentKeyColor);
      light01Ref.current.intensity = THREE.MathUtils.lerp(
        light01Ref.current.intensity,
        targetKeyIntensity,
        delta * 2.8
      );
      // Spatially consistent key position with subtle natural parallax drift
      light01Ref.current.position.x = -14 + Math.sin(lp * Math.PI) * 1.5;
    }

    // LIGHT 02: Deep violet source behind the environment
    if (light02Ref.current) {
      light02Ref.current.intensity = THREE.MathUtils.lerp(
        light02Ref.current.intensity,
        targetVioletIntensity,
        delta * 2.5
      );
    }

    // LIGHT 03: Small warm amber source deeper in the scene
    if (light03Ref.current) {
      light03Ref.current.intensity = THREE.MathUtils.lerp(
        light03Ref.current.intensity,
        targetAmberIntensity,
        delta * 2.5
      );
    }

    // LIGHT 04: Very subtle neutral white fill
    if (light04Ref.current) {
      light04Ref.current.intensity = THREE.MathUtils.lerp(
        light04Ref.current.intensity,
        targetFillIntensity,
        delta * 2.5
      );
    }

    // Project Preview Reflected Light
    if (projectBounceRef.current) {
      projectBounceRef.current.color.copy(currentProjectBounceColor);
      projectBounceRef.current.intensity = THREE.MathUtils.lerp(
        projectBounceRef.current.intensity,
        targetBounceIntensity,
        delta * 3.2
      );
      projectBounceRef.current.position.z = THREE.MathUtils.lerp(
        projectBounceRef.current.position.z,
        targetBounceZ,
        delta * 3.0
      );
    }

    // Contact Large Soft Warm Light
    if (contactWarmRef.current) {
      contactWarmRef.current.intensity = THREE.MathUtils.lerp(
        contactWarmRef.current.intensity,
        targetContactWarm,
        delta * 2.5
      );
    }

    // Cursor Localized Interaction Light (within 100–200px)
    if (cursorLightRef.current) {
      const hover = worldState.hoverReaction;
      const targetCursorIntensity = hover?.active ? 0.85 : 0.0;
      cursorLightRef.current.intensity = THREE.MathUtils.lerp(
        cursorLightRef.current.intensity,
        targetCursorIntensity,
        delta * 6.0
      );
      if (hover?.active) {
        cursorLightRef.current.color.set(hover.color || "#4F7CFF");
        // Place in camera view coordinates near screen
        cursorLightRef.current.position.set(
          worldState.mouseX * 4.0,
          worldState.mouseY * 2.5 + 2.0,
          light01Ref.current?.position.z ? 6.0 : 6.0
        );
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#08090C"]} />
      <fogExp2 attach="fog" args={["#08090C", 0.018]} />

      {/* Low ambient light keeping 70–80% dark neutral foundation */}
      <ambientLight intensity={0.16} color="#0c1017" />

      {/* LIGHT 01: Large cool blue source from upper-left */}
      <directionalLight
        ref={light01Ref}
        position={[-14, 18, 10]}
        intensity={1.35}
        color="#4F7CFF"
      />

      {/* LIGHT 02: Deep violet source behind the environment */}
      <directionalLight
        ref={light02Ref}
        position={[14, 8, -48]}
        intensity={0.45}
        color="#7867D8"
      />

      {/* LIGHT 03: Small warm amber source deeper in the scene */}
      <pointLight
        ref={light03Ref}
        position={[-6, 3, -64]}
        intensity={0.15}
        color="#C58B52"
        distance={45}
        decay={2}
      />

      {/* LIGHT 04: Very subtle neutral white fill */}
      <directionalLight
        ref={light04Ref}
        position={[0, -2, 5]}
        intensity={0.22}
        color="#F2F0EA"
      />

      {/* Reflected Light from Active Project Previews onto Surrounding Architecture */}
      <pointLight
        ref={projectBounceRef}
        position={[4, 2.0, -52]}
        intensity={0}
        color="#4F7CFF"
        distance={22}
        decay={2}
      />

      {/* Contact: Large Extremely Soft Warm Light Source */}
      <pointLight
        ref={contactWarmRef}
        position={[0, 2.8, -94]}
        intensity={0}
        color="#D8B77A"
        distance={85}
        decay={1.8}
      />

      {/* Localized Cursor Interaction Light (< 200px reaction) */}
      <pointLight
        ref={cursorLightRef}
        position={[0, 2, 6]}
        intensity={0}
        distance={10}
        decay={2.2}
      />
    </>
  );
}
