import { useEffect, useState } from 'react'
import { worldState } from '../lib/animation/sceneState'

export function useScrollProgress() {
  const [progress, setProgress] = useState({ global: 0, scene: 0 })
  useEffect(() => {
    let frameId: number
    const update = () => {
      setProgress({
        global: worldState.globalProgress,
        scene: worldState.sceneProgress
      })
      frameId = requestAnimationFrame(update)
    }
    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [])
  return progress
}