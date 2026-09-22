"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambleText from "../typography/ScrambleText";

gsap.registerPlugin(ScrollTrigger);

export default function HeroScene() {
  const containerRef       = useRef<HTMLElement>(null);
  const eyebrowRef         = useRef<HTMLDivElement>(null);
  const line1Ref           = useRef<HTMLDivElement>(null);
  const line2Ref           = useRef<HTMLDivElement>(null);
  const line3Ref           = useRef<HTMLDivElement>(null);
  const descRef            = useRef<HTMLParagraphElement>(null);
  const ctaRef             = useRef<HTMLDivElement>(null);
  const photoFrameRef      = useRef<HTMLDivElement>(null);
  const transitionFrameRef = useRef<HTMLDivElement>(null);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Initial hidden state set via GSAP
    gsap.set(eyebrowRef.current, { opacity: 0, y: 6 });
    gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], { y: 70, opacity: 0 });
    gsap.set(descRef.current, { opacity: 0, y: 16 });
    gsap.set(ctaRef.current, { opacity: 0, y: 12 });
    gsap.set(photoFrameRef.current, { opacity: 0, scale: 0.95 });

    // Exact Cinematic Masked Reveal Sequence (Requirement 5)
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 0.0–0.4s: Small eyebrow appears
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.0);

    // 0.3–1.1s: First heading line reveals upward behind clipping plane
    tl.to(line1Ref.current, { y: 0, opacity: 1, duration: 0.8 }, 0.3);

    // 0.5–1.4s: Second heading line reveals upward
    tl.to(line2Ref.current, { y: 0, opacity: 1, duration: 0.9 }, 0.5);

    // 0.8–1.7s: Third heading line reveals upward
    tl.to(line3Ref.current, { y: 0, opacity: 1, duration: 0.9 }, 0.8);

    // 1.2–2.0s: Supporting paragraph fades and moves slightly upward
    tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.8 }, 1.2);

    // CTA & Photo Frame Fade-in
    tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, 1.4);
    tl.to(photoFrameRef.current, { opacity: 1, scale: 1.0, duration: 1.0, ease: "power2.out" }, 0.6);

    // Section 7: Scroll Transformation — Hero to About
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top+=80 top",
        end: "bottom top",
        scrub: 1.0,
      },
    });

    scrollTl
      // Hero typography gradually dissolves into environment
      .to(".hero-editorial-group", {
        scale: 0.90,
        opacity: 0,
        y: "-16vh",
        ease: "power2.inOut",
      }, 0)
      .to(photoFrameRef.current, {
        scale: 0.88,
        opacity: 0,
        y: "-12vh",
        ease: "power2.inOut",
      }, 0);

    if (transitionFrameRef.current) {
      scrollTl.fromTo(
        transitionFrameRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
        0.55
      );
    }

    return () => {
      tl.kill();
      scrollTl.kill();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[135vh] flex flex-col justify-start px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 pb-20 overflow-hidden"
    >
      <div className="w-full max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4 sm:pt-8">

        {/* Left Column — Editorial Typography Composition (Graphite + Electric Blue + Subtle Cyan) */}
        <div className="lg:col-span-8 flex flex-col hero-editorial-group">
          {/* 0.0–0.4s Eyebrow */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-4 sm:mb-6">
            <span className="w-2 h-[1px] bg-[var(--accent-cyan)]" />
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[var(--accent-cyan)] font-semibold">
              <ScrambleText text="01 // THE DIGITAL CHAMBER" delay={0.1} />
            </span>
          </div>

          {/* Heading Composition with Masked Reveal Clipping Planes */}
          <h1 className="font-display font-black uppercase text-[var(--text-primary)] leading-[0.88] tracking-[-0.04em] flex flex-col">
            {/* Line 1: HELLO, I'M in Cool Grey */}
            <div className="overflow-hidden pb-1">
              <div
                ref={line1Ref}
                className="text-[clamp(2.2rem,5vw,5.5rem)] text-[var(--text-sec)] opacity-90"
              >
                HELLO, I&apos;M
              </div>
            </div>

            {/* Line 2: THARUN B.L. in Warm White */}
            <div className="overflow-hidden pb-2">
              <div
                ref={line2Ref}
                className="text-[clamp(3.8rem,9vw,9.5rem)] text-[var(--text-primary)]"
              >
                THARUN B.L.
              </div>
            </div>

            {/* Line 3: SENIOR FRONTEND DEVELOPER in Electric Blue */}
            <div className="overflow-hidden pb-1">
              <div
                ref={line3Ref}
                className="text-[clamp(1.6rem,3.8vw,4rem)] text-[var(--accent)] tracking-[-0.02em]"
              >
                SENIOR FRONTEND DEVELOPER
              </div>
            </div>
          </h1>

          {/* Supporting Statement Line in Cool Grey */}
          <p
            ref={descRef}
            className="mt-6 sm:mt-8 max-w-[56ch] text-[var(--text-sec)] text-sm sm:text-base md:text-lg font-light leading-relaxed"
          >
            I design and engineer interfaces where motion, performance and interaction become part of the product.
          </p>

          {/* CTA & Technical Indicator */}
          <div ref={ctaRef} className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="#about"
              data-cursor="EXPLORE"
              className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 border border-[var(--hairline-lg)] bg-[#101217]/80 hover:bg-[var(--accent)] hover:text-[#08090C] transition-all duration-300 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em]"
            >
              <span>EXPLORE ARCHITECTURE</span>
              <span>↓</span>
            </a>
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[var(--text-meta)]">
              COIMBATORE, INDIA // SCROLL TO NAVIGATE
            </span>
          </div>
        </div>

        {/* Right Column — Protected Dedicated Portrait Frame (Visually isolated, subtle cool rim) */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end mt-4 lg:mt-0">
          <div
            ref={photoFrameRef}
            className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[4/5] p-2.5 sm:p-3 border border-[var(--hairline-lg)] bg-[#101217] shadow-[0_30px_70px_rgba(0,0,0,0.95)] ring-1 ring-[var(--accent)]/15"
            style={{ zIndex: 10 }}
          >
            {/* Top Frame Marker in Desaturated Blue */}
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-[var(--hairline)] font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
              <span>PORTRAIT // ARCHIVE</span>
              <span>DEV_ID: 007-06</span>
            </div>

            {/* Photo Container with Grain & Separation (No color wash placed directly over portrait) */}
            <div className="relative w-full h-[calc(100%-24px)] overflow-hidden bg-[#08090C] border border-[var(--hairline)]">
              {!imgError ? (
                <Image
                  src="/images/profile.jpg"
                  alt="Tharun B.L. — Senior Frontend Developer"
                  fill
                  unoptimized
                  className="object-cover object-top filter brightness-95 contrast-105 hover:brightness-105 transition-all duration-700"
                  onError={() => setImgError(true)}
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <span className="font-display font-black text-6xl text-[var(--text-muted)] opacity-20">T</span>
                  <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                    THARUN B.L.
                  </span>
                </div>
              )}

              {/* Protected Frame Grain Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 7: Structural Frame Transition Mask (~70vh scroll) */}
      <div
        ref={transitionFrameRef}
        className="absolute bottom-12 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent pointer-events-none origin-center opacity-0"
        style={{ willChange: "transform, opacity" }}
      />

      {/* Section 7 Transition Horizon Datum */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent pointer-events-none" />
    </section>
  );
}