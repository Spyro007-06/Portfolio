"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Milestone {
  year: string;
  period: string;
  role: string;
  organization: string;
  type: "EXPERIENCE" | "EDUCATION" | "ARCHITECTURE";
  details: string[];
}

const MILESTONES: Milestone[] = [
  {
    year: "2021",
    period: "2021",
    role: "Foundations in Computing",
    organization: "Core Computer Science Systems",
    type: "EDUCATION",
    details: [
      "Algorithmic Thinking & Data Structures",
      "Object-Oriented Architecture & Memory Heuristics",
      "Foundations of Web Standards & Systems Design",
    ],
  },
  {
    year: "2022",
    period: "2022",
    role: "JavaScript Internals & DOM Computation",
    organization: "Deep Web Engineering",
    type: "ARCHITECTURE",
    details: [
      "V8 JIT compilation, event loop & microtask queue internals",
      "High-performance canvas rendering & state machines",
      "Strict functional programming and module modularity",
    ],
  },
  {
    year: "2023",
    period: "2023 — 2024",
    role: "Modern Frontend Engineering",
    organization: "Sri Shakthi Institute of Engineering and Technology",
    type: "EDUCATION",
    details: [
      "Deep dive into React, Next.js, and TypeScript ecosystems",
      "Building scalable responsive component systems and design tokens",
      "Client-side performance profiling and hydration optimization",
    ],
  },
  {
    year: "2024",
    period: "2024",
    role: "Motion Design & WebGL Exploration",
    organization: "Interactive Spatial Computing",
    type: "ARCHITECTURE",
    details: [
      "Choreographed GSAP ScrollTrigger timeline pipelines",
      "Constructing 3D WebGL environments & custom GLSL shaders",
      "Physics-based spring interpolation & spatial camera curves",
    ],
  },
  {
    year: "2025",
    period: "2025 — PRESENT",
    role: "Frontend Developer",
    organization: "Ahal AI",
    type: "EXPERIENCE",
    details: [
      "Engineered frontend architecture for AI-powered intelligence platform",
      "Implemented complex data visualizations and reasoning tree graphs",
      "Maintained 60 FPS motion fidelity with GSAP and WebGL integrations",
    ],
  },
  {
    year: "2026",
    period: "2026 — BEYOND",
    role: "Senior Frontend Architecture & AI Systems",
    organization: "Autonomous Software & Design Engineering",
    type: "EXPERIENCE",
    details: [
      "Building generative UI systems, deterministic AI agents, and voice RAG pipelines",
      "Architectural visualization and high-performance WebGL environments",
      "Crafting award-winning digital experiences with surgical precision",
    ],
  },
];

