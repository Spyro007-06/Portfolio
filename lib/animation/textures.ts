import * as THREE from "three";

let _glowTexture: THREE.CanvasTexture | null = null;
let _pulseTexture: THREE.CanvasTexture | null = null;
let _starTexture: THREE.CanvasTexture | null = null;

/**
 * Generates a soft circular Gaussian glow texture for Three.js PointsMaterial.
 * Eliminates square point-sprite artifacts and gives particles high-end optical bloom.
 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }
  if (_glowTexture) return _glowTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture() as THREE.CanvasTexture;

  const center = 64;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.15, "rgba(255, 255, 255, 0.95)");
  grad.addColorStop(0.35, "rgba(255, 255, 255, 0.55)");
  grad.addColorStop(0.65, "rgba(255, 255, 255, 0.15)");
  grad.addColorStop(0.88, "rgba(255, 255, 255, 0.03)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  _glowTexture = new THREE.CanvasTexture(canvas);
  _glowTexture.generateMipmaps = false;
  _glowTexture.minFilter = THREE.LinearFilter;
  _glowTexture.magFilter = THREE.LinearFilter;
  _glowTexture.needsUpdate = true;
  return _glowTexture;
}

/**
 * Generates an intense radiant data-pulse texture for high-velocity circuit packets.
 */
export function getPulseTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }
  if (_pulseTexture) return _pulseTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture() as THREE.CanvasTexture;

  const center = 64;
  // Core hotspot
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.12, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.30, "rgba(255, 255, 255, 0.70)");
  grad.addColorStop(0.55, "rgba(255, 255, 255, 0.20)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  _pulseTexture = new THREE.CanvasTexture(canvas);
  _pulseTexture.generateMipmaps = false;
  _pulseTexture.minFilter = THREE.LinearFilter;
  _pulseTexture.magFilter = THREE.LinearFilter;
  _pulseTexture.needsUpdate = true;
  return _pulseTexture;
}

/**
 * Generates a refined star-point texture with subtle 4-point diffraction spike for key constellation anchors.
 */
export function getStarTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }
  if (_starTexture) return _starTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture() as THREE.CanvasTexture;

  const center = 64;
  // Circular soft glow
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
  grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle cross diffraction spikes
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(center - 40, center);
  ctx.lineTo(center + 40, center);
  ctx.moveTo(center, center - 40);
  ctx.lineTo(center, center + 40);
  ctx.stroke();

  _starTexture = new THREE.CanvasTexture(canvas);
  _starTexture.generateMipmaps = false;
  _starTexture.minFilter = THREE.LinearFilter;
  _starTexture.magFilter = THREE.LinearFilter;
  _starTexture.needsUpdate = true;
  return _starTexture;
}
