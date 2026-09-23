"use client";

// One art-directed visual per project. There are no screenshots in the repo, so each plate is a
// small composition built from the project's own content: its question, its pipeline, its
// artefact, its interface copy. `live` = hovered or open; plates idle quietly otherwise.

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { Project } from "@/data/portfolio";
import { EASE, SPRING } from "../motion/tokens";

type P = { p: Project; live: boolean };

function useRunning() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { margin: "-10% 0px" });
  const rm = useReducedMotion();
  return [ref, seen && !rm] as const;
}

const mono = "mono text-[10px] uppercase tracking-[0.16em]";

/* 01 — the question, answered by a balance line crossing a safety margin */
function Financial({ p, live }: P) {
  const [ref, run] = useRunning();
  const line = "M0,60 C60,58 90,40 140,46 S220,90 260,84 S330,70 360,112 S430,150 470,128 S560,120 600,150";
  return (
    <div ref={ref} className="absolute inset-0 bg-[#0B1030] text-bone">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,107,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(61,107,255,.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="absolute inset-x-0 top-[28%] h-[48%] w-full">
        <rect x="0" y="120" width="600" height="100" fill="rgba(61,107,255,.14)" />
        <line x1="0" x2="600" y1="120" y2="120" stroke="#3D6BFF" strokeDasharray="4 6" />
        <motion.path
          d={line}
          fill="none"
          stroke="#EDEAE3"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: run ? 1 : 0.001 }}
          transition={{ duration: 2.2, ease: EASE.out }}
        />
      </svg>
      <div className={`${mono} absolute left-[6%] top-[8%] text-bone/60`}>Balance → 30 days</div>
      <div className={`${mono} absolute right-[6%] top-[70%] text-blue`}>Safety margin</div>
      <div className={`${mono} absolute bottom-[8%] left-[6%] flex gap-6 text-bone/50`}>
        <span>Recurring −</span>
        <span>Upcoming −</span>
        <span>Income +</span>
      </div>
      <motion.div className="absolute right-[6%] top-[8%] text-right" animate={{ y: live ? -4 : 0 }} transition={SPRING.soft}>
        <div className={`${mono} text-bone/60`}>{p.subtitle}</div>
        <motion.div className="display text-[clamp(2.5rem,6vw,5.5rem)] text-blue" animate={{ letterSpacing: live ? "0.02em" : "-0.045em" }} transition={SPRING.soft}>
          Wait.
        </motion.div>
      </motion.div>
    </div>
  );
}

