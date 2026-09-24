"use client";

// A project's dossier: the full record behind an installation (description, flow, what it
// includes, source link). Opens from a click in the world; the world keeps running behind it.

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { PROJECTS } from "@/data/portfolio";
import { ACCENT, EASE, SPRING, STAGGER, T } from "@/components/motion/tokens";
import { openProject, useOpenProject } from "@/world/signals";

const item = { out: { opacity: 0, y: 18 }, in: { opacity: 1, y: 0, transition: SPRING.soft } };

function Body({ id }: { id: string }) {
  const p = PROJECTS.find((x) => x.id === id)!;
  const accent = ACCENT[p.accent];
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && openProject(null);
    addEventListener("keydown", key);
    return () => {
      removeEventListener("keydown", key);
      prev?.focus?.();
    };
  }, []);
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-h"
      className="fixed inset-y-0 right-0 z-[80] w-full max-w-xl overflow-y-auto border-l border-line bg-[#0a0a0b]/95 p-8 backdrop-blur md:p-12"
      initial={{ clipPath: "inset(0 0 0 100%)" }}
      animate={{ clipPath: "inset(0 0 0 0%)", transition: { duration: 0.8, ease: EASE.out } }}
      exit={{ clipPath: "inset(0 0 0 100%)", transition: { duration: 0.45, ease: EASE.inOut } }}
    >
      <button ref={close} onClick={() => openProject(null)} className="mono absolute right-6 top-6 border border-line bg-[#131418] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-bone hover:border-[var(--accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors">
        Close <span aria-hidden>Esc</span>
      </button>
      <motion.div initial="out" animate="in" variants={{ in: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.25 } } }}>
        <motion.p variants={item} className="mono text-xs uppercase tracking-[0.2em] font-medium" style={{ color: accent }}>
          Project {p.idx} · {p.category} · {p.year}
        </motion.p>
        <motion.h2 variants={item} id="dossier-h" className="mt-4 text-4xl font-semibold leading-none tracking-[-0.03em] text-white md:text-5xl">
          {p.title}
        </motion.h2>
        <motion.p variants={item} className="serif mt-3 text-2xl text-[#dcd5c8]">
          {p.subtitle}
        </motion.p>
        <motion.p variants={item} className="mono mt-3 text-xs uppercase tracking-[0.15em] text-[#c2bcaf]">
          Role: Frontend Developer & Builder · Year: {p.year}
        </motion.p>
        <motion.p variants={item} className="mt-8 text-lg leading-relaxed text-[#eae4d6]">
          {p.desc}
        </motion.p>
        {p.flow && (
          <motion.div variants={item} className="mt-10">
            <p className="mono text-xs uppercase tracking-[0.2em] text-[#c2bcaf] font-semibold">{p.flow.label}</p>
            <ol className="mt-3 space-y-2">
              {p.flow.steps.map((s, i) => (
                <li key={s} className="flex gap-4 border-b border-line pb-2">
                  <span className="mono text-[11px]" style={{ color: accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
        <motion.div variants={item} className="mt-10">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-dim">{p.pointsLabel}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.points.map((s) => (
              <li key={s} className="border border-line px-3 py-1.5 text-sm text-dim">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.p variants={item} className="mono mt-10 text-[11px] uppercase tracking-[0.2em] text-dim">
          Domain — {p.domain}
        </motion.p>
        {p.link && (
          <motion.a variants={item} href={p.link} target="_blank" rel="noreferrer" data-cursor="Open" className="mt-8 inline-flex items-center gap-3 border-b pb-1 text-lg" style={{ borderColor: accent }}>
            View source on GitHub <span aria-hidden>↗</span>
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Dossier() {
  const id = useOpenProject();
  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key="scrim"
          className="fixed inset-0 z-[79] bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: T.medium }}
          exit={{ opacity: 0, transition: T.fast }}
          onClick={() => openProject(null)}
        />
      )}
      {id && <Body key={id} id={id} />}
    </AnimatePresence>
  );
}
