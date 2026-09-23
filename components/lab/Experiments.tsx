"use client";

// Four small instruments. Each exposes one part of the motion system rather than decorating:
// spring physics under a pointer, scroll velocity as a typographic input, the site's own spring
// tokens as something you can pull on, and layout animation (FLIP) through reordering.

import {
  Reorder,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/data/portfolio";
import { useMedia, useScrollVelocity } from "../motion/primitives";
import { ACCENT, SPRING } from "../motion/tokens";

const mono = "mono text-[10px] uppercase tracking-[0.16em]";

/* E.01 — every point is a spring; the pointer is a force */
function Dot({ cx, cy, mx, my }: { cx: number; cy: number; mx: MotionValue<number>; my: MotionValue<number> }) {
  const R = 130;
  const push = useTransform(() => {
    const dx = cx - mx.get(), dy = cy - my.get();
    const d = Math.hypot(dx, dy) || 1;
    const f = Math.max(0, 1 - d / R);
    return { x: (dx / d) * f * 34, y: (dy / d) * f * 34, f };
  });
  const x = useSpring(useTransform(push, (p) => p.x), SPRING.snappy);
  const y = useSpring(useTransform(push, (p) => p.y), SPRING.snappy);
  const f = useSpring(useTransform(push, (p) => p.f), SPRING.soft);
  const scale = useTransform(f, [0, 1], [1, 2.6]);
  const bg = useTransform(f, [0, 0.35], ["rgba(237,234,227,0.35)", ACCENT.acid]);
  return <motion.span className="absolute h-[3px] w-[3px] rounded-full" style={{ left: cx - 1.5, top: cy - 1.5, x, y, scale, backgroundColor: bg }} />;
}

export function SpringField() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const small = useMedia("(max-width: 767px)");
  const cols = small ? 10 : 18, rows = small ? 8 : 9;

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative h-full min-h-[280px] touch-pan-y overflow-hidden"
      data-cursor="Push"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => { mx.set(-999); my.set(-999); }}
      aria-hidden
    >
      {size.w > 0 &&
        Array.from({ length: cols * rows }, (_, i) => (
          <Dot key={`${cols}-${i}`} cx={((i % cols) + 0.5) * (size.w / cols)} cy={(Math.floor(i / cols) + 0.5) * (size.h / rows)} mx={mx} my={my} />
        ))}
    </div>
  );
}

/* E.02 — scroll speed becomes letter width and lean */
export function VelocityType() {
  const vel = useScrollVelocity();
  const rm = useReducedMotion();
  const abs = useTransform(vel, (v) => Math.min(1, Math.abs(v) / 2500));
  const wdth = useTransform(abs, [0, 1], [100, 62]);
  const skew = useTransform(vel, [-2500, 2500], [14, -14], { clamp: true });
  const fvs = useMotionTemplate`"wdth" ${wdth}`;
  const readout = useTransform(vel, (v) => (Math.abs(v) < 20 ? " 0000 px/s" : `${v > 0 ? "+" : "−"}${String(Math.round(Math.abs(v))).padStart(4, "0")} px/s`));
  const bar = useTransform(abs, (v) => v);
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <motion.p aria-hidden className="display origin-left text-[clamp(3rem,6.5vw,6.5rem)]" style={rm ? undefined : { fontVariationSettings: fvs, skewX: skew }}>
        Velo
        <br />
        city
      </motion.p>
      <div>
        <div className="h-px w-full bg-line">
          <motion.div className="h-px origin-left bg-orange" style={{ scaleX: bar }} />
        </div>
        <motion.p className={`${mono} mt-2 tabular-nums text-dim`}>{readout}</motion.p>
      </div>
    </div>
  );
}

/* E.03 — the site's own spring tokens, on a rubber band */
const PRESETS = ["snappy", "soft", "heavy"] as const;
export function SpringTokens() {
  const [k, setK] = useState<(typeof PRESETS)[number]>("soft");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = SPRING[k];
  return (
    <div className="flex h-full flex-col gap-4">
      <div role="radiogroup" aria-label="Spring token" className="flex gap-2">
        {PRESETS.map((p) => (
          <button key={p} role="radio" aria-checked={k === p} onClick={() => setK(p)} className={`${mono} border px-3 py-1.5 transition-colors ${k === p ? "border-acid text-acid" : "border-line text-dim hover:text-bone"}`}>
            {p}
          </button>
        ))}
      </div>
      <div className="relative min-h-[200px] flex-1">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <Band x={x} y={y} />
        </svg>
        <span aria-hidden className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 border border-bone/40" />
        <motion.div
          drag
          dragMomentum={false}
          onDragEnd={() => {
            animate(x, 0, s);
            animate(y, 0, s);
          }}
          style={{ x, y }}
          whileDrag={{ scale: 1.15 }}
          data-cursor="Drag"
          aria-label="Draggable spring puck"
          className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 touch-none rounded-full bg-acid"
        />
      </div>
      <p className={`${mono} text-dim`}>
        stiffness {s.stiffness} · damping {s.damping} · mass {s.mass}
      </p>
    </div>
  );
}
function Band({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const ref = useRef<SVGLineElement>(null);
  useEffect(() => {
    const draw = () => {
      const svg = ref.current?.ownerSVGElement;
      if (!svg || !ref.current) return;
      const cx = svg.clientWidth / 2, cy = svg.clientHeight / 2;
      ref.current.setAttribute("x1", `${cx}`);
      ref.current.setAttribute("y1", `${cy}`);
      ref.current.setAttribute("x2", `${cx + x.get()}`);
      ref.current.setAttribute("y2", `${cy + y.get()}`);
    };
    draw();
    const a = x.on("change", draw), b = y.on("change", draw);
    return () => { a(); b(); };
  }, [x, y]);
  return <line ref={ref} stroke={ACCENT.acid} strokeWidth={1} />;
}

/* E.04 — layout animation: order changes, positions are interpolated (FLIP) */
export function ReorderList() {
  const [items, setItems] = useState(PROJECTS.map((p) => p.title));
  const shuffle = () =>
    setItems((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next.join() === prev.join() ? [...next.slice(1), next[0]] : next;
    });
  return (
    <div className="flex h-full flex-col gap-4">
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-1.5">
        {items.map((t) => {
          const p = PROJECTS.find((pr) => pr.title === t)!;
          return (
            <Reorder.Item
              key={t}
              value={t}
              transition={SPRING.soft}
              whileDrag={{ scale: 1.02, backgroundColor: "#1c1d21" }}
              data-cursor="Drag"
              className="flex touch-pan-y items-center justify-between border border-line bg-graphite px-4 py-3 md:touch-none"
            >
              <span className="flex items-center gap-3">
                <span className="h-2 w-2" style={{ background: ACCENT[p.accent] }} />
                {t}
              </span>
              <span className={`${mono} text-faint`}>{p.idx}</span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <button onClick={shuffle} data-cursor-magnet className={`${mono} self-start border border-line px-3 py-1.5 text-dim transition-colors hover:border-orange hover:text-orange`}>
        Shuffle
      </button>
    </div>
  );
}
