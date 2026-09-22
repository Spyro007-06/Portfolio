"use client";

import { useRef, useCallback, ReactNode, AnchorHTMLAttributes } from "react";
import gsap from "gsap";

interface MagneticButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  children: ReactNode;
  href?: string;
  variant?: "outline" | "ghost" | "arrow";
  as?: "button" | "a";
}

export default function MagneticButton({
  children,
  href,
  variant = "ghost",
  className = "",
  as: Tag = "a",
  ...rest
}: MagneticButtonProps) {
  const elRef = useRef<HTMLAnchorElement | null>(null);
  const qX    = useRef<gsap.QuickToFunc | null>(null);
  const qY    = useRef<gsap.QuickToFunc | null>(null);

  const setRef = useCallback((node: HTMLAnchorElement | null) => {
    elRef.current = node;
    if (node) {
      qX.current = gsap.quickTo(node, "x", { duration: 0.4, ease: "power2.out" });
      qY.current = gsap.quickTo(node, "y", { duration: 0.4, ease: "power2.out" });
    }
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect   = e.currentTarget.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = e.clientX - cx;
    const dy     = e.clientY - cy;
    qX.current?.(dx * 0.35);
    qY.current?.(dy * 0.35);
  };

  const onMouseLeave = () => {
    qX.current?.(0);
    qY.current?.(0);
  };

  const baseClass = "magnetic-btn inline-flex items-center gap-2 transition-colors duration-200";

  const variantClass = {
    ghost:   "font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
    outline: "font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] border border-[var(--hairline)] px-4 py-2 hover:border-[var(--accent)] hover:text-[var(--text-primary)]",
    arrow:   "arrow-btn",
  }[variant];

  return (
    <a
      ref={setRef}
      href={href}
      className={`${baseClass} ${variantClass} ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {variant === "arrow" ? (
        <>
          {children}
          <span className="arrow-line" />
          <span>→</span>
        </>
      ) : (
        children
      )}
    </a>
  );
}