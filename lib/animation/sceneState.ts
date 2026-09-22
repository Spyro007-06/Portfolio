/**
 * Global world state singleton — NOT React state.
 * Mutated imperatively each frame. Never triggers re-renders.
 */

export type SceneName =
  | 'HERO'
  | 'IDENTITY'
  | 'WORK'
  | 'PHILOSOPHY'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'ABOUT'
  | 'CONTACT';

export type QualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WorldState {
  scene: SceneName;
  sceneProgress: number;   // 0–1 within current scene
  globalProgress: number;  // 0–1 across entire page
  scrollVelocity: number;  // -1 → +1 normalized
  mouseX: number;          // -1 → +1 (left → right)
  mouseY: number;          // -1 → +1 (top → bottom)
  particleTarget: number;  // index into morph targets array
  quality: QualityLevel;
  particleCount: number;
  reducedMotion: boolean;
  activeSkillIndex: number;
  activeProjectIndex: number;
  lightingProgress: number;
  atmosphereProgress: number;
  accentProgress: number;
  hoverReaction: {
    active: boolean;
    type: 'project' | 'skill' | 'contact' | 'default';
    x: number;
    y: number;
    color: string;
  };
}

export const worldState: WorldState = {
  scene: 'HERO',
  sceneProgress: 0,
  globalProgress: 0,
  scrollVelocity: 0,
  mouseX: 0,
  mouseY: 0,
  particleTarget: 0,
  quality: 'MEDIUM',
  particleCount: 350,
  reducedMotion: false,
  activeSkillIndex: 0,
  activeProjectIndex: 0,
  lightingProgress: 0,
  atmosphereProgress: 0,
  accentProgress: 0,
  hoverReaction: {
    active: false,
    type: 'default',
    x: 0,
    y: 0,
    color: '#4F7CFF',
  },
};

const SCENE_TO_TARGET: Record<SceneName, number> = {
  HERO:        0,
  IDENTITY:    1,
  WORK:        2,
  PHILOSOPHY:  3,
  SKILLS:      4,
  EXPERIENCE:  5,
  ABOUT:       6,
  CONTACT:     7,
};

export function setScene(scene: SceneName): void {
  worldState.scene = scene;
  worldState.particleTarget = SCENE_TO_TARGET[scene];
}

export function detectQuality(): void {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  worldState.reducedMotion = mediaQuery.matches;
  
  try {
    mediaQuery.addEventListener('change', (e) => {
      worldState.reducedMotion = e.matches;
    });
  } catch (err) {
    // Safari legacy fallback
    try {
      mediaQuery.addListener((e) => {
        worldState.reducedMotion = e.matches;
      });
    } catch (e) {}
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio ?? 1;

  if (cores >= 8 && w >= 1440 && dpr <= 2) {
    worldState.quality = 'HIGH';
    worldState.particleCount = 600;
  } else if (cores >= 4 && w >= 768) {
    worldState.quality = 'MEDIUM';
    worldState.particleCount = 350;
  } else {
    worldState.quality = 'LOW';
    worldState.particleCount = 150;
  }

  if (worldState.reducedMotion) {
    worldState.particleCount = Math.min(worldState.particleCount, 100);
  }
}
