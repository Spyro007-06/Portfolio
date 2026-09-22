import { noise3D, fbm } from './noise';

// ─── Helpers ───────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clusterOf(
  cx: number, cy: number, cz: number,
  spread: number, count: number,
  out: Float32Array, offset: number
): number {
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = spread * Math.cbrt(Math.random()); // uniform in sphere
    out[(offset + i) * 3]     = cx + r * Math.sin(phi) * Math.cos(theta);
    out[(offset + i) * 3 + 1] = cy + r * Math.sin(phi) * Math.sin(theta);
    out[(offset + i) * 3 + 2] = cz + r * Math.cos(phi);
  }
  return offset + count;
}

// ─── Morph Target Generators ───────────────────────────────────────────────

/** HERO — chaotic computational topology with clusters */
export function generateHeroNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  // Several organic clusters scattered in 3D space
  const clusters = [
    [0.5, 0.2, -0.5, 0.9],
    [-0.8, 0.4, 0.3, 0.7],
    [1.2, -0.6, 0.8, 0.6],
    [-0.3, -0.8, -0.4, 0.8],
    [0.0, 0.7, 1.0, 0.5],
    [-1.0, 0.0, -0.8, 0.6],
  ];

  let offset = 0;
  const perCluster = Math.floor(count * 0.75) / clusters.length;
  for (const [cx, cy, cz, sp] of clusters) {
    const n = Math.min(Math.floor(perCluster), count - offset);
    offset = clusterOf(cx, cy, cz, sp, n, arr, offset);
  }

  // Fill remainder with scattered particles
  while (offset < count) {
    arr[offset * 3]     = rand(-2.5, 2.5);
    arr[offset * 3 + 1] = rand(-1.8, 1.8);
    arr[offset * 3 + 2] = rand(-2.0, 2.0);
    offset++;
  }

  return arr;
}

/** IDENTITY — structured radial / hub-spoke arrangement */
export function generateIdentityNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  // Central hub cluster
  const hubCount = Math.floor(count * 0.15);
  let offset = clusterOf(0, 0, 0, 0.25, hubCount, arr, 0);

  // 4 labeled spoke clusters
  const spokes = [
    [0, 1.4, 0],   // top
    [0, -1.4, 0],  // bottom
    [-1.4, 0, 0],  // left
    [1.4, 0, 0],   // right
  ];

  const perSpoke = Math.floor(count * 0.15);
  for (const [sx, sy, sz] of spokes) {
    const n = Math.min(perSpoke, count - offset);
    offset = clusterOf(sx, sy, sz, 0.35, n, arr, offset);
  }

  // Scattered remainder
  while (offset < count) {
    const r     = rand(0.6, 2.2);
    const theta = rand(0, Math.PI * 2);
    const phi   = rand(-0.6, 0.6);
    arr[offset * 3]     = r * Math.cos(theta) * Math.cos(phi);
    arr[offset * 3 + 1] = r * Math.sin(phi);
    arr[offset * 3 + 2] = r * Math.sin(theta) * Math.cos(phi) * 0.4;
    offset++;
  }

  return arr;
}

/** WORK — project card cluster arrangement */
export function generateWorkNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  // 4 project clusters in a 2×2 grid arrangement
  const positions = [
    [-0.8,  0.6, 0],
    [ 0.8,  0.6, 0],
    [-0.8, -0.6, 0],
    [ 0.8, -0.6, 0],
  ];

  const perGroup = Math.floor(count * 0.22);
  let offset = 0;
  for (const [px, py, pz] of positions) {
    const n = Math.min(perGroup, count - offset);
    offset = clusterOf(px, py, pz, 0.45, n, arr, offset);
  }

  while (offset < count) {
    arr[offset * 3]     = rand(-2, 2);
    arr[offset * 3 + 1] = rand(-1.5, 1.5);
    arr[offset * 3 + 2] = rand(-0.5, 0.5);
    offset++;
  }

  return arr;
}

/** PHILOSOPHY — flowing wave surface */
export function generatePhilosophyNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = (i / count) * 6 - 3;
    const v = ((i * 1.618) % 1) * 4 - 2;
    const w = fbm(u * 0.4, v * 0.4, 0.5, 3) * 0.8;

    arr[i * 3]     = u * 0.8 + rand(-0.08, 0.08);
    arr[i * 3 + 1] = w * 1.2 + rand(-0.04, 0.04);
    arr[i * 3 + 2] = v * 0.35 + rand(-0.08, 0.08);
  }

  return arr;
}

/** SKILLS — orbital constellation rings */
export function generateSkillsNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  // Center node
  const centerCount = Math.floor(count * 0.08);
  let offset = clusterOf(0, 0, 0, 0.15, centerCount, arr, 0);

  // 3 orbital rings at different radii
  const rings = [
    { r: 0.8, tilt: 0.15, count: 0.25 },
    { r: 1.4, tilt: -0.2, count: 0.30 },
    { r: 2.0, tilt: 0.08, count: 0.25 },
  ];

  for (const ring of rings) {
    const n = Math.floor(count * ring.count);
    for (let i = 0; i < n && offset < count; i++) {
      const angle = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
      const tilt  = ring.tilt;
      arr[offset * 3]     = ring.r * Math.cos(angle) + rand(-0.06, 0.06);
      arr[offset * 3 + 1] = ring.r * Math.sin(angle) * Math.cos(tilt) + rand(-0.06, 0.06);
      arr[offset * 3 + 2] = ring.r * Math.sin(angle) * Math.sin(tilt) * 0.5 + rand(-0.06, 0.06);
      offset++;
    }
  }

  while (offset < count) {
    arr[offset * 3]     = rand(-2.5, 2.5);
    arr[offset * 3 + 1] = rand(-2.0, 2.0);
    arr[offset * 3 + 2] = rand(-0.5, 0.5);
    offset++;
  }

  return arr;
}

