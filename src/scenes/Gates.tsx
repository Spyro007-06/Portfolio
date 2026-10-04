import { useRef } from 'react';
import { contact, cvLink, person } from '../content';
import { CINEMATIC, LIGHT, gsap, liveWhileOnScreen, reveal, scrubbed, useGSAP } from '../lib/motion';
import { Icon, type IconName } from '../components/Icon';
import { Lines } from '../components/Lines';
import { Particles } from '../components/Particles';
import { Scenery } from '../components/Scenery';
import './Gates.css';

const channels: { icon: IconName; label: string; value: string; href?: string; external?: boolean; download?: boolean }[] = [
  { icon: 'mail', label: 'Email', value: person.email, href: `mailto:${person.email}` },
  { icon: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/tharun-b-l', href: person.linkedin, external: true },
  { icon: 'github', label: 'GitHub', value: 'github.com/Spyro007-06', href: person.github, external: true },
  { icon: 'pin', label: 'Location', value: person.location },
  { icon: 'download', label: 'CV', value: cvLink.label, href: cvLink.href, download: cvLink.download },
];

/** Chapter 05 — The Gates of Olympus. The camera drifts toward the gateway as the light grows, then settles. */
export function Gates() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // phones and tablets: the gateway emerges from the dark, then the camera keeps walking toward it
      mm.add(LIGHT, () => {
        const section = root.current!;
        scrubbed(section, 'top bottom', 'bottom bottom')
          .fromTo('.art--gates', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0)
          .fromTo('.art--gates', { scale: 1.36 }, { scale: 1.02, duration: 0.45, ease: 'power2.out' }, 0)
          .to('.art--gates', { scale: 1.14, duration: 0.55 }, 0.45);

        reveal(section.querySelector('.gates-copy')!)
          .from('.gates-copy .label', { autoAlpha: 0, x: -24 }, 0)
          // the heading opens like a pair of doors
          .from('.gates-copy .line', { clipPath: 'inset(0% 50% 0% 50%)', duration: 1.3, stagger: 0.12, ease: 'expo.inOut' }, 0.05)
          .from('.gates-copy .body', { autoAlpha: 0, y: 24 }, 0.6);
        reveal(section.querySelector('.channels')!).from('.channel', { autoAlpha: 0, x: 36, stagger: 0.08 });
        reveal(section.querySelector('.closing')!, 'top 95%').from('.closing', { autoAlpha: 0, y: 24, duration: 1.4 });
      });

      mm.add(CINEMATIC, () => {
        const section = root.current!;
        const env = section.querySelector('.env')!;
        liveWhileOnScreen(section, env);

        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.9 } })
          .fromTo(env, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
          .fromTo('.art--gates', { scale: 1.12 }, { scale: 1.02, duration: 1 }, 0)
          .from('.gates-copy .label', { autoAlpha: 0, x: -24, duration: 0.2 }, 0.5)
          // the heading opens like a pair of doors
          .from('.gates-copy .line', { clipPath: 'inset(0% 50% 0% 50%)', duration: 0.3, stagger: 0.08, ease: 'power2.out' }, 0.56)
          .from('.gates-copy .body', { autoAlpha: 0, y: 20, duration: 0.2 }, 0.78)
          .from('.channel', { autoAlpha: 0, x: 26, duration: 0.15, stagger: 0.04, ease: 'power2.out' }, 0.8);

        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1.2 } })
          .fromTo('.art--gates', { scale: 1.02 }, { scale: 1.1, duration: 1, ease: 'power2.out', immediateRender: false }, 0)
          .fromTo('.gate-light', { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.8 }, 0)
          .from('.closing', { autoAlpha: 0, y: 18, duration: 0.25, ease: 'power2.out' }, 0.5);
      });
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className="scene scene--gates" aria-labelledby="contact-title">
      <div className="env env--gates" aria-hidden="true">
        <Scenery name="gates" focus={[0.6, 0.5]} className="art--gates">
          <span className="gate-light" />
        </Scenery>
        <Particles kind="dust" />
        <div className="veil veil--gates" />
      </div>

      <div className="stage gates-stage">
        <div className="gates-copy">
          <p className="label">
            <span className="n">05</span>
            <span className="rule" />
            The Gates of Olympus
          </p>
          <h2 id="contact-title" className="h2">
            <Lines lines={contact.heading} />
          </h2>
          <p className="body">{contact.body}</p>
        </div>

        <ul className="channels">
          {channels.map(({ icon, label, value, href, external, download }) => {
            const inner = (
              <>
                <span className="channel-icon">
                  <Icon name={icon} />
                </span>
                <span>
                  <small>{label}</small>
                  {value}
                </span>
              </>
            );
            return (
              <li className="channel" key={label}>
                {href ? (
                  <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} download={download || undefined}>
                    {inner}
                  </a>
                ) : (
                  <span className="channel-static">{inner}</span>
                )}
              </li>
            );
          })}
        </ul>

        <p className="closing">{contact.closing}</p>
      </div>
    </section>
  );
}
