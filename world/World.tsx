"use client";

// The world. One canvas, fixed behind the page; the page's only job is to be scrolled.
// Every scene sits in its own Suspense boundary and mounts only inside its timeline window
// (see Mount), so a late-loading scene can never blank the frame and far scenes cost nothing.
// Frame rate is watched: if it drops, resolution drops before anything else does.

import { PerformanceMonitor, Text, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import CameraRig from "./camera/CameraRig";
import Atmosphere from "./environment/Atmosphere";
import Dust from "./environment/Dust";
import Terrain from "./environment/Terrain";
import Mount from "./objects/Mount";
import { FONTS } from "./objects/RetroText";
import Post from "./post/Post";
import Archive from "./scenes/Archive";
import Gate from "./scenes/Gate";
import Lab from "./scenes/Lab";
import Observation from "./scenes/Observation";
import Projects from "./scenes/Projects";
import Signal from "./scenes/Signal";
import Transmission from "./scenes/Transmission";
import Workshop from "./scenes/Workshop";
import { markReady, settings } from "./signals";
import type { SceneKey } from "./timeline";

useTexture.preload("/images/profile.jpg");

/** Suspends until every font the film uses is parsed, then tells the loader. */
function Ready() {
  useEffect(() => markReady(), []);
  return (
    <>
      {Object.values(FONTS).map((f) => (
        <Text key={f} font={f} visible={false}>
          .
        </Text>
      ))}
    </>
  );
}

const Scene = ({ k, children }: { k: SceneKey; children: ReactNode }) => (
  <Mount scene={k}>
    <Suspense fallback={null}>{children}</Suspense>
  </Mount>
);

export default function World() {
  const [dpr, setDpr] = useState(settings.mobile ? 1 : 1.5);
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 30, near: 0.1, far: 2400, position: [0, 5, 118] }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(settings.mobile ? 1 : 1.5)} />
      <CameraRig />
      <Atmosphere />
      <Suspense fallback={null}>
        <Ready />
        <Terrain />
        <Dust />
        <Scene k="signalField"><Signal /></Scene>
        <Scene k="gate"><Gate /></Scene>
        <Scene k="archive"><Archive /></Scene>
        <Scene k="workshop"><Workshop /></Scene>
        <Scene k="projects"><Projects /></Scene>
        <Scene k="lab"><Lab /></Scene>
        <Scene k="observation"><Observation /></Scene>
        <Scene k="transmission"><Transmission /></Scene>
        <Post />
      </Suspense>
    </Canvas>
  );
}
