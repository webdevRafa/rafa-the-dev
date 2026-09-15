import { useCallback, useEffect, useRef, useState } from 'react'

export type OdysseyStage = 1 | 2 | 3 | 4 | 5 | 6

export interface OdysseyStageConfig {
  id: OdysseyStage
  name: string
  shortName: string
  code: string
  eyebrow: string
  heading: string
  description: string
  ctaText: string
  targetTime: number
}

export const ODYSSEY_STAGES: Record<OdysseyStage, OdysseyStageConfig> = {
  1: {
    id: 1,
    name: 'Low Orbit',
    shortName: 'Orbit',
    code: 'ORBIT-01',
    eyebrow: 'Departure · low orbit',
    heading: 'Leave the familiar behind.',
    description: 'The tether is gone. Earth slips into the distance while open space—and every direction it offers—takes over.',
    ctaText: 'Engage the engines',
    targetTime: 0,
  },
  2: {
    id: 2,
    name: 'Asteroid Belt',
    shortName: 'Belt',
    code: 'BELT-02',
    eyebrow: 'Transit · asteroid belt',
    heading: 'Find a way through the noise.',
    description: 'Rock, ice, and bright meteor trails crowd the route. The path forward is narrow, but it is there.',
    ctaText: 'Cross the debris field',
    targetTime: 4,
  },
  3: {
    id: 3,
    name: 'Cronus Flyby',
    shortName: 'Cronus',
    code: 'CRONUS-03',
    eyebrow: 'Gravity assist · Cronus',
    heading: 'Let the giant pull you forward.',
    description: 'A ringed world fills the window. Its gravity bends the flight into a faster line toward the outer dark.',
    ctaText: 'Take the slingshot',
    targetTime: 8,
  },
  4: {
    id: 4,
    name: 'Crystalline Nebula',
    shortName: 'Nebula',
    code: 'NEBULA-04',
    eyebrow: 'Signal drift · crystalline nebula',
    heading: 'Follow the color into the unknown.',
    description: 'Cyan and magenta clouds fold around the ship, turning the quiet between worlds into something alive.',
    ctaText: 'Continue through the glow',
    targetTime: 12,
  },
  5: {
    id: 5,
    name: 'Aethelgard',
    shortName: 'Arrival',
    code: 'AETHEL-05',
    eyebrow: 'Arrival · Aethelgard',
    heading: 'There it is.',
    description: 'Sapphire water, emerald land, and one faint beacon below. You can pass it by—or find out what is waiting on the surface.',
    ctaText: 'Begin final descent',
    targetTime: 16,
  },
  6: {
    id: 6,
    name: 'Canyon Landfall',
    shortName: 'Landfall',
    code: 'LAND-06',
    eyebrow: 'Landfall · outpost alpha',
    heading: 'Touch down somewhere new.',
    description: 'The engines settle. Crystals hum across the canyon floor, and the beacon answers back. The rest is yours to imagine.',
    ctaText: 'Build something unexpected',
    targetTime: 20,
  },
}

const LAST_STAGE = 6
const TRANSITION_DURATION_MS = 3200

export function useOdysseyProgression() {
  const [currentStage, setCurrentStage] = useState<OdysseyStage>(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
  }, [])

  const goToStage = useCallback((stage: OdysseyStage) => {
    setCurrentStage(stage)
    setIsTransitioning(true)

    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    transitionTimer.current = window.setTimeout(() => {
      setIsTransitioning(false)
      transitionTimer.current = null
    }, TRANSITION_DURATION_MS)
  }, [])

  const nextStage = useCallback(() => {
    if (currentStage < LAST_STAGE) goToStage((currentStage + 1) as OdysseyStage)
  }, [currentStage, goToStage])

  const previousStage = useCallback(() => {
    if (currentStage > 1) goToStage((currentStage - 1) as OdysseyStage)
  }, [currentStage, goToStage])

  return {
    currentStage,
    stage: ODYSSEY_STAGES[currentStage],
    isTransitioning,
    goToStage,
    nextStage,
    previousStage,
    hasNext: currentStage < LAST_STAGE,
    hasPrevious: currentStage > 1,
  }
}
