"use client";

// The page is a projector. It holds the scroll distance (the film's length), the world behind
// it, and a thin layer of chrome. All content lives in the world; the Transcript carries the
// same content as plain text for screen readers and anyone who prefers to read.

import dynamic from "next/dynamic";
import { MotionConfig, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import FilmDriver from "./film/FilmDriver";
import Loader from "./ui/Loader";
import Hud from "./ui/Hud";
import Dossier from "./ui/Dossier";
import Transcript from "./ui/Transcript";
import { useFinePointer } from "./motion/media";
import { settings } from "@/world/signals";
import { SCROLL_LENGTH_VH } from "@/world/timeline";

// WebGL is split out of the main bundle and never server-rendered.
const World = dynamic(() => import("@/world/World"), { ssr: false });
const Cursor = dynamic(() => import("./cursor/Cursor"), { ssr: false });

export default function Site() {
  const fine = useFinePointer();
  const rm = useReducedMotion();
  const [boot, setBoot] = useState(false);
  const [text, setText] = useState(false);
  const closeText = useCallback(() => setText(false), []);

  useEffect(() => {
    // quality tier is decided once, before the world is built
    settings.mobile = matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    settings.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    settings.live = !settings.reduced && matchMedia("(hover: hover) and (pointer: fine)").matches;
    setBoot(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" onClick={() => setText(true)} className="skip mono text-xs uppercase tracking-widest">
        Skip to text version
      </a>
      <FilmDriver />
      <div className="fixed inset-0">{boot && <World />}</div>
      <Hud onText={() => setText(true)} />
      <Dossier />
      <Transcript open={text} onClose={closeText} />
      {fine && !rm && <Cursor />}
      <Loader />
      {/* the film's physical length */}
      <div aria-hidden style={{ height: `${SCROLL_LENGTH_VH * 100}vh` }} />
    </MotionConfig>
  );
}
