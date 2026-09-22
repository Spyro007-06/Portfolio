'use client'
import LoadingScreen from './LoadingScreen'
import Navigation from './Navigation'
import SceneOrchestrator from './SceneOrchestrator'
import DebugOverlay from './ui/DebugOverlay'
import DigitalArchitectureWorld from '@/components/Background/DigitalArchitectureWorld'

import HeroScene from './scenes/HeroScene'
import AboutScene from './scenes/AboutScene'
import SkillsScene from './scenes/SkillsScene'
import WorkScene from './scenes/WorkScene'
import ExperienceScene from './scenes/ExperienceScene'
import ContactScene from './scenes/ContactScene'

export default function Portfolio() {
  return (
    <div className="portfolio-root bg-[var(--bg)] min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      <LoadingScreen />
      <DigitalArchitectureWorld />
      <Navigation />
      <SceneOrchestrator />
      <DebugOverlay />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <HeroScene />
        <AboutScene />
        <SkillsScene />
        <WorkScene />
        <ExperienceScene />
        <ContactScene />
      </main>
    </div>
  )
}