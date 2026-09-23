"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode, type PointerEvent } from "react";
import { DUR, EASE, SPRING, STAGGER } from "./tokens";

/* ---------- environment ---------- */

export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => serverValue,
  );
}

/** True only for a precise pointer that can hover — where cursor/hover physics make sense. */
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useDesktop = () => useMedia("(min-width: 1024px)");

/* ---------- velocity ---------- */

/** Smoothed page scroll velocity (px/s). Shared language for every velocity-reactive element. */
export function useScrollVelocity(): MotionValue<number> {
  const { scrollY } = useScroll();
  return useSpring(useVelocity(scrollY), SPRING.smooth);
}

/* ---------- text reveal ---------- */

type LinesProps = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** "mount" plays on load (hero), "view" plays once when scrolled into view. */
  trigger?: "mount" | "view";
  as?: "h1" | "h2" | "h3" | "p" | "div";
  id?: string;
};

/**
 * Masked line reveal: each line rises out of its own clipping box.
 * Communicates "this was composed line by line" — used for headlines only.
 */
export function SplitLines({ id, lines, className, lineClassName, delay = 0, trigger = "view", as = "div" }: LinesProps) {
  const Tag = motion[as];
  const play = trigger === "mount" ? { animate: "in" } : { whileInView: "in", viewport: { once: true, margin: "-10% 0px" } };
  return (
    <Tag id={id} className={className} initial="out" {...play} variants={{ out: {}, in: { transition: { staggerChildren: STAGGER.loose, delayChildren: delay } } }}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
          <motion.span
            className={`block will-change-transform ${lineClassName ?? ""}`}
            variants={{
              out: { y: "108%", rotate: 2.5 },
              in: { y: "0%", rotate: 0, transition: { duration: DUR.cinematic, ease: EASE.out } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------- magnetic ---------- */

/**
 * Pulls its child toward the pointer while hovered, springs home on leave.
 * `strength` is the fraction of the pointer offset the element follows.
 */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const rm = useReducedMotion();
  const x = useSpring(useMotionValue(0), SPRING.snappy);
  const y = useSpring(useMotionValue(0), SPRING.snappy);

  const move = (e: PointerEvent) => {
    if (rm || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span ref={ref} className={`inline-block ${className ?? ""}`} style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  );
}

/* ---------- section label ---------- */

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`mono text-[11px] uppercase tracking-[0.18em] text-dim ${className}`}>{children}</span>;
}
