"use client";

// Skills as a system, not a list. Focusing a node lights its neighbours, draws the connections,
// nudges everything else back, and the readout explains the node and where it was used.
// Works with hover, keyboard focus, and tap.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PROJECTS, SKILLS, type Skill } from "@/data/portfolio";
import { Label, SplitLines } from "../motion/primitives";
import { ACCENT, EASE, SPRING, T } from "../motion/tokens";

const ALL = SKILLS.flatMap((g) => g.items.map((s) => ({ ...s, group: g.group, accent: ACCENT[g.accent] })));
const byName = new Map(ALL.map((s) => [s.name, s]));
const neighbours = (name: string) =>
  new Set([...(byName.get(name)?.rel ?? []), ...ALL.filter((s) => s.rel.includes(name)).map((s) => s.name)]);
const id = (name: string) => "sk-" + name.replace(/[^a-z0-9]/gi, "").toLowerCase();

export default function System() {
  const [active, setActive] = useState<string | null>(null);
  const rm = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ d: string; key: string }[]>([]);
  const rel = useMemo(() => (active ? neighbours(active) : new Set<string>()), [active]);
  const cur = active ? byName.get(active) : null;

  // measure after the nodes have been placed; springs move them by a few px, not enough to matter
  useLayoutEffect(() => {
    if (!active || !wrap.current) return setLines([]);
    const box = wrap.current.getBoundingClientRect();
    const at = (n: string) => {
      const r = document.getElementById(id(n))?.querySelector("[data-name]")?.getBoundingClientRect();
      return r ? { l: r.left - box.left - 16, r: r.right - box.left + 8, y: r.top - box.top + r.height / 2 } : null;
    };
    const a = at(active);
    if (!a) return;
    setLines(
      [...rel].flatMap((n) => {
        const b = at(n);
        if (!b) return [];
        // neighbours to the right leave from the label's end; the rest loop out to the left
        const right = b.l > a.r;
        const x0 = right ? a.r : a.l;
        const bend = right ? (x0 + b.l) / 2 : Math.min(x0, b.l) - 24 - Math.abs(a.y - b.y) * 0.2;
        return [{ key: n, d: `M${x0},${a.y} C${bend},${a.y} ${bend},${b.y} ${b.l},${b.y}` }];
      }),
    );
  }, [active, rel]);

  return (
    <section id="system" aria-labelledby="sys-h" className="px-pad relative pb-[16vh]">
      <div className="mb-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label>
            <span className="text-acid">01.B</span> — Capabilities
          </Label>
        </div>
        <SplitLines as="h2" id="sys-h" className="display text-[clamp(2.2rem,5vw,5rem)] lg:col-span-7" lines={["A system,", "not a list."]} />
      </div>

      <div className="grid gap-10 lg:grid-cols-12" onPointerLeave={() => setActive(null)}>
        <div ref={wrap} className="relative grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-9">
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <AnimatePresence>
              {lines.map((l, i) => (
                <motion.path
                  key={active + l.key}
                  d={l.d}
                  fill="none"
                  stroke={cur ? byName.get(active!)!.accent : "#fff"}
                  strokeWidth={1}
                  initial={{ pathLength: 0, opacity: 0.9 }}
                  animate={{ pathLength: 1, opacity: 0.55, transition: { duration: 0.55, ease: EASE.out, delay: i * 0.04 } }}
                  exit={{ opacity: 0, transition: T.fast }}
                />
              ))}
            </AnimatePresence>
          </svg>

          {SKILLS.map((g, gi) => (
            <div key={g.group}>
              <div className="mb-4 flex items-baseline gap-2 border-b border-line pb-2">
                <span className="mono text-[11px]" style={{ color: ACCENT[g.accent] }}>
                  0{gi + 1}
                </span>
                <Label className="text-bone">{g.group}</Label>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((s) => (
                  <Node key={s.name} s={s} accent={ACCENT[g.accent]} state={!active ? "idle" : active === s.name ? "on" : rel.has(s.name) ? "rel" : "off"} rm={!!rm} set={setActive} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* readout */}
        <aside aria-live="polite" className="lg:col-span-3">
          <div className="sticky top-28 min-h-[220px] border-l border-line pl-5">
            <AnimatePresence mode="wait" initial={false}>
              {cur ? (
                <motion.div key={cur.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: T.medium }} exit={{ opacity: 0, y: -6, transition: T.fast }}>
                  <Label>{cur.group}</Label>
                  <p className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: cur.accent }}>{cur.name}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-dim">{cur.info}</p>
                  <p className="mono mt-5 text-[11px] uppercase tracking-[0.14em] text-faint">Connected · {rel.size}</p>
                  <p className="mt-1 text-sm text-dim">{[...rel].join(" · ")}</p>
                  {cur.used && (
                    <>
                      <p className="mono mt-4 text-[11px] uppercase tracking-[0.14em] text-faint">Seen in</p>
                      <p className="mt-1 text-sm">{cur.used.map((u) => PROJECTS.find((p) => p.id === u)?.title).join(" · ")}</p>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.p key="idle" className="text-[15px] leading-relaxed text-dim" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: T.medium }} exit={{ opacity: 0, transition: T.fast }}>
                  Hover, focus or tap any capability — the system shows what it connects to and where it was used.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Node({ s, accent, state, rm, set }: { s: Skill; accent: string; state: "idle" | "on" | "rel" | "off"; rm: boolean; set: (n: string | null) => void }) {
  const x = rm ? 0 : { idle: 0, on: 10, rel: 5, off: -2 }[state];
  return (
    <li>
      <motion.button
        id={id(s.name)}
        type="button"
        aria-pressed={state === "on"}
        onPointerEnter={(e) => e.pointerType === "mouse" && set(s.name)}
        onFocus={() => set(s.name)}
        onClick={() => set(s.name)}
        className="flex w-full items-center gap-2 py-0.5 text-left text-[15px] md:text-base"
        animate={{ x, opacity: state === "off" ? 0.28 : 1, color: state === "on" ? accent : "#EDEAE3" }}
        transition={SPRING.snappy}
      >
        <motion.span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          animate={{ scale: state === "on" || state === "rel" ? 1 : 0.4, backgroundColor: state === "idle" || state === "off" ? "#55544F" : accent }}
          transition={SPRING.snappy}
        />
        <span data-name>{s.name}</span>
      </motion.button>
    </li>
  );
}
