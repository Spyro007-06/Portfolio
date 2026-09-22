"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PERSONAL_INFO } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export default function AboutScene() {
  const sectionRef   = useRef<HTMLElement>(null);
  const markerRef    = useRef<HTMLDivElement>(null);
  const primaryRef   = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const metaRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Depth Layers scroll-driven animation (Requirement 9)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 30%",
          scrub: 1.0,
        },
      });

      // Layer 1: Enormous Vertical Typographic Marker ("01 ABOUT")
      tl.fromTo(
        markerRef.current,
        { y: 60, opacity: 0.2 },
        { y: -30, opacity: 1, ease: "none" },
        0
      )
      // Layer 2: Primary Text Plane (z = 0)
      .fromTo(
        primaryRef.current,
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, ease: "power2.out" },
        0.1
      )
      // Layer 3: Secondary Paragraph (z = -20px depth perception)
      .fromTo(
        secondaryRef.current,
        { y: 90, opacity: 0 },
        { y: 0, opacity: 0.95, ease: "power2.out" },
        0.2
      )
      // Layer 4: Distant Metadata Layer (z = -50px depth perception)
      .fromTo(
        metaRef.current,
        { y: 120, opacity: 0 },
        { y: 0, opacity: 0.85, ease: "power2.out" },
        0.3
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-[130vh] flex items-center px-4 sm:px-8 md:px-12 py-24 sm:py-32 overflow-hidden"
    >
      <div
        className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start relative z-10"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        {/* Section 8: Enormous Vertical Typographic Marker ("01 ABOUT") with Silver & Desaturated Cyan */}
        <div ref={markerRef} className="lg:col-span-4 flex flex-col select-none">
          <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--accent-cyan)] mb-2 sm:mb-3 flex items-center gap-2">
            <span className="w-2 h-[1px] bg-[var(--accent-cyan)]" />
            <span>THE ARCHIVE // 01</span>
          </div>

          <div className="font-display font-black leading-[0.82] text-[clamp(4rem,9.5vw,11rem)] text-[var(--text-primary)]">
            <div className="text-[var(--text-secondary)] opacity-30">01</div>
            <div>ABOUT</div>
          </div>

          {/* Faint Architectural Coordinate Markers in Desaturated Blue */}
          <div className="mt-6 sm:mt-8 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-meta)] opacity-70 flex flex-col gap-1">
            <span>SEC-02 // SYS_ARCHIVE</span>
            <span>LAT 11.0168° N · LNG 76.9558° E</span>
            <span>ATMOSPHERE: CHARCOAL × CYAN × SILVER</span>
          </div>
        </div>

        {/* Multi-Depth Content Columns with Brighter Neutral Editorial Surface */}
        <div className="lg:col-span-8 flex flex-col gap-8 sm:gap-10">

          {/* Primary Text Plane (z = 0) with Brighter Neutral Surface backing important text */}
          <div
            ref={primaryRef}
            className="flex flex-col gap-4 p-6 sm:p-8 bg-[#141A23]/60 border border-[var(--hairline-lg)] backdrop-blur-md rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-5xl leading-tight text-[var(--text-primary)] tracking-[-0.02em]">
              Engineering digital systems where motion is architecture, not decoration.
            </h2>
          </div>

          {/* Secondary Text Plane (approx 20px behind in depth) */}
          <div
            ref={secondaryRef}
            className="flex flex-col gap-5 sm:gap-6 text-[var(--text-sec)] text-sm sm:text-base md:text-lg leading-relaxed max-w-[62ch] border-l-2 border-[var(--accent-cyan)]/40 pl-5 sm:pl-6 bg-[#10151E]/40 backdrop-blur-xs p-5 rounded-xs"
            style={{ transform: "translateZ(-20px)" }}
          >
            <p>
              I build web experiences at the intersection of robust frontend engineering, generative AI, and deliberate interaction design. Every interface is approached not as a static document, but as a responsive physical environment with genuine spatial depth, weight, and hierarchy.
            </p>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm md:text-base">
              My work focuses on pushing browser capability to its limit—combining Next.js architecture, WebGL shaders, and GSAP scroll choreography into high-performance applications that maintain immediate responsiveness and 60 FPS fluidity.
            </p>
          </div>

          {/* Secondary Metadata Layer (Farther in depth) */}
          <div
            ref={metaRef}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-[var(--hairline)]"
            style={{ transform: "translateZ(-45px)" }}
          >
            <div>
              <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--text-meta)] mb-1">
                LOCATION
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)]">
                {PERSONAL_INFO.location}
              </div>
            </div>

            <div>
              <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--text-meta)] mb-1">
                DISCIPLINE
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)]">
                Frontend × AI
              </div>
            </div>

            <div>
              <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--text-meta)] mb-1">
                SPECIALIZATION
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)]">
                Cinematic WebGL
              </div>
            </div>

            <div>
              <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--accent-amber)] mb-1">
                AVAILABILITY
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] shadow-[0_0_6px_#C58B52]" />
                <span>Open for 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thin Horizontal Architectural Scanning Guide Line */}
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)]/30 to-transparent" />
    </section>
  );
}