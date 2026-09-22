"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const BOOT_STAGES = [
  { num: "01", label: "ENVIRONMENT", detail: "INITIALIZING DIGITAL CHAMBER" },
  { num: "02", label: "SYSTEM",      detail: "SYNCHRONIZING SCENARIO MATRIX" },
  { num: "03", label: "INTERFACE",   detail: "CALIBRATING EDITORIAL TYPOGRAPHY" },
  { num: "04", label: "READY",       detail: "DIGITAL ARCHITECTURE COMPILED" },
];

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (containerRef.current) containerRef.current.style.display = "none";
      return;
    }

    const stageElements = containerRef.current.querySelectorAll(".stage-row");
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
    });

    // Animate stage sequence
    stageElements.forEach((el, index) => {
      tl.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.28,
        onStart: () => {
          if (progressBarRef.current) {
            const p = ((index + 1) / BOOT_STAGES.length) * 100;
            gsap.to(progressBarRef.current, { width: `${p}%`, duration: 0.28, ease: "power1.inOut" });
          }
          if (percentRef.current) {
            const pVal = Math.round(((index + 1) / BOOT_STAGES.length) * 100);
            percentRef.current.innerText = `${pVal}%`;
          }
        },
      }, index * 0.28);
    });

    // 0.8–1.2s transformation into hero environment (curtain slides up revealing 3D chamber)
    tl.to({}, { duration: 0.2 }); // small pause at 100% READY
    tl.to(containerRef.current, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.0,
      ease: "power4.inOut",
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
      },
    });

    return () => {
      tl.kill();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-14 bg-[#08090C] text-[var(--text-primary)]"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      role="status"
      aria-label="Loading digital architecture portfolio"
    >
      {/* Top Header Readout */}
      <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-70">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>INITIALIZING EXPERIENCE</span>
        </div>
        <div className="hidden sm:block">
          SEC-01 // COIMBATORE, INDIA
        </div>
      </div>

      {/* Center Stage Checklist */}
      <div className="max-w-[480px] w-full mx-auto my-auto flex flex-col gap-4 font-mono">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.16em] mb-2">
          ARCHITECTURE PIPELINE //
        </div>
        {BOOT_STAGES.map((stage) => (
          <div
            key={stage.num}
            className="stage-row flex items-baseline justify-between py-2 border-b border-[var(--hairline)]"
            style={{ opacity: 0, transform: "translateY(8px)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--accent)]">{stage.num}</span>
              <span className="text-xs tracking-[0.14em] font-semibold text-[var(--text)]">
                — {stage.label}
              </span>
            </div>
            <span className="text-[9px] text-[var(--text-muted)] tracking-widest hidden md:inline">
              {stage.detail}
            </span>
          </div>
        ))}

        {/* Progress Bar & Numeric readout */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-[2px] bg-[var(--hairline)] overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-[var(--accent)] w-0 transition-all"
            />
          </div>
          <span ref={percentRef} className="text-[10px] text-[var(--text-muted)] w-8 text-right">
            0%
          </span>
        </div>
      </div>

      {/* Bottom Technical Footer */}
      <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] opacity-60">
        <span>THARUN B.L.</span>
        <span>SENIOR FRONTEND ARCHITECTURE</span>
      </div>
    </div>
  );
}