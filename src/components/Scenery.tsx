import type { CSSProperties, ReactNode } from 'react';

const SIZES = {
  'hero-plate': [1776, 896],
  hall: [1680, 944],
  forge: [1680, 944],
  pantheon: [1776, 896],
  ascent: [1776, 896],
  gates: [1680, 944],
} as const;

type Props = {
  name: keyof typeof SIZES;
  /** Point of the painting (0..1) kept on screen when the viewport crops it. */
  focus?: [number, number];
  priority?: boolean;
  className?: string;
  /** Overlays positioned in the painting's own coordinates (percentages of the image). */
  children?: ReactNode;
};

/**
 * A painting that covers the viewport. In cinematic mode the box keeps the image's exact aspect ratio,
 * so overlays (firelight, sunbeams) stay pinned to the right spot of the artwork at any screen size.
 */
export function Scenery({ name, focus = [0.5, 0.5], priority, className = '', children }: Props) {
  const [w, h] = SIZES[name];
  const style = { '--ar': w / h, '--fx': focus[0], '--fy': focus[1] } as CSSProperties;
  return (
    <div className={`art ${className}`} style={style}>
      <img
        src={`/art/${name}.webp`}
        srcSet={`/art/${name}-960.webp 960w, /art/${name}.webp ${w}w`}
        sizes="100vw"
        width={w}
        height={h}
        alt=""
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      {children}
    </div>
  );
}
