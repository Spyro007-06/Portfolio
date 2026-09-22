"use client";
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setScene, worldState, detectQuality, type SceneName } from '@/lib/animation/sceneState'
import { useMouseForce } from '@/hooks/useMouseForce'
import { useScrollVelocity } from '@/hooks/useScrollVelocity'

gsap.registerPlugin(ScrollTrigger)


export default function SceneOrchestrator() {
  useMouseForce()
  useScrollVelocity()

  useEffect(() => {
    detectQuality();
    if (typeof window !== 'undefined') {
      (window as any).__WORLD_STATE__ = worldState;
    }

    const scenes: { id: string, name: SceneName }[] = [
      { id: 'hero', name: 'HERO' },
      { id: 'about', name: 'ABOUT' },
      { id: 'skills', name: 'SKILLS' },
      { id: 'work', name: 'WORK' },
      { id: 'experience', name: 'EXPERIENCE' },
      { id: 'contact', name: 'CONTACT' }
    ]

    const triggers = scenes.map(({ id, name }) => {
      const el = document.getElementById(id)
      if (!el) return null
      
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setScene(name),
        onEnterBack: () => setScene(name),
        onUpdate: (self) => {
          if (worldState.scene === name) {
            worldState.sceneProgress = self.progress
          }
        }
      })
    })
    
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) {
        worldState.globalProgress = Math.max(0, Math.min(1, window.scrollY / max));
      }
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    const globalTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        worldState.globalProgress = self.progress;
      }
    });

    const onTick = () => {
      const p = worldState.globalProgress;
      // Lighting: medium response
      worldState.lightingProgress += (p - worldState.lightingProgress) * 0.08;
      // Atmosphere: very slow response
      worldState.atmosphereProgress += (p - worldState.atmosphereProgress) * 0.03;
      // Accent highlights: faster response
      worldState.accentProgress += (p - worldState.accentProgress) * 0.20;
    };
    gsap.ticker.add(onTick);

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener('scroll', updateScroll);
      triggers.forEach(t => t?.kill());
      globalTrigger.kill();
    };
  }, [])

  return null
}