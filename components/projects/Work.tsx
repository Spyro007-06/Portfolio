"use client";

// Work — the main event. On desktop, vertical scroll drives a horizontal track inside a sticky
// stage (native scroll, nothing hijacked). Each plate wipes open as it enters from the right,
// its image counter-drifts, and it shears slightly with scroll velocity. The section title
// compresses as the first plate arrives — About's typography giving way to imagery.
// Phones/tablets get a vertical sequence where plates wipe open as they're reached.
// Opening a project morphs its plate into the detail layer (shared layout, see Detail).

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/data/portfolio";
import { Label, useDesktop, useScrollVelocity } from "../motion/primitives";
import { ACCENT, EASE, SPRING, T } from "../motion/tokens";
import Plate from "./Plates";
import Detail from "./Detail";

// Each project is composed differently — plate size, position and text placement vary.
const LAYOUT: { w: string; plate: string; text: string; dir: string; idx?: string }[] = [
  { w: "w-[74vw]", plate: "h-[58vh] w-[64%]", text: "w-[32%] pl-[3vw] self-end", dir: "flex-row" },
  { w: "w-[70vw]", plate: "h-[50vh] w-[58%] self-start mt-[4vh]", text: "w-[36%] pr-[3vw] self-end", dir: "flex-row-reverse" },
  { w: "w-[56vw]", plate: "h-[62vh] w-[56%]", text: "w-[40%] pl-[2.5vw] self-center", dir: "flex-row" },
  { w: "w-[80vw]", plate: "h-[46vh] w-full", text: "w-[70%] pt-6", dir: "flex-col", idx: "right-[-40%] top-[-0.2em]" },
];

