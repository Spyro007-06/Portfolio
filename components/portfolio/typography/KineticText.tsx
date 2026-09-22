"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface KineticTextProps {
  children: string;
  scrollSpeed?: number;
  className?: string;
}

export default function KineticText({
  children,
  scrollSpeed = 1,
  className = "",
}: KineticTextProps) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    tl.fromTo(
      el,
      { y: `${scrollSpeed * 15}px` },
      { y: `-${scrollSpeed * 30}px`, ease: "none" }
    );

    return () => { tl.kill(); };
  }, [scrollSpeed]);

  return (
    <span ref={elRef} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}