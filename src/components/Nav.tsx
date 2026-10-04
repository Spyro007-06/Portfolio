import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { chapters, cvLink } from '../content';
import { CINEMATIC, ScrollTrigger, scrollToId } from '../lib/motion';
import { Icon } from './Icon';

const links = chapters.filter((c) => c.id !== 'home');

export function Nav() {
  const [active, setActive] = useState<string>('home');
  const [solid, setSolid] = useState(false);
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // which chapter is under the middle of the screen; only fires at chapter boundaries, so no re-render per frame
  useEffect(() => {
    const triggers = chapters.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => self.isActive && setActive(id),
      }),
    );
    triggers.push(ScrollTrigger.create({ start: 40, end: 'max', onToggle: (self) => setSolid(self.isActive) }));
    // the bar turns parchment while the ivory chapter is underneath it: on desktop the wipe and cross-fade are
    // half-way at mid-screen, while on phones the ivory has to actually reach the bar
    const edge = (side: string) => () => `${side} ${matchMedia(CINEMATIC).matches ? 'center' : '64px'}`;
    triggers.push(ScrollTrigger.create({ trigger: '#projects', start: edge('top'), end: edge('bottom'), onToggle: (self) => setLight(self.isActive) }));
    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      menuBtn.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    if (open) {
      setOpen(false);
      menuBtn.current?.focus();
    }
    scrollToId(id);
  };

  return (
    <>
      <header className="nav" data-solid={solid || undefined} data-tone={light && !open ? 'light' : undefined}>
        <a className="monogram" href="#home" onClick={go('home')} aria-label="Tharun B.L — back to the beginning">
          T<span>B</span>
        </a>

        <nav aria-label="Chapters" className="nav-links">
          {links.map(({ id, nav }) => (
            <a key={id} href={`#${id}`} onClick={go(id)} className="nav-link" aria-current={active === id ? 'true' : undefined}>
              {nav}
              {active === id && <motion.span layoutId="nav-underline" className="nav-underline" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
            </a>
          ))}
        </nav>

        <a className="btn btn--dark btn--small nav-cv" href={cvLink.href} download={cvLink.download || undefined}>
          <Icon name="download" />
          <span>{cvLink.label}</span>
        </a>

        <button ref={menuBtn} className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-lines" data-open={open || undefined} aria-hidden="true" />
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav aria-label="Chapters">
              <ol>
                {links.map(({ id, n, title }, i) => (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a ref={i === 0 ? firstLink : undefined} href={`#${id}`} onClick={go(id)}>
                      <span className="menu-n">{n}</span>
                      {title}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <a className="btn btn--dark" href={cvLink.href} download={cvLink.download || undefined}>
              <Icon name="download" />
              <span>{cvLink.label}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
