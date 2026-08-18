import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const revealEase = [0.22, 1, 0.36, 1] as const

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const reduceMotion = useReducedMotion()
  const lastScrollY = useRef(0)
  const scrollDirection = useRef<-1 | 0 | 1>(0)
  const intentDistance = useRef(0)

  useEffect(() => {
    let frameId = 0

    lastScrollY.current = Math.max(window.scrollY, 0)

    const updateHeader = () => {
      const nextScrollY = Math.max(window.scrollY, 0)
      const delta = nextScrollY - lastScrollY.current

      setScrolled(nextScrollY > 24)

      if (nextScrollY <= 32 || menuOpen) {
        setHeaderVisible(true)
        scrollDirection.current = 0
        intentDistance.current = 0
      } else if (Math.abs(delta) >= 1) {
        const nextDirection = delta > 0 ? 1 : -1

        if (nextDirection !== scrollDirection.current) {
          scrollDirection.current = nextDirection
          intentDistance.current = 0
        }

        intentDistance.current += Math.abs(delta)

        if (nextDirection === 1 && nextScrollY > 72 && intentDistance.current >= 18) {
          setHeaderVisible(false)
          intentDistance.current = 0
        }

        if (nextDirection === -1 && intentDistance.current >= 10) {
          setHeaderVisible(true)
          intentDistance.current = 0
        }
      }

      lastScrollY.current = nextScrollY
      frameId = 0
    }

    const handleScroll = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(updateHeader)
    }

    frameId = window.requestAnimationFrame(updateHeader)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== 0) window.cancelAnimationFrame(frameId)
    }
  }, [menuOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    document.documentElement.classList.add('mobile-menu-open')
    document.body.classList.add('mobile-menu-open')
    return () => {
      document.documentElement.classList.remove('mobile-menu-open')
      document.body.classList.remove('mobile-menu-open')
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <motion.header
      className={`site-header${scrolled ? ' is-scrolled' : ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: headerVisible ? 0 : '-155%' }}
      transition={reduceMotion ? { duration: 0 } : { duration: headerVisible ? 0.48 : 0.34, ease: revealEase }}
      onFocusCapture={() => setHeaderVisible(true)}
    >
      <Link className="brand header-brand" to="/#top" aria-label="Rafa the Dev home">
        <span className="brand-mark" aria-hidden="true">
          <img src="/brand-mark.png" alt="" />
        </span>
        <span className="brand-copy">
          <strong>RAFA THE DEV</strong>
        </span>
      </Link>

      <nav className={`nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <Link to="/#services" onClick={closeMenu}>Services</Link>
        <Link to="/#packages" onClick={closeMenu}>Packages</Link>
        <Link to="/#process" onClick={closeMenu}>Process</Link>
        <Link to="/#about" onClick={closeMenu}>About</Link>
        <a
          className="mobile-instagram"
          href="https://www.instagram.com/rafathedev/"
          target="_blank"
          rel="noreferrer"
          onClick={closeMenu}
        >
          <FaInstagram aria-hidden="true" /> @rafathedev
        </a>
        <Link className="button button-small nav-cta" to="/#contact" onClick={closeMenu}>
          Start a project <ArrowUpRight size={16} />
        </Link>
      </nav>

      <div className="header-actions">
        <a
          className="instagram-link"
          href="https://www.instagram.com/rafathedev/"
          target="_blank"
          rel="noreferrer"
          aria-label="Follow Rafa the Dev on Instagram"
        >
          <FaInstagram size={17} aria-hidden="true" />
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
              initial={reduceMotion ? false : { opacity: 0, rotate: -35 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, rotate: 35 }}
              transition={{ duration: 0.16 }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.header>
  )
}

export default SiteHeader
