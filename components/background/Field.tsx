"use client";

// The "machine": one fixed canvas behind the whole site. It is a single 3D plane of lines
// whose pose is driven by scroll, so every section is a different view of the same object:
//   hero       → a floor receding to a horizon, gates passing through, the core turning
//   about      → the plane swings upright into a flat technical grid (reorganisation)
//   work       → recedes and dims so the project plates own the stage
//   lab        → lines dissolve into intersection points (fragments)
//   experience → settles back toward a floor
//   contact    → nearly still; the core returns (bookend)
//
// Speeds: L1 atmosphere (CSS/Motion, ~40s) · L2 grid drift (~7s/cell) · L3 gates + core (~2–4s)
//         L4 pointer (Motion springs) · L5 rare pulses along one grid line (every 7–14s).
// Canvas only renders; Motion owns pointer smoothing and the atmosphere layer.

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { ACCENT, SPRING } from "../motion/tokens";

const SECTIONS = ["top", "about", "work", "lab", "experience", "contact"];
// per-section pose: [tilt(rad), lineAlpha, speed, fragment(0 lines→1 points), core, accent]
const POSE: [number, number, number, number, number, string][] = [
  [1.36, 1.0, 1.0, 0, 1, ACCENT.blue],
  [0.05, 0.4, 0.55, 0, 0.15, ACCENT.bone],
  [0.95, 0.28, 0.8, 0, 0.1, ACCENT.orange],
  [0.02, 0.55, 1.0, 1, 0, ACCENT.acid],
  [1.2, 0.4, 0.5, 0.25, 0.2, ACCENT.orange],
  [1.46, 0.55, 0.18, 0, 1, ACCENT.orange],
];
const EVENT_COLORS = [ACCENT.blue, ACCENT.acid, ACCENT.orange];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return A.map((v, i) => Math.round(lerp(v, B[i], t)));
};

