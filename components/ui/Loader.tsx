"use client";

// Opening titles. Black frame; the world initializes in four named stages. It waits for the real
// ready signal (fonts parsed, first scenes built) and a minimum beat, then the frame fades up
// into the first shot. Scroll is held until then so the film always starts at frame zero.

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { DUR, EASE, STAGGER } from "@/components/motion/tokens";
import { useReady } from "@/world/signals";

const STAGES = ["Geometry", "Light", "Signal", "Camera"];

export default function Loader() {
  const ready = useReady();
  const [beat, setBeat] = useState(false);
  const done = ready && beat;

  useEffect(() => {
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    const id = setTimeout(() => setBeat(true), 2600);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = done ? "" : "hidden";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[95] grid place-items-center bg-black"
          exit={{ opacity: 0, transition: { duration: DUR.cinematic, ease: EASE.inOut } }}
        >
          <div className="mono w-[min(320px,80vw)] text-[11px] uppercase tracking-[0.22em] text-dim">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.slow }} className="text-bone">
              World initializing
            </motion.p>
            <motion.ul
              className="mt-5 space-y-1.5"
              initial="off"
              animate="on"
              variants={{ on: { transition: { staggerChildren: STAGGER.loose * 3, delayChildren: 0.5 } } }}
            >
              {STAGES.map((s, i) => (
                <motion.li key={s} className="flex justify-between" variants={{ off: { opacity: 0, x: -8 }, on: { opacity: 1, x: 0, transition: { duration: DUR.medium, ease: EASE.out } } }}>
                  <span>{s}</span>
                  <span className="text-[var(--accent)]">{i === STAGES.length - 1 && !ready ? "…" : "OK"}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-6 h-px w-full overflow-hidden bg-line">
              <motion.div className="h-px origin-left bg-bone" initial={{ scaleX: 0 }} animate={{ scaleX: ready ? 1 : 0.7 }} transition={{ duration: ready ? DUR.slow : 2.4, ease: EASE.out }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
