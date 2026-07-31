import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

type ScrollSplitTextProps = {
  text: string
  className?: string
  ending?: 'scatter' | 'reassemble'
  distance?: number
  rotation?: number
  scrub?: boolean | number
  eyebrow?: string
  supportingText?: string
}

function ScrollSplitText({
  text,
  className,
  ending = 'scatter',
  distance = 150,
  rotation = 15,
  scrub = 0.8,
  eyebrow,
  supportingText,
}: ScrollSplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const kickerRef = useRef<HTMLParagraphElement>(null)
  const supportRef = useRef<HTMLParagraphElement>(null)
  const meterRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const container = containerRef.current
      const visual = visualRef.current
      const heading = headingRef.current

      if (!container || !visual || !heading) return

      const media = gsap.matchMedia()

      const createResponsiveAnimation = (compact: boolean) => {
          const motionDistance = distance * (compact ? 0.46 : 1)
          const motionRotation = rotation * (compact ? 0.55 : 1)
          let timeline: gsap.core.Timeline | null = null

          const buildTimeline = (split: SplitText) => {
            timeline?.scrollTrigger?.kill(true)
            timeline?.kill()

            const characters = split.chars as HTMLElement[]
            const center = Math.max((characters.length - 1) / 2, 1)

            const direction = (index: number) => (index < center ? -1 : 1)
            const rotationDirection = (index: number) =>
              index % 2 === 0 ? -1 : 1
            const centerDistance = (index: number) =>
              Math.abs((index - center) / center)
            const deterministicWave = (index: number) =>
              (((index * 7) % 11) - 5) / 5
            const edgeDamping = (index: number) =>
              Math.sin(
                Math.PI * (index / Math.max(characters.length - 1, 1)),
              )

            const middleX = (index: number) => {
              const weight = 0.05 + centerDistance(index) * 0.22
              return (
                direction(index) *
                motionDistance *
                weight *
                edgeDamping(index)
              )
            }

            const middleY = (index: number) =>
              deterministicWave(index) * motionDistance * 0.12

            const middleRotation = (index: number) =>
              rotationDirection(index) *
              motionRotation *
              (0.18 + centerDistance(index) * 0.38) *
              (0.35 + edgeDamping(index) * 0.65)

            const finalX = (index: number) => {
              const weight =
                0.48 +
                centerDistance(index) * 0.92 +
                (index % 4) * 0.055
              return direction(index) * motionDistance * weight
            }

            const finalY = (index: number) =>
              deterministicWave(index) * motionDistance * 0.32 +
              (index % 2 === 0 ? -1 : 1) *
                centerDistance(index) *
                motionDistance *
                0.12

            const finalRotation = (index: number) =>
              rotationDirection(index) *
              motionRotation *
              (0.72 + centerDistance(index) * 0.8)

            gsap.set(characters, {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              force3D: true,
              transformOrigin: '50% 65%',
            })
            gsap.set(
              [heading, kickerRef.current, supportRef.current].filter(Boolean),
              {
                x: 0,
                y: 0,
              },
            )
            gsap.set(meterRef.current, { scaleX: 0, transformOrigin: 'left center' })

            timeline = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: () =>
                  `+=${Math.round(
                    window.innerHeight * (compact ? 0.95 : 1.35),
                  )}`,
                pin: visual,
                pinSpacing: true,
                scrub,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })

            timeline
              .to(meterRef.current, { scaleX: 1, duration: 1 }, 0)
              .to(
                heading,
                {
                  letterSpacing: compact ? '0.012em' : '0.025em',
                  duration: 0.42,
                },
                0.08,
              )
              .to(
                characters,
                {
                  x: middleX,
                  y: middleY,
                  rotation: middleRotation,
                  scale: (index) => 1 + (index % 3) * 0.012,
                  duration: 0.5,
                  stagger: { each: 0.002, from: 'center' },
                },
                0.1,
              )

            if (kickerRef.current) {
              timeline.to(
                kickerRef.current,
                {
                  x: compact ? 8 : 16,
                  letterSpacing: compact ? '0.13em' : '0.16em',
                  duration: 0.42,
                },
                0.12,
              )
            }

            if (supportRef.current) {
              timeline.to(
                supportRef.current,
                {
                  x: compact ? 8 : -20,
                  y: compact ? 10 : -8,
                  duration: 0.48,
                },
                0.12,
              )
            }

            if (ending === 'reassemble') {
              timeline
                .to(
                  characters,
                  {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    scale: 1,
                    duration: 0.4,
                    stagger: { each: 0.0015, from: 'edges' },
                  },
                  0.6,
                )
                .to(
                  heading,
                  { letterSpacing: '-0.005em', duration: 0.4 },
                  0.6,
                )

              const supportingTargets = [
                kickerRef.current,
                supportRef.current,
              ].filter(Boolean)

              if (supportingTargets.length > 0) {
                timeline.to(
                  supportingTargets,
                  {
                    x: 0,
                    y: 0,
                    duration: 0.4,
                  },
                  0.6,
                )
              }
            } else {
              timeline.to(
                characters,
                {
                  x: finalX,
                  y: finalY,
                  rotation: finalRotation,
                  scale: (index) => 0.94 + (index % 4) * 0.035,
                  duration: 0.42,
                  stagger: { each: 0.0015, from: 'center' },
                },
                0.58,
              )
            }
          }

          const split = SplitText.create(heading, {
            type: 'lines,words,chars',
            linesClass: 'scroll-split-line',
            wordsClass: 'scroll-split-word',
            charsClass: 'scroll-split-char',
            aria: 'auto',
            autoSplit: true,
            smartWrap: true,
            onSplit: buildTimeline,
          })

          return () => {
            timeline?.scrollTrigger?.kill(true)
            timeline?.kill()
            split.kill()
          }
      }

      media.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 761px)',
        () => createResponsiveAnimation(false),
      )
      media.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 760px)',
        () => createResponsiveAnimation(true),
      )

      return () => media.revert()
    },
    {
      scope: containerRef,
      dependencies: [distance, ending, rotation, scrub, text],
      revertOnUpdate: true,
    },
  )

  const sectionClassName = ['scroll-split-text', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClassName} ref={containerRef}>
      <div className="scroll-split-text__visual" ref={visualRef}>
        <div className="scroll-split-text__layout">
          <div className="scroll-split-text__primary">
            {eyebrow && (
              <p
                className="section-kicker scroll-split-text__kicker"
                ref={kickerRef}
              >
                {eyebrow}
              </p>
            )}
            <h2 className="scroll-split-text__heading" ref={headingRef}>
              {text}
            </h2>
          </div>
          {supportingText && (
            <p className="scroll-split-text__support" ref={supportRef}>
              {supportingText}
            </p>
          )}
        </div>
        <div className="scroll-split-text__meter" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <i>
            <span ref={meterRef} />
          </i>
          <span>01 — 04</span>
        </div>
      </div>
    </section>
  )
}

export default ScrollSplitText