export default function Field() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rm = useReducedMotion();
  // L4: pointer, smoothed by Motion and sampled by the render loop.
  const px = useSpring(0, SPRING.follow);
  const py = useSpring(0, SPRING.follow);
  const mx = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const small = innerWidth < 768;
    const N = small ? 14 : 26; // grid half-extent in cells
    const dpr = Math.min(devicePixelRatio || 1, small ? 1 : 1.5);
    let w = 0, h = 0, tops: number[] = [];
    let raf = 0, last = performance.now(), t = 0, dirty = true;
    const born = last;
    let fieldOpen = 0, nextEvent = 3, events: { u: number; v: number; c: string }[] = [];

    const measure = () => {
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      tops = SECTIONS.map((id) => document.getElementById(id)?.offsetTop ?? 0);
      dirty = true;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px.set((e.clientX / w) * 2 - 1);
      py.set((e.clientY / h) * 2 - 1);
      mx.current = { x: e.clientX, y: e.clientY };
    };
    const onScroll = () => (dirty = true);
    if (fine) addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });

    // continuous scene index: 0 = hero … 5 = contact, fractional between sections
    const sceneAt = (y: number) => {
      const mid = y + h * 0.5;
      for (let i = tops.length - 1; i >= 0; i--) {
        if (mid >= tops[i]) {
          const next = tops[i + 1] ?? tops[i] + h;
          // hold the pose for most of a section, blend in the last 40% before the next
          const f = clamp01(((mid - tops[i]) / Math.max(1, next - tops[i]) - 0.6) / 0.4);
          return i + (i < tops.length - 1 ? f * f * (3 - 2 * f) : 0);
        }
      }
      return 0;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      if (small && now - last < 32) return; // ~30fps on phones
      last = now;
      const s = sceneAt(scrollY);
      const i = Math.floor(s), f = s - i;
      const A = POSE[i], B = POSE[Math.min(i + 1, POSE.length - 1)];
      const P = A.map((v, k) => (k < 5 ? lerp(v as number, B[k] as number, f) : 0)) as number[];
      const open = document.documentElement.dataset.field === "open" ? 1 : 0;
      fieldOpen += (open - fieldOpen) * Math.min(1, dt * 3);
      const speed = P[2] * (1 + fieldOpen * 2);
      if (rm) { if (!dirty) return; } else t += dt * speed;
      dirty = false;

      const intro = rm ? 1 : clamp01((now - born) / 1800);
      const ease = 1 - Math.pow(1 - intro, 3);
      const tilt = P[0] + (1 - ease) * 0.18;
      const alpha = P[1] * ease;
      const frag = P[3];
      const [r, g, b] = mix(A[5], B[5], f);
      const acc = `${r},${g},${b}`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // camera: slow sway (L2) + pointer parallax (L4)
      const camX = Math.sin(t * 0.05) * 0.5 + px.get() * 0.7;
      const camY = Math.cos(t * 0.04) * 0.15 - py.get() * 0.35;
      const fl = Math.min(w, h * 1.4) * 0.9;
      const cx = w / 2, cy = h * lerp(0.5, 0.56, Math.sin(tilt));
      const sa = Math.sin(tilt), ca = Math.cos(tilt);
      const pivotY = -1.3 * sa, D = lerp(5.5, 3.2, sa);
      const spacing = 1 + fieldOpen * 0.35;

      const proj = (X: number, Y: number, Z: number) => [cx + ((X - camX) * fl) / Z, cy - ((Y - camY) * fl) / Z] as const;
      const world = (u: number, v: number) => [u * spacing, pivotY + v * ca * spacing, D + v * sa * spacing] as const;
      const NEAR = 0.4;
      // project a plane segment, clipped against the near plane
      const seg = (path: Path2D, u0: number, v0: number, u1: number, v1: number) => {
        let a = world(u0, v0), bb = world(u1, v1);
        if (a[2] < NEAR && bb[2] < NEAR) return;
        if (a[2] < NEAR || bb[2] < NEAR) {
          const k = (NEAR - a[2]) / (bb[2] - a[2]);
          const c = [lerp(a[0], bb[0], k), lerp(a[1], bb[1], k), NEAR] as const;
          if (a[2] < NEAR) a = c; else bb = c;
        }
        const p = proj(...a), q = proj(...bb);
        path.moveTo(p[0], p[1]);
        path.lineTo(q[0], q[1]);
      };

      const drift = (t * 0.14) % 1; // L2: the floor flows toward the viewer
      const grid = new Path2D();
      if (frag < 1) {
        for (let u = -N; u <= N; u++) seg(grid, u, -N, u, N);
        for (let v = -N; v <= N; v++) seg(grid, -N, v - drift, N, v - drift);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(237,234,227,${0.1 * alpha * (1 - frag)})`;
        ctx.stroke(grid);
        if (fine && mx.current.x > -999) {
          // L4: the grid lights up under the pointer, in the section's accent
          const m = mx.current;
          const lg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 260);
          lg.addColorStop(0, `rgba(${acc},${0.55 * (1 - frag) * ease})`);
          lg.addColorStop(1, `rgba(${acc},0)`);
          ctx.strokeStyle = lg;
          ctx.stroke(grid);
        }
      }
      if (frag > 0) {
        const pts = new Path2D();
        const M = Math.min(N, 16);
        for (let u = -M; u <= M; u++)
          for (let v = -M; v <= M; v++) {
            const wp = world(u, v - drift);
            if (wp[2] < NEAR) continue;
            const [x, y] = proj(...wp);
            if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
            const sz = Math.min(2.2, 6 / wp[2]);
            pts.rect(x - sz / 2, y - sz / 2, sz, sz);
          }
        ctx.fillStyle = `rgba(237,234,227,${0.22 * alpha * frag})`;
        ctx.fill(pts);
      }

      // L3: architectural gates passing through the space, and the core at the horizon
      if (sa > 0.6 && alpha > 0.05) {
        const gates = new Path2D();
        const span = 24;
        for (let k = 0; k < 5; k++) {
          const z = ((k * span) / 5 - t * 0.5) % span;
          const Z = (z < 0 ? z + span : z) + 1.2;
          const gw = 5.5, gh = 3.4, y0 = pivotY;
          const c = [proj(-gw, y0, Z), proj(gw, y0, Z), proj(gw, y0 + gh, Z), proj(-gw, y0 + gh, Z)];
          gates.moveTo(c[0][0], c[0][1]);
          c.slice(1).forEach((p) => gates.lineTo(p[0], p[1]));
          gates.closePath();
        }
        ctx.strokeStyle = `rgba(237,234,227,${0.06 * alpha * (sa - 0.6) * 2.5})`;
        ctx.stroke(gates);
      }
      const core = P[4] * ease;
      if (core > 0.02) {
        const rot = t * 0.18, rot2 = t * 0.11;
        const Zc = 16, Yc = pivotY + 2.4, s = 1.4 + fieldOpen * 0.6;
        const V = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z])));
        const P2 = V.map(([x, y, z]) => {
          const x1 = x * Math.cos(rot) - z * Math.sin(rot), z1 = x * Math.sin(rot) + z * Math.cos(rot);
          const y1 = y * Math.cos(rot2) - z1 * Math.sin(rot2), z2 = y * Math.sin(rot2) + z1 * Math.cos(rot2);
          return proj(x1 * s, Yc + y1 * s, Zc + z2 * s);
        });
        const cube = new Path2D();
        for (let a = 0; a < 8; a++)
          for (let bIdx = a + 1; bIdx < 8; bIdx++) {
            const d = (a ^ bIdx);
            if (d === 1 || d === 2 || d === 4) {
              cube.moveTo(P2[a][0], P2[a][1]);
              cube.lineTo(P2[bIdx][0], P2[bIdx][1]);
            }
          }
        ctx.strokeStyle = `rgba(237,234,227,${0.32 * core})`;
        ctx.stroke(cube);
        // core halo, the only soft light in the scene
        const [hx, hy] = proj(0, Yc, Zc);
        const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 220);
        halo.addColorStop(0, `rgba(${acc},${0.12 * core * (1 + fieldOpen)})`);
        halo.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(hx - 220, hy - 220, 440, 440);
      }

      // horizon fog: depth without blur
      if (sa > 0.3) {
        const fog = ctx.createLinearGradient(0, cy - h * 0.25, 0, cy + h * 0.12);
        fog.addColorStop(0, "rgba(11,11,12,0.95)");
        fog.addColorStop(0.55, `rgba(11,11,12,${0.6 * sa})`);
        fog.addColorStop(1, "rgba(11,11,12,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, w, cy + h * 0.12);
      }

      // L5: rare events — a pulse of color runs down one grid line toward the viewer
      if (!rm) {
        nextEvent -= dt * Math.max(0.3, speed);
        if (nextEvent <= 0 && frag < 0.5) {
          events.push({ u: Math.round((Math.random() * 2 - 1) * 7), v: N, c: EVENT_COLORS[(Math.random() * 3) | 0] });
          nextEvent = 7 + Math.random() * 7;
        }
        events = events.filter((e) => (e.v -= dt * 9 * Math.max(0.4, speed)) > -N);
        for (const e of events) {
          const [cr, cg, cb] = hex(e.c);
          for (let k = 0; k < 4; k++) {
            const p = new Path2D();
            seg(p, e.u, e.v + k * 0.6, e.u, e.v + (k + 1) * 0.6);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(0.9 - k * 0.22) * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke(p);
          }
          ctx.lineWidth = 1;
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
    };
  }, [rm, px, py]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* L1: atmosphere — two very large light fields drifting on ~40s cycles */}
      {!rm && (
        <>
          <motion.div
            className="absolute -left-[20vw] top-[10vh] h-[80vh] w-[80vw] opacity-[0.10] bg-[radial-gradient(closest-side,#3D6BFF,transparent)]"
            animate={{ x: ["0vw", "18vw", "0vw"], y: ["0vh", "12vh", "0vh"] }}
            transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-[25vw] bottom-[-20vh] h-[70vh] w-[70vw] opacity-[0.07] bg-[radial-gradient(closest-side,#FF6A2B,transparent)]"
            animate={{ x: ["0vw", "-14vw", "0vw"], y: ["0vh", "-10vh", "0vh"] }}
            transition={{ duration: 56, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,11,12,0.85)_100%)]" />
    </div>
  );
}
