import { useEffect, useRef, type MouseEvent } from 'react';
import { chapters } from '../content';
import { ScrollTrigger, scrollToId } from '../lib/motion';

/** The thin bronze line on the left: fills with your progress, one node per chapter (each node is a link). */
export function Rail() {
  const fill = useRef<HTMLSpanElement>(null);
  const nodes = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    let marks: number[] = [];
    const place = () => {
      const max = ScrollTrigger.maxScroll(window) || 1;
      marks = chapters.map(({ id }) => Math.min(1, (document.getElementById(id)?.offsetTop ?? 0) / max));
      marks.forEach((m, i) => nodes.current[i]?.style.setProperty('top', `${m * 100}%`));
    };
    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: ({ progress: p }) => {
        fill.current?.style.setProperty('scale', `1 ${p}`);
        marks.forEach((m, i) => nodes.current[i]?.classList.toggle('is-past', p >= m - 0.001));
      },
    });
    place();
    ScrollTrigger.addEventListener('refresh', place);
    return () => {
      progress.kill();
      ScrollTrigger.removeEventListener('refresh', place);
    };
  }, []);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <nav className="rail" aria-label="Chapter progress">
      <span className="rail-track" aria-hidden="true" />
      <span className="rail-fill" ref={fill} aria-hidden="true" />
      {chapters.map(({ id, n, title }, i) => (
        <a key={id} ref={(el) => void (nodes.current[i] = el)} className="rail-node" href={`#${id}`} onClick={go(id)}>
          <span className="rail-tip">
            <b>{n}</b> {title}
          </span>
        </a>
      ))}
      <span className="rail-label" aria-hidden="true">Scroll</span>
    </nav>
  );
}
