"use client";

// Pointer system. Two bodies: a dot bound to the pointer (SPRING.cursor) and a ring that
// lags behind it (SPRING.follow). Any element with data-cursor="LABEL" turns the ring into
// a label; data-cursor-magnet makes the ring snap onto that element's box. The dot stretches
// along its velocity so fast movement reads as fast.
// Mounted only for fine pointers without reduced-motion (see Site).

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useState } from "react";
import { SPRING, T } from "../motion/tokens";

const HIT = "[data-cursor],a,button,[role=button],[data-cursor-magnet]";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // ring target: pointer, or the centre of a magnetic element
  const tx = useMotionValue(-100);
  const ty = useMotionValue(-100);
  const dx = useSpring(x, SPRING.cursor);
  const dy = useSpring(y, SPRING.cursor);
  const rx = useSpring(tx, SPRING.follow);
  const ry = useSpring(ty, SPRING.follow);
  const w = useSpring(34, SPRING.snappy);
  const h = useSpring(34, SPRING.snappy);
  const ml = useTransform(w, (v) => -v / 2);
  const mt = useTransform(h, (v) => -v / 2);

  const vx = useVelocity(dx);
  const vy = useVelocity(dy);
  const speed = useTransform(() => Math.min(1, Math.hypot(vx.get(), vy.get()) / 2800));
  const scaleX = useTransform(speed, [0, 1], [1, 2.6]);
  const scaleY = useTransform(speed, [0, 1], [1, 0.5]);
  const rotate = useTransform(() => (Math.atan2(vy.get(), vx.get()) * 180) / Math.PI);

  const [label, setLabel] = useState<string | null>(null);
  const [magnet, setMagnet] = useState(false);
  const [down, setDown] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("has-cursor");
    let target: Element | null = null;
    let rect: DOMRect | null = null;

    const sync = (px: number, py: number) => {
      const hit = document.elementFromPoint(px, py)?.closest(HIT) ?? null;
      if (hit !== target) {
        target = hit;
        const lbl = hit?.getAttribute("data-cursor") || null;
        rect = hit?.hasAttribute("data-cursor-magnet") ? hit.getBoundingClientRect() : null;
        setLabel(lbl);
        setMagnet(!!rect);
        if (rect) { w.set(rect.width + 16); h.set(rect.height + 12); }
        else if (lbl) { w.set(8); h.set(8); }
        else if (hit) { w.set(58); h.set(58); }
        else { w.set(34); h.set(34); }
      } else if (rect && hit) rect = hit.getBoundingClientRect();
      tx.set(rect ? rect.left + rect.width / 2 : px);
      ty.set(rect ? rect.top + rect.height / 2 : py);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      sync(e.clientX, e.clientY);
    };
    const scroll = () => sync(x.get(), y.get());
    const pd = () => setDown(true);
    const pu = () => setDown(false);
    const out = () => setShown(false);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("pointerdown", pd);
    addEventListener("pointerup", pu);
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("scroll", scroll);
      removeEventListener("pointerdown", pd);
      removeEventListener("pointerup", pu);
      document.documentElement.removeEventListener("pointerleave", out);
    };
  }, [x, y, tx, ty, w, h]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200" style={{ opacity: shown ? 1 : 0 }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="absolute border border-bone/50 mix-blend-difference"
          style={{ width: w, height: h, marginLeft: ml, marginTop: mt }}
          animate={{ scale: down ? 0.82 : 1, borderRadius: magnet ? 6 : 999, opacity: label ? 0 : 1 }}
          transition={SPRING.snappy}
        />
        <div className="absolute">
          <AnimatePresence>
            {label && (
              <motion.span
                key={label}
                className="mono absolute left-0 top-0 block whitespace-nowrap rounded-full bg-bone px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink"
                style={{ translateX: "-50%", translateY: "-50%" }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: SPRING.snappy }}
                exit={{ scale: 0.3, opacity: 0, transition: T.fast }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x: dx, y: dy }}>
        <motion.div
          className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-bone mix-blend-difference"
          style={{ scaleX, scaleY, rotate }}
          animate={{ opacity: label ? 0 : 1 }}
          transition={T.fast}
        />
      </motion.div>
    </div>
  );
}
