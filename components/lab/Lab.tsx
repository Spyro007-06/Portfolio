"use client";

// Lab. Arrives as fragments: a scatter of tiles in the four project colours falls into a single
// ruled line as you scroll in — the work breaking down into small, testable pieces.
// Then an asymmetric set of instruments, each framed like a specimen, not a card.

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { PROJECTS } from "@/data/portfolio";
import { Label, SplitLines } from "../motion/primitives";
import { ACCENT } from "../motion/tokens";
import { ReorderList, SpringField, SpringTokens, VelocityType } from "./Experiments";

const TILES = Array.from({ length: 24 }, (_, i) => ({
  c: ACCENT[PROJECTS[i % 4].accent],
  // deterministic scatter
  dx: Math.round(Math.sin(i * 12.9898) * 260),
  dy: Math.round(Math.cos(i * 78.233) * 180 - 60),
  r: Math.round(Math.sin(i * 3.7) * 90),
}));

function Tile({ t, p }: { t: (typeof TILES)[number]; p: MotionValue<number> }) {
  const x = useTransform(p, [0, 1], [t.dx, 0]);
  const y = useTransform(p, [0, 1], [t.dy, 0]);
  const rotate = useTransform(p, [0, 1], [t.r, 0]);
  const scale = useTransform(p, [0, 1], [2.2, 1]);
  return <motion.span className="block h-1.5 flex-1" style={{ x, y, rotate, scale, backgroundColor: t.c }} />;
}

function Specimen({ n, title, note, className = "", children }: { n: string; title: string; note: string; className?: string; children: ReactNode }) {
  return (
    <figure className={`relative flex flex-col border-t border-line pt-4 ${className}`}>
      <figcaption className="mb-6 flex items-baseline justify-between gap-6">
        <span>
          <span className="mono text-[11px] text-acid">E.{n}</span>
          <span className="ml-3 text-lg font-semibold tracking-tight">{title}</span>
        </span>
        <span className="hidden max-w-[16rem] text-right text-sm text-dim md:block">{note}</span>
      </figcaption>
      <div className="flex-1">{children}</div>
      <p className="mt-4 text-sm text-dim md:hidden">{note}</p>
    </figure>
  );
}

export default function Lab() {
  const strip = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: strip, offset: ["start end", "start 45%"] });

  return (
    <section id="lab" aria-labelledby="lab-h" className="px-pad relative py-[18vh]">
      <div className="mb-10 flex items-center justify-between border-t border-line pt-4">
        <Label>
          <span className="text-acid">03</span> — Lab
        </Label>
        <Label className="hidden sm:inline">Experiments / Instruments</Label>
      </div>

      <div ref={strip} aria-hidden className="mb-16 flex gap-1">
        {TILES.map((t, i) => (rm ? <span key={i} className="block h-1.5 flex-1" style={{ backgroundColor: t.c }} /> : <Tile key={i} t={t} p={scrollYProgress} />))}
      </div>

      <div className="mb-20 grid gap-8 lg:grid-cols-12">
        <SplitLines as="h2" id="lab-h" className="display text-[clamp(2.6rem,7vw,7.5rem)] lg:col-span-8" lines={["Small systems,", "pulled apart."]} />
        <p className="self-end text-[15px] leading-relaxed text-dim lg:col-span-4">
          The pieces this site is built from, isolated so you can touch them. Every value here comes from the same motion
          tokens that drive the rest of the page.
        </p>
      </div>

      <div className="grid gap-x-10 gap-y-20 lg:grid-cols-12">
        <Specimen n="01" title="Spring field" note="Each point is its own spring. The pointer is a force, not a trigger." className="lg:col-span-8">
          <SpringField />
        </Specimen>
        <Specimen n="02" title="Velocity type" note="Scroll speed drives letter width and lean. Scroll fast, then stop." className="lg:col-span-4">
          <VelocityType />
        </Specimen>
        <Specimen n="03" title="Spring tokens" note="Pull the puck. Release it into one of this site's three springs." className="lg:col-span-5">
          <SpringTokens />
        </Specimen>
        <Specimen n="04" title="Layout, interpolated" note="Drag to reorder, or shuffle. Positions are measured, not animated by hand." className="lg:col-span-6 lg:col-start-7">
          <ReorderList />
        </Specimen>
      </div>
    </section>
  );
}
