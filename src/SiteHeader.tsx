import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link, useLocation } from 'react-router-dom'

const revealEase = [0.22, 1, 0.36, 1] as const
const brandLabelScenes = [
  { id: 'developer', label: 'FULL-STACK DEVELOPER' },
  {
    id: 'systems',
    words: ['BOOKING', 'PAYMENT', 'SCHEDULING'],
    suffix: 'SYSTEMS',
    termWidth: '11.25ch',
  },
  {
    id: 'portals',
    words: ['CUSTOMER', 'EMPLOYEE', 'ADMIN'],
    suffix: 'PORTALS',
    termWidth: '9.25ch',
  },
  {
    id: 'dashboards',
    words: ['OPERATIONS', 'ANALYTICS', 'CLIENT'],
    suffix: 'DASHBOARDS',
    termWidth: '11.25ch',
  },
  {
    id: 'websites',
    words: ['BROCHURE', 'CONVERSION', 'BUSINESS'],
    suffix: 'WEBSITES',
    termWidth: '11.25ch',
  },
  {
    id: 'tools',
    words: ['WORKFLOW', 'REPORTING', 'AUTOMATION'],
    suffix: 'TOOLS',
    termWidth: '11.25ch',
  },
] as const

const navigationItemVariants = {
  hidden: { opacity: 0, x: -18, filter: 'blur(4px)' },
  visible: (order: number) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.48,
      delay: 0.28 + order * 0.09,
      ease: revealEase,
    },
  }),
}

const navigationCtaVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: (order: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.42,
      delay: 0.28 + order * 0.09,
      ease: revealEase,
    },
  }),
}

const MotionLink = motion.create(Link)