/** EXPERIENCE — timeline arc from past to present */
export function generateExperienceNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t    = i / count;
    const x    = (t - 0.5) * 4.0;
    const y    = -0.5 + Math.sin(t * Math.PI) * 0.6;
    const z    = -t * 1.5;
    const jitter = 0.12;

    arr[i * 3]     = x + rand(-jitter, jitter);
    arr[i * 3 + 1] = y + rand(-jitter * 0.5, jitter * 0.5);
    arr[i * 3 + 2] = z + rand(-jitter, jitter);
  }

  return arr;
}

/** ABOUT — 3D computational human head & profile silhouette point-cloud */
export function generateAboutNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  let offset = 0;

  // 1. Profile contour (distinct nose, lips, chin, brow, forehead, jaw) - 25% of particles
  const profileCount = Math.floor(count * 0.25);
  for (let i = 0; i < profileCount && offset < count; i++) {
    const t = i / profileCount; // 0 = top of forehead, 1 = base of neck
    let y = 0.9 - t * 1.8;
    let z = 0;
    let x = 0;

    if (t < 0.2) {
      // Forehead
      z = 0.5 + Math.sin(t / 0.2 * Math.PI * 0.5) * 0.15;
    } else if (t < 0.28) {
      // Brow ridge
      z = 0.65;
    } else if (t < 0.35) {
      // Eye socket indent
      z = 0.56;
    } else if (t < 0.52) {
      // Nose bridge and tip
      const nt = (t - 0.35) / 0.17;
      z = 0.56 + nt * 0.28;
    } else if (t < 0.58) {
      // Under nose / philtrum
      z = 0.62;
    } else if (t < 0.68) {
      // Upper & lower lips
      const lt = (t - 0.58) / 0.10;
      z = 0.66 + Math.sin(lt * Math.PI * 2) * 0.05;
    } else if (t < 0.78) {
      // Chin
      z = 0.67;
    } else if (t < 0.9) {
      // Under chin & throat
      z = 0.35;
    } else {
      // Front of neck
      z = 0.25;
    }

    // Add slight width so it's a 3D volume, not a flat line
    x = rand(-0.15, 0.15);
    arr[offset * 3]     = x - 0.8; // positioned towards left side of viewport
    arr[offset * 3 + 1] = y;
    arr[offset * 3 + 2] = z + rand(-0.04, 0.04);
    offset++;
  }

  // 2. Cranium / head volume (ellipsoid) - 35% of particles
  const craniumCount = Math.floor(count * 0.35);
  for (let i = 0; i < craniumCount && offset < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * 0.58;

    const x = r * Math.sin(phi) * Math.cos(theta) * 0.8;
    const y = 0.35 + r * Math.cos(phi) * 1.1;
    const z = -0.05 + r * Math.sin(phi) * Math.sin(theta) * 0.95;

    arr[offset * 3]     = x - 0.8;
    arr[offset * 3 + 1] = y;
    arr[offset * 3 + 2] = z;
    offset++;
  }

  // 3. Neck & shoulders - 20% of particles
  const bodyCount = Math.floor(count * 0.2);
  for (let i = 0; i < bodyCount && offset < count; i++) {
    const t = Math.random();
    // Shoulders fan out
    const x = (Math.random() - 0.5) * (0.6 + t * 1.6);
    const y = -0.5 - t * 0.7;
    const z = (Math.random() - 0.5) * 0.5;

    arr[offset * 3]     = x - 0.8;
    arr[offset * 3 + 1] = y;
    arr[offset * 3 + 2] = z;
    offset++;
  }

  // 4. Detached computational halo nodes - remaining particles
  while (offset < count) {
    const angle = rand(0, Math.PI * 2);
    const rad = rand(0.9, 2.2);
    arr[offset * 3]     = Math.cos(angle) * rad - 0.8;
    arr[offset * 3 + 1] = rand(-1.2, 1.2);
    arr[offset * 3 + 2] = Math.sin(angle) * rad * 0.5;
    offset++;
  }

  return arr;
}

/** CONTACT — convergence toward a singularity point */
export function generateContactNetwork(count: number): Float32Array {
  const arr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Spiral inward
    const t      = i / count;
    const angle  = t * Math.PI * 12;
    const radius = (1 - t) * 2.2 + 0.05;
    const height = (t - 0.5) * 0.8;

    arr[i * 3]     = radius * Math.cos(angle) + rand(-0.04, 0.04);
    arr[i * 3 + 1] = height + rand(-0.04, 0.04);
    arr[i * 3 + 2] = radius * Math.sin(angle) * 0.5 + rand(-0.04, 0.04);
  }

  return arr;
}

/** All targets indexed by worldState.particleTarget */
export const MORPH_TARGETS = [
  generateHeroNetwork,
  generateIdentityNetwork,
  generateWorkNetwork,
  generatePhilosophyNetwork,
  generateSkillsNetwork,
  generateExperienceNetwork,
  generateAboutNetwork,
  generateContactNetwork,
] as const;
