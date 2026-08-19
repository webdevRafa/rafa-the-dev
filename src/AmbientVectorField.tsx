import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const atmosphereScenes = [
  {
    primary: 'M-180 180C80-60 390-80 650 100C930 292 1120 70 1570 140L1570 690C1260 610 1050 750 790 650C470 528 180 820-180 710Z',
    secondary: 'M980-160C1210-40 1390 170 1620 350L1620 980L820 980C730 720 820 500 1050 390C1240 300 1170 60 980-160Z',
    accent: '#2ee7ff', support: '#3158ff', glow: '#7928ff',
  },
  {
    primary: 'M-180 90C190-40 420 80 570 330C730 595 980 590 1570 330L1570 830C1190 930 910 790 620 720C310 645 100 850-180 780Z',
    secondary: 'M900-180C1130 20 1410 20 1620 210L1620 980L760 980C620 700 760 470 1030 390C1300 310 1110 40 900-180Z',
    accent: '#39f2c5', support: '#2057ff', glow: '#7647ff',
  },
  {
    primary: 'M-180 340C90 80 350 120 580 320C820 530 1130 190 1570 40L1570 610C1260 580 1090 850 720 740C390 642 150 900-180 820Z',
    secondary: 'M820-180C1050 60 1330 110 1620 250L1620 980L760 980C580 770 690 550 970 410C1260 265 1050 20 820-180Z',
    accent: '#6f62ff', support: '#b439ff', glow: '#2ee7ff',
  },
  {
    primary: 'M-180 110C150 15 450 180 600 420C770 690 1050 650 1570 410L1570 880C1170 970 870 810 580 750C270 680 60 890-180 820Z',
    secondary: 'M880-180C1110 10 1410 90 1620 330L1620 980L700 980C570 730 700 510 990 420C1260 330 1090 60 880-180Z',
    accent: '#9558ff', support: '#ef3dbd', glow: '#ff725e',
  },
  {
    primary: 'M-180 270C80 20 390 90 610 300C860 540 1090 410 1570 130L1570 760C1240 720 1020 910 690 760C400 630 130 910-180 830Z',
    secondary: 'M760-180C1040-10 1380 30 1620 260L1620 980L650 980C560 690 740 500 1010 430C1280 360 1010 20 760-180Z',
    accent: '#d94cff', support: '#ff496f', glow: '#ff9b51',
  },
  {
    primary: 'M-180 70C130-10 410 160 600 400C790 640 1110 600 1570 350L1570 900C1190 950 900 810 610 730C270 640 50 900-180 810Z',
    secondary: 'M920-180C1180 20 1400 150 1620 390L1620 980L690 980C560 700 710 520 1010 430C1280 350 1120 40 920-180Z',
    accent: '#ff527d', support: '#ff704c', glow: '#ffbc5c',
  },
  {
    primary: 'M-180 260C120 40 380 100 610 300C870 530 1090 500 1570 250L1570 830C1210 870 970 820 650 720C350 620 100 900-180 820Z',
    secondary: 'M790-180C1080 10 1390 70 1620 310L1620 980L660 980C530 710 710 500 990 420C1290 330 1060 20 790-180Z',
    accent: '#ff5e78', support: '#f04bca', glow: '#7d5cff',
  },
  {
    primary: 'M-180 100C150-20 430 170 590 390C790 660 1080 600 1570 330L1570 900C1220 940 920 830 620 730C300 625 50 880-180 800Z',
    secondary: 'M860-180C1130 0 1410 100 1620 360L1620 980L690 980C560 720 690 510 1000 420C1280 340 1090 40 860-180Z',
    accent: '#f642ad', support: '#ff6c4b', glow: '#ffbf65',
  },
] as const

const morphEase = [0.22, 1, 0.36, 1] as const

function AmbientVectorField() {
  const [activeScene, setActiveScene] = useState(0)
  const [useLiteField, setUseLiteField] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
      : false,
  )
  const reduceMotion = useReducedMotion()
  const scene = atmosphereScenes[Math.min(activeScene, atmosphereScenes.length - 1)]

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px), (pointer: coarse)')
    const updateFieldMode = () => setUseLiteField(media.matches)
    updateFieldMode()
    media.addEventListener('change', updateFieldMode)
    return () => media.removeEventListener('change', updateFieldMode)
  }, [])

  useEffect(() => {
    if (useLiteField) return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ambient-scene]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - window.innerHeight * 0.46) -
              Math.abs(b.boundingClientRect.top - window.innerHeight * 0.46),
          )[0]
        if (!visible) return
        const nextScene = Number((visible.target as HTMLElement).dataset.ambientScene)
        if (Number.isInteger(nextScene)) setActiveScene(nextScene)
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [useLiteField])

  if (useLiteField) {
    return (
      <div className="ambient-atmosphere ambient-atmosphere--lite" aria-hidden="true">
        <span className="ambient-atmosphere__veil" />
      </div>
    )
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 1.65, ease: morphEase }

  return (
    <div className="ambient-atmosphere" aria-hidden="true" data-scene={activeScene}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ambient-primary" x1="0" y1="0" x2="1" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: scene.accent }} transition={transition} />
            <motion.stop offset="100%" animate={{ stopColor: scene.support }} transition={transition} />
          </linearGradient>
          <radialGradient id="ambient-secondary" cx="50%" cy="50%" r="65%">
            <motion.stop offset="0%" animate={{ stopColor: scene.glow, stopOpacity: 0.72 }} transition={transition} />
            <motion.stop offset="100%" animate={{ stopColor: scene.support, stopOpacity: 0 }} transition={transition} />
          </radialGradient>
          <filter id="ambient-noise" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="9" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.18" />
            </feComponentTransfer>
          </filter>
        </defs>

        <motion.path
          className="ambient-atmosphere__field ambient-atmosphere__field--primary"
          fill="url(#ambient-primary)"
          animate={{ d: scene.primary }}
          transition={transition}
        />
        <motion.path
          className="ambient-atmosphere__field ambient-atmosphere__field--secondary"
          fill="url(#ambient-secondary)"
          animate={{ d: scene.secondary }}
          transition={transition}
        />
        <rect width="1440" height="900" filter="url(#ambient-noise)" opacity="0.45" />
      </svg>
      <span className="ambient-atmosphere__veil" />
    </div>
  )
}

export default AmbientVectorField