function RotatingBrandLabel() {
  const reduceMotion = useReducedMotion()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const activeSceneIndex = reduceMotion ? 0 : sceneIndex
  const scene = brandLabelScenes[activeSceneIndex]

  useEffect(() => {
    if (reduceMotion) return

    const hasSharedWord = 'words' in scene
    const isLastWord = hasSharedWord && wordIndex === scene.words.length - 1
    const delay = hasSharedWord ? 3000 : 4200
    const timer = window.setTimeout(() => {
      if (hasSharedWord && !isLastWord) {
        setWordIndex((current) => current + 1)
        return
      }

      setSceneIndex((current) => (current + 1) % brandLabelScenes.length)
      setWordIndex(0)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [reduceMotion, scene, wordIndex])

  return (
    <small
      className="brand-rotator"
      aria-label="Full-stack developer building websites, booking and payment systems, portals, dashboards, and analytics tools"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          className="brand-label-scene"
          key={scene.id}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, x: 16, filter: 'blur(3px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16, filter: 'blur(3px)' }}
          transition={{ duration: 0.38, ease: revealEase }}
        >
          {'words' in scene ? (
            <span className="brand-label-shared">
              <span className="brand-label-term-window" style={{ width: scene.termWidth }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    className="brand-label-term"
                    key={scene.words[wordIndex]}
                    initial={reduceMotion ? false : { opacity: 0, y: '85%' }}
                    animate={{ opacity: 1, y: '0%' }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: '-85%' }}
                    transition={{ duration: 0.34, ease: revealEase }}
                  >
                    {scene.words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>{scene.suffix}</span>
            </span>
          ) : (
            scene.label
          )}
        </motion.span>
      </AnimatePresence>
    </small>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const reduceMotion = useReducedMotion()
  const { pathname } = useLocation()
  const freeWebsiteActive = pathname === '/free-website'

  useEffect(() => {
    if (!freeWebsiteActive) return

    lastScrollY.current = window.scrollY
    let animationFrame = 0

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0)
      const scrollDelta = currentScrollY - lastScrollY.current

      if (menuOpen || currentScrollY < 32) {
        setHeaderVisible(true)
      } else if (scrollDelta > 6 && currentScrollY > 88) {
        setHeaderVisible(false)
      } else if (scrollDelta < -4) {
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
      animationFrame = 0
    }

    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateHeader)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [freeWebsiteActive, menuOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const root = document.documentElement
    const body = document.body
    const scrollPosition = window.scrollY

    root.classList.add('mobile-menu-open')
    body.classList.add('mobile-menu-open')
    body.style.setProperty('--mobile-menu-scroll-offset', `-${scrollPosition}px`)

    return () => {
      root.classList.remove('mobile-menu-open')
      body.classList.remove('mobile-menu-open')
      body.style.removeProperty('--mobile-menu-scroll-offset')
      window.scrollTo(0, scrollPosition)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <motion.header
      className={`site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between ${
        freeWebsiteActive ? 'free-route-header' : ''
      }`}
      initial={reduceMotion ? false : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: freeWebsiteActive && !headerVisible ? '-110%' : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: headerVisible ? 0.38 : 0.3, ease: revealEase }
      }
    >
      <MotionLink
        className="brand header-brand inline-flex items-center no-underline"
        to="/#top"
        aria-label="Rafa the Dev home"
        whileHover={reduceMotion ? undefined : { scale: 1.025 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      >
        <span className="brand-copy">
          <strong>{freeWebsiteActive ? 'RAFA / OPEN STUDIO' : 'RAFA THE DEV'}</strong>
          {freeWebsiteActive ? (
            <small className="free-route-brand-label">COMMUNITY WEBSITE / 2026</small>
          ) : (
            <RotatingBrandLabel />
          )}
        </span>
      </MotionLink>

      {freeWebsiteActive ? (
        <motion.nav
          className={`nav-links free-route-nav items-center ${menuOpen ? 'is-open' : ''}`}
          aria-label="Free website navigation"
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          <motion.a custom={0} variants={navigationItemVariants} href="#how-it-works" onClick={closeMenu}>
            Process
          </motion.a>
          <motion.a custom={1} variants={navigationItemVariants} href="#scope" onClick={closeMenu}>
            What&apos;s included
          </motion.a>
          <MotionLink custom={2} variants={navigationItemVariants} to="/" onClick={closeMenu}>
            Rafa the Dev
          </MotionLink>
          <motion.a
            className="instagram-link mobile-instagram"
            custom={3}
            variants={navigationItemVariants}
            href="https://www.instagram.com/rafathedev/"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <FaInstagram size={17} aria-hidden="true" />
            @rafathedev
          </motion.a>
          <motion.a
            className="button button-small nav-cta"
            custom={4}
            variants={navigationCtaVariants}
            href="#application"
            onClick={closeMenu}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -2, transition: { duration: 0.18, ease: 'easeOut' } }
            }
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            Apply now
            <ArrowUpRight size={16} />
          </motion.a>
        </motion.nav>
      ) : (
        <motion.nav
          className={`nav-links items-center ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          <MotionLink custom={0} variants={navigationItemVariants} to="/#services" onClick={closeMenu}>
            Services
          </MotionLink>
          <MotionLink custom={1} variants={navigationItemVariants} to="/#process" onClick={closeMenu}>
            The Process
          </MotionLink>
          <MotionLink custom={2} variants={navigationItemVariants} to="/#about" onClick={closeMenu}>
            About Me
          </MotionLink>
          <MotionLink
            className="nav-feature-link"
            custom={3}
            variants={navigationItemVariants}
            to="/free-website"
            onClick={closeMenu}
          >
            Free Website
          </MotionLink>
          <motion.a
            className="instagram-link mobile-instagram"
            custom={4}
            variants={navigationItemVariants}
            href="https://www.instagram.com/rafathedev/"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <FaInstagram size={17} aria-hidden="true" />
            @rafathedev
          </motion.a>
          <MotionLink
            className="button button-small nav-cta"
            custom={4}
            variants={navigationCtaVariants}
            to="/#contact"
            onClick={closeMenu}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -2, transition: { duration: 0.18, ease: 'easeOut' } }
            }
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            Start a project
            <ArrowUpRight size={16} />
          </MotionLink>
        </motion.nav>
      )}

      <div className="header-actions">
        <a
          className="instagram-link"
          href="https://www.instagram.com/rafathedev/"
          target="_blank"
          rel="noreferrer"
          aria-label="Follow Rafa the Dev on Instagram"
        >
          <FaInstagram size={18} aria-hidden="true" />
        </a>
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? 'close' : 'menu'}
              className="menu-icon-wrap"
              initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.75 }}
              transition={{ duration: 0.16 }}
            >
              {menuOpen ? <X /> : <Menu />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.header>
  )
}

export default SiteHeader
