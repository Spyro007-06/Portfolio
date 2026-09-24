"use client";

// The viewfinder. Small, quiet, in the corners, never over the subject:
//   top-left    name mark
//   top-right   film timecode (pacing reference) · scene title · text version
//   bottom-left chapter index — click flies the camera there (scroll animated by Motion; the
//               camera spring then carries it the rest of the way)
//   bottom-right camera coordinates
// At the very end, real links surface (the 3D ones are not keyboard-reachable).

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValueEvent, useTransform } from "motion/react";
import { useState } from "react";
import { PERSON } from "@/data/portfolio";
import { DUR, EASE, SPRING, T } from "@/components/motion/tokens";
import { camPos, film, progress } from "@/world/signals";
import { CHAPTERS, FILM_SECONDS, WORLD_TIMELINE, sceneAt, type SceneKey } from "@/world/timeline";
import { scrollFromFilmProgress } from "../film/FilmDriver";

const mono = "mono text-[12px] sm:text-[13px] uppercase tracking-[0.16em] leading-normal";
const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

function useScene() {
  const [s, set] = useState<SceneKey>("signal");
  useMotionValueEvent(film, "change", (v) => {
    const k = sceneAt(v);
    if (k !== s) set(k);
  });
  return s;
}

function useFlag(test: (v: number) => boolean) {
  const [on, set] = useState(false);
  useMotionValueEvent(progress, "change", (v) => test(v) !== on && set(test(v)));
  return on;
}

export function flyTo(at: number) {
  const max = document.documentElement.scrollHeight - innerHeight;
  const from = scrollY, to = scrollFromFilmProgress(at) * max;
  const dist = Math.abs(to - from) / innerHeight;
  const ctl = animate(from, to, { duration: Math.min(3.2, 0.9 + dist * 0.05), ease: EASE.inOut, onUpdate: (v) => scrollTo(0, v) });
  const stop = () => ctl.stop();
  addEventListener("wheel", stop, { once: true, passive: true });
  addEventListener("touchstart", stop, { once: true, passive: true });
}

