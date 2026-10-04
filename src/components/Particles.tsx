import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

type Kind = 'dust' | 'embers' | 'marble';

// spawn = [x, y, w, h] as fractions of the canvas; speed > 0 rises, < 0 falls
const KINDS: Record<Kind, { count: number; rgb: string; size: [number, number]; speed: [number, number]; spawn: [number, number, number, number] }> = {
  dust: { count: 46, rgb: '255,226,170', size: [0.6, 1.8], speed: [0.06, 0.28], spawn: [0, 0.25, 1, 0.75] },
  embers: { count: 64, rgb: '255,150,62', size: [0.8, 2.3], speed: [0.35, 1.2], spawn: [0.58, 0.58, 0.28, 0.2] },
  marble: { count: 34, rgb: '241,232,215', size: [0.5, 1.4], speed: [-0.16, -0.04], spawn: [0, -0.05, 1, 1] },
};

type Mote = { x: number; y: number; r: number; vy: number; vx: number; age: number; life: number; seed: number };

/** Drifting light motes. Runs only while its scene is on screen. */
export function Particles({ kind }: { kind: Kind }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { count, rgb, size, speed, spawn } = KINDS[kind];
    const [sx, sy, sw, sh] = spawn;

    // one soft sprite, stamped many times — cheaper than shadowBlur
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const s = sprite.getContext('2d')!;
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.25, `rgba(${rgb},.55)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    s.fillStyle = g;
    s.fillRect(0, 0, 32, 32);

    let w = 0;
    let h = 0;
    let raf = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const respawn = (m: Mote, anywhere: boolean): Mote =>
      Object.assign(m, {
        x: (sx + Math.random() * sw) * w,
        y: anywhere ? Math.random() * h : (sy + Math.random() * sh) * h,
        r: rand(...size),
        vy: -rand(...speed),
        vx: rand(-0.12, 0.12),
        age: 0,
        life: rand(260, 600),
        seed: Math.random() * 100,
      });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const motes = Array.from({ length: count }, () => respawn({} as Mote, true));

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.age++;
        m.x += m.vx + Math.sin((m.age + m.seed * 40) * 0.018) * 0.22;
        m.y += m.vy;
        if (m.age > m.life || m.y < -12 || m.y > h + 12) respawn(m, false);
        ctx.globalAlpha = Math.sin((Math.PI * m.age) / m.life) * 0.85;
        const d = m.r * 6;
        ctx.drawImage(sprite, m.x - d / 2, m.y - d / 2, d, d);
      }
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // the canvas may sit in a fixed layer, so watch the scene it belongs to
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas.closest('section') ?? canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [kind]);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
