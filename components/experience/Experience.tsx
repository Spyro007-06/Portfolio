"use client";

// Experience as an editorial sequence. Each entry owns a diagonal step of the page: its year
// slides through behind it, the role rises in, and responsibilities are drawn out one by one as
// you read down. A sticky rail on the left fills with progress and lights each node on arrival.

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { TIMELINE, type Timeline } from "@/data/portfolio";
import { Label, SplitLines } from "../motion/primitives";
import { ACCENT, T } from "../motion/tokens";

export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const rm = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 60%", "end 70%"] });

  return (
    <section id="experience" ref={ref} aria-labelledby="exp-h" className="px-pad relative py-[16vh]">
      <div className="mb-16 flex items-center justify-between border-t border-line pt-4">
        <Label>
          <span className="text-acid">04</span> — Experience
        </Label>
        <Label className="hidden sm:inline">Work / Education</Label>
      </div>
      <SplitLines as="h2" id="exp-h" className="display mb-[10vh] text-[clamp(2.6rem,7vw,7.5rem)]" lines={["Where I’m", "building now."]} />

      <div className="grid gap-10 lg:grid-cols-12">
        <Rail p={p} rm={!!rm} />
        <ol className="space-y-[18vh] lg:col-span-10">
          {TIMELINE.map((t, i) => (
            <Entry key={t.org} t={t} i={i} rm={!!rm} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Rail({ p, rm }: { p: MotionValue<number>; rm: boolean }) {
  return (
    <div aria-hidden className="hidden lg:col-span-2 lg:block">
      <div className="sticky top-[30vh] flex h-[40vh] gap-4">
        <div className="relative w-px bg-line">
          <motion.div className="absolute inset-0 origin-top bg-bone" style={rm ? undefined : { scaleY: p }} />
          {TIMELINE.map((t, i) => (
            <Node key={t.org} p={p} at={(i + 0.35) / TIMELINE.length} top={`${((i + 0.35) / TIMELINE.length) * 100}%`} color={ACCENT[t.accent]} rm={rm} />
          ))}
        </div>
        <div className="mono flex flex-col justify-between text-[10px] uppercase tracking-[0.16em] text-faint">
          <span>Now</span>
          <span>{TIMELINE[TIMELINE.length - 1].start}</span>
        </div>
      </div>
    </div>
  );
}

function Node({ p, at, top, color, rm }: { p: MotionValue<number>; at: number; top: string; color: string; rm: boolean }) {
  const on = useTransform(p, [at - 0.02, at + 0.02], [0, 1]);
  const scale = useTransform(on, [0, 1], [0.6, 1.4]);
  const bg = useTransform(on, [0, 1], ["#55544F", color]);
  return <motion.span className="absolute -left-[4px] h-[9px] w-[9px] rounded-full" style={{ top, scale: rm ? 1 : scale, backgroundColor: rm ? color : bg }} />;
}

function Entry({ t, i, rm }: { t: Timeline; i: number; rm: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yearX = useTransform(p, [0, 1], ["18%", "-22%"]);
  const accent = ACCENT[t.accent];

  return (
    <li ref={ref} className={`relative ${i % 2 ? "lg:ml-[22%]" : ""}`}>
      <motion.span
        aria-hidden
        className="display outline-text pointer-events-none absolute -top-[0.45em] right-0 -z-10 select-none text-[clamp(7rem,22vw,22rem)] leading-none"
        style={rm ? undefined : { x: yearX }}
      >
        {t.start}
      </motion.span>

      <div className="mono mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.16em]">
        <span style={{ color: accent }}>● {t.kind}</span>
        <span className="text-dim">{t.period}</span>
      </div>
      <SplitLines as="h3" className="text-[clamp(2rem,4.6vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.035em]" lines={[t.role]} />
      {/* observe the unclipped wrapper: a fully clipped element never reports as intersecting */}
      <motion.div initial="out" whileInView="in" viewport={{ once: true, margin: "-20%" }}>
        <motion.p
          className="mt-3 text-xl text-dim md:text-2xl"
          variants={{ out: { clipPath: "inset(0 100% 0 0)" }, in: { clipPath: "inset(0 0% 0 0)", transition: { ...T.slow, delay: 0.25 } } }}
        >
          {t.org}
        </motion.p>
      </motion.div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <p className="max-w-md text-[15px] leading-relaxed text-dim">{t.desc}</p>
        <ul className="space-y-0">
          {t.focus.map((f, k) => (
            <Focus key={f} p={p} k={k} n={t.focus.length} text={f} accent={accent} rm={rm} />
          ))}
        </ul>
      </div>
    </li>
  );
}

function Focus({ p, k, n, text, accent, rm }: { p: MotionValue<number>; k: number; n: number; text: string; accent: string; rm: boolean }) {
  // progressive: each responsibility arrives a little further down the read
  const a = 0.28 + (k / n) * 0.16;
  const o = useTransform(p, [a, a + 0.08], [0.15, 1]);
  const x = useTransform(p, [a, a + 0.08], [24, 0]);
  const w = useTransform(p, [a, a + 0.1], [0, 1]);
  return (
    <li className="relative border-b border-line py-2.5">
      <motion.span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-full origin-left" style={{ background: accent, scaleX: rm ? 1 : w, opacity: 0.6 }} />
      <motion.span className="block text-[15px]" style={rm ? undefined : { opacity: o, x }}>
        {text}
      </motion.span>
    </li>
  );
}