export default function Hud({ onText }: { onText: () => void }) {
  const scene = useScene();
  const started = useFlag((v) => v > 0.012);
  const ended = useFlag((v) => v > 0.975);
  const time = useTransform(film, (v) => {
    const s = v * FILM_SECONDS;
    return `${pad(s / 60)}:${pad(s % 60)}:${pad((s % 1) * 24)}`;
  });
  const cx = useTransform(camPos.x, (v) => v.toFixed(1));
  const cy = useTransform(camPos.y, (v) => v.toFixed(1));
  const cz = useTransform(camPos.z, (v) => v.toFixed(1));
  const active = [...CHAPTERS].reverse().find((c) => WORLD_TIMELINE[c.key].start <= WORLD_TIMELINE[scene].start)?.key;

  return (
    <div id="chrome" className="pointer-events-none fixed inset-0 z-40 text-bone">
      {/* Top-left identity with protective backplate (Section 6, 19) */}
      <div className="absolute left-[var(--pad)] top-5 flex items-center gap-3 rounded-sm border border-line bg-[#0a0a0b]/90 px-3.5 py-2 shadow-lg backdrop-blur-md">
        <span className={`${mono} grid h-8 w-8 place-items-center border border-line bg-panel text-bone font-semibold`}>{PERSON.short}</span>
        <span className={`${mono} hidden text-bone sm:block`}>
          <span className="font-semibold text-white">{PERSON.name}</span>
          <br />
          <span className="text-[#c2bcaf]">{PERSON.title}</span>
        </span>
      </div>

      {/* Top-right timecode & scene indicator with protective backplate (Section 6, 19) */}
      <div className="absolute right-[var(--pad)] top-5 flex flex-col items-end gap-1.5 rounded-sm border border-line bg-[#0a0a0b]/90 p-3 text-right shadow-lg backdrop-blur-md">
        <span className={`${mono} tabular-nums text-[#c2bcaf]`}>
          <motion.span className="font-semibold text-white">{time}</motion.span> / 02:00:00
        </span>
        <span className={`${mono} relative h-4 overflow-hidden font-medium text-[var(--accent)]`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={scene} className="block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: T.medium }} exit={{ y: -14, opacity: 0, transition: T.fast }}>
              {WORLD_TIMELINE[scene].title}
            </motion.span>
          </AnimatePresence>
        </span>
        <button onClick={onText} className={`${mono} pointer-events-auto mt-1 rounded-sm border border-line bg-[#131418] px-3.5 py-1.5 text-bone transition-all hover:border-[var(--accent)] hover:bg-[#1c1d24] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]`}>
          Text version
        </button>
      </div>

      {/* Bottom-left chapter navigation with protective backplate & clear active indicators (Section 19 & 20) */}
      <nav aria-label="Scenes" className="pointer-events-auto absolute bottom-5 left-[var(--pad)] rounded-sm border border-line bg-[#0a0a0b]/90 p-3 shadow-2xl backdrop-blur-md">
        <LayoutGroup>
          <ol className={`${mono} flex flex-col gap-1.5`}>
            {CHAPTERS.map((c) => {
              const on = active === c.key;
              return (
                <motion.li key={c.key} whileHover={{ x: 4 }} transition={SPRING.physical}>
                  <button
                    onClick={() => flyTo(c.at)}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-3 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm px-1 ${
                      on ? "font-semibold text-white" : "text-[#c2bcaf] hover:text-white"
                    }`}
                  >
                    <span className="relative flex h-px w-5 items-center">
                      <span className="absolute inset-0 bg-line" />
                      {on && <motion.span layoutId="chapter" className="absolute inset-0 bg-[var(--accent)]" transition={SPRING.soft} />}
                    </span>
                    <span className={on ? "text-[var(--accent)] font-bold" : "text-[#968f83]"}>{c.n}</span>
                    <span className="hidden sm:inline">{c.label}</span>
                  </button>
                </motion.li>
              );
            })}
          </ol>
        </LayoutGroup>
      </nav>

      {/* Bottom-right camera coordinates with protective backplate (Section 19) */}
      <div className={`${mono} absolute bottom-5 right-[var(--pad)] hidden rounded-sm border border-line bg-[#0a0a0b]/90 p-3 text-right tabular-nums text-[#c2bcaf] shadow-lg backdrop-blur-md md:grid md:grid-cols-[auto_4.8rem] md:gap-x-3`}>
        <span>X</span>
        <motion.span className="text-white">{cx}</motion.span>
        <span>Y</span>
        <motion.span className="text-white">{cy}</motion.span>
        <span>Z</span>
        <motion.span className="text-white">{cz}</motion.span>
      </div>

      <AnimatePresence>
        {!started && (
          <motion.p
            key="hint"
            className={`${mono} absolute bottom-[14vh] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-line bg-[#0a0a0b]/85 px-4 py-2 font-medium text-bone shadow-xl backdrop-blur-md`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DUR.slow, delay: 3.4 } }}
            exit={{ opacity: 0, transition: T.medium }}
          >
            Scroll to move the camera
          </motion.p>
        )}
        {ended && (
          <motion.ul
            key="links"
            className={`${mono} pointer-events-auto absolute bottom-[6vh] left-1/2 flex -translate-x-1/2 gap-6 whitespace-nowrap rounded-sm border border-line bg-[#0a0a0b]/90 px-6 py-3 text-bone shadow-2xl backdrop-blur-md`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { ...T.slow, delay: 0.6 } }}
            exit={{ opacity: 0, transition: T.fast }}
          >
            <li><a className="transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={`mailto:${PERSON.email}`}>Email</a></li>
            <li><a className="transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={PERSON.github} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a className="transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={PERSON.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a className="transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={`mailto:${PERSON.email}?subject=Resume%20request`}>Resume</a></li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
