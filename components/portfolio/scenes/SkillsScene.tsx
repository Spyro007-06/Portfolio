"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { worldState } from "@/lib/animation/sceneState";
import { SYSTEM_MAP_NODES, type SystemNodeDef } from "@/components/Background/SystemMap3D";

gsap.registerPlugin(ScrollTrigger);

interface SkillDetail {
  id: string;
  name: string;
  category: string;
  code: string;
  metric: string;
  description: string;
  techs: string[];
  isAmber?: boolean;
}

const SKILL_DETAILS: SkillDetail[] = [
  {
    id: "arch",
    name: "FRONTEND ARCHITECTURE",
    category: "CORE TOPOLOGY",
    code: "ARCH_01",
    metric: "MODULAR // EXTENSIBLE",
    description: "Designing deterministic, scalable application shells, state machines, and micro-frontend component hierarchies with strict separation of concerns.",
    techs: ["Next.js App Router", "Server Components", "State Machines", "Turborepo"],
    isAmber: true,
  },
  {
    id: "react",
    name: "REACT",
    category: "RUNTIME FRAMEWORK",
    code: "REACT_02",
    metric: "CONCURRENT 19 ENGINE",
    description: "Mastery of React 19 concurrent features, streaming SSR, Server Components, and zero-layout-shift hydration pipelines.",
    techs: ["React 19", "Server Components", "Custom Hooks", "Action Transitions"],
  },
  {
    id: "next",
    name: "NEXT.JS",
    category: "FULLSTACK PLATFORM",
    code: "NEXT_03",
    metric: "SSR · SSG · EDGE RUNTIME",
    description: "Hybrid rendering architectures, incremental static regeneration, edge middleware routing, and streaming responses.",
    techs: ["Next.js 15", "App Router", "Edge Middleware", "Route Handlers"],
  },
  {
    id: "ts",
    name: "TYPESCRIPT",
    category: "LANGUAGE INTEGRITY",
    code: "TS_04",
    metric: "100% STRICT TYPE SAFETY",
    description: "Zero `any` guarantee with expressive generic systems, branded types, compile-time schema validation, and template literal types.",
    techs: ["TypeScript 5.8", "Zod", "Branded Types", "Generics"],
    isAmber: true,
  },
  {
    id: "js",
    name: "JAVASCRIPT",
    category: "LANGUAGE ENGINE",
    code: "JS_05",
    metric: "V8 JIT & MICROTASKS",
    description: "Deep mastery of the event loop, garbage collection heuristics, Web Workers, memory profiling, and modern ECMAScript idioms.",
    techs: ["ESNext", "Event Loop", "Web Workers", "Memory Profiling"],
  },
  {
    id: "gsap",
    name: "GSAP",
    category: "CHOREOGRAPHY ENGINE",
    code: "GSAP_06",
    metric: "60 FPS GPU PIPELINE",
    description: "Physics-based interpolation, scroll scrubbing, morphing SVGs, and sophisticated cinematic timeline sequencing.",
    techs: ["GSAP 3", "ScrollTrigger", "Flip", "Lenis Scroll"],
  },
  {
    id: "webgl",
    name: "WEBGL & THREE.JS",
    category: "3D SPATIAL COMPUTATION",
    code: "GL_07",
    metric: "CUSTOM GLSL SHADERS",
    description: "Constructing responsive 3D environments, camera trajectories, particle stream simulations, and procedural materials.",
    techs: ["Three.js", "React Three Fiber", "GLSL Shaders", "Drei"],
    isAmber: true,
  },
  {
    id: "ds",
    name: "DESIGN SYSTEMS",
    category: "DESIGN ARCHITECTURE",
    code: "DS_08",
    metric: "COMPOSABLE PRIMITIVES",
    description: "Tokenized design systems, fluid typography scales, atomic component architectures, and ergonomic developer ergonomics.",
    techs: ["Tailwind CSS", "Radix UI", "Design Tokens", "CVA Primitives"],
  },
  {
    id: "perf",
    name: "PERFORMANCE",
    category: "RUNTIME OPTIMIZATION",
    code: "PERF_09",
    metric: "99+ CORE WEB VITALS",
    description: "Relentless frame-budget profiling, layout thrash elimination, intelligent code splitting, and sub-second LCP.",
    techs: ["Lighthouse 100", "Bundle Splitting", "Web Vitals", "Critical CSS"],
    isAmber: true,
  },
  {
    id: "a11y",
    name: "ACCESSIBILITY",
    category: "STANDARDS & EQUITY",
    code: "A11Y_10",
    metric: "WCAG 2.2 AAA COMPLIANCE",
    description: "Screen reader semantic rigor, ARIA live announcements, keyboard navigation focus rings, and prefers-reduced-motion choreography.",
    techs: ["WCAG AAA", "ARIA Live", "Focus Management", "Contrast Audit"],
  },
];

// Connected neighbors lookup for visual hierarchy
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 4], [0, 5], [5, 6], [0, 7], [0, 8], [0, 9], [1, 7], [2, 8], [6, 8],
];

