import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CornerUpLeft, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandEmblem from '../BrandEmblem.tsx'
import SpaceOdysseyScene from './SpaceOdysseyScene.tsx'
import { ODYSSEY_STAGES, type OdysseyStage, useOdysseyProgression } from './useOdysseyProgression.ts'
import './SpaceOdysseyExperience.css'

const panelEase = [0.22, 1, 0.36, 1] as const
type OdysseyStageConfig = (typeof ODYSSEY_STAGES)[OdysseyStage]

function SceneLoading() {
  return (
    <div className="odyssey-loading" role="status" aria-live="polite">
      <span className="odyssey-loading__orbit" aria-hidden="true"><i /></span>
      <span>Calibrating navigation</span>
    </div>
  )
}

export default function SpaceOdysseyExperience() {
  const progression = useOdysseyProgression()
  const reduceMotion = useReducedMotion() ?? false
  const [sceneReady, setSceneReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Space Odyssey | Rafa the Dev'
    document.documentElement.classList.add('odyssey-route-active')
    document.body.classList.add('odyssey-route-active')
    return () => {
      document.title = previousTitle
      document.documentElement.classList.remove('odyssey-route-active')
      document.body.classList.remove('odyssey-route-active')
    }
  }, [])

  const enterJourney = useCallback(() => {
    if (sceneReady) setEntered(true)
  }, [sceneReady])

  const restartJourney = useCallback(() => {
    progression.goToStage(1)
  }, [progression])

  useEffect(() => {
    if (!entered) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && progression.hasNext) progression.nextStage()
      if (event.key === 'ArrowLeft' && progression.hasPrevious) progression.previousStage()
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

    if (distance < -60 && progression.hasNext) progression.nextStage()
    if (distance > 60 && progression.hasPrevious) progression.previousStage()
  }

  return (
    <main
      id="main"
      className={`odyssey-experience odyssey-experience--stage-${progression.currentStage}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Suspense fallback={<SceneLoading />}>
        <SpaceOdysseyScene
          currentStage={progression.currentStage}
          reduceMotion={reduceMotion}
          onReady={() => setSceneReady(true)}
        />
      </Suspense>

      <div className="odyssey-vignette" aria-hidden="true" />
      <div className="odyssey-scanline" aria-hidden="true" />

      <header className="odyssey-header">
        <Link className="odyssey-brand" to="/" aria-label="Return to Rafa the Dev home">
          <BrandEmblem />
          <span>RAFA THE DEV</span>
        </Link>

        <div className="odyssey-system-status" aria-hidden="true">
          <span className="odyssey-system-status__pulse" />
          <span>NAV online</span>
          <i />
          <span>{entered ? progression.stage.code : 'STANDBY'}</span>
        </div>

        <Link className="odyssey-exit" to="/">
          <CornerUpLeft size={15} aria-hidden="true" />
          <span>Exit flight</span>
        </Link>
      </header>

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.section
            className="odyssey-intro"
            key="odyssey-intro"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
            transition={{ duration: reduceMotion ? 0 : 0.72, ease: panelEase }}
          >
            <p className="odyssey-eyebrow">Interactive space flight</p>
            <h1>See what happens when code leaves Earth.</h1>
            <p className="odyssey-intro__copy">
              Six stops. One impossible flight path. Take the controls and travel from low orbit to the surface of a world no one has seen before.
            </p>
            <div className="odyssey-intro__actions">
              <button className="odyssey-primary-action" type="button" onClick={enterJourney} disabled={!sceneReady}>
                <span>{sceneReady ? 'Begin launch sequence' : 'Preparing the flight'}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <span className="odyssey-duration">6 destinations · you set the pace</span>
            </div>
          </motion.section>
        ) : (
          <motion.section
            className="odyssey-hud"
            key={`odyssey-stage-${progression.currentStage}`}
            initial={reduceMotion ? false : { opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 18 }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: panelEase }}
            aria-live="polite"
          >
            <p className="odyssey-eyebrow">{progression.stage.eyebrow}</p>
            <h1>{progression.stage.heading}</h1>
            <p className="odyssey-hud__copy">{progression.stage.description}</p>

            <div className="odyssey-hud__actions">
              {progression.hasPrevious && (
                <button
                  className="odyssey-secondary-action"
                  type="button"
                  onClick={progression.previousStage}
                  disabled={progression.isTransitioning}
                  aria-label={`Return to ${ODYSSEY_STAGES[(progression.currentStage - 1) as OdysseyStage].name}`}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Back</span>
                </button>
              )}

              {progression.hasNext ? (
                <button
                  className="odyssey-primary-action"
                  type="button"
                  onClick={progression.nextStage}
                  disabled={progression.isTransitioning}
                >
                  <span>{progression.stage.ctaText}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ) : (
                <Link className="odyssey-primary-action" to="/#contact">
                  <span>{progression.stage.ctaText}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              )}

              {!progression.hasNext && (
                <button className="odyssey-replay" type="button" onClick={restartJourney}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Fly it again
                </button>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {entered && (
        <nav className="odyssey-progress" aria-label="Flight destinations">
          {(Object.values(ODYSSEY_STAGES) as OdysseyStageConfig[]).map((stage) => (
            <button
              className={stage.id === progression.currentStage ? 'is-current' : ''}
              key={stage.id}
              type="button"
              onClick={() => progression.goToStage(stage.id)}
              aria-current={stage.id === progression.currentStage ? 'step' : undefined}
              aria-label={`Fly to ${stage.name}`}
            >
              <span className="odyssey-progress__index">0{stage.id}</span>
              <span className="odyssey-progress__name">{stage.shortName}</span>
              <span className="odyssey-progress__line" aria-hidden="true" />
            </button>
          ))}
        </nav>
      )}

      <p className="odyssey-control-hint" aria-hidden="true">
        {entered ? 'Use arrow keys or swipe to navigate' : 'Move your pointer to guide the astronaut'}
      </p>
    </main>
  )
}
