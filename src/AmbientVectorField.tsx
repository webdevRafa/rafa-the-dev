import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const vectorScenes = [
  {
    paths: [
      'M 920 -120 C 1080 130 1320 170 1540 310 C 1320 450 1150 650 1020 1020',
      'M 1120 -120 C 1240 120 1450 240 1540 420 C 1400 560 1300 760 1260 1020',
      'M 720 -100 C 940 120 1020 310 1100 500 C 1200 720 1350 850 1540 980',
    ],
    orbit: { cx: 1160, cy: 280, r: 205 },
    node: { x: 1160, y: 280, rotate: 0, scale: 1.05 },
  },
  {
    paths: [
      'M -120 160 C 180 90 360 250 450 460 C 550 700 760 820 1040 960',
      'M -140 280 C 120 220 300 340 390 510 C 500 730 700 880 930 1010',
      'M 160 -120 C 300 80 420 180 620 240 C 820 300 980 520 1080 900',
    ],
    orbit: { cx: 390, cy: 430, r: 155 },
    node: { x: 390, y: 430, rotate: 35, scale: 0.92 },
  },
  {
    paths: [
      'M -120 660 C 220 420 420 360 700 450 C 980 540 1190 300 1560 170',
      'M -120 760 C 220 540 430 480 720 560 C 980 640 1200 420 1560 290',
      'M -120 560 C 220 320 450 270 700 350 C 960 430 1210 200 1560 80',
    ],
    orbit: { cx: 710, cy: 455, r: 235 },
    node: { x: 710, y: 455, rotate: 90, scale: 1.12 },
  },
  {
    paths: [
      'M -120 180 C 180 180 320 280 520 410 C 740 560 990 560 1560 380',
      'M -120 360 C 180 360 360 430 560 530 C 820 660 1120 610 1560 500',
      'M 260 -120 C 360 140 520 320 760 430 C 990 540 1240 700 1500 980',
    ],
    orbit: { cx: 555, cy: 455, r: 175 },
    node: { x: 555, y: 455, rotate: 45, scale: 0.95 },
  },
  {
    paths: [
      'M -120 740 C 240 600 420 420 650 430 C 890 440 1110 650 1560 700',
      'M -120 850 C 240 710 450 530 680 540 C 920 550 1180 760 1560 800',
      'M 180 -100 C 360 150 520 330 700 450 C 900 590 1070 760 1180 1020',
    ],
    orbit: { cx: 675, cy: 475, r: 190 },
    node: { x: 675, y: 475, rotate: 125, scale: 1.02 },
  },
  {
    paths: [
      'M -120 220 C 180 120 360 180 550 340 C 760 520 980 620 1560 620',
      'M -120 380 C 160 280 350 300 560 440 C 810 600 1080 730 1560 710',
      'M -120 540 C 180 440 370 430 600 540 C 880 680 1180 820 1560 800',
    ],
    orbit: { cx: 565, cy: 430, r: 165 },
    node: { x: 565, y: 430, rotate: 180, scale: 0.9 },
  },
  {
    paths: [
      'M -120 120 C 240 250 420 360 720 470 C 1020 580 1230 650 1560 790',
      'M -120 860 C 250 690 460 590 720 470 C 980 350 1240 230 1560 80',
      'M 720 -120 C 700 130 700 320 720 470 C 750 650 760 810 740 1020',
    ],
    orbit: { cx: 720, cy: 470, r: 225 },
    node: { x: 720, y: 470, rotate: 225, scale: 1.08 },
  },
  {
    paths: [
      'M -120 500 C 190 260 430 220 700 380 C 990 550 1220 540 1560 340',
      'M -120 650 C 220 400 460 360 720 500 C 990 650 1230 680 1560 500',
      'M 220 -120 C 480 120 560 310 650 480 C 760 690 980 850 1280 1020',
    ],
    orbit: { cx: 700, cy: 440, r: 180 },
    node: { x: 700, y: 440, rotate: 270, scale: 0.96 },
  },
  {
    paths: [
      'M -120 180 C 300 190 620 320 920 560 C 1130 730 1350 790 1560 800',
      'M -120 780 C 300 720 620 650 920 560 C 1190 480 1380 330 1560 160',
      'M 720 -120 C 760 180 830 380 920 560 C 1030 760 1090 900 1160 1020',
    ],
    orbit: { cx: 920, cy: 560, r: 210 },
    node: { x: 920, y: 560, rotate: 315, scale: 1.08 },
  },
] as const

const morphEase = [0.22, 1, 0.36, 1] as const

function AmbientVectorField() {
  const [activeScene, setActiveScene] = useState(0)
  const reduceMotion = useReducedMotion()
  const scene = vectorScenes[activeScene]
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.45, ease: morphEase }

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-ambient-scene]'),
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const enteringSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (!enteringSection) return

        const nextScene = Number(
          (enteringSection.target as HTMLElement).dataset.ambientScene,
        )

        if (Number.isInteger(nextScene)) {
          setActiveScene(nextScene)
        }
      },
      {
        rootMargin: '-46% 0px -46% 0px',
        threshold: 0,
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="ambient-vector-field" aria-hidden="true" data-scene={activeScene}>
      <svg
        className="ambient-vector-field__svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="ambient-dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.15" fill="currentColor" />
          </pattern>
        </defs>

        <rect
          className="ambient-vector-field__texture"
          width="1440"
          height="900"
          fill="url(#ambient-dots)"
        />

        {scene.paths.map((path, index) => (
          <motion.path
            className={`ambient-vector-path ambient-vector-path--${index + 1}`}
            d={path}
            key={index}
            fill="none"
            animate={{ d: path }}
            transition={transition}
          />
        ))}

        <motion.circle
          className="ambient-vector-orbit"
          fill="none"
          strokeDasharray="7 16"
          animate={scene.orbit}
          transition={transition}
        />

        <motion.g
          className="ambient-vector-node"
          animate={{
            x: scene.node.x,
            y: scene.node.y,
            rotate: scene.node.rotate,
            scale: scene.node.scale,
          }}
          transition={transition}
        >
          <g className="ambient-vector-node__pulse">
            <circle r="16" />
            <rect x="-46" y="-46" width="92" height="92" rx="4" />
            <path d="M -92 0 H 92 M 0 -92 V 92" />
            <circle cx="-92" cy="0" r="4" />
            <circle cx="92" cy="0" r="4" />
            <circle cx="0" cy="-92" r="4" />
            <circle cx="0" cy="92" r="4" />
          </g>
        </motion.g>
      </svg>
      <span className="ambient-vector-field__shade" />
    </div>
  )
}

export default AmbientVectorField
