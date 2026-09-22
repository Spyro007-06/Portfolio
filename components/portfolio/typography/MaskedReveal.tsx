"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MaskedRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down";
  className?: string;
  /** If false, uses ScrollTrigger instead of mounting animation */
  onMount?: boolean;
}

export default function MaskedReveal({
  children,
  delay = 0,
  duration = 0.85,
  direction = "up",
  className = "",
  onMount = false,
}: MaskedRevealProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!innerRef.current || !wrapRef.current) return;

    const yFrom = direction === "up" ? 60 : -60;

    const animProps = {
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      opacity: 1,
      duration,
      ease: "power4.out",
      delay: onMount ? delay : 0,
    };

    gsap.set(innerRef.current, {
      y: yFrom,
      clipPath: "inset(0 0 100% 0)",
      opacity: 0,
    });

    if (onMount) {
      gsap.to(innerRef.current, animProps);
    } else {
      gsap.to(innerRef.current, {
        ...animProps,
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 85%",
          once: true,
        },
        delay,
      });
    }
  }, [delay, duration, direction, onMount]);

  return (
    <div ref={wrapRef} className={`masked-reveal-wrapper overflow-hidden ${className}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}