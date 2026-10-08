import { useRef, type CSSProperties } from 'react';
import { journey } from '../content';
import { CINEMATIC, LIGHT, PORTRAIT, gsap, liveWhileOnScreen, reveal, revealCopy, scrubbed, useGSAP } from '../lib/motion';
import { Lines } from '../components/Lines';
import { Scenery } from '../components/Scenery';
import './Ascent.css';

// where each milestone sits on the climb (percent of the stage) and where the bronze path reaches it
const STOPS = [
  { x: 17, y: 62, at: 0.1 },
  { x: 50, y: 49, at: 0.4 },
  { x: 82, y: 31, at: 0.7 },
];
const PATH = 'M3 80 C 8 73, 12 65, 17 62 S 38 51, 50 49 S 70 40, 82 31 S 93 21, 98 17';
// phones: the same three stops zig-zag up a track ~2.2 screens tall (percent of that track)
const STOPS_TALL = [
  { x: 37, y: 79 },
  { x: 62, y: 50 },
  { x: 38, y: 22 },
];
const PATH_TALL = 'M20 100 C 26 93, 33 85, 37 79 S 58 58, 62 50 S 44 30, 38 22 S 44 6, 56 0';

/** Chapter 04 — The Ascent. The camera pulls back, the path draws itself and dawn warms the mountain. */
export function Ascent() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // phones and tablets: the camera pulls back out of the dark, the path draws itself and each medal lights in turn
      mm.add(LIGHT, () => {
        const section = root.current!;
        const list = section.querySelector('.milestones')!;
        scrubbed(section, 'top bottom', 'top 15%').fromTo('.art--ascent', { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1.08 }, 0);
        scrubbed(section).fromTo('.art--ascent', { yPercent: -4 }, { yPercent: 4 }, 0);
        revealCopy(section.querySelector('.ascent-copy')!);
        scrubbed(list, 'top 75%', 'bottom 55%').fromTo(list, { '--trail': 0 }, { '--trail': 1 }, 0);

        const stops = gsap.utils.toArray<HTMLElement>('.milestone', section);
        stops.forEach((stop) => {
          const q = gsap.utils.selector(stop);
          reveal(stop)
            .from(q('.medal'), { scale: 0.4, rotate: -24, autoAlpha: 0, duration: 1.2, ease: 'back.out(1.6)' }, 0)
            .from(q('.milestone-text > *'), { autoAlpha: 0, x: 24, stagger: 0.1 }, 0.15);
          // lit while it is the stop nearest the middle of the screen
          gsap.timeline({ scrollTrigger: { trigger: stop, start: 'top 62%', end: 'bottom 38%', toggleClass: 'is-active' } });
        });
        return () => stops.forEach((s) => s.classList.remove('is-active'));
      });

      // phones, on top of the film below: the camera climbs the tall track, so each milestone passes through the frame in turn
      mm.add(PORTRAIT, () => {
        const section = root.current!;
        const climb = section.querySelector<HTMLElement>('.climb')!;
        // how far to lower the track so stop i's medal sits just above the middle of the screen, text beneath it
        const framing = (i: number) => () => climb.offsetHeight * (1 - STOPS_TALL[i].y / 100) - window.innerHeight * 0.66;
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true },
          })
          // the track hangs from the foot of the frame (the first stop in view); lowering it brings the higher stops down into frame
          // the heading steps aside just as the first milestone arrives (0.1)
          .to('.ascent-copy', { autoAlpha: 0, y: -40, duration: 0.08, ease: 'power1.in' }, 0.04)
          // then the camera rests on each milestone and climbs to the next, while the film above lights them in turn (0.4, 0.7)
          .fromTo(climb, { y: 0 }, { y: framing(0), duration: 0.08, ease: 'power2.inOut' }, 0.04)
          .to(climb, { y: framing(1), duration: 0.14, ease: 'power2.inOut' }, 0.31)
          .to(climb, { y: framing(2), duration: 0.14, ease: 'power2.inOut' }, 0.6)
          .set({}, {}, 1); // run the full length so these positions line up with the film's 0.4 / 0.7 cues
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        const env = section.querySelector('.env')!;
        liveWhileOnScreen(section, env);
        const stops = gsap.utils.toArray<HTMLElement>('.milestone', section);

        // entrance: cross-fade from the gallery while the camera begins to pull back
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.9 } })
          .fromTo(env, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
          .fromTo('.art--ascent', { scale: 1.34 }, { scale: 1.14, duration: 1 }, 0)
          .from('.ascent-copy .label', { autoAlpha: 0, x: -24, duration: 0.25 }, 0.55)
          .from('.ascent-copy .line-in', { yPercent: 112, duration: 0.3, stagger: 0.08, ease: 'power2.out' }, 0.6)
          .from('.ascent-copy .body', { autoAlpha: 0, y: 20, duration: 0.25 }, 0.78);

        // pinned: pull back, light the dawn, draw the path and bring each milestone into focus in turn
        let current = -1;
        const tl = gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.9,
              onUpdate: ({ progress }) => {
                const next = progress < STOPS[1].at ? 0 : progress < STOPS[2].at ? 1 : 2;
                if (next === current) return;
                current = next;
                stops.forEach((s, i) => s.classList.toggle('is-active', i === next));
              },
            },
          })
          .fromTo('.art--ascent', { scale: 1.14 }, { scale: 1, duration: 1, ease: 'power1.out', immediateRender: false }, 0)
          .fromTo('.dawn', { autoAlpha: 0.12 }, { autoAlpha: 1, duration: 1 }, 0)
          .fromTo('.veil--ascent', { opacity: 1 }, { opacity: 0.62, duration: 1 }, 0)
          .fromTo('.trail-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9 }, 0.04);
        stops.forEach((s, i) => tl.from(s, { autoAlpha: 0, y: 26, duration: 0.1, ease: 'power2.out' }, STOPS[i].at));
        tl.to(['.ascent-copy', '.milestones', '.trail'], { autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0.92);
        return () => stops.forEach((s) => s.classList.remove('is-active'));
      });
    },
    { scope: root },
  );

  return (
    <section id="journey" ref={root} className="scene scene--ascent" aria-labelledby="journey-title">
      <div className="env env--ascent" aria-hidden="true">
        <Scenery name="ascent" focus={[0.62, 0.45]} className="art--ascent">
          <span className="dawn" />
        </Scenery>
        <div className="veil veil--ascent" />
      </div>

      <div className="stage ascent-stage">
        <div className="ascent-copy">
          <p className="label">
            <span className="n">04</span>
            <span className="rule" />
            The Ascent
          </p>
          <h2 id="journey-title" className="h2">
            <Lines lines={journey.heading} />
          </h2>
          <p className="body">{journey.body}</p>
        </div>

        {/* the climb: on desktop it simply lays out over the stage; on phones it is a tall track the camera climbs */}
        <div className="climb">
        <svg className="trail trail--wide cine-only" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="trail-base" d={PATH} vectorEffect="non-scaling-stroke" />
          <path className="trail-line" d={PATH} pathLength={1} strokeDasharray="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="trail trail--tall" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="trail-base" d={PATH_TALL} vectorEffect="non-scaling-stroke" />
          <path className="trail-line" d={PATH_TALL} pathLength={1} strokeDasharray="1" vectorEffect="non-scaling-stroke" />
        </svg>

        <ol className="milestones">
          {journey.milestones.map((m, i) => (
            <li
              className="milestone"
              key={m.title}
              style={{ '--x': `${STOPS[i].x}%`, '--y': `${STOPS[i].y}%`, '--px': `${STOPS_TALL[i].x}%`, '--py': `${STOPS_TALL[i].y}%` } as CSSProperties}
            >
              <div className="milestone-in">
                <span className="medal">
                  <img src={`/art/${m.art}.webp`} width={560} height={560} alt="" loading="lazy" decoding="async" />
                </span>
                <div className="milestone-text">
                  <h3>
                    {m.title} <em>{m.epithet}</em>
                  </h3>
                  <p>{m.text}</p>
                  <p className="milestone-meta">{m.meta}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}
