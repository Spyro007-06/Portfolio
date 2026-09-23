"use client";

// A control panel, not a navbar: mark top-left, section index top-right with a shared-layout
// indicator that slides between entries, and a hairline progress bar. On phones it becomes a
// single bottom "readout" pill that opens into a sheet.

import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { PERSON } from "@/data/portfolio";
import { EASE, SPRING, STAGGER, T } from "../motion/tokens";

export const NAV = [
  { id: "about", n: "01", label: "About" },
  { id: "work", n: "02", label: "Work" },
  { id: "lab", n: "03", label: "Lab" },
  { id: "experience", n: "04", label: "Experience" },
  { id: "contact", n: "05", label: "Contact" },
];

function useActive() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ["top", ...NAV.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === "top" ? null : e.target.id)),
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export default function Nav() {
  const active = useActive();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING.smooth);
  const [open, setOpen] = useState(false);
  const current = NAV.find((n) => n.id === active);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <>
      <motion.div aria-hidden className="fixed left-0 right-0 top-0 z-50 h-px origin-left bg-bone/70" style={{ scaleX: progress }} />

      <motion.header
        className="px-pad pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between pt-5"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...T.slow, delay: 1.1 }}
      >
        <a href="#top" className="pointer-events-auto group flex items-center gap-3" data-cursor-magnet>
          <span className="mono grid h-8 w-8 place-items-center border border-line text-[10px] tracking-widest transition-colors group-hover:border-acid group-hover:text-acid">
            {PERSON.short}
          </span>
          <span className="mono hidden text-[11px] uppercase leading-tight tracking-[0.16em] text-dim sm:block">
            {PERSON.name}
            <br />
            <span className="text-faint">Portfolio — {new Date().getFullYear()}</span>
          </span>
        </a>

        <nav aria-label="Sections" className="pointer-events-auto hidden md:block">
          <LayoutGroup>
            <ol className="mono flex flex-col items-end gap-1 text-[11px] uppercase tracking-[0.16em]">
              {NAV.map((n) => {
                const on = active === n.id;
                return (
                  <motion.li key={n.id} whileHover={{ x: -6 }} transition={SPRING.snappy}>
                    <a href={`#${n.id}`} aria-current={on ? "true" : undefined} className={`flex items-center gap-3 py-0.5 transition-colors ${on ? "text-bone" : "text-dim hover:text-bone"}`}>
                      {on && <motion.span layoutId="nav-dot" className="h-px w-6 bg-acid" transition={SPRING.soft} />}
                      <span className={on ? "text-acid" : "text-faint"}>{n.n}</span>
                      <span>{n.label}</span>
                    </a>
                  </motion.li>
                );
              })}
            </ol>
          </LayoutGroup>
        </nav>
      </motion.header>

      {/* phone: one readout pill, bottom-centre where the thumb is */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden">
        <motion.button
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="mono flex items-center gap-3 rounded-full border border-line bg-graphite/90 py-2.5 pl-3 pr-4 text-[11px] uppercase tracking-[0.16em] backdrop-blur"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ ...SPRING.soft, delay: 1.2 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="-rotate-90">
            <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(237,234,227,.15)" strokeWidth="2" />
            <motion.circle cx="9" cy="9" r="7" fill="none" stroke="#C6F432" strokeWidth="2" style={{ pathLength: progress }} />
          </svg>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={current?.id ?? "index"} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={T.fast}>
              {current ? `${current.n} ${current.label}` : "Index"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sections"
            className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/95 p-6 pb-24 md:hidden"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)", transition: { duration: 0.6, ease: EASE.out } }}
            exit={{ clipPath: "inset(100% 0 0 0)", transition: { duration: 0.4, ease: EASE.inOut } }}
          >
            <motion.ol initial="out" animate="in" variants={{ out: {}, in: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.15 } } }}>
              {NAV.map((n) => (
                <motion.li key={n.id} variants={{ out: { y: 40, opacity: 0 }, in: { y: 0, opacity: 1, transition: SPRING.soft } }} className="border-b border-line">
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-3">
                    <span className="mono text-xs text-acid">{n.n}</span>
                    <span className="display text-5xl">{n.label}</span>
                  </a>
                </motion.li>
              ))}
            </motion.ol>
            <button autoFocus onClick={() => setOpen(false)} className="mono absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-line px-5 py-2.5 text-[11px] uppercase tracking-[0.16em]">
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