export default function ExperienceScene() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const sliderRef    = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !sliderRef.current || !trackRef.current) return;

    const total = MILESTONES.length;

    // Viewport-centered horizontal translation calculation
    const updateTranslation = (progress: number) => {
      if (!sliderRef.current) return;
      const firstCard = sliderRef.current.children[0] as HTMLElement | undefined;
      const secondCard = sliderRef.current.children[1] as HTMLElement | undefined;

      let step = 460;
      if (firstCard && secondCard) {
        step = secondCard.offsetLeft - firstCard.offsetLeft;
      }

      const totalDistance = (total - 1) * step;
      const currentShift = progress * totalDistance;
      sliderRef.current.style.transform = `translate3d(-${currentShift.toFixed(2)}px, 0, 0)`;

      const active = Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))));
      setActiveIdx(active);
    };

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${total * 60}%`,
      pin: trackRef.current,
      pinSpacing: true,
      onUpdate: (self) => {
        updateTranslation(self.progress);
      },
    });

    updateTranslation(0);

    const onResize = () => {
      if (trigger) updateTranslation(trigger.progress);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
    };
  }, []);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative min-h-[320vh] bg-transparent"
    >
      <div
        ref={trackRef}
        className="h-screen w-full flex flex-col justify-between px-4 sm:px-8 md:px-12 py-12 sm:py-16 overflow-hidden"
      >
        {/* Top Header & Readout in Deep Charcoal + Violet + Burgundy Undertone */}
        <div className="w-full max-w-[1360px] mx-auto flex justify-between items-center border-b border-[var(--hairline)] pb-3 pt-2 sm:pt-4 z-20 relative">
          <div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[var(--accent-violet)] flex items-center gap-2">
              <span className="w-2 h-[1px] bg-[var(--accent-violet)]" />
              <span>04 // TIMELINE ENGINE</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[var(--text-primary)] tracking-tight">
              CHRONOLOGICAL ARCHITECTURE
            </h2>
          </div>

          <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] text-right">
            <span>HORIZONTAL SCROLL RAIL</span>
            <br />
            <span className="text-[var(--accent-amber)] font-semibold">
              ACTIVE MILESTONE: {MILESTONES[activeIdx]?.year}
            </span>
          </div>
        </div>

        {/* Center: Long Horizontal Architectural Timeline with Subtle Violet Markers & Warm Highlights */}
        <div className="w-full mx-auto my-auto overflow-hidden relative z-10 py-6">
          {/* Main Horizontal Structural Rail with Subtle Violet Glow */}
          <div className="absolute top-[48px] sm:top-[56px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-violet)]/35 to-transparent z-0" />

          {/* Sliding Track with viewport centering padding */}
          <div
            ref={sliderRef}
            className="flex items-start gap-8 sm:gap-12 md:gap-16 will-change-transform z-10 relative pt-3 sm:pt-4"
            style={{
              paddingLeft: "max(24px, calc(50vw - 210px))",
              paddingRight: "max(24px, calc(50vw - 210px))",
              width: "max-content",
            }}
          >
            {MILESTONES.map((m, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={m.year}
                  className={`w-[290px] sm:w-[360px] md:w-[420px] shrink-0 flex flex-col transition-all duration-500 ${
                    isActive ? "opacity-100 scale-100" : "opacity-35 scale-95"
                  }`}
                >
                  {/* Structural Year Marker with Violet Illumination & Active Warm Highlight */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-400 ${
                        isActive
                          ? "border-[var(--accent-amber)] bg-[var(--accent-amber)] text-[#08090C] shadow-[0_0_16px_rgba(197,139,82,0.85)]"
                          : "border-[var(--accent-violet)]/40 bg-[#120F18] text-[#9D8FE8] shadow-[0_0_10px_rgba(120,103,216,0.25)]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    <div
                      className={`font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight transition-colors duration-400 ${
                        isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {m.year}
                    </div>

                    {/* Architectural Line Growth Indicator */}
                    <div
                      className={`h-[1px] flex-1 transition-all duration-500 ${
                        isActive
                          ? "bg-gradient-to-r from-[var(--accent-amber)] to-transparent shadow-[0_0_8px_rgba(197,139,82,0.7)]"
                          : "bg-transparent"
                      }`}
                    />
                  </div>

                  {/* Contextual Information Card in Deep Charcoal with Burgundy/Violet Undertone */}
                  <div
                    className={`p-4 sm:p-6 border transition-all duration-500 rounded-sm relative ${
                      isActive
                        ? "border-[var(--accent-amber)]/60 bg-[#181116]/95 shadow-[0_20px_50px_rgba(197,139,82,0.16)] backdrop-blur-md"
                        : "border-[var(--hairline)] bg-[#120E18]/80 backdrop-blur-sm"
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center mb-2 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider ${
                        isActive ? "text-[var(--accent-amber)] font-semibold" : "text-[var(--accent-violet)]"
                      }`}
                    >
                      <span>{m.type}</span>
                      <span>{m.period}</span>
                    </div>

                    <h4 className="font-display font-bold text-lg sm:text-xl text-[var(--text-primary)] mb-1">
                      {m.role}
                    </h4>

                    <div className="font-mono text-[10px] sm:text-xs text-[var(--text-muted)] mb-3">
                      {m.organization}
                    </div>

                    <ul className="flex flex-col gap-1.5 font-sans text-xs text-[var(--text-sec)] list-none p-0 m-0 border-t border-[var(--hairline)] pt-3">
                      {m.details.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className={isActive ? "text-[var(--accent-amber)]" : "text-[var(--accent-violet)]"}>›</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Rail Guide */}
        <div className="w-full max-w-[1360px] mx-auto flex justify-between items-center font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] border-t border-[var(--hairline)] pt-3 z-20 relative">
          <span>VERTICAL SCROLL SCRUB → HORIZONTAL TIME VECTOR</span>
          <span className="text-[var(--accent-violet)]">2021 — 2026 // CONTINUOUS MILESTONES</span>
        </div>
      </div>
    </section>
  );
}