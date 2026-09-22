"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.×•—";

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function ScrambleText({
  text,
  className = "",
  delay = 0,
  duration = 1.2,
}: ScrambleTextProps) {
  const elRef       = useRef<HTMLSpanElement>(null);
  const frameRef    = useRef<number>(0);
  const startedRef  = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    el.textContent = text.replace(/./g, "·");

    const startTime = gsap.globalTimeline.time() + delay;

    const ticker = gsap.ticker.add(() => {
      const now = gsap.globalTimeline.time();
      if (now < startTime) return;

      if (!startedRef.current) {
        startedRef.current = true;
      }

      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const resolved = Math.floor(progress * text.length);
      let output = "";

      for (let i = 0; i < text.length; i++) {
        if (i < resolved) {
          output += text[i];
        } else if (text[i] === " ") {
          output += " ";
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      el.textContent = output;

      if (progress >= 1) {
        el.textContent = text;
        gsap.ticker.remove(ticker);
      }
    });

    return () => {
      gsap.ticker.remove(ticker);
    };
  }, [text, delay, duration]);

  return (
    <span ref={elRef} className={className} aria-label={text}>
      {text}
    </span>
  );
}