/* 02 — a voice becomes a waveform becomes a pipeline */
const BARS = Array.from({ length: 40 }, (_, i) => Math.round((0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45))) * 100) / 100);
function Voice({ p, live }: P) {
  const [ref, run] = useRunning();
  return (
    <div ref={ref} className="absolute inset-0 bg-[#060606] text-bone">
      <div className="absolute inset-x-[8%] top-[18%] flex h-[36%] items-center gap-[0.6%]">
        {BARS.map((h, i) => (
          <motion.span
            key={i}
            className="block flex-1 rounded-full bg-acid"
            style={{ height: `${Math.round(h * 100)}%`, opacity: Math.round((0.35 + h * 0.65) * 100) / 100 }}
            animate={run ? { scaleY: [1, 0.25 + ((i * 7) % 5) / 6, 1] } : { scaleY: 0.2 }}
            transition={run ? { duration: live ? 0.6 : 1.4, repeat: Infinity, delay: (i % 8) * 0.07, ease: "easeInOut" } : SPRING.soft}
          />
        ))}
      </div>
      <div className="absolute inset-x-[8%] bottom-[16%]">
        <div className="relative flex justify-between">
          <span className="absolute left-0 right-0 top-[5px] h-px bg-bone/15" />
          {run && (
            <motion.span
              className="absolute top-[3px] h-[5px] w-[5px] rounded-full bg-acid"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: live ? 1.6 : 3.2, repeat: Infinity, ease: EASE.inOut }}
            />
          )}
          {p.flow!.steps.map((s) => (
            <span key={s} className="relative flex flex-col items-center gap-3 first:items-start last:items-end">
              <span className="h-[11px] w-[11px] rounded-full border border-acid bg-[#060606]" />
              <span className={`${mono} text-bone/70`}>{s}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="serif absolute left-[8%] top-[6%] text-[clamp(1.1rem,2vw,1.6rem)] text-bone/80">“{p.subtitle}”</div>
    </div>
  );
}

/* 03 — the artefact itself: a Builder ID on an orange field */
const QR = Array.from({ length: 81 }, (_, i) => ((i * 37 + (i >> 2) * 11) % 7) < 3);
function Identity({ p, live }: P) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-orange text-ink">
      <div className="display absolute -bottom-[0.12em] -left-[0.04em] text-[clamp(5rem,16vw,15rem)] text-ink/10">Goa</div>
      <motion.div
        className="absolute left-1/2 top-1/2 w-[46%] min-w-[180px] max-w-[300px] rounded-[10px] bg-ink p-[4%] text-bone shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]"
        style={{ x: "-50%", y: "-50%" }}
        animate={{ rotate: live ? 0 : -7, scale: live ? 1.04 : 1 }}
        transition={SPRING.soft}
      >
        <div className={`${mono} flex justify-between text-bone/60`}>
          <span>Builder ID</span>
          <span className="text-orange">{p.title.replace("HH ", "")}</span>
        </div>
        <div className="mt-[8%] flex items-center gap-[6%]">
          <div className="aspect-square w-[34%] rounded-full border border-dashed border-orange/80 p-[6%]">
            <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_35%,#3a3a3a_0_30%,#222_31%_100%)]" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-[80%] rounded-sm bg-bone/80" />
            <div className="h-2 w-[55%] rounded-sm bg-bone/30" />
            <div className="h-2 w-[65%] rounded-sm bg-orange/70" />
          </div>
        </div>
        <div className="mt-[8%] flex items-end justify-between">
          <span className={`${mono} text-bone/50`}>Name · Role · Title</span>
          <div className="grid w-[26%] grid-cols-9 gap-px">
            {QR.map((on, i) => (
              <span key={i} className={`aspect-square ${on ? "bg-bone" : "bg-transparent"}`} />
            ))}
          </div>
        </div>
      </motion.div>
      <div className={`${mono} absolute right-[5%] top-[6%] flex gap-4`}>
        {p.flow!.steps.map((s, i) => (
          <span key={s} className={i === 2 ? "underline underline-offset-4" : "opacity-60"}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* 04 — light plate: a record that turns, and the interface copy that learns */
function Music({ p, live }: P) {
  const [ref, run] = useRunning();
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-bone text-ink">
      <motion.div
        className="absolute -right-[22%] top-1/2 aspect-square w-[52%] rounded-full sm:-right-[12%] sm:w-[62%] bg-[repeating-radial-gradient(circle,#0B0B0C_0_1px,#1a1a1b_2px_5px)]"
        style={{ y: "-50%" }}
        animate={run ? { rotate: 360 } : {}}
        transition={{ duration: live ? 4 : 14, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-1/2 aspect-square w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange" />
        <span className="absolute left-1/2 top-[18%] h-[10%] w-px bg-bone/40" />
      </motion.div>
      <ul className="absolute left-[6%] top-1/2 -translate-y-1/2 space-y-[0.4em] text-[clamp(1.1rem,2.3vw,2rem)] font-semibold tracking-tight">
        {p.points.slice(0, 4).map((s, i) => (
          <motion.li key={s} className="flex items-center gap-3" animate={{ x: live ? i * 10 : 0, opacity: live || i === 0 ? 1 : 0.45 }} transition={{ ...SPRING.soft, delay: i * 0.04 }}>
            <span className="mono text-[10px] text-ink/50">0{i + 1}</span>
            {s}
          </motion.li>
        ))}
      </ul>
      <div className={`${mono} absolute bottom-[7%] left-[6%] text-ink/60`}>{p.subtitle}</div>
    </div>
  );
}

const MAP = { financial: Financial, voice: Voice, hhgoa: Identity, music: Music } as const;

export default function Plate({ p, live }: P) {
  const C = MAP[p.id as keyof typeof MAP];
  return <C p={p} live={live} />;
}
