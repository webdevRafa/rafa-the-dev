import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const revealEase = [0.22, 1, 0.36, 1] as const

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: revealEase }}
    >
      <Link className="brand header-brand" to="/#top" aria-label="Rafa the Dev home">
        <span className="brand-mark" aria-hidden="true">R</span>
        <span className="brand-copy">
          <strong>RAFA / THE DEV</strong>
          <small>DESIGN · CODE · LAUNCH</small>
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
