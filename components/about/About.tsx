"use client";

// About as an editorial spread. Three depths move at different rates while the section passes:
// statement (slow), portrait (clip-path opens as it enters, image counter-scales), spec sheet
// (rows arrive at staggered rates and lock into alignment — a stack of plates, not a paragraph).

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EXPLORING, PERSON, PRINCIPLES, TIMELINE } from "@/data/portfolio";
import { Label, SplitLines } from "../motion/primitives";
import { EASE, T } from "../motion/tokens";

function Ticker({ items }: { items: string[] }) {
  const rm = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (rm) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 2400);
    return () => clearInterval(id);
  }, [rm, items.length]);
  if (rm) return <span>{items.join(", ")}</span>;
  return (
    <span className="relative inline-flex h-[1.4em] overflow-hidden align-bottom" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={items[i]}
          className="block whitespace-nowrap"
          initial={{ y: "100%" }}
          animate={{ y: "0%", transition: { duration: 0.6, ease: EASE.out } }}
          exit={{ y: "-100%", transition: { duration: 0.4, ease: EASE.in } }}
        >
          {items[i]}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{items.join(", ")}</span>
    </span>
  );
}

const work = TIMELINE.find((t) => t.kind === "Work")!;
const edu = TIMELINE.find((t) => t.kind === "Education")!;
const SPEC: [string, React.ReactNode][] = [
  ["Location", PERSON.location],
  ["Focus", "Frontend engineering × AI products"],
  ["Stack", "HTML · CSS · JavaScript · REST APIs · LLMs"],
  ["Experience", `${work.role}, ${work.org} — ${work.start} →`],
  ["Education", `CSE, Sri Shakthi IET — ${edu.start} →`],
  ["Exploring", <Ticker key="t" items={EXPLORING} />],
];

function Row({ p, k, label, value }: { p: MotionValue<number>; k: number; label: string; value: React.ReactNode }) {
  const rm = useReducedMotion();
  const y = useTransform(p, [0.15, 0.5], [20 + k * 22, 0]); // plates assemble, then hold
  return (
    <motion.div style={rm ? undefined : { y }} className="group grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-t border-line py-3.5 md:grid-cols-[9rem_1fr]">
      <Label className="transition-colors group-hover:text-acid">{label}</Label>
      <span className="text-[15px] md:text-base">{value}</span>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const pic = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: pp } = useScroll({ target: pic, offset: ["start end", "center center"] });
  const clip = useTransform(pp, [0, 1], ["inset(22% 18% 22% 18%)", "inset(0% 0% 0% 0%)"]);
  const zoom = useTransform(pp, [0, 1], [1.35, 1]);
  const ySlow = useTransform(p, [0, 1], ["6vh", "-6vh"]);
  const yPic = useTransform(p, [0, 1], ["12vh", "-14vh"]);

  return (
    <section id="about" ref={ref} aria-labelledby="about-h" className="px-pad relative py-[18vh]">
      <div className="mb-14 flex items-center justify-between border-t border-line pt-4">
        <Label>
          <span className="text-acid">01</span> — About
        </Label>
        <Label className="hidden sm:inline">Index / Profile</Label>
      </div>

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
        <motion.div style={rm ? undefined : { y: ySlow }} className="lg:col-span-7">
          <h2 id="about-h" className="sr-only">About</h2>
          <SplitLines
            className="display text-[clamp(2.6rem,6.4vw,6.8rem)]"
            lines={[
              "Understand",
              "the problem.",
              <span key="c">
                Then make it <span className="serif normal-case tracking-normal text-dim">simple.</span>
              </span>,
            ]}
          />
          <motion.p
            className="mt-10 max-w-xl text-lg leading-relaxed text-dim md:text-xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ ...T.slow, delay: 0.3 }}
          >
            I&apos;m <span className="text-bone">Tharun</span> — a frontend developer and CSE student in Coimbatore.{" "}
            {PERSON.statement} I learn fastest by turning ideas into working products, then
            iterating until the complexity disappears from the interface.
          </motion.p>
        </motion.div>

        <div className="lg:col-span-5">
          <motion.div ref={pic} style={rm ? undefined : { y: yPic }} className="relative ml-auto w-[78%] max-w-[420px] lg:w-full" data-cursor="Explore">
            <motion.div style={rm ? undefined : { clipPath: clip }} className="relative aspect-[4/5] overflow-hidden bg-graphite">
              <motion.div style={rm ? undefined : { scale: zoom }} className="absolute inset-0">
                <Image
                  src="/images/profile.jpg"
                  alt="Portrait of Tharun B.L"
                  fill
                  sizes="(min-width: 1024px) 30vw, 78vw"
                  className="object-cover grayscale contrast-[1.08] transition-[filter] duration-700 hover:grayscale-0"
                />
              </motion.div>
            </motion.div>
            <div className="mono mt-3 flex justify-between text-[10px] uppercase tracking-[0.16em] text-faint">
              <span>Fig. 01 — {PERSON.name}</span>
              <span>{PERSON.coords}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-[14vh] grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label>Spec sheet</Label>
        </div>
        <div className="border-b border-line lg:col-span-7">
          {SPEC.map(([l, v], k) => (
            <Row key={l} p={p} k={k} label={l} value={v} />
          ))}
        </div>
      </div>

      <Principles />
    </section>
  );
}

function Principles() {
  const ref = useRef<HTMLOListElement>(null);
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 35%"] });
  return (
    <div className="mt-[16vh]">
      <Label>Operating principles</Label>
      <ol ref={ref} className="mt-6 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((pr, i) => (
          <Principle key={pr.title} i={i} p={scrollYProgress} rm={!!rm} {...pr} />
        ))}
      </ol>
    </div>
  );
}

function Principle({ i, p, rm, title, copy }: { i: number; p: MotionValue<number>; rm: boolean; title: string; copy: string }) {
  // the rule draws left→right, each one a beat after the last
  const start = i * 0.15;
  const draw = useTransform(p, [start, start + 0.55], [0, 1]);
  const o = useTransform(p, [start + 0.1, start + 0.6], [0, 1]);
  return (
    <li className="relative pr-6 pt-5">
      <motion.span aria-hidden className="absolute left-0 top-0 h-px w-full origin-left bg-bone/40" style={rm ? undefined : { scaleX: draw }} />
      <motion.div style={rm ? undefined : { opacity: o }}>
        <span className="mono text-[11px] text-acid">0{i + 1}</span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-dim">{copy}</p>
      </motion.div>
    </li>
  );
}
