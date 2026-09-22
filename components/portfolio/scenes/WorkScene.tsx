"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/data/portfolio";
import { worldState } from "@/lib/animation/sceneState";

gsap.registerPlugin(ScrollTrigger);

// Individual Art-Directed Color Identities for Projects (Requirement: PROJECT SECTION)
// Must maintain the same architectural language while interpolating environmental lighting
const PROJECT_THEMES = [
  {
    // PROJECT 01: Cobalt + Cyan + Graphite
    primaryAccent: "#65D6E8",
    secondaryAccent: "#243B80",
    glowRgba: "rgba(36, 59, 128, 0.45)",
    borderRgba: "rgba(101, 214, 232, 0.35)",
    badgeBg: "#0B192A",
    highlightColor: "#65D6E8",
    ambientLight: "#4F7CFF",
  },
  {
    // PROJECT 02: Violet + Indigo + Warm White
    primaryAccent: "#7867D8",
    secondaryAccent: "#34306B",
    glowRgba: "rgba(120, 103, 216, 0.40)",
    borderRgba: "rgba(120, 103, 216, 0.35)",
    badgeBg: "#161228",
    highlightColor: "#F2F0EA",
    ambientLight: "#7867D8",
  },
  {
    // PROJECT 03: Amber + Graphite + Deep Blue
    primaryAccent: "#C58B52",
    secondaryAccent: "#243B80",
    glowRgba: "rgba(197, 139, 82, 0.35)",
    borderRgba: "rgba(197, 139, 82, 0.35)",
    badgeBg: "#1C150C",
    highlightColor: "#C58B52",
    ambientLight: "#C58B52",
  },
  {
    // PROJECT 04: Muted Magenta + Violet + Charcoal
    primaryAccent: "#A45B8A",
    secondaryAccent: "#7867D8",
    glowRgba: "rgba(164, 91, 138, 0.35)",
    borderRgba: "rgba(164, 91, 138, 0.35)",
    badgeBg: "#1A0F18",
    highlightColor: "#A45B8A",
    ambientLight: "#A45B8A",
  },
];

