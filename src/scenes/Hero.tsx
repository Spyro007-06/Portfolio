import { useRef } from 'react';
import { hero, person } from '../content';
import { CINEMATIC, LIGHT, gsap, liveWhileOnScreen, scrollToId, scrubbed, useGSAP } from '../lib/motion';
import { Cta } from '../components/Cta';
import { Icon } from '../components/Icon';
import { Lines } from '../components/Lines';
import { Particles } from '../components/Particles';
import { Scenery } from '../components/Scenery';
import './Hero.css';

/** Chapter 0 — The Mortal Realm. A wide establishing shot that slowly turns toward a distant temple. */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // opening titles (any screen that allows motion)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
          .from('.art--plate img', { scale: 1.12, duration: 2.8, ease: 'power3.out' }, 0)
          .from('.statue-in', { autoAlpha: 0, y: 70, duration: 2.2 }, 0.3)
          .from('.hero-label', { autoAlpha: 0, y: 16, duration: 1.2 }, 0.55)
          .from('.hero-name .line-in', { yPercent: 112, duration: 1.7 }, 0.65)
          .from(['.hero-role', '.hero-line', '.hero-cta', '.hero-meta'], { autoAlpha: 0, y: 24, duration: 1.3, stagger: 0.12 }, 1.1);
      });

      // phones and tablets: as the page leaves the hero, each layer falls behind at its own pace
      mm.add(LIGHT, () => {
        scrubbed(root.current!, 'top top', 'bottom top')
          .to('.art--plate', { yPercent: 22, scale: 1.1 }, 0)
          .to('.mist--back', { yPercent: -20, xPercent: 8 }, 0)
          .to('.statue', { yPercent: 9, scale: 1.08 }, 0)
          .to('.mist--front', { yPercent: -45 }, 0)
          .to(['.hero-copy', '.hero-meta-wrap'], { y: -90, autoAlpha: 0, ease: 'power1.in' }, 0);
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        liveWhileOnScreen(section, section.querySelector('.env')!);
        const vw = (n: number) => () => (window.innerWidth * n) / 100;
        const vh = (n: number) => () => (window.innerHeight * n) / 100;

        // pinned: every layer drifts at its own speed, then the camera turns toward the temple
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true },
          })
          .to('.art--plate', { scale: 1.12, yPercent: -1.5, duration: 1 }, 0)
          .to('.mist--back', { xPercent: 7, yPercent: -10, duration: 1 }, 0)
          .to('.mist--front', { yPercent: -28, duration: 1 }, 0)
          .to('.statue', { x: vw(2), y: vh(-5), scale: 1.05, duration: 0.5 }, 0)
          .to('.statue', { x: vw(20), y: vh(-1), scale: 1.14, duration: 0.5, ease: 'power2.in' }, 0.5)
          .to('.hero-copy', { y: -120, autoAlpha: 0, duration: 0.32, ease: 'power1.in' }, 0.16)
          .to('.hero-meta-wrap', { autoAlpha: 0, duration: 0.14 }, 0.12)
          .to('.veil--hero', { opacity: 0.5, duration: 0.5 }, 0.5)
          .fromTo('.temple-ring', { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'power2.out' }, 0.58);

        // exit: the camera keeps travelling into the temple while the Hall of Wisdom opens over it
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'bottom bottom', end: 'bottom top', scrub: 0.9, invalidateOnRefresh: true },
          })
          .fromTo('.art--plate', { scale: 1.12, yPercent: -1.5 }, { scale: 1.65, yPercent: -1.5, duration: 1, ease: 'power1.in', immediateRender: false }, 0)
          .fromTo('.statue', { x: vw(20), y: vh(-1), scale: 1.14 }, { x: vw(48), y: vh(4), scale: 1.32, autoAlpha: 0, duration: 0.7, ease: 'power2.in', immediateRender: false }, 0)
          .fromTo('.mist--front', { yPercent: -28 }, { yPercent: -70, autoAlpha: 0, duration: 1, immediateRender: false }, 0)
          .fromTo('.temple-ring', { scale: 1 }, { scale: 3, autoAlpha: 0, duration: 0.55, immediateRender: false }, 0);
      });
    },
    { scope: root },
  );

  return (
    <section id="home" ref={root} className="scene scene--hero" aria-labelledby="hero-title">
      <div className="env env--hero is-live" aria-hidden="true">
        <Scenery name="hero-plate" focus={[0.52, 0.5]} priority className="art--plate">
          <span className="temple-ring" />
        </Scenery>
        <div className="mist mist--back" />
        <div className="statue">
          <img
            className="statue-in"
            src="/art/statue.webp"
            srcSet="/art/statue-640.webp 640w, /art/statue.webp 1061w"
            sizes="(min-width: 1024px) 40vw, 70vw"
            width={1061}
            height={1351}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="mist mist--front" />
        <Particles kind="dust" />
        <div className="veil veil--hero" />
      </div>

      <div className="stage hero-stage">
        <div className="hero-copy">
          <p className="label hero-label">{hero.label}</p>
          <h1 id="hero-title" className="hero-name">
            <Lines lines={[person.name]} />
          </h1>
          <p className="hero-role">{person.role}</p>
          <p className="hero-line">{hero.line}</p>
          <div className="hero-cta">
            <Cta
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('about');
              }}
            >
              {hero.cta}
            </Cta>
          </div>
        </div>
        <div className="hero-meta-wrap">
          <p className="hero-meta">
            <Icon name="pin" /> Based in {person.location}
          </p>
        </div>
      </div>
    </section>
  );
}
