import { motion, useReducedMotion } from 'framer-motion'

const emblemEase = [0.22, 1, 0.36, 1] as const
const intactRightFace = 'M23 29 L42 18 L42 28.2 L42 41 L42 41 L23 52 Z'
const brokenRightFace = 'M23 29 L42 18 L42 28.2 L33.5 33.1 L33.5 45.9 L23 52 Z'

function BrandEmblem() {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      className="brand-emblem"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="rtd-emblem-top" x1="8" y1="8" x2="39" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#aa80ff" />
          <stop offset="1" stopColor="#7752f6" />
        </linearGradient>
        <linearGradient id="rtd-emblem-left" x1="5" y1="19" x2="25" y2="51" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54efff" />
          <stop offset="1" stopColor="#18c7df" />
        </linearGradient>
        <linearGradient id="rtd-emblem-right" x1="29" y1="24" x2="50" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff8b73" />
          <stop offset="1" stopColor="#ff5d54" />
        </linearGradient>
      </defs>

      <g shapeRendering="geometricPrecision">
        <path d="M4 18 23 7l19 11-19 11L4 18Z" fill="url(#rtd-emblem-top)" />
        <path d="m4 18 19 11v23L4 41V18Z" fill="url(#rtd-emblem-left)" />
        <motion.path
          d={brokenRightFace}
          fill="url(#rtd-emblem-right)"
          initial={reduceMotion ? false : { d: intactRightFace }}
          animate={{ d: brokenRightFace }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.48, duration: 0.58, ease: emblemEase }}
        />

        <g className="brand-emblem__fragment brand-emblem__fragment--primary">
          <motion.g
            initial={reduceMotion ? false : { opacity: 0, x: -10, y: -2, scale: 0.72 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={reduceMotion
              ? { duration: 0 }
              : { delay: 0.58, type: 'spring', stiffness: 180, damping: 16, mass: 0.55 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <path d="m38 36 7-4 7 4-7 4-7-4Z" fill="url(#rtd-emblem-top)" />
            <path d="m38 36 7 4v8.4l-7-4V36Z" fill="url(#rtd-emblem-left)" />
            <path d="m45 40 7-4v8.4l-7 4V40Z" fill="url(#rtd-emblem-right)" />
          </motion.g>
        </g>

        <g className="brand-emblem__fragment brand-emblem__fragment--secondary">
          <motion.g
            initial={reduceMotion ? false : { opacity: 0, x: -17, y: 10, scale: 0.55 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={reduceMotion
              ? { duration: 0 }
              : { delay: 0.7, type: 'spring', stiffness: 165, damping: 15, mass: 0.5 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <path d="m51 23.5 4-2.3 4 2.3-4 2.3-4-2.3Z" fill="url(#rtd-emblem-top)" />
            <path d="m51 23.5 4 2.3v5l-4-2.3v-5Z" fill="url(#rtd-emblem-left)" />
            <path d="m55 25.8 4-2.3v5l-4 2.3v-5Z" fill="url(#rtd-emblem-right)" />
          </motion.g>
        </g>

        <path d="M4 18 23 29l19-11M23 29v23" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth=".8" />
      </g>
    </svg>
  )
}

export default BrandEmblem
