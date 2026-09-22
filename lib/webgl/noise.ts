import { createNoise3D } from 'simplex-noise';

const _noise3D = createNoise3D();

/**
 * Raw 3D Simplex noise — returns -1..1
 */
export function noise3D(x: number, y: number, z: number): number {
  return _noise3D(x, y, z);
}

/**
 * Fractional Brownian Motion — layered octaves for richer noise
 */
export function fbm(
  x: number,
  y: number,
  z: number,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  let total = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * _noise3D(x * frequency, y * frequency, z * frequency);
    total += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return value / total;
}

/**
 * Domain-warped noise for organic terrain displacement
 */
export function warpedNoise(x: number, y: number, z: number): number {
  const q0 = fbm(x, y, z, 3);
  const q1 = fbm(x + 5.2, y + 1.3, z, 3);
  return fbm(x + 1.7 * q0, y + 9.2 * q1, z + 0.3, 3);
}
