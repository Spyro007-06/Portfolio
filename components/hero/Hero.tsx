"use client";

// Hero. Depth, back to front:
//   canvas machine (Field) → statement (drifts slower than scroll) → metadata + registration
//   marks (move faster than scroll). On exit each line slides a different direction and the
//   type compresses along Archivo's width axis — the headline "collapses" into About.
// The headline letters are also a material: on a fine pointer they widen under the cursor.

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PERSON } from "@/data/portfolio";
import { SplitLines, useFinePointer, useScrollVelocity } from "../motion/primitives";
import { SPRING, STAGGER, T } from "../motion/tokens";

type P = { mx: MotionValue<number>; my: MotionValue<number>; base: MotionValue<number>; active: boolean };

function Letter({ ch, mx, my, base, active }: P & { ch: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // centre cached in page coordinates: measured on mount/resize, never inside the pointer loop
  const c = useRef({ x: -1e4, y: -1e4 });
  useEffect(() => {
    if (!active) return;
    const m = () => {
      const r = ref.current!.getBoundingClientRect();
      c.current = { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
    };
    const id = setTimeout(m, 1800); // after the entrance has settled
    addEventListener("resize", m);
    return () => { clearTimeout(id); removeEventListener("resize", m); };
  }, [active]);
  const near = useTransform(() => {
    if (!active) return 0;
    const d = Math.hypot(mx.get() - c.current.x, my.get() - c.current.y);
    return Math.max(0, 1 - d / 320);
  });
  const k = useSpring(near, SPRING.soft);
  const wdth = useTransform(() => base.get() + k.get() * 25);
  const wght = useTransform(k, [0, 1], [700, 850]);
  return (
    <motion.span ref={ref} className="inline-block" style={{ fontVariationSettings: useMotionTemplate`"wdth" ${wdth}, "wght" ${wght}` }}>
      {ch}
    </motion.span>
  );
}

function Word({ text, ...p }: P & { text: string }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden>
          {ch === " " ? " " : <Letter ch={ch} {...p} />}
        </span>
      ))}
    </span>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now ?? "--:--:--"} IST</span>;
}

const META = ["Frontend Developer", "AI Builder", "Motion / Interaction"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const rm = useReducedMotion();
  const fine = useFinePointer();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const vel = useScrollVelocity();

  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  // exit choreography — each line leaves in its own direction
  const x1 = useTransform(p, [0, 1], ["0vw", "-14vw"]);
  const x2 = useTransform(p, [0, 1], ["0vw", "10vw"]);
  const x3 = useTransform(p, [0, 1], ["0vw", "-5vw"]);
  const squeeze = useTransform(p, [0, 0.9], [100, 68]);
  const stretch = useMotionTemplate`"wdth" ${squeeze}`;
  const yBack = useTransform(p, [0, 1], ["0vh", "14vh"]);
  const yFront = useTransform(p, [0, 1], ["0vh", "-18vh"]);
  const fade = useTransform(p, [0.02, 0.3], [1, 0]); // chrome clears first, then the statement leaves
  const skew = useTransform(vel, [-2500, 2500], [6, -6], { clamp: true });
  const pct = useTransform(p, (v) => `${String(Math.round(v * 100)).padStart(3, "0")}%`);

  const still = !!rm;
  const flat = useMotionValue(100);
  const wp = { mx, my, base: still ? flat : squeeze, active: fine && !still };
  const lineStyle = (x: MotionValue<string>) => (still ? undefined : { x, fontVariationSettings: stretch });

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Introduction"
      className="px-pad relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-24 md:pb-10"
      onPointerMove={(e) => { if (e.pointerType === "mouse") { mx.set(e.pageX); my.set(e.pageY); } }}
      onPointerLeave={() => { mx.set(-9999); my.set(-9999); }}
    >
      {/* front layer: metadata + registration marks, moving faster than the page */}
      <motion.div style={still ? undefined : { y: yFront, opacity: fade }} className="relative z-10">
        <motion.ul
          className="mono flex flex-wrap gap-x-8 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-dim"
          initial="out"
          animate="in"
          variants={{ out: {}, in: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.2 } } }}
        >
          {META.map((m, i) => (
            <motion.li key={m} variants={{ out: { opacity: 0, x: -12 }, in: { opacity: 1, x: 0, transition: T.medium } }}>
              <span className="text-faint">0{i + 1}</span> {m}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
      <Marks still={still} y={yFront} />

      {/* statement: the dominant layer */}
      <motion.div style={still ? undefined : { y: yBack, skewX: skew }} className="relative my-10 origin-left">
        <h1 className="display text-[clamp(3.4rem,13.2vw,15.5rem)]">
          <span className="sr-only">Tharun B.L — interfaces that think and move.</span>
          <SplitLines
            trigger="mount"
            delay={0.35}
            as="div"
            lines={[
              <motion.span key="1" className="block" style={lineStyle(x1)} aria-hidden>
                <Word text="Interfaces" {...wp} />
              </motion.span>,
              <motion.span key="2" className="block pl-[8vw]" style={lineStyle(x2)} aria-hidden>
                <Word text="that think" {...wp} />
              </motion.span>,
              <motion.span key="3" className="flex items-baseline gap-[0.12em]" style={lineStyle(x3)} aria-hidden>
                <span className="outline-text">&amp;</span>
                <span className="serif normal-case tracking-normal">move.</span>
              </motion.span>,
            ]}
          />
        </h1>
      </motion.div>

      {/* baseline row */}
      <motion.div style={still ? undefined : { opacity: fade }} className="relative z-10">
      <motion.div
        className="grid gap-6 border-t border-line pt-5 md:grid-cols-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...T.slow, delay: 1.3 }}
      >
        <p className="max-w-md text-[15px] leading-relaxed text-dim md:col-span-6">
          <span className="text-bone">{PERSON.name}</span> — frontend developer building interfaces for AI products. I work at
          the intersection of frontend engineering, AI and product design.
        </p>
        <div className="mono flex items-end justify-between gap-6 text-[11px] uppercase tracking-[0.16em] text-dim md:col-span-6 md:justify-end md:gap-12">
          <span className="hidden lg:block">
            {PERSON.location}
            <br />
            <span className="text-faint">{PERSON.coords}</span>
          </span>
          <Clock />
          <a href="#about" className="flex items-center gap-2 text-bone" data-cursor="Scroll">
            <span className="relative block h-8 w-px overflow-hidden bg-line">
              {!still && (
                <motion.span
                  className="absolute inset-x-0 top-0 h-3 bg-acid"
                  animate={{ y: [-12, 34] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                />
              )}
            </span>
            <motion.span className="tabular-nums">{pct}</motion.span>
          </a>
        </div>
      </motion.div>
      </motion.div>
    </section>
  );
}

function Marks({ still, y }: { still: boolean; y: MotionValue<string> }) {
  const cls = "absolute h-3 w-3 border-bone/30";
  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-x-[var(--pad)] top-36 bottom-28 hidden md:block" style={still ? undefined : { y }}>
      <span className={`${cls} left-0 top-0 border-l border-t`} />
      <span className={`${cls} right-0 top-0 border-r border-t`} />
      <span className={`${cls} bottom-0 left-0 border-b border-l`} />
      <span className={`${cls} bottom-0 right-0 border-b border-r`} />
    </motion.div>
  );
}