export default function Work() {
  const desk = useDesktop();
  const rm = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ span: 0, vw: 1 });
  const [open, setOpen] = useState<Project | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!desk || !track.current) return;
    const el = track.current;
    const m = () => setDims({ span: Math.max(0, el.scrollWidth - innerWidth), vw: innerWidth });
    m();
    const ro = new ResizeObserver(m);
    ro.observe(el);
    addEventListener("resize", m);
    return () => { ro.disconnect(); removeEventListener("resize", m); };
  }, [desk]);

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(p, (v) => -v * dims.span);
  const vel = useScrollVelocity();
  const shear = useTransform(vel, [-3000, 3000], [4, -4], { clamp: true });
  const titleW = useTransform(p, [0, 0.14], [100, 62]);
  const titleO = useTransform(p, [0.05, 0.2], [1, 0.12]);
  const titleVar = useMotionTemplate`"wdth" ${titleW}`;
  const active = useTransform(p, (v) => Math.min(PROJECTS.length, Math.max(1, Math.round(v * PROJECTS.length + 0.3))));
  const count = useTransform(active, (n) => `0${n}`);

  const horizontal = desk; // reduced motion still scrolls horizontally: it's navigation, not decoration

  return (
    <section
      id="work"
      ref={section}
      aria-labelledby="work-h"
      className="relative"
      style={horizontal ? { height: `calc(${dims.span}px + 100vh)` } : undefined}
    >
      <motion.div
        className={horizontal ? "sticky top-0 flex h-screen flex-col overflow-hidden" : "relative"}
        animate={{ scale: open ? 0.94 : 1, opacity: open ? 0.2 : 1 }}
        transition={SPRING.heavy}
      >
        {/* right margin keeps the sticky header clear of the fixed index */}
        <header className="px-pad lg:mt-24">
          <div className="border-t border-line pt-4 lg:mr-[14rem]">
            <Label>
              <span className="text-acid">02</span> — Selected work
            </Label>
          </div>
        </header>

        <div ref={track} className={horizontal ? "flex flex-1 items-center" : "px-pad space-y-24 py-16"}>
          {horizontal ? (
            <motion.div style={{ x, width: "max-content" }} className="flex items-center gap-[8vw] pl-[var(--pad)] pr-[12vw] will-change-transform">
              <Intro titleVar={rm ? undefined : titleVar} titleO={rm ? undefined : titleO} />
              {PROJECTS.map((pr, i) => (
                <Panel key={pr.id} pr={pr} i={i} x={x} vw={dims.vw} shear={rm ? undefined : shear} onOpen={setOpen} hover={hover} setHover={setHover} hidden={open?.id === pr.id} />
              ))}
            </motion.div>
          ) : (
            <>
              <Intro />
              {PROJECTS.map((pr, i) => (
                <Stacked key={pr.id} pr={pr} i={i} onOpen={setOpen} hidden={open?.id === pr.id} />
              ))}
            </>
          )}
        </div>
        {horizontal && <Progress p={p} count={count} />}
      </motion.div>

      <AnimatePresence>{open && <Detail p={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}

function Intro({ titleVar, titleO }: { titleVar?: MotionValue<string>; titleO?: MotionValue<number> }) {
  return (
    <div className="shrink-0 lg:w-[46vw]">
      <motion.h2 id="work-h" className="display text-[clamp(3.2rem,11vw,12rem)]" style={{ fontVariationSettings: titleVar, opacity: titleO }}>
        Selected
        <br />
        <span className="serif normal-case tracking-normal">work,</span> 2026
      </motion.h2>
      <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-dim">
        Four products at the intersection of AI and interface — each one starts from a single question a person actually has.
      </p>
    </div>
  );
}

// hover choreography: every layer moves on its own spring, together
const V = {
  plate: { rest: { scale: 1.06 }, hover: { scale: 1.1 } },
  title: { rest: { x: 0 }, hover: { x: 14 } },
  meta: { rest: { x: 0, opacity: 0.7 }, hover: { x: -6, opacity: 1 } },
  strip: { rest: { y: "101%" }, hover: { y: "0%" } },
  wash: { rest: { opacity: 0 }, hover: { opacity: 1 } },
  idx: { rest: { y: 0 }, hover: { y: -10 } },
};

type PanelProps = {
  pr: Project;
  i: number;
  x: MotionValue<number>;
  vw: number;
  shear?: MotionValue<number>;
  onOpen: (p: Project) => void;
  hover: string | null;
  setHover: (id: string | null) => void;
  hidden: boolean;
};

function Panel({ pr, i, x, vw, shear, onOpen, hover, setHover, hidden }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const L = LAYOUT[i % LAYOUT.length];
  const accent = ACCENT[pr.accent];
  // where this panel sits relative to the viewport, derived from the track position
  const rel = useTransform(x, (v) => {
    const left = (ref.current?.offsetLeft ?? 0) + v;
    return left / vw; // 1 = entering at the right edge, 0 = at the left edge
  });
  const reveal = useTransform(rel, [1.02, 0.45], [100, 0], { clamp: true });
  const clip = useMotionTemplate`inset(0% ${reveal}% 0% 0%)`;
  const drift = useTransform(rel, [1, -0.5], ["-2.5%", "2.5%"]);
  const live = hover === pr.id;

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(pr)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(pr))}
      onHoverStart={() => setHover(pr.id)}
      onHoverEnd={() => setHover(null)}
      onFocus={() => setHover(pr.id)}
      onBlur={() => setHover(null)}
      initial="rest"
      animate={live ? "hover" : "rest"}
      data-cursor="View project"
      aria-label={`${pr.title} — ${pr.subtitle} Open case study`}
      className={`group relative flex shrink-0 gap-0 text-left ${L.w} ${L.dir}`}
    >
      <motion.div variants={V.wash} transition={T.medium} aria-hidden className="pointer-events-none absolute -inset-[3vw] -z-10" style={{ background: `radial-gradient(60% 60% at 40% 50%, ${accent}1f, transparent 70%)` }} />
      <motion.div className={`relative shrink-0 ${L.plate}`} style={{ clipPath: shear ? clip : undefined, skewX: shear }}>
        {!hidden && (
          <motion.div layoutId={`plate-${pr.id}`} className="absolute inset-0 overflow-hidden" transition={SPRING.heavy}>
            <motion.div className="absolute inset-0" style={{ x: shear ? drift : undefined }}>
              <motion.div variants={V.plate} transition={SPRING.soft} className="absolute inset-0">
                <Plate p={pr} live={live} />
              </motion.div>
            </motion.div>
            {pr.flow && (
              <motion.div variants={V.strip} transition={SPRING.snappy} className="mono absolute inset-x-0 bottom-0 flex justify-between bg-ink/85 px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur">
                <span style={{ color: accent }}>{pr.flow.label}</span>
                <span className="text-dim">{pr.flow.steps.join(" → ")}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className={`relative flex flex-col gap-5 ${L.text}`}>
        <motion.span variants={V.idx} transition={SPRING.soft} aria-hidden className={`display outline-text pointer-events-none absolute text-[clamp(5rem,9vw,9rem)] transition-[-webkit-text-stroke-color] duration-300 ${L.idx ?? "-top-[0.85em] left-[0.1em]"}`} style={live ? { WebkitTextStrokeColor: accent } : undefined}>
          {pr.idx}
        </motion.span>
        <motion.div variants={V.meta} transition={SPRING.snappy} className="mono relative flex gap-4 text-[10px] uppercase tracking-[0.16em] text-dim">
          <span style={{ color: accent }}>●</span>
          <span>{pr.category}</span>
          <span>{pr.year}</span>
        </motion.div>
        <motion.h3 layoutId={`title-${pr.id}`} variants={V.title} transition={SPRING.soft} className="relative text-[clamp(1.8rem,3.2vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
          {pr.title}
        </motion.h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-dim">{pr.subtitle}</p>
        <dl className="mono grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.16em]">
          <dt className="text-faint">Domain</dt>
          <dd className="text-dim">{pr.domain}</dd>
          <dt className="text-faint">Year</dt>
          <dd className="text-dim">{pr.year}</dd>
        </dl>
      </div>
    </motion.div>
  );
}

function Stacked({ pr, i, onOpen, hidden }: { pr: Project; i: number; onOpen: (p: Project) => void; hidden: boolean }) {
  const accent = ACCENT[pr.accent];
  return (
    <motion.div role="button" tabIndex={0} onClick={() => onOpen(pr)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(pr))} className="block w-full text-left" initial="out" whileInView="in" viewport={{ once: true, margin: "-15%" }} aria-label={`${pr.title} — ${pr.subtitle} Open case study`}>
      <div className="mono mb-3 flex justify-between text-[10px] uppercase tracking-[0.16em] text-dim">
        <span>
          <span style={{ color: accent }}>{pr.idx}</span> · {pr.category}
        </span>
        <span>{pr.year}</span>
      </div>
      <motion.div
        className={`relative w-full ${i % 2 ? "aspect-[4/5] sm:aspect-[16/10]" : "aspect-[4/3] sm:aspect-[16/9]"}`}
        variants={{ out: { clipPath: "inset(0% 0% 100% 0%)" }, in: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease: EASE.out } } }}
      >
        {!hidden && (
          <motion.div layoutId={`plate-${pr.id}`} className="absolute inset-0 overflow-hidden" transition={SPRING.heavy}>
            <Plate p={pr} live={false} />
          </motion.div>
        )}
      </motion.div>
      <motion.h3 layoutId={`title-${pr.id}`} className="mt-5 text-3xl font-semibold leading-none tracking-[-0.03em]">
        {pr.title}
      </motion.h3>
      <p className="mt-2 text-[15px] text-dim">{pr.subtitle}</p>
    </motion.div>
  );
}

// segmented readout: one segment per project, filled in that project's colour
function Progress({ p, count }: { p: MotionValue<number>; count: MotionValue<string> }) {
  return (
    <div className="px-pad mono flex items-center gap-6 pb-6 text-[11px] uppercase tracking-[0.16em] text-dim">
      <span className="tabular-nums">
        <motion.span className="text-bone">{count}</motion.span> / 0{PROJECTS.length}
      </span>
      <div className="flex flex-1 gap-1.5">
        {PROJECTS.map((pr, i) => (
          <Segment key={pr.id} p={p} i={i} color={ACCENT[pr.accent]} />
        ))}
      </div>
    </div>
  );
}
function Segment({ p, i, color }: { p: MotionValue<number>; i: number; color: string }) {
  const n = PROJECTS.length;
  const fill = useTransform(p, [0.1 + (i / n) * 0.85, 0.1 + ((i + 1) / n) * 0.85], [0, 1]);
  return (
    <span className="relative h-px flex-1 bg-line">
      <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, backgroundColor: color }} />
    </span>
  );
}
