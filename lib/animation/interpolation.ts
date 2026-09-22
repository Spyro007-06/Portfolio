// Animation utilities — lerp, clamp, mapRange, smoothstep, spring physics

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Frame-rate-independent exponential decay lerp */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Simple spring physics — returns [newPosition, newVelocity] */
export function springUpdate(
  pos: number,
  vel: number,
  target: number,
  stiffness = 120,
  damping = 14,
  dt = 1 / 60
): [number, number] {
  const force = (target - pos) * stiffness - vel * damping;
  const newVel = vel + force * dt;
  const newPos = pos + newVel * dt;
  return [newPos, newVel];
}
