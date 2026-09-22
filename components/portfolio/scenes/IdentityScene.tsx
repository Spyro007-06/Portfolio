"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "../ui/SectionLabel";
import MaskedReveal from "../typography/MaskedReveal";
import { PERSONAL_INFO } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export default function IdentityScene() {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#identity",
        start: "top 70%",
        end: "bottom 30%",
        scrub: false,
        once: true,
      },
    });
    tl.from(lineRef.current, { attr: { x2: "0%" }, duration: 1.2, ease: "power2.inOut" }, 0);
    return () => { tl.kill(); };
  }, []);

  return (
    <section
      id="identity"
      className="min-h-screen flex items-center px-8 md:px-12 py-32"
    >
      <div className="w-full max-w-[1320px] mx-auto">
        <SectionLabel number="02" name="IDENTITY" />

        {/* Drawing SVG rule */}
        <div className="my-10 overflow-hidden">
          <svg width="100%" height="1" viewBox="0 0 1000 1" preserveAspectRatio="none">
            <line
              ref={lineRef}
              x1="0%" y1="0" x2="100%" y2="0"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Primary statement — large display text */}
        <div className="max-w-[840px] content-safe-zone">
          <h2 className="font-display font-black text-[clamp(2.8rem,6vw,7rem)] leading-[0.88] tracking-[-0.04em] uppercase mb-16">
            <MaskedReveal>
              <span className="text-[var(--text-primary)]">I build</span>
            </MaskedReveal>
            <MaskedReveal delay={0.12}>
              <span className="text-[var(--text-primary)]">digital experiences</span>
            </MaskedReveal>
            <MaskedReveal delay={0.24}>
              <span className="text-[var(--text-muted)] text-[0.6em] font-medium normal-case tracking-normal">
                at the intersection of
              </span>
            </MaskedReveal>
            <MaskedReveal delay={0.36}>
              <span className="text-[var(--text-primary)]">frontend &amp; AI.</span>
            </MaskedReveal>
          </h2>

          {/* Node labels row */}
          <div className="flex flex-wrap gap-6 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {["Frontend Engineering", "AI Integration", "Product Design", "Coimbatore, India"].map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-60" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}