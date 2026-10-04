import { useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { skills } from '../content';
import { CINEMATIC, LIGHT, gsap, liveWhileOnScreen, reveal, revealCopy, scrubbed, useGSAP } from '../lib/motion';
import { Lines } from '../components/Lines';
import { Particles } from '../components/Particles';
import { Scenery } from '../components/Scenery';
import './Forge.css';

type Tool = (typeof skills.tools)[number];

/** A tool card that leans toward the cursor; the edge catches forge light where the pointer is. */
function ToolCard({ tool }: { tool: Tool }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x - 0.5);
    py.set(y - 0.5);
    e.currentTarget.style.setProperty('--gx', `${x * 100}%`);
    e.currentTarget.style.setProperty('--gy', `${y * 100}%`);
  };

  return (
    <motion.div
      className="tool-card"
      style={{ rotateX, rotateY }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <svg className="tool-mark" viewBox={tool.mark.viewBox} aria-hidden="true">
        <path d={tool.mark.path} fill={tool.mark.fill} />
      </svg>
      <h3>{tool.name}</h3>
      <p>{tool.role}</p>
    </motion.div>
  );
}

/** Chapter 02 — The Forge. The world darkens, then the furnace lights it from within. */
export function Forge() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // phones and tablets: the forge glows up out of the dark, then the tools are raised row by row
      mm.add(LIGHT, () => {
        const section = root.current!;
        const tools = section.querySelector('.tools')!;
        scrubbed(section, 'top bottom', 'top 20%').fromTo('.art--forge', { autoAlpha: 0, scale: 1.24 }, { autoAlpha: 1, scale: 1.08 }, 0);
        scrubbed(section).fromTo('.art--forge', { yPercent: -4 }, { yPercent: 4 }, 0);
        revealCopy(section.querySelector('.forge-copy')!);

        const columns = getComputedStyle(tools).gridTemplateColumns.split(' ').length;
        gsap.utils.toArray<HTMLElement>('.tool', section).forEach((tool, i) =>
          reveal(tool, 'top 92%').from(tool, { autoAlpha: 0, y: 60, rotateX: -40, transformOrigin: '50% 100%', duration: 1.2, delay: (i % columns) * 0.09 }),
        );
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        const env = section.querySelector('.env')!;
        liveWhileOnScreen(section, env);

        // entrance: dissolve through darkness
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.9 } })
          .fromTo(env, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55 }, 0)
          .fromTo('.art--forge', { scale: 1.16 }, { scale: 1.07, duration: 1 }, 0);

        gsap
          .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: section, start: 'top 38%', end: 'top top', scrub: 0.9 } })
          .from('.forge-copy .label', { autoAlpha: 0, x: -24, duration: 0.3 }, 0)
          .from('.forge-copy .line-in', { yPercent: 112, duration: 0.5, stagger: 0.12 }, 0.08)
          .from('.forge-copy .body', { autoAlpha: 0, y: 24, duration: 0.4 }, 0.4);

        // pinned: the veil lifts, the furnace kindles, the tools are brought out in two ranks
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.9 } })
          .fromTo('.veil--forge', { opacity: 1 }, { opacity: 0.1, duration: 0.45 }, 0)
          .fromTo(['.fire', '.molten'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.in' }, 0.08)
          .fromTo('.art--forge', { scale: 1.07 }, { scale: 1, duration: 1, immediateRender: false }, 0)
          .from('.tool', { autoAlpha: 0, y: 70, rotateX: 24, duration: 0.3, ease: 'power2.out', stagger: { each: 0.045, grid: [2, 4], from: 'start' } }, 0.14)
          .to(['.forge-copy', '.tools'], { autoAlpha: 0, duration: 0.1, ease: 'power1.in' }, 0.9);
      });
    },
    { scope: root },
  );

  return (
    <section id="skills" ref={root} className="scene scene--forge" aria-labelledby="skills-title">
      <div className="env env--forge" aria-hidden="true">
        <Scenery name="forge" focus={[0.62, 0.5]} className="art--forge">
          <span className="fire" />
          <span className="molten" />
        </Scenery>
        <div className="veil forge-shade" />
        <div className="veil veil--forge cine-only" />
        {/* embers rise through the darkness before the forge itself is revealed */}
        <Particles kind="embers" />
      </div>

      <div className="stage forge-stage">
        <div className="forge-copy">
          <p className="label">
            <span className="n">02</span>
            <span className="rule" />
            The Forge
          </p>
          <h2 id="skills-title" className="h2">
            <Lines lines={skills.heading} />
          </h2>
          <p className="body">{skills.body}</p>
        </div>
        <ul className="tools">
          {skills.tools.map((tool) => (
            <li className="tool" key={tool.name}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
