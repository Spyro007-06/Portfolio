import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { about, contact, cvLink, hero, journey, person, projects, skills } from '../content';
import { Icon, type IconName } from '../components/Icon';
import { Scenery } from '../components/Scenery';
import { prefersReducedMotion } from '../lib/motion';
import './Story.css';

// the order an element arrives in when its card comes on screen
const at = (n: number) => ({ className: 'rv', style: { '--d': n } as CSSProperties });

function Label({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p {...at(0)} className="rv label">
      <span className="n">{n}</span>
      <span className="rule" />
      {children}
    </p>
  );
}

const channels: { icon: IconName; label: string; value: string; href?: string; external?: boolean; download?: boolean }[] = [
  { icon: 'mail', label: 'Email', value: person.email, href: `mailto:${person.email}` },
  { icon: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/tharun-b-l', href: person.linkedin, external: true },
  { icon: 'github', label: 'GitHub', value: 'github.com/Spyro007-06', href: person.github, external: true },
  { icon: 'pin', label: 'Location', value: person.location },
  { icon: 'download', label: 'CV', value: cvLink.label, href: cvLink.href, download: cvLink.download },
];

type Card = { chapter: string; art: ReactNode; body: ReactNode; light?: boolean; className?: string };

const cards: Card[] = [
  {
    chapter: 'The Olympian Codex',
    className: 'sc--cover',
    art: (
      <>
        <Scenery name="hero-plate" focus={[0.62, 0.5]} priority />
        <img className="sc-statue" src="/art/statue-640.webp" width={640} height={815} alt="" fetchPriority="high" />
      </>
    ),
    body: (
      <>
        <p {...at(0)} className="rv label">
          {hero.label}
        </p>
        <h1 {...at(1)} className="rv sc-name">
          {person.name}
        </h1>
        <p {...at(2)} className="rv sc-role">
          {person.role}
        </p>
        <p {...at(3)} className="rv sc-line">
          {hero.line}
        </p>
        <p {...at(4)} className="rv sc-hint">
          Swipe to begin <Icon name="arrow" />
        </p>
      </>
    ),
  },
  {
    chapter: 'The Hall of Wisdom',
    art: <Scenery name="hall" focus={[0.26, 0.5]} />,
    body: (
      <>
        <Label n="01">The Hall of Wisdom</Label>
        <h2 {...at(1)} className="rv h2 sc-h">
          {about.heading.join(' ')}
        </h2>
        <p {...at(2)} className="rv body">
          {about.body}
        </p>
      </>
    ),
  },
  {
    chapter: 'The Hall of Wisdom',
    art: <Scenery name="hall" focus={[0.4, 0.3]} />,
    body: (
      <>
        <Label n="01">What guides me</Label>
        <ul className="sc-qualities">
          {about.qualities.map(({ icon, label }, i) => (
            <li key={label} {...at(1 + i)}>
              <span className="q-icon">
                <Icon name={icon as IconName} />
              </span>
              {label}
            </li>
          ))}
        </ul>
        <blockquote {...at(5)} className="rv quote sc-quote">
          “{about.quote}”
        </blockquote>
        <p {...at(6)} className="rv sc-sign">
          — {person.name}
        </p>
      </>
    ),
  },
  {
    chapter: 'The Forge',
    art: <Scenery name="forge" focus={[0.62, 0.5]} />,
    body: (
      <>
        <Label n="02">The Forge</Label>
        <h2 {...at(1)} className="rv h2 sc-h">
          {skills.heading.join(' ')}
        </h2>
        <p {...at(2)} className="rv body">
          {skills.body}
        </p>
        <ul className="sc-tools">
          {skills.tools.map((t, i) => (
            <li key={t.name} {...at(3 + i * 0.5)}>
              <svg viewBox={t.mark.viewBox} aria-hidden="true">
                <path d={t.mark.path} fill={t.mark.fill} />
              </svg>
              {t.name}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  ...projects.items.map(
    (p, i): Card => ({
      chapter: 'The Pantheon of Creations',
      light: true,
      className: 'sc--project',
      art: null,
      body: (
        <>
          <figure {...at(0)} className="rv sc-frame">
            <img
              src={`/art/${p.art}-800.webp`}
              srcSet={`/art/${p.art}-800.webp 800w, /art/${p.art}.webp 1456w`}
              sizes="92vw"
              width={1456}
              height={1088}
              alt={p.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <p {...at(1)} className="rv sc-n">
            03 · {['I', 'II', 'III'][i]} / III
          </p>
          <h2 {...at(2)} className="rv sc-title">
            {p.title}
          </h2>
          <p {...at(3)} className="rv sc-tag">
            {p.tagline}
          </p>
          <p {...at(4)} className="rv sc-desc">
            {p.description}
          </p>
          <ul {...at(5)} className="rv sc-chips" aria-label="Focus">
            {p.labels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {p.link && (
            <a {...at(6)} className="rv btn btn--light btn--small sc-cta" href={p.link.href} target="_blank" rel="noreferrer">
              <span>{p.link.label}</span>
              <Icon name="external" />
            </a>
          )}
        </>
      ),
    }),
  ),
  {
    chapter: 'The Ascent',
    art: <Scenery name="ascent" focus={[0.66, 0.4]} />,
    body: (
      <>
        <Label n="04">The Ascent</Label>
        <h2 {...at(1)} className="rv h2 sc-h">
          {journey.heading.join(' ')}
        </h2>
        <ol className="sc-steps">
          {journey.milestones.map((m, i) => (
            <li key={m.title} {...at(2 + i)}>
              <img src={`/art/${m.art}.webp`} width={560} height={560} alt="" loading="lazy" decoding="async" />
              <div>
                <h3>
                  {m.title} <em>{m.epithet}</em>
                </h3>
                <p>{m.text}</p>
                <small>{m.meta}</small>
              </div>
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    chapter: 'The Gates of Olympus',
    art: <Scenery name="gates" focus={[0.6, 0.5]} />,
    body: (
      <>
        <Label n="05">The Gates of Olympus</Label>
        <h2 {...at(1)} className="rv h2 sc-h">
          {contact.heading.join(' ')}
        </h2>
        <ul className="sc-channels">
          {channels.map(({ icon, label, value, href, external, download }, i) => {
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
              <li key={label} {...at(2 + i * 0.6)}>
                {href ? (
                  <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} download={download || undefined}>
                    {inner}
                  </a>
                ) : (
                  <span>{inner}</span>
                )}
              </li>
            );
          })}
        </ul>
        <p {...at(6)} className="rv sc-closing">
          {contact.closing}
        </p>
        <p {...at(7)} className="rv sc-foot">
          © 2026 {person.name}. Built with code + curiosity.
        </p>
      </>
    ),
  },
];

/** Phones: the portfolio as full-screen story cards — swipe, tap the sides, or use the arrow keys. */
export function Story() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el || i < 0 || i >= cards.length) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft') go(active - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // like a story: tap the left edge to go back, anywhere else to go on (links and buttons keep their own taps)
  const onTap = (e: MouseEvent) => {
    if ((e.target as Element).closest('a, button') || window.getSelection()?.toString()) return;
    go(e.clientX < window.innerWidth * 0.28 ? active - 1 : active + 1);
  };

  return (
    <div className="story" data-tone={cards[active].light ? 'light' : undefined}>
      <header className="story-bar">
        <nav className="segs" aria-label="Story cards">
          {cards.map((c, i) => (
            <button
              key={i}
              className={`seg${i < active ? ' is-past' : i === active ? ' is-on' : ''}`}
              aria-label={`Card ${i + 1}: ${c.chapter}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </nav>
        <div className="story-meta">
          <span className="monogram">
            T<span>B</span>
          </span>
          <span className="story-chapter">{cards[active].chapter}</span>
          <span className="story-count">
            {String(active + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
          </span>
        </div>
      </header>

      <div
        ref={track}
        className="story-track"
        data-lenis-prevent
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onClick={onTap}
      >
        {cards.map((c, i) => (
          <section
            key={i}
            className={`sc ${c.className ?? ''}${i === active ? ' is-on' : ''}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${cards.length}: ${c.chapter}`}
          >
            {c.art && <div className="sc-art">{c.art}</div>}
            {c.art && <div className="sc-veil" />}
            <div className="sc-body">{c.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
