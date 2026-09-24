"use client";

// The text version: every piece of information in the film as a plain, semantic document.
// Always in the DOM (screen readers get the portfolio without the world); shown as an overlay
// when asked for. Nothing here depends on animation.

import { useEffect, useRef } from "react";
import { EXPLORING, PERSON, PRINCIPLES, PROJECTS, SKILLS, TIMELINE } from "@/data/portfolio";

export default function Transcript({ open, onClose }: { open: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [open, onClose]);

  const h2 = "mono mt-14 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]";
  return (
    <main id="main" aria-label="Portfolio — text version" className={open ? "fixed inset-0 z-[85] overflow-y-auto bg-[#0a0a0b]" : "sr-only"}>
      <div className="px-pad mx-auto max-w-3xl py-20">
        {open && (
          <button ref={close} onClick={onClose} className="mono fixed right-6 top-6 border border-line bg-[#0a0a0b] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]">
            Back to the world <span aria-hidden>Esc</span>
          </button>
        )}
        <h1 className="text-5xl font-semibold tracking-[-0.03em]">{PERSON.name}</h1>
        <p className="mt-3 text-xl text-dim">
          {PERSON.title} · {PERSON.location}
        </p>
        <p className="mt-8 text-lg leading-relaxed">
          I&apos;m Tharun — a frontend developer and CSE student in Coimbatore. {PERSON.statement} I learn fastest by turning ideas into
          working products, then iterating.
        </p>
        <p className="mt-4 text-dim">Currently exploring: {EXPLORING.join(", ")}.</p>

        <h2 className={h2}>Experience</h2>
        {TIMELINE.map((t) => (
          <section key={t.org} className="mt-6">
            <h3 className="text-2xl font-semibold">
              {t.role} — {t.org}
            </h3>
            <p className="text-dim">{t.period}</p>
            <p className="mt-2 leading-relaxed">{t.desc}</p>
            <ul className="mt-2 list-disc pl-5 text-dim">
              {t.focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        ))}

        <h2 className={h2}>Skills</h2>
        {SKILLS.map((g) => (
          <section key={g.group} className="mt-5">
            <h3 className="font-semibold">{g.group}</h3>
            <p className="text-dim">{g.items.map((s) => s.name).join(", ")}</p>
          </section>
        ))}

        <h2 className={h2}>Projects</h2>
        {PROJECTS.map((p) => (
          <section key={p.id} className="mt-8 border-b border-line pb-6">
            <h3 className="text-2xl font-semibold text-white">
              {p.idx} — {p.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-[var(--accent)]">
              {p.category} · {p.domain}
            </p>
            <p className="mt-1 text-sm text-[#c2bcaf]">
              Role: Frontend Developer & Builder · Year: {p.year}
            </p>
            <p className="mt-3 leading-relaxed text-[#eae4d6]">{p.desc}</p>
            <p className="mt-2 text-sm text-[#c2bcaf]">
              <strong className="text-white">Technologies & Capabilities:</strong> {p.points.join(" · ")}
            </p>
            {p.link && (
              <a className="mt-3 inline-flex items-center gap-1.5 text-sm underline text-[var(--accent)] hover:text-white" href={p.link} target="_blank" rel="noreferrer">
                Source repository on GitHub ↗
              </a>
            )}
          </section>
        ))}

        <h2 className={h2}>How I work</h2>
        <ul className="mt-4 space-y-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title}>
              <strong>{p.title}.</strong> <span className="text-dim">{p.copy}</span>
            </li>
          ))}
        </ul>

        <h2 className={h2}>Contact</h2>
        <ul className="mt-4 space-y-2 text-lg">
          <li>
            <a className="underline" href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
          </li>
          <li>
            <a className="underline" href={PERSON.github} target="_blank" rel="noreferrer">GitHub</a>
          </li>
          <li>
            <a className="underline" href={PERSON.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </li>
          <li>
            <a className="underline" href={`mailto:${PERSON.email}?subject=Resume%20request`}>Resume — on request</a>
          </li>
        </ul>
        <p className="mt-10 text-sm text-faint">{PERSON.status}.</p>
      </div>
    </main>
  );
}
