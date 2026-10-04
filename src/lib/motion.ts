import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Full cinematic mode: pinned scenes, fixed environment layers, scrubbed camera moves. Must match the CSS in styles/base.css. */
export const CINEMATIC = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
/** Phones and tablets that still allow motion get light, decorative-only animation. */
export const LIGHT = '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)';

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/** Smooth wheel scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock. */
export function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __st: ScrollTrigger });
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scroll to a page position (px). */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.8 });
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Scroll to a chapter and hand keyboard focus to it. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(id === 'home' ? 0 : el.getBoundingClientRect().top + window.scrollY);
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}

/** A scene's fixed environment is only painted while some part of its section is on screen. */
export function liveWhileOnScreen(section: Element, env: Element) {
  // An empty timeline, not ScrollTrigger.create(): create() refreshes on the spot, which wipes the scroll position GSAP
  // saved before a breakpoint change (e.g. rotating a tablet), so the page jumped to the top and scrubs fell out of sync.
  return gsap.timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', toggleClass: { targets: env, className: 'is-live' } } });
}

/** Phones and tablets: plays once as `trigger` comes into view. A timeline for the same reason as liveWhileOnScreen. */
export function reveal(trigger: Element, start = 'top 85%') {
  return gsap.timeline({ defaults: { duration: 1, ease: 'expo.out' }, scrollTrigger: { trigger, start, toggleActions: 'play none none none' } });
}

/** Phones and tablets: tied directly to the scroll while `trigger` travels from `start` to `end`. */
export function scrubbed(trigger: Element, start = 'top bottom', end = 'bottom top') {
  return gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger, start, end, scrub: true } });
}

/** Phones and tablets: a chapter's label, masked heading lines and intro paragraph arrive in turn. */
export function revealCopy(copy: Element, start?: string) {
  const q = gsap.utils.selector(copy);
  return reveal(copy, start)
    .from(q('.label'), { autoAlpha: 0, x: -24 }, 0)
    .from(q('.line-in'), { yPercent: 112, duration: 1.2, stagger: 0.1 }, 0.08)
    .from(q('.body'), { autoAlpha: 0, y: 24 }, 0.4);
}

/** The arch-shaped window a scene is revealed through (clip-path and its bronze outline share these numbers). */
export const ARCH = {
  closed: 'inset(41% 47% 31% 47% round 50% 50% 0% 0% / 34% 34% 0% 0%)',
  open: 'inset(0% 0% 0% 0% round 0% 0% 0% 0% / 0% 0% 0% 0%)',
  ringClosed: { top: '41%', right: '47%', bottom: '31%', left: '47%' },
  ringOpen: { top: '0%', right: '0%', bottom: '0%', left: '0%' },
};

export { gsap, ScrollTrigger, useGSAP };
