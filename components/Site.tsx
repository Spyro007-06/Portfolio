"use client";

import dynamic from "next/dynamic";
import { MotionConfig, useReducedMotion } from "motion/react";
import Nav from "./navigation/Nav";
import Hero from "./hero/Hero";
import About from "./about/About";
import System from "./about/System";
import Work from "./projects/Work";
import Lab from "./lab/Lab";
import Experience from "./experience/Experience";
import Contact from "./contact/Contact";
import { useFinePointer } from "./motion/primitives";

// Visual-only layers: client-only and split out of the main bundle.
const Field = dynamic(() => import("./background/Field"), { ssr: false });
const Cursor = dynamic(() => import("./cursor/Cursor"), { ssr: false });

export default function Site() {
  const fine = useFinePointer();
  const rm = useReducedMotion();
  return (
    // "user": Motion drops transform/layout animation when the OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip mono text-xs uppercase tracking-widest">
        Skip to content
      </a>
      <Field />
      {fine && !rm && <Cursor />}
      <div id="chrome">
        <Nav />
      </div>
      <main id="main" className="relative isolate">
        <Hero />
        <About />
        <System />
        <Work />
        <Lab />
        <Experience />
        <Contact />
      </main>
    </MotionConfig>
  );
}