export default function SkillsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    // Pinning across 320vh for controlled scroll-driven system map navigation (Requirements 10 & 11)
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=260%",
      pin: containerRef.current,
      pinSpacing: true,
      onUpdate: (self) => {
        const step = Math.min(
          SKILL_DETAILS.length - 1,
          Math.floor(self.progress * SKILL_DETAILS.length)
        );
        setActiveIdx(step);
        worldState.activeSkillIndex = step;
      },
    });

    return () => trigger.kill();
  }, []);

  const handleSelectNode = (i: number) => {
    setActiveIdx(i);
    worldState.activeSkillIndex = i;
  };

  const activeNode = SKILL_DETAILS[activeIdx] || SKILL_DETAILS[0];
  const active3DNode = SYSTEM_MAP_NODES[activeIdx] || SYSTEM_MAP_NODES[0];

  // Helper to determine if a node is available (connected to active)
  const isAvailableNode = (i: number) => {
    return CONNECTIONS.some(([a, b]) => (a === activeIdx && b === i) || (b === activeIdx && a === i));
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative min-h-[320vh] bg-transparent"
    >
      <div
        ref={containerRef}
        className="h-screen w-full flex flex-col justify-between px-4 sm:px-8 md:px-12 py-16 sm:py-20 overflow-hidden"
      >
        {/* Top Header Readout with Live Spatial Telemetry in Deep Navy / Cyan */}
        <div className="w-full max-w-[1360px] mx-auto flex justify-between items-start pt-2 sm:pt-4 border-b border-[var(--hairline)] pb-3">
          <div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[var(--accent-cyan)] mb-1 flex items-center gap-2">
              <span className="w-2 h-[1px] bg-[var(--accent-cyan)]" />
              <span>02 // SYSTEM MAP & ARCHITECTURE</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[var(--text-primary)] tracking-tight">
              TECHNICAL TOPOLOGY
            </h2>
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)] text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              <span className="text-[var(--text-primary)] font-semibold">
                NODE [{String(activeIdx + 1).padStart(2, "0")}/10]: {activeNode.code}
              </span>
            </div>
            <span className="text-[var(--text-meta)] hidden sm:inline">
              3D POS: [{active3DNode.pos.map(v => v.toFixed(1)).join(", ")}]
            </span>
          </div>
        </div>

        {/* Center: Architectural HUD Layout (Open center allows 3D System Map to be visible) */}
        <div className="w-full max-w-[1360px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">

          {/* Left: System Blueprint Matrix / 10 Node Bus with Explicit Visual Hierarchy */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-meta)] flex justify-between items-center mb-1">
              <span>SYSTEM BUS // SELECT NODE</span>
              <span className="text-[var(--accent-cyan)] text-[8px]">TAP / SCROLL TO FOCUS</span>
            </div>

            {/* Scrollable Node Chips on Mobile / Grid on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-[44vh] sm:max-h-none overflow-y-auto pr-1">
              {SKILL_DETAILS.map((node, i) => {
                const isActive = i === activeIdx;
                const isAvailable = isAvailableNode(i);

                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(i)}
                    className={`group text-left px-3 py-2 border transition-all duration-300 relative ${
                      isActive
                        ? "border-[var(--accent-cyan)] bg-[#0B1E30]/90 shadow-[0_0_18px_rgba(101,214,232,0.22)]"
                        : isAvailable
                        ? "border-[var(--accent)]/35 bg-[#0C1524]/60 hover:border-[var(--accent)]"
                        : "border-[var(--hairline)] bg-[#10141C]/50 hover:border-[var(--hairline-lg)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[8px] uppercase tracking-wider ${
                          isActive
                            ? "text-[var(--accent-cyan)] font-semibold"
                            : isAvailable
                            ? "text-[var(--accent)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {node.code}
                      </span>
                      <div className="flex items-center gap-1">
                        {node.isAmber && (
                          <span className="w-1 h-1 rounded-full bg-[var(--accent-amber)]" title="Key Architectural Indicator" />
                        )}
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            isActive
                              ? "bg-[var(--accent-cyan)] shadow-[0_0_6px_#65D6E8]"
                              : isAvailable
                              ? "bg-[var(--accent)]/60"
                              : "bg-transparent border border-white/15"
                          }`}
                        />
                      </div>
                    </div>
                    <div
                      className={`font-display font-bold text-xs sm:text-sm tracking-tight truncate mt-0.5 ${
                        isActive
                          ? "text-[var(--text-primary)]"
                          : isAvailable
                          ? "text-[var(--text-sec)] group-hover:text-[var(--text-primary)]"
                          : "text-[var(--text-muted)] group-hover:text-[var(--text-sec)]"
                      }`}
                    >
                      {node.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Node Architectural Console in Deep Navy + Cyan + Amber */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="relative p-5 sm:p-7 border border-[var(--hairline-lg)] bg-[#0B1322]/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-4">

              {/* Console Top Datum Line */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--hairline)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-ping" />
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[var(--accent-cyan)] font-semibold">
                    TOPOLOGY // {activeNode.category}
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[var(--accent-amber)] px-2 py-0.5 border border-[var(--accent-amber)]/30 bg-[#16120C]">
                  {activeNode.metric}
                </span>
              </div>

              {/* Node Heading in Warm White */}
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
                  {activeNode.name}
                </h3>
              </div>

              {/* Architectural Description in Cool Grey */}
              <p className="text-[var(--text-sec)] text-xs sm:text-sm md:text-base leading-relaxed">
                {activeNode.description}
              </p>

              {/* System Integrations Chips */}
              <div className="pt-3 border-t border-[var(--hairline)]">
                <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-meta)] mb-2">
                  SYSTEM INTEGRATIONS //
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {activeNode.techs.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-[#0C1A2E] border border-[var(--accent-cyan)]/25 font-mono text-[9px] sm:text-[10px] text-[var(--accent-cyan)] tracking-wider"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Navigation Ticker */}
        <div className="w-full max-w-[1360px] mx-auto flex justify-between items-center font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] border-t border-[var(--hairline)] pt-3">
          <span>SCROLL NAVIGATES CAMERA THROUGH ARCHITECTURAL TOPOLOGY</span>
          <span className="hidden sm:inline text-[var(--accent-cyan)]">10 / 10 NODES INTEGRATED</span>
        </div>
      </div>
    </section>
  );
}