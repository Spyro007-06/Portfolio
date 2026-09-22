"use client";

import { useEffect, useState, useRef } from "react";
import { worldState } from "@/lib/animation/sceneState";

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({
    fps: 60,
    scene: "HERO",
    globalProgress: 0,
    sceneProgress: 0,
    velocity: 0,
    quality: "HIGH",
    particles: 350,
  });

  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    // Enable if ?debug=true or toggle via key 'D'
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug") === "true" || params.get("debug") === "1") {
        setVisible(true);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "D" && e.shiftKey) {
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!visible) return;

    let rafId: number;

    const tick = () => {
      framesRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 500) {
        const currentFps = Math.round((framesRef.current * 1000) / elapsed);
        framesRef.current = 0;
        lastTimeRef.current = now;

        setStats({
          fps: currentFps,
          scene: worldState.scene,
          globalProgress: Number(worldState.globalProgress.toFixed(3)),
          sceneProgress: Number(worldState.sceneProgress.toFixed(3)),
          velocity: Number(worldState.scrollVelocity.toFixed(3)),
          quality: worldState.quality,
          particles: worldState.particleCount,
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 font-mono text-[10px] text-[var(--accent)] bg-[#030607]/95 border border-[var(--accent)]/40 p-3 rounded-xs shadow-[0_0_15px_rgba(74,158,255,0.2)] select-none backdrop-blur-md"
      aria-label="Development Telemetry Overlay"
    >
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/10 text-white font-bold">
        <span>TELEMETRY // DEBUG</span>
        <span className="text-[9px] text-[var(--text-muted)] font-normal">[Shift+D to hide]</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-[var(--text-muted)]">FPS:</span>
        <span className={stats.fps >= 55 ? "text-emerald-400" : "text-amber-400"}>{stats.fps}</span>

        <span className="text-[var(--text-muted)]">SCENE:</span>
        <span className="text-white font-semibold">{stats.scene}</span>

        <span className="text-[var(--text-muted)]">SCENE PROG:</span>
        <span>{stats.sceneProgress}</span>

        <span className="text-[var(--text-muted)]">GLOBAL PROG:</span>
        <span>{stats.globalProgress}</span>

        <span className="text-[var(--text-muted)]">SCROLL VEL:</span>
        <span>{stats.velocity}</span>

        <span className="text-[var(--text-muted)]">QUALITY:</span>
        <span>{stats.quality}</span>

        <span className="text-[var(--text-muted)]">PARTICLES:</span>
        <span>{stats.particles}</span>
      </div>
    </div>
  );
}
