import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CornerUpLeft, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandEmblem from '../BrandEmblem.tsx'
import ForestScene from './ForestScene.tsx'
import { FOREST_ZONES, type ForestZone, useForestProgression } from './useForestProgression.ts'
import './ForestExperience.css'

const panelEase = [0.22, 1, 0.36, 1] as const

function SceneLoading() {
  return (
    <div className="forest-loading" role="status" aria-live="polite">
      <span className="forest-loading__light" aria-hidden="true" />
      <span>Lighting the path</span>
    </div>
  )
}

export default function ForestExperience() {
  const progression = useForestProgression()
  const reduceMotion = useReducedMotion() ?? false
  const [sceneReady, setSceneReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = '3D Journey | Rafa the Dev'
    document.documentElement.classList.add('forest-route-active')
    document.body.classList.add('forest-route-active')
    return () => {
      document.title = previousTitle
      document.documentElement.classList.remove('forest-route-active')
      document.body.classList.remove('forest-route-active')
    }
  }, [])

  const enterJourney = useCallback(() => {
    if (sceneReady) setEntered(true)
  }, [sceneReady])

  const restartJourney = useCallback(() => {
    progression.goToZone(1)
  }, [progression])

  useEffect(() => {
    if (!entered) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && progression.hasNext) progression.nextZone()
      if (event.key === 'ArrowLeft' && progression.hasPrevious) progression.previousZone()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [entered, progression])

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || !entered) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = endX - touchStartX.current
    touchStartX.current = null

    if (distance < -60 && progression.hasNext) progression.nextZone()
    if (distance > 60 && progression.hasPrevious) progression.previousZone()
  }

  return (
    <main
      id="main"
      className={`forest-experience forest-experience--zone-${progression.currentZone}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Suspense fallback={<SceneLoading />}>
        <ForestScene
          currentZone={progression.currentZone}
          reduceMotion={reduceMotion}
          onReady={() => setSceneReady(true)}
        />
      </Suspense>

      <div className="forest-vignette" aria-hidden="true" />

      <header className="forest-header">
        <Link className="forest-brand" to="/" aria-label="Return to Rafa the Dev home">
          <BrandEmblem />
          <span>RAFA THE DEV</span>
        </Link>

        <div className="forest-header__status" aria-hidden="true">
          <span className="forest-header__pulse" />
          Interactive field notes
        </div>

        <Link className="forest-exit" to="/">
          <CornerUpLeft size={15} aria-hidden="true" />
          <span>Exit journey</span>
        </Link>
      </header>

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.section
            className="forest-intro"
            key="forest-intro"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: panelEase }}
          >
            <p className="forest-eyebrow">A short walk through the work</p>
            <h1>Find a clear path through complexity.</h1>
            <p className="forest-intro__copy">
              Take a three-part journey through the way I approach unfamiliar problems—from the first questions to a working product.
            </p>
            <div className="forest-intro__actions">
              <button className="forest-primary-action" type="button" onClick={enterJourney} disabled={!sceneReady}>
                <span>{sceneReady ? 'Enter the forest' : 'Preparing the trail'}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <span className="forest-duration">3 scenes · about 45 seconds</span>
            </div>
          </motion.section>
        ) : (
          <motion.section
            className="forest-hud"
            key={`forest-zone-${progression.currentZone}`}
            initial={reduceMotion ? false : { opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: panelEase }}
            aria-live="polite"
          >
            <p className="forest-eyebrow">{progression.zone.eyebrow}</p>
            <h1>{progression.zone.heading}</h1>
            <p className="forest-hud__copy">{progression.zone.description}</p>

            <div className="forest-hud__actions">
              {progression.hasPrevious && (
                <button
                  className="forest-secondary-action forest-back-action"
                  type="button"
                  onClick={progression.previousZone}
                  disabled={progression.isTransitioning}
                  aria-label={`Return to ${FOREST_ZONES[(progression.currentZone - 1) as ForestZone].name}`}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Back</span>
                </button>
              )}

              {progression.hasNext ? (
                <button
                  className="forest-primary-action"
                  type="button"
                  onClick={progression.nextZone}
                  disabled={progression.isTransitioning}
                >
                  <span>{progression.zone.ctaText}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ) : (
                <Link className="forest-primary-action" to="/#contact">
                  <span>{progression.zone.ctaText}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              )}

              {!progression.hasNext && (
                <button className="forest-replay" type="button" onClick={restartJourney}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Walk it again
                </button>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {entered && (
        <nav className="forest-progress" aria-label="Journey chapters">
          {(Object.values(FOREST_ZONES) as ForestZoneConfig[]).map((zone) => (
            <button
              className={zone.id === progression.currentZone ? 'is-current' : ''}
              key={zone.id}
              type="button"
              onClick={() => progression.goToZone(zone.id)}
              aria-current={zone.id === progression.currentZone ? 'step' : undefined}
              aria-label={`Go to ${zone.name}`}
            >
              <span className="forest-progress__index">0{zone.id}</span>
              <span className="forest-progress__name">{zone.shortName}</span>
              <span className="forest-progress__line" aria-hidden="true" />
            </button>
          ))}
        </nav>
      )}

      <p className="forest-control-hint" aria-hidden="true">
        {entered ? 'Use arrow keys or swipe to move' : 'Move your pointer to look around'}
      </p>
    </main>
  )
}

type ForestZoneConfig = (typeof FOREST_ZONES)[ForestZone]
