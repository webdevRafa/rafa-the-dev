import { useCallback, useEffect, useRef, useState } from 'react'

export type ForestZone = 1 | 2 | 3

export interface ForestZoneConfig {
  id: ForestZone
  name: string
  shortName: string
  eyebrow: string
  heading: string
  description: string
  ctaText: string
  targetTime: number
}

export const FOREST_ZONES: Record<ForestZone, ForestZoneConfig> = {
  1: {
    id: 1,
    name: 'The Trailhead',
    shortName: 'Trailhead',
    eyebrow: 'Discovery · the trailhead',
    heading: 'Start with what matters.',
    description:
      'Before I build, I learn how the business actually works—the people, the friction, and the outcome worth moving toward.',
    ctaText: 'Follow the lanterns',
    targetTime: 0.5,
  },
  2: {
    id: 2,
    name: 'The Sunken Hollow',
    shortName: 'Hollow',
    eyebrow: 'Design · the hollow',
    heading: 'Give complexity a clear path.',
    description:
      'I turn what we learn into an experience and system architecture that feel natural to use—even when the work behind them is complex.',
    ctaText: 'Cross the hollow',
    targetTime: 6.5,
  },
  3: {
    id: 3,
    name: 'The Ancient Grove',
    shortName: 'Grove',
    eyebrow: 'Build · the ancient grove',
    heading: 'Make the idea real.',
    description:
      'Thoughtful engineering, thorough testing, and honest collaboration turn the plan into software your business can rely on.',
    ctaText: 'Start a project',
    targetTime: 12.2,
  },
}

const LAST_ZONE = 3
const TRANSITION_DURATION_MS = 2500

export function useForestProgression() {
  const [currentZone, setCurrentZone] = useState<ForestZone>(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
  }, [])

  const goToZone = useCallback((zone: ForestZone) => {
    setCurrentZone(zone)
    setIsTransitioning(true)

    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    transitionTimer.current = window.setTimeout(() => {
      setIsTransitioning(false)
      transitionTimer.current = null
    }, TRANSITION_DURATION_MS)
  }, [])

  const nextZone = useCallback(() => {
    if (currentZone < LAST_ZONE) goToZone((currentZone + 1) as ForestZone)
  }, [currentZone, goToZone])

  const previousZone = useCallback(() => {
    if (currentZone > 1) goToZone((currentZone - 1) as ForestZone)
  }, [currentZone, goToZone])

  return {
    currentZone,
    zone: FOREST_ZONES[currentZone],
    isTransitioning,
    goToZone,
    nextZone,
    previousZone,
    hasNext: currentZone < LAST_ZONE,
    hasPrevious: currentZone > 1,
  }
}
