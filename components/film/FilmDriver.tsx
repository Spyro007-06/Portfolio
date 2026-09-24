"use client";

// The only place scroll and pointer enter the system.
//   scroll position → progress (0..1 over SCROLL_LENGTH_VH)
//   progress → Motion spring → film   (the camera follows this: mass, lag, natural settling)
//   scroll velocity → spring → velocity
//   pointer → spring → pointer.x/y     (look-around)
// Also paints --accent from the colour script so the HUD belongs to the same scene.
// Reduced motion: film tracks progress directly; no pointer look-around.

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect } from "react";
import { COLOR_SCRIPT, lerp, smooth } from "@/world/timeline";
import { film, pointer, progress, settings, velocity } from "@/world/signals";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ACC = COLOR_SCRIPT.map(([t, , , a]) => [t, hex(a)] as const);
function accentAt(t: number) {
  let i = 0;
  while (i < ACC.length - 2 && t > ACC[i + 1][0]) i++;
  const [ta, a] = ACC[i], [tb, b] = ACC[i + 1];
  const f = smooth(Math.min(1, Math.max(0, (t - ta) / (tb - ta))));
  return a.map((v, k) => Math.round(lerp(v, b[k], f)));
}

import { responsiveScrollProgress, scrollFromFilmProgress } from "./scroll.ts";
export { responsiveScrollProgress, scrollFromFilmProgress };

export default function FilmDriver() {
  const rm = !!useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const mapped = useTransform(scrollYProgress, responsiveScrollProgress);
  // camera settling ≈ 1–1.5 s after the wheel stops
  const cam = useSpring(mapped, { stiffness: 55, damping: 19, mass: 1, restDelta: 0.00001 });
  const vel = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30, mass: 0.4 });
  const px = useSpring(0, { stiffness: 60, damping: 18, mass: 1 });
  const py = useSpring(0, { stiffness: 60, damping: 18, mass: 1 });

  useEffect(() => {
    settings.reduced = rm;
    settings.live = !rm && matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, [rm]);

  const paint = (v: number) => {
    film.set(v);
    const c = accentAt(v).join(",");
    document.documentElement.style.setProperty("--accent-rgb", c);
    document.documentElement.style.setProperty("--accent", `rgb(${c})`);
  };
  useMotionValueEvent(mapped, "change", (v) => {
    progress.set(v);
    if (settings.reduced) paint(v);
  });
  useMotionValueEvent(cam, "change", (v) => !settings.reduced && paint(v));
  useMotionValueEvent(vel, "change", (v) => velocity.set(v));
  useMotionValueEvent(px, "change", (v) => pointer.x.set(v));
  useMotionValueEvent(py, "change", (v) => pointer.y.set(v));

  useEffect(() => {
    const initial = responsiveScrollProgress(scrollYProgress.get());
    paint(initial);
    if (!settings.live) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px.set((e.clientX / innerWidth) * 2 - 1);
      py.set((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [px, py, rm, scrollYProgress]);

  return null;
}
