"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PERSONAL_INFO } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export default function ContactScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          once: true,
        },
      });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1.0, duration: 1.0, ease: "power3.out" },
        0.1
      ).fromTo(
        linksRef.current?.querySelectorAll(".contact-item") ?? [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" },
        0.35
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-between px-4 sm:px-8 md:px-12 pt-24 sm:pt-32 pb-14 sm:pb-16 overflow-hidden"
    >
      {/* Subtle Warm Horizon Ambient Halo (Near Black + Champagne + Soft Amber) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none rounded-full blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(216, 183, 122, 0.45) 0%, rgba(197, 139, 82, 0.20) 45%, transparent 70%)",
        }}
      />

      {/* Top Header Marker (Requirement: Near Black + Graphite + Champagne) */}
      <div className="w-full max-w-[1360px] mx-auto flex items-center gap-3 relative z-10">
        <span className="w-2 h-[1px] bg-[var(--accent-champagne)]" />
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[var(--accent-champagne)]">
          05 // THE EXIT & HORIZON
        </span>
      </div>

      {/* Center: Monumental Typography in Warm White and Champagne */}
      <div className="w-full max-w-[1360px] mx-auto my-auto py-8 sm:py-12 flex flex-col items-start relative z-10">
        <h2
          ref={headlineRef}
          className="font-display font-black leading-[0.88] tracking-[-0.04em] text-[var(--text-primary)] text-[clamp(2.6rem,7.5vw,9.5rem)] uppercase"
        >
          LET&apos;S BUILD
          <br />
          <span className="text-[var(--accent-champagne)]">SOMETHING</span>
          <br />
          EXCEPTIONAL.
        </h2>

        <p className="mt-6 sm:mt-8 max-w-[50ch] text-[var(--text-sec)] text-sm sm:text-base md:text-lg font-light leading-relaxed">
          Open to senior engineering roles, technical architecture collaborations, and frontier digital product ventures.
        </p>

        {/* Contact Links with Warm Champagne & Amber Interactions */}
        <div
          ref={linksRef}
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full pt-8 sm:pt-10 border-t border-[var(--hairline)]"
        >
          <div className="contact-item flex flex-col gap-1">
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--accent-champagne)]">
              DIRECT LINE
            </span>
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              data-cursor="EMAIL"
              className="font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-amber)] transition-colors break-all"
            >
              {PERSONAL_INFO.email}
            </a>
          </div>

          <div className="contact-item flex flex-col gap-1">
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--accent-champagne)]">
              CODE & REPOSITORIES
            </span>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="GITHUB"
              className="font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-amber)] transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <span>↗</span>
            </a>
          </div>

          <div className="contact-item flex flex-col gap-1">
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--accent-champagne)]">
              PROFESSIONAL NETWORK
            </span>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="CONNECT"
              className="font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-amber)] transition-colors inline-flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <span>↗</span>
            </a>
          </div>

          <div className="contact-item flex flex-col gap-1">
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--accent-champagne)]">
              DOCUMENTATION
            </span>
            <a
              href={`mailto:${PERSONAL_INFO.email}?subject=Resume%20Request`}
              data-cursor="RESUME"
              className="font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:text-[var(--accent-amber)] transition-colors inline-flex items-center gap-1"
            >
              <span>Request CV / Resume</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Architectural Horizon Footer in Champagne & Graphite */}
      <div className="w-full max-w-[1360px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-[var(--hairline)] font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] relative z-10">
        <div>
          THARUN B.L. · {new Date().getFullYear()}
        </div>
        <div className="text-center sm:text-right text-[var(--accent-champagne)] opacity-80">
          DIGITAL ARCHITECTURE // CONTINUOUS CINEMATIC ENGINE
        </div>
      </div>
    </section>
  );
}