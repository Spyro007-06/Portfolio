import { useRef } from 'react';
import { about, person } from '../content';
import { ARCH, CINEMATIC, LIGHT, gsap, liveWhileOnScreen, reveal, revealCopy, scrubbed, useGSAP } from '../lib/motion';
import { Icon, type IconName } from '../components/Icon';
import { Lines } from '../components/Lines';
import { Particles } from '../components/Particles';
import { Scenery } from '../components/Scenery';
import './Hall.css';

// on a phone the hall is one tall column, so its arch starts as a narrow window near the top
const ARCH_PHONE = 'inset(14% 26% 46% 26% round 50% 50% 0% 0% / 16% 16% 0% 0%)';

/** Chapter 01 — The Hall of Wisdom. Entered through the arch the hero camera was flying toward. */
export function Hall() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // phones and tablets: the same arch opens out of the dark as the hall rises into view
      mm.add(LIGHT, () => {
        const section = root.current!;
        const copy = section.querySelector('.hall-copy')!;
        scrubbed(section, 'top bottom', 'top 10%')
          .fromTo('.portal', { clipPath: ARCH_PHONE }, { clipPath: ARCH.open, ease: 'power2.inOut' }, 0)
          .fromTo('.art--hall', { scale: 1.32 }, { scale: 1.08 }, 0);
        scrubbed(section).fromTo('.art--hall', { yPercent: -4 }, { yPercent: 4 }, 0);

        revealCopy(copy).from('.ornament path', { strokeDashoffset: 1, duration: 1.4, ease: 'power2.inOut' }, 0.3);
        reveal(section.querySelector('.qualities')!).from('.qualities li', { autoAlpha: 0, y: 26, scale: 0.92, stagger: 0.08 });
        reveal(section.querySelector('.signature')!, 'top 92%').from(['.signature', '.hall-quote'], { autoAlpha: 0, y: 20, stagger: 0.15 });
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        liveWhileOnScreen(section, section.querySelector('.env')!);
        const vw = (n: number) => () => (window.innerWidth * n) / 100;

        // entrance: the arch opens over the hero and the camera passes through it
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.9, invalidateOnRefresh: true },
          })
          .fromTo('.portal', { clipPath: ARCH.closed }, { clipPath: ARCH.open, ease: 'power2.inOut', duration: 1 }, 0)
          .fromTo('.portal-ring', { ...ARCH.ringClosed, autoAlpha: 1 }, { ...ARCH.ringOpen, autoAlpha: 0, ease: 'power2.inOut', duration: 1 }, 0)
          .fromTo('.art--hall', { scale: 1.32 }, { scale: 1.06, duration: 1 }, 0)
          .fromTo('.fg-column--l', { x: vw(-14), scale: 1.25 }, { x: 0, scale: 1, duration: 1 }, 0)
          .fromTo('.fg-column--r', { x: vw(14), scale: 1.25 }, { x: 0, scale: 1, duration: 1 }, 0);

        // the words arrive as the stage rises into place
        gsap
          .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: section, start: 'top 38%', end: 'top top', scrub: 0.9 } })
          .from('.hall-copy .label', { autoAlpha: 0, x: -24, duration: 0.3 }, 0)
          .from('.hall-copy .line-in', { yPercent: 112, duration: 0.5, stagger: 0.12 }, 0.08)
          .from('.ornament path', { strokeDashoffset: 1, duration: 0.6, ease: 'none' }, 0.25)
          .from('.hall-copy .body', { autoAlpha: 0, y: 26, duration: 0.4 }, 0.42)
          .from('.qualities li', { autoAlpha: 0, y: 20, duration: 0.3, stagger: 0.07 }, 0.55)
          .from(['.signature', '.hall-quote'], { autoAlpha: 0, y: 16, duration: 0.3, stagger: 0.1 }, 0.75);

        // pinned: light finds the statue while the foreground columns slide past faster than the hall behind them
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true },
          })
          .fromTo('.art--hall', { scale: 1.06, xPercent: 0 }, { scale: 1, xPercent: -1.5, duration: 1, immediateRender: false }, 0)
          .fromTo('.hall-light', { autoAlpha: 0, xPercent: -30 }, { autoAlpha: 1, xPercent: 10, duration: 1 }, 0)
          .fromTo('.veil--hall', { opacity: 1 }, { opacity: 0.72, duration: 1 }, 0)
          .fromTo('.fg-column--l', { x: 0, y: 0 }, { x: vw(-7), y: () => -window.innerHeight * 0.05, duration: 1, immediateRender: false }, 0)
          .fromTo('.fg-column--r', { x: 0, y: 0 }, { x: vw(7), y: () => -window.innerHeight * 0.05, duration: 1, immediateRender: false }, 0)
          .to('.hall-copy', { autoAlpha: 0, duration: 0.12, ease: 'power1.in' }, 0.88);
      });
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="scene scene--hall" aria-labelledby="about-title">
      <div className="env env--hall" aria-hidden="true">
        <div className="portal">
          <Scenery name="hall" focus={[0.26, 0.5]} className="art--hall">
            <span className="hall-light" />
          </Scenery>
          <div className="veil veil--hall" />
          <img className="fg-column fg-column--l cine-only" src="/art/column.webp" width={382} height={1750} alt="" />
          <img className="fg-column fg-column--r cine-only" src="/art/column.webp" width={382} height={1750} alt="" />
          <Particles kind="marble" />
        </div>
        <span className="portal-ring cine-only" />
      </div>

      <div className="stage hall-stage">
        <div className="hall-copy">
          <p className="label">
            <span className="n">01</span>
            <span className="rule" />
            The Hall of Wisdom
          </p>
          <h2 id="about-title" className="h2">
            <Lines lines={about.heading} />
          </h2>
          <svg className="ornament" viewBox="0 0 320 12" aria-hidden="true">
            <path d="M0 6h140M180 6h140" pathLength={1} strokeDasharray="1" />
            <path d="M160 1l5 5-5 5-5-5z" pathLength={1} strokeDasharray="1" />
          </svg>
          <p className="body">{about.body}</p>
          <ul className="qualities">
            {about.qualities.map(({ icon, label }) => (
              <li key={label}>
                <span className="q-icon">
                  <Icon name={icon as IconName} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="signature">— {person.name}</p>
          <blockquote className="quote hall-quote">“{about.quote}”</blockquote>
        </div>
      </div>
    </section>
  );
}