export default function WorkScene() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeProject, setActiveProject] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const totalProjects = PROJECTS.length;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${totalProjects * 115}%`,
      pin: trackRef.current,
      pinSpacing: true,
      onUpdate: (self) => {
        const raw = self.progress * totalProjects;
        const currentIdx = Math.min(totalProjects - 1, Math.floor(raw));
        setActiveProject(currentIdx);
        worldState.activeProjectIndex = currentIdx;

        // Section 13 & 14: Continuous Cinematic Horizontal Motion & Plane Expansion
        PROJECTS.forEach((_, idx) => {
          const cardEl = cardRefs.current[idx];
          const sweepLineEl = lineRefs.current[idx];
          if (!cardEl) return;

          const localProg = raw - idx;

          // If completely out of range, hide
          if (localProg < -0.4 || localProg > 1.3) {
            cardEl.style.opacity = "0";
            cardEl.style.pointerEvents = "none";
            cardEl.style.transform = "translate3d(30vw, 0, 0) scale(0.9)";
            return;
          }

          cardEl.style.pointerEvents = localProg >= 0 && localProg <= 1 ? "auto" : "none";

          let xVw = 0;
          let scale = 1.0;
          let opacity = 1.0;

          if (localProg < 0) {
            // Incoming from right: -0.4 -> 0
            const t = (localProg + 0.4) / 0.4;
            xVw = (1 - t) * 22;
            opacity = t;
            scale = 0.92 + t * 0.08;
          } else if (localProg <= 0.3) {
            // Entering towards center: 0% -> 25% (0 -> 0.25)
            const t = localProg / 0.3;
            xVw = (1 - t) * 6;
            opacity = 1.0;
            scale = 1.0;
            if (sweepLineEl) {
              sweepLineEl.style.width = `${Math.min(100, t * 120)}%`;
            }
          } else if (localProg <= 0.7) {
            // Centered to slight drift left: 25% -> 50% -> 70%
            const t = (localProg - 0.3) / 0.4;
            xVw = -t * 5;
            opacity = 1.0;
            scale = 1.0 + t * 0.08;
          } else {
            // Transition point: 70% -> 100% preview plane expands as camera passes through
            const t = (localProg - 0.7) / 0.3;
            xVw = -5 - t * 15;
            scale = 1.08 + t * 0.42; // Expands to 1.5x filling the viewport plane
            opacity = Math.max(0, 1.0 - t * 1.3);
          }

          cardEl.style.opacity = String(Math.max(0, Math.min(1, opacity)));
          cardEl.style.transform = `translate3d(${xVw.toFixed(2)}vw, 0, 0) scale(${scale.toFixed(3)})`;
        });
      },
    });

    return () => trigger.kill();
  }, []);

  const activeTheme = PROJECT_THEMES[activeProject] || PROJECT_THEMES[0];

  return (
    <section
      id="work"
      ref={containerRef}
      className="relative min-h-[480vh] bg-transparent"
    >
      <div
        ref={trackRef}
        className="h-screen w-full flex flex-col justify-between px-4 sm:px-8 md:px-12 py-14 sm:py-16 overflow-hidden"
      >
        {/* Top Header & Indicator */}
        <div className="w-full max-w-[1360px] mx-auto flex justify-between items-center border-b border-[var(--hairline)] pb-3 pt-2 sm:pt-4">
          <div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-2">
              <span className="w-2 h-[1px] bg-[var(--accent)]" />
              <span>03 // THE SHOWCASE GALLERY</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[var(--text-primary)] tracking-tight">
              FEATURED DIGITAL SPACES
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-[9px] sm:text-[10px]">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeTheme.primaryAccent }}
              />
              <span className="text-[var(--text-muted)] tracking-wider hidden sm:inline">LIVE SYSTEM HARNESS</span>
            </div>
            <span
              className="tracking-widest text-sm sm:text-base font-bold transition-colors duration-300"
              style={{ color: activeTheme.primaryAccent }}
            >
              0{activeProject + 1} / 0{PROJECTS.length}
            </span>
          </div>
        </div>

        {/* Center: Large Horizontal Project Scenes with Bespoke Preview Environments */}
        <div className="w-full max-w-[1360px] mx-auto my-auto relative min-h-[56vh] sm:min-h-[58vh] flex items-center justify-center">
          {PROJECTS.map((project, idx) => {
            const theme = PROJECT_THEMES[idx];

            return (
              <div
                key={project.idx}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className="absolute inset-0 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center will-change-transform transition-opacity duration-150"
                style={{
                  opacity: idx === 0 ? 1 : 0,
                  transform: idx === 0 ? "translate3d(0vw, 0, 0) scale(1)" : "translate3d(20vw, 0, 0) scale(0.9)",
                }}
              >
                {/* Left: Metadata & Project Information with Individual Color Atmosphere */}
                <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-5">
                  {/* Thin Architectural Sweep Line themed to project */}
                  <div className="w-full h-[1px] bg-white/10 overflow-hidden">
                    <div
                      ref={(el) => { lineRefs.current[idx] = el; }}
                      className="h-full w-0 transition-all duration-300"
                      style={{ backgroundColor: theme.primaryAccent }}
                    />
                  </div>

                  {/* Category & Year */}
                  <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[var(--text-muted)]">
                    <span
                      className="font-semibold px-2 py-0.5 border rounded-xs"
                      style={{
                        color: theme.primaryAccent,
                        backgroundColor: theme.badgeBg,
                        borderColor: `${theme.primaryAccent}40`,
                      }}
                    >
                      {project.tag}
                    </span>
                    <span>//</span>
                    <span>{project.year}</span>
                  </div>

                  {/* Project Title & Subtitle */}
                  <div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <div className="font-mono text-xs sm:text-sm text-[var(--text-meta)] mt-1 tracking-wide">
                        {project.subtitle}
                      </div>
                    )}
                  </div>

                  <p className="text-[var(--text-sec)] text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {project.desc}
                  </p>

                  {/* Tech stack points */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    {project.points?.map((pt) => (
                      <span
                        key={pt}
                        className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#10141C] border border-[var(--hairline)] font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-[var(--text-secondary)]"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>

                  {/* External Link with Local Cursor Hover Response */}
                  {project.link && (
                    <div className="pt-2">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border transition-all font-mono text-[9px] sm:text-[10px] uppercase tracking-widest cursor-interactive"
                        data-cursor="LAUNCH"
                        style={{
                          borderColor: theme.primaryAccent,
                          color: theme.primaryAccent,
                        }}
                      >
                        <span>VIEW SOURCE SYSTEM</span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Large Visual Preview Area with Reflected Light around Preview Edges */}
                <div className="lg:col-span-7">
                  <div
                    className="relative w-full aspect-[16/10] p-4 sm:p-6 border bg-[#0B1017]/90 backdrop-blur-md overflow-hidden flex flex-col justify-between transition-shadow duration-500 rounded-xs"
                    style={{
                      borderColor: theme.borderRgba,
                      boxShadow: `0 30px 70px ${theme.glowRgba}`,
                    }}
                  >
                    {/* Window Controls Header */}
                    <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-2.5 font-mono text-[8px] sm:text-[9px] text-[var(--text-muted)] tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500/70" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                        <span className="w-2 h-2 rounded-full bg-green-500/70" />
                        <span className="ml-2 text-[var(--text-primary)] font-medium">
                          {project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.env
                        </span>
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: theme.primaryAccent }}
                      >
                        PLANE EXPANSION // ACTIVE
                      </span>
                    </div>

                    {/* Bespoke Interactive Simulation Area for Each Project */}
                    <div className="my-auto py-3 sm:py-4">
                      {/* 01: AI FINANCIAL AGENT (Cobalt + Cyan) */}
                      {idx === 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 border border-[var(--hairline)] bg-[#071322] flex flex-col justify-between">
                              <span className="font-mono text-[8px] text-[#65D6E8]">DISPOSABLE MARGIN</span>
                              <span className="font-display font-black text-lg sm:text-2xl text-emerald-400">+34.8%</span>
                              <span className="font-mono text-[7px] text-[var(--text-muted)]">RECURRING COMMITMENTS MET</span>
                            </div>
                            <div className="p-2.5 border border-[var(--hairline)] bg-[#071322] flex flex-col justify-between">
                              <span className="font-mono text-[8px] text-[#65D6E8]">CONFIDENCE SCORE</span>
                              <span className="font-display font-black text-lg sm:text-2xl text-white">0.962</span>
                              <span className="font-mono text-[7px] text-[var(--text-muted)]">DETERMINISTIC GATE VERIFIED</span>
                            </div>
                            <div className="p-2.5 border border-[var(--hairline)] bg-[#071322] flex flex-col justify-between">
                              <span className="font-mono text-[8px] text-[#65D6E8]">RECOMMENDATION</span>
                              <span className="font-display font-black text-lg sm:text-2xl text-[#65D6E8]">APPROVE</span>
                              <span className="font-mono text-[7px] text-emerald-400">SAFETY BUFFER SAFE</span>
                            </div>
                          </div>
                          <div className="p-2.5 border border-[var(--hairline)] bg-[#06101D] font-mono text-[9px] text-[var(--text-sec)] flex items-center justify-between">
                            <span>REASONING PIPELINE: VERIFIED CASH FLOW RATIOS FOR 2026</span>
                            <span className="text-emerald-400">STATUS: DETERMINISTIC</span>
                          </div>
                        </div>
                      )}

                      {/* 02: VOICE-ENABLED RAG (Violet + Indigo + Warm White) */}
                      {idx === 1 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between p-3 border border-[var(--hairline)] bg-[#120F24]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#7867D8] animate-pulse" />
                              <span className="font-mono text-[9px] text-[#7867D8] uppercase">AUDIO STREAM // 48kHz</span>
                            </div>
                            {/* Animated Acoustic Waveform in Violet */}
                            <div className="flex items-center gap-1 h-6">
                              {[18, 32, 12, 45, 28, 55, 38, 22, 48, 30, 16, 40].map((h, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="w-1 bg-[#7867D8] rounded-full animate-pulse"
                                  style={{
                                    height: `${h}%`,
                                    animationDelay: `${bIdx * 0.08}s`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 font-mono text-[8px] sm:text-[9px]">
                            <div className="p-2.5 border border-[var(--hairline)] bg-[#16122C]">
                              <div className="text-[var(--text-meta)] mb-1">STT REASONING VECTOR:</div>
                              <div className="text-[var(--text-primary)] font-semibold truncate">&quot;Architecture specifications for Next.js 15&quot;</div>
                            </div>
                            <div className="p-2.5 border border-[var(--hairline)] bg-[#16122C]">
                              <div className="text-[var(--text-meta)] mb-1">COSINE SIMILARITY MATCH:</div>
                              <div className="text-[#8B7AE8] font-semibold">0.941 // GROUNDED CITATION</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 03: HH GOA 2026 BUILDER ID (Amber + Graphite + Deep Blue) */}
                      {idx === 2 && (
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 border border-[var(--hairline)] bg-[#14100A]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 border border-[#C58B52] bg-[#22180E] flex flex-col items-center justify-center font-display font-black text-xl text-[#C58B52]">
                              ID
                            </div>
                            <div className="flex flex-col font-mono text-[9px]">
                              <span className="text-[var(--text-muted)] uppercase">BUILDER BADGE // HH GOA</span>
                              <span className="text-[var(--text-primary)] font-bold text-sm">THARUN B.L.</span>
                              <span className="text-[#C58B52]">ROLE: SENIOR FRONTEND ARCHITECT</span>
                            </div>
                          </div>
                          <div className="p-2 border border-[var(--hairline)] bg-[#1E140C] font-mono text-[8px] text-[var(--text-muted)] text-right">
                            <div>TOKEN: #007-06-GOA</div>
                            <div className="text-[#C58B52]">VERIFIED CRYPTO SIGNATURE</div>
                          </div>
                        </div>
                      )}

                      {/* 04: PERSONALIZED MUSIC PLATFORM (Muted Magenta + Violet + Charcoal) */}
                      {idx === 3 && (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-2 font-mono text-[8px] sm:text-[9px]">
                            <div className="p-2 border border-[var(--hairline)] bg-[#1A0E18]">
                              <span className="text-[var(--text-muted)] block">ALGORITHMIC FIT</span>
                              <span className="text-[#D878B8] font-bold text-base sm:text-lg">98.4%</span>
                            </div>
                            <div className="p-2 border border-[var(--hairline)] bg-[#1A0E18]">
                              <span className="text-[var(--text-muted)] block">TEMPO HARMONICS</span>
                              <span className="text-white font-bold text-base sm:text-lg">128 BPM</span>
                            </div>
                            <div className="p-2 border border-[var(--hairline)] bg-[#1A0E18]">
                              <span className="text-[var(--text-muted)] block">DYNAMIC VECTOR</span>
                              <span className="text-[#A45B8A] font-bold text-base sm:text-lg">NEO-CHILL</span>
                            </div>
                          </div>
                          <div className="p-2.5 border border-[var(--hairline)] bg-[#140A12] flex items-center justify-between font-mono text-[8px] text-[var(--text-muted)]">
                            <span>AUDIO LATENCY: 8MS // BITRATE: 320 KBPS LOSSLESS</span>
                            <span className="text-[#A45B8A]">LEARNING MODEL: ONLINE</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Window Telemetry */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-[var(--hairline)] font-mono text-[8px] sm:text-[9px] text-[var(--text-muted)]">
                      <span>PORTAL TRANSITION PLANE // SCROLL THROUGH</span>
                      <span style={{ color: theme.primaryAccent }}>SPACE 0{idx + 1} OF 04</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Horizontal Progress Rails */}
        <div className="w-full max-w-[1360px] mx-auto flex items-center gap-3 sm:gap-4 font-mono text-[8px] sm:text-[9px] text-[var(--text-muted)] border-t border-[var(--hairline)] pt-3">
          <span className="uppercase tracking-wider whitespace-nowrap" style={{ color: activeTheme.primaryAccent }}>
            TRANSITION MASK //
          </span>
          <div className="flex-1 flex gap-2">
            {PROJECTS.map((_, i) => (
              <div
                key={i}
                className="h-[2px] flex-1 transition-all duration-300"
                style={{
                  backgroundColor: i === activeProject ? PROJECT_THEMES[i].primaryAccent : "var(--hairline)",
                }}
              />
            ))}
          </div>
          <span className="hidden sm:inline">SCROLL VERTICAL → NAVIGATES HORIZONTAL</span>
        </div>
      </div>
    </section>
  );
}