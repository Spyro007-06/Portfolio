"use client";

// Project detail: the clicked plate and title morph (shared layoutId) into a full layer above
// the page; the stage behind recedes (see Work). Content arrives after the morph, in reading
// order. Esc or the close button return you to exactly where you were.

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/portfolio";
import { Label } from "../motion/primitives";
import { ACCENT, EASE, SPRING, STAGGER, T } from "../motion/tokens";
import Plate from "./Plates";

const item = { out: { opacity: 0, y: 24 }, in: { opacity: 1, y: 0, transition: SPRING.soft } };

export default function Detail({ p, onClose }: { p: Project; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  const accent = ACCENT[p.accent];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const bg = ["main", "chrome"].map((id) => document.getElementById(id));
    html.style.overflow = "hidden";
    bg.forEach((el) => el?.setAttribute("inert", "")); // keeps Tab inside the dialog
    close.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => {
      html.style.overflow = "";
      bg.forEach((el) => el?.removeAttribute("inert"));
      removeEventListener("keydown", key);
      prev?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`d-${p.id}`}
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain"
      initial={{ backgroundColor: "rgba(11,11,12,0)" }}
      animate={{ backgroundColor: "rgba(11,11,12,0.96)", transition: T.medium }}
      exit={{ backgroundColor: "rgba(11,11,12,0)", transition: { ...T.medium, delay: 0.1 } }}
    >
      <div className="px-pad mx-auto max-w-[1400px] pb-24 pt-20">
        <div className="relative h-[46vh] w-full md:h-[58vh]">
          <motion.div layoutId={`plate-${p.id}`} className="absolute inset-0 overflow-hidden" transition={SPRING.heavy}>
            <Plate p={p} live />
          </motion.div>
        </div>

        <motion.div
          className="mt-10 grid gap-10 lg:grid-cols-12"
          initial="out"
          animate="in"
          exit="out"
          variants={{ out: { transition: { duration: 0.1 } }, in: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.35 } } }}
        >
          <div className="lg:col-span-7">
            <motion.div variants={item} className="mono mb-5 flex gap-4 text-[11px] uppercase tracking-[0.16em] text-dim">
              <span style={{ color: accent }}>{p.idx}</span>
              <span>{p.category}</span>
              <span>{p.year}</span>
            </motion.div>
            <motion.h2 id={`d-${p.id}`} layoutId={`title-${p.id}`} transition={SPRING.heavy} className="text-[clamp(2.4rem,6vw,6rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
              {p.title}
            </motion.h2>
            <motion.p variants={item} className="serif mt-4 text-2xl text-dim md:text-3xl">
              {p.subtitle}
            </motion.p>
            <motion.p variants={item} className="mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
              {p.desc}
            </motion.p>
          </div>

          <div className="space-y-10 lg:col-span-4 lg:col-start-9">
            {p.flow && (
              <motion.div variants={item}>
                <Label>{p.flow.label}</Label>
                <ol className="mt-4 space-y-2">
                  {p.flow.steps.map((s, i) => (
                    <li key={s} className="flex items-baseline gap-4 border-b border-line pb-2">
                      <span className="mono text-[11px]" style={{ color: accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
            <motion.div variants={item}>
              <Label>{p.pointsLabel}</Label>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.points.map((s) => (
                  <li key={s} className="border border-line px-3 py-1.5 text-sm text-dim">
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={item} className="mono text-[11px] uppercase tracking-[0.16em]">
              <Label>Domain</Label>
              <p className="mt-2 text-dim">{p.domain}</p>
            </motion.div>
            {p.link && (
              <motion.a variants={item} href={p.link} target="_blank" rel="noreferrer" data-cursor="Open" className="group inline-flex items-center gap-3 border-b pb-1 text-lg" style={{ borderColor: accent }}>
                View source on GitHub
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        ref={close}
        onClick={onClose}
        data-cursor-magnet
        className="mono fixed right-[var(--pad)] top-5 z-10 flex items-center gap-2 border border-line bg-ink/80 px-4 py-2 text-[11px] uppercase tracking-[0.16em] backdrop-blur"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { ...T.medium, delay: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE.in } }}
      >
        Close <span aria-hidden>Esc</span>
      </motion.button>
    </motion.div>,
    document.body,
  );
}
