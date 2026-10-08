import { useRef, type CSSProperties } from 'react';
import { projects } from '../content';
import { CINEMATIC, LIGHT, PORTRAIT, gsap, liveWhileOnScreen, reveal, scrollToY, scrubbed, useGSAP } from '../lib/motion';
import { Cta } from '../components/Cta';
import { Lines } from '../components/Lines';
import { Scenery } from '../components/Scenery';
import './Pantheon.css';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const TRAVEL = 0.84; // share of the pinned scroll spent travelling; the rest lets the gallery recede

/** Chapter 03 — The Pantheon of Creations. A marble column wipes the forge away; the gallery travels sideways. */
export function Pantheon() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // phones and tablets: the ivory hall sweeps in over the forge, then each creation is unveiled in turn
      mm.add(LIGHT, () => {
        const section = root.current!;
        // an ivory dome rises out of the forge's dark and swells until it fills the screen
        scrubbed(section, 'top bottom', 'top 35%')
          .fromTo('.pantheon-reveal', { clipPath: 'circle(0vh at 50% 60vh)' }, { clipPath: 'circle(110vh at 50% 60vh)', ease: 'power1.in' }, 0)
          .fromTo('.art--pantheon', { scale: 1.2 }, { scale: 1 }, 0)
          // the chapter is taller than the dome, so let the ivory reach its foot once the dome has filled the screen
          .set('.pantheon-reveal', { clipPath: 'none' });
        // the intro waits until the dome has covered it so dark ink never sits on the dark forge
        reveal(section.querySelector('.track-intro')!, 'top 70%')
          .from('.track-intro .label', { autoAlpha: 0, x: -24 }, 0)
          .from('.track-intro .line-in', { yPercent: 112, duration: 1.2, stagger: 0.1 }, 0.08)
          .from(['.track-intro .body', '.track-cta'], { autoAlpha: 0, y: 24, stagger: 0.12 }, 0.4);

        gsap.utils.toArray<HTMLElement>('.panel', section).forEach((panel) => {
          const q = gsap.utils.selector(panel);
          reveal(panel)
            .from(panel, { autoAlpha: 0, y: 80, duration: 1.2 }, 0)
            // settles a little oversized so the parallax below never shows the frame's edge
            .fromTo(q('.panel-frame img'), { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.4 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.16, duration: 1.6, ease: 'expo.inOut' }, 0.05)
            .from(q('.panel-text > *'), { autoAlpha: 0, y: 22, stagger: 0.08 }, 0.6);
          scrubbed(panel).fromTo(q('.panel-frame img'), { yPercent: -7 }, { yPercent: 7 }, 0);
        });
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        liveWhileOnScreen(section, section.querySelector('.env')!);
        const column = section.querySelector<HTMLElement>('.wipe-column')!;
        const track = section.querySelector<HTMLElement>('.track')!;
        const panels = gsap.utils.toArray<HTMLElement>('.panel', section);
        const travel = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const portrait = matchMedia(PORTRAIT).matches;
        // phones show one panel at a time, so the gallery comes to rest with a panel (or the intro) centred
        const restingPoints = () => [
          0,
          ...panels.map((p) => (gsap.utils.clamp(0, travel(), p.offsetLeft + p.offsetWidth / 2 - window.innerWidth / 2) / travel()) * TRAVEL),
          1,
        ];

        // entrance: the column sweeps across and the ivory hall is revealed in its wake
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.9, invalidateOnRefresh: true },
          })
          .fromTo('.pantheon-reveal', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 0)
          .fromTo(column, { x: () => window.innerWidth - column.offsetWidth / 2 }, { x: () => -column.offsetWidth / 2, duration: 1 }, 0)
          .fromTo('.art--pantheon', { scale: 1.12 }, { scale: 1.05, duration: 1 }, 0)
          // on a phone the intro sits right where the column sweeps last, so it waits for it to pass
          .from('.track-intro > *', { autoAlpha: 0, y: 30, duration: 0.3, stagger: 0.08, ease: 'power2.out' }, portrait ? 0.86 : 0.62);

        // how close each panel is to centre stage drives its scale, light and the order its text arrives in
        const focusPanels = () => {
          const cx = window.innerWidth / 2;
          const rects = panels.map((p) => p.getBoundingClientRect());
          rects.forEach((r, i) => {
            const d = (r.left + r.width / 2 - cx) / (r.width * 0.85);
            panels[i].style.setProperty('--a', Math.max(0, 1 - Math.abs(d)).toFixed(3));
            panels[i].style.setProperty('--o', gsap.utils.clamp(-1, 1, d).toFixed(3));
          });
        };

        const tl = gsap
          .timeline({
            defaults: { ease: 'none' },
            onUpdate: focusPanels,
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.9,
              invalidateOnRefresh: true,
              onRefresh: focusPanels,
              snap: portrait ? { snapTo: (v: number) => gsap.utils.snap(restingPoints(), v), duration: { min: 0.3, max: 0.8 }, delay: 0.08, ease: 'power2.inOut' } : undefined,
            },
          })
          .fromTo(column, { x: () => -column.offsetWidth / 2 }, { x: () => -column.offsetWidth - 60, duration: 0.05, immediateRender: false }, 0)
          .fromTo('.art--pantheon', { scale: 1.05, xPercent: 0 }, { scale: 1, xPercent: -2, duration: 1, immediateRender: false }, 0)
          .to(track, { x: () => -travel(), duration: TRAVEL }, 0)
          .to(track, { scale: 0.92, yPercent: -4, autoAlpha: 0, duration: 1 - TRAVEL - 0.02, ease: 'power1.in' }, TRAVEL + 0.02);
        focusPanels();

        // keyboard: tabbing to a project link brings that panel to centre stage
        const st = tl.scrollTrigger!;
        const onFocus = (e: FocusEvent) => {
          const panel = (e.target as HTMLElement).closest<HTMLElement>('.panel');
          if (!panel || !travel()) return;
          const x = gsap.utils.clamp(0, travel(), panel.offsetLeft + panel.offsetWidth / 2 - window.innerWidth / 2);
          scrollToY(st.start + (x / travel()) * TRAVEL * (st.end - st.start));
        };
        track.addEventListener('focusin', onFocus);
        return () => {
          track.removeEventListener('focusin', onFocus);
          panels.forEach((p) => p.style.removeProperty('--a'));
        };
      });
    },
    { scope: root },
  );

  return (
    <section id="projects" ref={root} className="scene scene--pantheon" aria-labelledby="projects-title">
      <div className="env env--pantheon" aria-hidden="true">
        <div className="pantheon-reveal">
          <Scenery name="pantheon" className="art--pantheon" />
          <div className="veil veil--pantheon" />
        </div>
        <img className="wipe-column cine-only" src="/art/column.webp" width={382} height={1750} alt="" />
      </div>

      <div className="stage pantheon-stage">
        <ul className="track">
          <li className="track-intro">
            <p className="label">
              <span className="n">03</span>
              <span className="rule" />
              The Pantheon of Creations
            </p>
            <h2 id="projects-title" className="h2">
              <Lines lines={projects.heading} />
            </h2>
            <p className="body">{projects.body}</p>
            <div className="track-cta">
              <Cta tone="light" href={projects.all.href} external icon="external">
                {projects.all.label}
              </Cta>
            </div>
          </li>

          {projects.items.map((p, i) => (
            <li className="panel" key={p.title}>
              <figure className="panel-frame">
                <img
                  src={`/art/${p.art}.webp`}
                  srcSet={`/art/${p.art}-800.webp 800w, /art/${p.art}.webp 1456w`}
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  width={1456}
                  height={1088}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div className="panel-text">
                <p className="panel-n" style={order(0)}>
                  {ROMAN[i]} <span>/ {ROMAN[projects.items.length - 1]}</span>
                </p>
                <h3 style={order(1)}>{p.title}</h3>
                <p className="panel-tag" style={order(2)}>
                  {p.tagline}
                </p>
                <p className="panel-desc" style={order(3)}>
                  {p.description}
                </p>
                <ul className="panel-labels" style={order(4)} aria-label="Focus">
                  {p.labels.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                {p.link && (
                  <div className="panel-cta" style={order(5)}>
                    <Cta tone="light" href={p.link.href} external icon="external">
                      {p.link.label}
                    </Cta>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
