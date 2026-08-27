import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from 'framer-motion'

const confettiColors = [
  '#2ee7ff',
  '#8c5bff',
  '#ee4fbd',
  '#ff6c56',
  '#ffbd69',
  '#f5f7ff',
]

const particles = Array.from({ length: 72 }, (_, index) => {
  const drift = ((index * 83) % 240) - 120
  const size = 5 + ((index * 7) % 8)

  return {
    color: confettiColors[index % confettiColors.length],
    delay: (index * 37) % 720,
    drift,
    duration: 2700 + ((index * 71) % 1400),
    height: index % 4 === 0 ? Math.max(3, Math.round(size * 0.45)) : size + 4,
    left: 2 + ((index * 43) % 97),
    radius: index % 5 === 0 ? '50%' : index % 3 === 0 ? '999px' : '1px',
    rotation: 480 + ((index * 97) % 760),
    size,
  }
})

function ConfettiCelebration() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return null

  const viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight)

  return createPortal(
    <div
      className="confetti-celebration"
      aria-hidden="true"
      style={{ '--confetti-viewport-height': `${viewportHeight}px` } as CSSProperties}
    >
      {particles.map((particle, index) => (
        <i
          className="confetti-celebration__piece"
          key={index}
          style={{
            '--confetti-delay': `${particle.delay}ms`,
            '--confetti-drift': `${particle.drift}px`,
            '--confetti-duration': `${particle.duration}ms`,
            '--confetti-rotation': `${particle.rotation}deg`,
            backgroundColor: particle.color,
            borderRadius: particle.radius,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
          } as CSSProperties}
        />
      ))}
    </div>,
    document.body,
  )
}

export default ConfettiCelebration
