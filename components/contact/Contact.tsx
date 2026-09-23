"use client";

// Final scene. The page has been slowing since the Lab (Field speed → 0.18); density drops to
// one question and one address. Hovering the address opens the field: an orange aperture
// irises open behind it, the letters widen, and the background machine speeds up and spreads
// (via data-field on <html>, read by Field).

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { PERSON } from "@/data/portfolio";
import { Label, Magnetic, SplitLines } from "../motion/primitives";
import { EASE, SPRING } from "../motion/tokens";

const LINKS = [
  { label: "Email", href: `mailto:${PERSON.email}`, cursor: "Write" },
  { label: "LinkedIn", href: PERSON.linkedin, cursor: "Open" },
  { label: "GitHub", href: PERSON.github, cursor: "Open" },
  { label: "Resume — on request", href: `mailto:${PERSON.email}?subject=Resume%20request`, cursor: "Request" },
];

export default function Contact() {
  const [open, setOpen] = useState(false);
  const rm = useReducedMotion();
  const set = (v: boolean) => {
    setOpen(v);
    if (v) document.documentElement.dataset.field = "open";
    else delete document.documentElement.dataset.field;
  };
  const [user, host] = PERSON.email.split("@");

  return (
    <section id="contact" aria-labelledby="contact-h" className="px-pad relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[16vh]">
      <div className="flex items-center justify-between border-t border-line pt-4">
        <Label>
          <span className="text-acid">05</span> — Contact
        </Label>
        <Label className="hidden sm:inline">{PERSON.status}</Label>
      </div>

      <div className="relative my-16">
        <SplitLines
          as="h2"
          id="contact-h"
          className="display text-[clamp(3rem,11vw,12rem)]"
          lines={[
            "Got an idea",
            <span key="2">
              that should <span className="serif normal-case tracking-normal text-orange">move?</span>
            </span>,
          ]}
        />

        <div className="relative mt-[8vh] inline-block">
          {/* the aperture */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[140%] w-[110%] rounded-[50%] bg-orange"
            style={{ x: "-50%", y: "-50%" }}
            initial={false}
            animate={{ scale: open && !rm ? 1 : 0, opacity: open ? 1 : 0 }}
            transition={open ? { duration: 0.9, ease: EASE.out } : { duration: 0.45, ease: EASE.inOut }}
          />
          <Magnetic strength={0.12}>
            <a
              href={`mailto:${PERSON.email}`}
              onPointerEnter={() => set(true)}
              onPointerLeave={() => set(false)}
              onFocus={() => set(true)}
              onBlur={() => set(false)}
              data-cursor="Say hello"
              className="block px-2 text-[clamp(1.5rem,5.4vw,5.5rem)] font-semibold tracking-[-0.035em] transition-colors duration-300"
              style={{ color: open ? "#0B0B0C" : undefined }}
            >
              <motion.span className="inline-block" animate={{ letterSpacing: open && !rm ? "0.01em" : "-0.035em" }} transition={SPRING.soft}>
                {user}
                <span className={open ? "" : "text-dim"}>@{host}</span>
              </motion.span>
            </a>
          </Magnetic>
        </div>
      </div>

      <footer className="relative border-t border-line pb-24 pt-6 md:pb-8">
        <ul className="mb-12 grid grid-cols-2 gap-y-3 md:grid-cols-4">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                data-cursor={l.cursor}
                className="group inline-flex items-center gap-2 text-lg"
              >
                <span className="relative">
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-bone transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
                </span>
                <span aria-hidden className="text-dim transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mono flex flex-col gap-3 text-[11px] uppercase tracking-[0.16em] text-dim md:flex-row md:items-center md:justify-between">
          <span>
            {PERSON.name} · {PERSON.location} · © {new Date().getFullYear()}
          </span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {!rm && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-acid"
                  animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <span className="relative h-2 w-2 rounded-full bg-acid" />
            </span>
            {PERSON.status}
          </span>
          <span className="text-faint">Built with Next.js, TypeScript &amp; Motion</span>
          <motion.a href="#top" className="text-bone" whileHover={{ y: -3 }} transition={SPRING.snappy} data-cursor-magnet>
            Back to top ↑
          </motion.a>
        </div>
      </footer>
    </section>
  );
}
