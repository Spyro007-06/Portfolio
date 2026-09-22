"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { worldState } from "@/lib/animation/sceneState";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const localGlowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [hoverLabel, setHoverLabel] = useState<string>("");
  const [hoverColor, setHoverColor] = useState<string>("#4F7CFF");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check coarse pointer (mobile/touch) or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Dot moves instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    // Smooth follower interpolation loop
    const tick = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      const transformStr = `translate3d(${ringX}px, ${ringY}px, 0)`;
      if (ringRef.current) {
        ringRef.current.style.transform = transformStr;
      }
      if (localGlowRef.current) {
        localGlowRef.current.style.transform = transformStr;
      }

      rafId = requestAnimationFrame(tick);
    };

    // Detect interactive elements for localized environmental reaction (100–200px)
    const handleOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], [data-cursor], input, .cursor-interactive"
      ) as HTMLElement | null;

      if (target) {
        setIsHovered(true);

        // Determine section context for chromatic localized illumination
        const inSkills = !!target.closest("#skills");
        const inWork = !!target.closest("#work");
        const inContact = !!target.closest("#contact");

        let activeColor = "#4F7CFF"; // Hero default electric blue
        let reactionType: "project" | "skill" | "contact" | "default" = "default";

        if (inSkills) {
          activeColor = "#65D6E8"; // Small cyan response for skill nodes
          reactionType = "skill";
        } else if (inWork) {
          activeColor = "#7867D8"; // Tiny localized blue/violet for project links
          reactionType = "project";
        } else if (inContact) {
          activeColor = "#D8B77A"; // Subtle warm champagne response for contact links
          reactionType = "contact";
        }

        setHoverColor(activeColor);

        // Update worldState for 3D virtual light reaction
        worldState.hoverReaction = {
          active: true,
          type: reactionType,
          x: (mouseX / window.innerWidth) * 2 - 1,
          y: -(mouseY / window.innerHeight) * 2 + 1,
          color: activeColor,
        };

        const label = target.getAttribute("data-cursor") || (target.tagName === "A" ? "OPEN" : "SELECT");
        setHoverLabel(label);

        gsap.to(ringRef.current, {
          scale: 1.5,
          borderColor: activeColor,
          backgroundColor: `${activeColor}15`,
          duration: 0.25,
          ease: "power2.out",
        });
      } else {
        setIsHovered(false);
        setHoverLabel("");

        worldState.hoverReaction = {
          active: false,
          type: "default",
          x: 0,
          y: 0,
          color: "#4F7CFF",
        };

        gsap.to(ringRef.current, {
          scale: 1.0,
          borderColor: "rgba(79, 124, 255, 0.35)",
          backgroundColor: "transparent",
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[100] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Precision Core Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[var(--accent)] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_8px_rgba(79,124,255,0.9)]"
        style={{ willChange: "transform" }}
      />

      {/* Localized Environmental Reaction (Restrained strictly within 140px around cursor) */}
      <div
        ref={localGlowRef}
        className={`fixed top-0 left-0 w-36 h-36 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle, ${hoverColor}22 0%, ${hoverColor}08 45%, transparent 70%)`,
          willChange: "transform",
        }}
      />

      {/* Smooth Ambient Follower Ring with Technical Micro-Label */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/35 pointer-events-none flex items-center justify-center transition-[border-color,background-color] duration-200"
        style={{ willChange: "transform" }}
      >
        {isHovered && hoverLabel && (
          <span
            ref={labelRef}
            className="absolute left-8 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.2em] bg-[#08090C]/90 px-1.5 py-0.5 border rounded-xs whitespace-nowrap select-none backdrop-blur-xs"
            style={{
              color: hoverColor,
              borderColor: `${hoverColor}40`,
            }}
          >
            {hoverLabel}
          </span>
        )}
      </div>
    </div>
  );
}
