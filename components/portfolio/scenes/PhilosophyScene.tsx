"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "../ui/SectionLabel";
import { APPROACH } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export default function PhilosophyScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildRef   = useRef<HTMLSpanElement>(null);
  const iterRef    = useRef<HTMLSpanElement>(null);
  const shipRef    = useRef<HTMLSpanElement>(null);
  const itemsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Kinetic text — each word at different scroll speed / direction
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      tl.to(buildRef.current, { x: "-8vw", ease: "none" }, 0)
        .to(iterRef.current,  { x: "4vw",  ease: "none" }, 0)
        .to(shipRef.current,  { x: "-12vw", y: "-2vh", ease: "none" }, 0);

      // Approach items stagger reveal
      const items = itemsRef.current?.querySelectorAll(".approach-item");
      if (items && items.length > 0) {
        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
          },
        });

        enterTl.from(items, {
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-8 md:px-12 py-32 overflow-hidden"
    >
      <div className="w-full max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* Left — kinetic display text */}
        <div className="lg:col-span-7 content-safe-zone">
          <SectionLabel number="05" name="PHILOSOPHY" />
          <div className="mt-10 select-none overflow-visible">
            <div className="font-display font-black text-[clamp(4rem,9vw,10rem)] leading-[0.82] tracking-[-0.05em] uppercase">
              <div className="overflow-visible">
                <span ref={buildRef} className="inline-block text-[var(--text-primary)]">SYSTEMS.</span>
              </div>
              <div className="overflow-visible">
                <span ref={iterRef} className="inline-block text-[var(--text-muted)] pl-[3vw]">OVER.</span>
              </div>
              <div className="overflow-visible">
                <span ref={shipRef} className="inline-block text-[var(--text-primary)]">DEMOS.</span>
              </div>
            </div>
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Real progress comes from building systems that last, not demos that impress.
          </p>
        </div>

        {/* Right — approach items & vertical mantra */}
        <div className="lg:col-span-5 flex gap-6 content-safe-zone" ref={itemsRef}>
          {/* Vertical phrase: BUILD / VERIFY / IMPROVE / REPEAT */}
          <div className="hidden sm:flex flex-col justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)] border-r border-white/10 pr-4 opacity-40 select-none">
            <span>BUILD</span>
            <span>•</span>
            <span>VERIFY</span>
            <span>•</span>
            <span>IMPROVE</span>
            <span>•</span>
            <span>REPEAT</span>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {APPROACH.map((item) => (
              <div key={item.idx} className="approach-item opacity-0 p-4 border border-[var(--hairline)] bg-[#05090B]/60 rounded-xs">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--accent)] mb-1">
                  {item.idx} // PRINCIPLE
                </div>
                <h4 className="font-display font-bold text-base text-[var(--text-primary)] mb-1 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}