/**
 * Maps raw scroll progress (0..1) to film progress (0..1).
 * Section 16: The first 15% of scroll (0..15%) has slightly higher world movement per scroll input,
 * reaching p=0.19 (the opening Gate) smoothly with C1 continuity before settling into normal cinematic pacing.
 */
export function responsiveScrollProgress(s: number): number {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  const sPivot = 0.15;
  const pPivot = 0.19;
  if (s < sPivot) {
    const t = s / sPivot;
    const m0 = 1.22;
    const m1 = (1 - pPivot) / (1 - sPivot);
    const t2 = t * t, t3 = t2 * t;
    const h01 = -2 * t3 + 3 * t2;
    const h10 = t3 - 2 * t2 + t;
    const h11 = t3 - t2;
    return h01 * pPivot + h10 * (sPivot * m0) + h11 * (sPivot * m1);
  }
  return pPivot + ((s - sPivot) / (1 - sPivot)) * (1 - pPivot);
}

/** Inverse mapping for exact chapter navigation in Hud */
export function scrollFromFilmProgress(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const sPivot = 0.15;
  const pPivot = 0.19;
  if (p >= pPivot) {
    return sPivot + ((p - pPivot) / (1 - pPivot)) * (1 - sPivot);
  }
  let lo = 0, hi = sPivot;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) * 0.5;
    if (responsiveScrollProgress(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) * 0.5;
}
