"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { num: "01", label: "ABOUT",      href: "#about" },
  { num: "02", label: "EXPERTISE",  href: "#skills" },
  { num: "03", label: "WORK",       href: "#work" },
  { num: "04", label: "EXPERIENCE", href: "#experience" },
  { num: "05", label: "CONTACT",    href: "#contact" },
];

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navAtmosphere, setNavAtmosphere] = useState({
    color: "#4F7CFF",
    borderRgba: "rgba(79, 124, 255, 0.16)",
  });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;

      // Subtle atmospheric inheritance based on active space
      if (p < 0.14) {
        setNavAtmosphere({ color: "#4F7CFF", borderRgba: "rgba(79, 124, 255, 0.18)" }); // Hero slightly blue
      } else if (p < 0.426) {
        setNavAtmosphere({ color: "#65D6E8", borderRgba: "rgba(101, 214, 232, 0.18)" }); // Skills slightly cyan
      } else if (p < 0.735) {
        setNavAtmosphere({ color: "#7867D8", borderRgba: "rgba(120, 103, 216, 0.18)" }); // Projects slightly violet
      } else if (p < 0.940) {
        setNavAtmosphere({ color: "#7867D8", borderRgba: "rgba(120, 103, 216, 0.15)" }); // Experience violet
      } else {
        setNavAtmosphere({ color: "#D8B77A", borderRgba: "rgba(216, 183, 122, 0.20)" }); // Contact slightly warm
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Cinematic Intro Reveal after loading screen transformation (~1.6s)
    gsap.fromTo(
      nav,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.9, delay: 1.5, ease: "power2.out" }
    );

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      if ((window as any).__LENIS__) {
        (window as any).__LENIS__.scrollTo(el, { duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-8 md:px-12 py-4 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? "bg-[#08090C]/90 backdrop-blur-md border-b"
            : "bg-transparent"
        }`}
        aria-label="Main navigation"
        style={{
          opacity: 0,
          borderBottomColor: scrolled || mobileMenuOpen ? navAtmosphere.borderRgba : "transparent",
        }}
      >
        {/* Left: YOUR NAME (Requirement 30) */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("hero");
          }}
          className="group flex items-center gap-2.5 text-decoration-none"
          aria-label="Tharun B.L — Home"
        >
          <span className="font-display font-black text-xs sm:text-sm tracking-[-0.02em] text-[var(--text-primary)]">
            THARUN B.L.
          </span>
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
            // SENIOR FRONTEND ARCHITECTURE
          </span>
        </a>

        {/* Right: Desktop Minimal Links (Requirement 30) */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8 list-none m-0 p-0" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(href);
                }}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Minimal Menu Toggle (Requirement 28) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 border border-[var(--hairline)] bg-[#050a12]/80 text-[var(--accent)] font-mono text-[10px] uppercase tracking-wider"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>{mobileMenuOpen ? "CLOSE" : "MENU"}</span>
        </button>
      </nav>

      {/* Mobile Editorial HUD Drawer (Requirement 28) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 pt-20 px-6 pb-8 bg-[#030507]/95 backdrop-blur-xl md:hidden flex flex-col justify-between"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-4 mt-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--accent)] mb-2">
              SPATIAL NAVIGATION //
            </div>
            {NAV_LINKS.map(({ num, label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(href);
                }}
                className="flex items-center justify-between py-3.5 border-b border-[var(--hairline)] group"
              >
                <span className="font-mono text-xs text-[var(--accent)]">{num}</span>
                <span className="font-display font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {label}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            ))}
          </div>

          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] border-t border-[var(--hairline)] pt-4 flex justify-between items-center">
            <span>THARUN B.L.</span>
            <span>COIMBATORE, INDIA</span>
          </div>
        </div>
      )}
    </>
  );
}