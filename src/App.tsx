import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  Braces,
  Building2,
  CalendarCheck2,
  Camera,
  Check,
  CircleDollarSign,
  Code2,
  Copy,
  Database,
  Gauge,
  Menu,
  MessageSquare,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import './App.css'

const services = [
  {
    number: '01',
    icon: Building2,
    title: 'Business websites',
    description:
      'Fast, responsive websites built to explain what you do, earn trust, and turn attention into qualified inquiries.',
    features: ['Clear service architecture', 'Lead-generation flows', 'Search-friendly structure'],
  },
  {
    number: '02',
    icon: Braces,
    title: 'Custom web applications',
    description:
      'Purpose-built software for businesses whose workflows have outgrown templates and disconnected tools.',
    features: ['Secure user accounts', 'Admin and client dashboards', 'Custom business logic'],
  },
  {
    number: '03',
    icon: CalendarCheck2,
    title: 'Booking & scheduling',
    description:
      'Reservation experiences designed around your real availability, capacity, pricing, and approval rules.',
    features: ['Live availability', 'Customer confirmations', 'Rescheduling workflows'],
  },
  {
    number: '04',
    icon: CircleDollarSign,
    title: 'Payments & marketplaces',
    description:
      'Secure checkout, deposits, connected accounts, platform fees, invoices, and payout workflows.',
    features: ['Stripe integrations', 'Payment status tracking', 'Marketplace architecture'],
  },
]

const projects = [
  {
    index: '01',
    name: 'SATX Ink',
    category: 'Marketplace platform',
    description:
      'A San Antonio marketplace connecting tattoo clients with local artists through discovery, requests, booking, messaging, and payments.',
    tags: ['Multi-role accounts', 'Stripe Connect', 'Booking workflows', 'Artist portfolios'],
    accent: 'lime',
    href: 'https://satxink.com',
    cta: 'View live platform',
  },
  {
    index: '02',
    name: 'RoofZeus',
    category: 'Multi-tenant SaaS',
    description:
      'A multi-tenant roofing SaaS application that brings job progress, scheduling, crews, payouts, invoices, materials, and financial reporting into one system.',
    tags: ['Multi-tenant accounts', 'Job pipelines', 'Crew management', 'Financial reporting'],
    accent: 'blue',
    href: 'https://roofzeus.com',
    cta: 'View live multi-tenant SaaS',
  },
]

const capabilities = [
  { icon: ShieldCheck, label: 'Secure authentication & permissions' },
  { icon: Database, label: 'Cloud databases & file storage' },
  { icon: CircleDollarSign, label: 'Payments, deposits & payouts' },
  { icon: CalendarCheck2, label: 'Booking & availability logic' },
  { icon: Users, label: 'Client, employee & admin portals' },
  { icon: Workflow, label: 'Business workflows & automation' },
  { icon: Gauge, label: 'Dashboards, reporting & activity' },
  { icon: Code2, label: 'API, email & AI integrations' },
]

const process = [
  {
    step: '01',
    title: 'Understand the business',
    copy: 'We start with the problem, the people using the system, and what a successful result needs to look like.',
  },
  {
    step: '02',
    title: 'Define the first version',
    copy: 'We separate the essential features from the ideas that can wait, creating a focused plan you can act on.',
  },
  {
    step: '03',
    title: 'Design the experience',
    copy: 'I map the main user flows and design an interface that feels clear, intentional, and useful on every screen.',
  },
  {
    step: '04',
    title: 'Build, test & launch',
    copy: 'I develop the full system, test the important workflows, deploy it, and improve it based on real use.',
  },
]

const faqs = [
  {
    question: 'Do you build regular business websites?',
    answer:
      'Yes. I can build a polished marketing site on its own or make it the public-facing part of a larger web application.',
  },
  {
    question: 'Can you build user accounts, bookings, or payments?',
    answer:
      'Yes. I build secure account systems, custom booking experiences, checkout and deposit flows, dashboards, portals, and marketplace payment architecture.',
  },
  {
    question: 'Do I need to know exactly what features I need?',
    answer:
      'No. Start by explaining the business problem, your current process, and the outcome you want. I can help define the right first version from there.',
  },
  {
    question: 'Will I work directly with you?',
    answer:
      'Yes. You will communicate directly with me throughout planning and development—there is no sales team translating your idea before it reaches the builder.',
  },
]

const projectTypes = [
  'Business website',
  'Custom web application',
  'Booking or scheduling',
  'Payments',
  'Customer portal',
  'Employee or admin system',
  'Marketplace',
  'Internal operations tool',
  'Not sure yet',
]

const revealEase = [0.22, 1, 0.36, 1] as const
const revealViewport = { once: true, amount: 0.16 } as const
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
const heroOutcomes = [
  'RUN BETTER.',
  'CAPTURE LEADS.',
  'BOOK CLIENTS.',
  'TAKE PAYMENTS.',
  'SAVE TIME.',
  'GROW FASTER.',
] as const

const heroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(7px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: revealEase },
  },
}

function Reveal({
  children,
  className,
  delay = 0,
  distance = 34,
}: {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance, filter: 'blur(6px)' }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={revealViewport}
      transition={{ duration: 0.72, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  )
}

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      R/
    </span>
  )
}

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

function RotatingHeroOutcome() {
  const reduceMotion = useReducedMotion()
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  const activeOutcomeIndex = reduceMotion ? 0 : outcomeIndex

  useEffect(() => {
    if (reduceMotion) return

    const timer = window.setTimeout(() => {
      setOutcomeIndex((current) => (current + 1) % heroOutcomes.length)
    }, 3800)

    return () => window.clearTimeout(timer)
  }, [outcomeIndex, reduceMotion])

  return (
    <span className="hero-outcome-window" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.em
          className="hero-outcome"
          key={heroOutcomes[activeOutcomeIndex]}
          initial={reduceMotion ? false : { opacity: 0, y: '90%', filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
          exit={reduceMotion ? undefined : { opacity: 0, y: '-90%', filter: 'blur(5px)' }}
          transition={{ duration: 0.48, ease: revealEase }}
        >
          {heroOutcomes[activeOutcomeIndex]}
        </motion.em>
      </AnimatePresence>
    </span>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [briefReady, setBriefReady] = useState(false)
  const [briefCopied, setBriefCopied] = useState(false)
  const [projectBrief, setProjectBrief] = useState('')
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  })

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const buildBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const capabilities = form.getAll('capabilities').join(', ')
    const brief = [
      'PROJECT INQUIRY — RAFATHEDEV.COM',
      '',
      `Name: ${form.get('name')}`,
      `Email: ${form.get('email')}`,
      `Business: ${form.get('business') || 'Not provided'}`,
      `Project type: ${capabilities || 'Not sure yet'}`,
      `Timing: ${form.get('timing')}`,
      `Budget: ${form.get('budget')}`,
      '',
      'What I want to build or improve:',
      String(form.get('message')),
      '',
      'Lead source: rafathedev',
    ].join('\n')

    setProjectBrief(brief)
    setBriefReady(true)
    setBriefCopied(false)
  }

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(projectBrief)
      setBriefCopied(true)
    } catch {
      setBriefCopied(false)
    }
  }

  return (
    <div className="site-shell min-h-screen overflow-hidden bg-ink text-paper">
      {!reduceMotion && (
        <motion.div
          className="scroll-progress"
          style={{ scaleX: smoothScrollProgress }}
          aria-hidden="true"
        />
      )}
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <motion.header
        className="site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between"
        initial={reduceMotion ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: revealEase }}
      >
        <motion.a
          className="brand header-brand inline-flex items-center no-underline"
          href="#top"
          aria-label="Rafa the Dev home"
          whileHover={reduceMotion ? undefined : { scale: 1.025 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <span className="brand-copy">
            <strong>RAFA THE DEV</strong>
            <RotatingBrandLabel />
          </span>
        </motion.a>

        <nav className={`nav-links items-center ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>My Work</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#process" onClick={closeMenu}>The Process</a>
          <a href="#about" onClick={closeMenu}>About Me</a>
          <a
            className="instagram-link mobile-instagram"
            href="https://www.instagram.com/rafathedev/"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <Camera size={17} />
            @rafathedev
          </a>
          <a className="button button-small nav-cta" href="#contact" onClick={closeMenu}>
            Start a project
            <ArrowUpRight size={16} />
          </a>
        </nav>

        <div className="header-actions">
          <a
            className="instagram-link"
            href="https://www.instagram.com/rafathedev/"
            target="_blank"
            rel="noreferrer"
            aria-label="Follow Rafa the Dev on Instagram"
          >
            <Camera size={18} />
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

      <main id="main">
        <section className="hero-section mx-auto min-h-screen max-w-[1400px]" id="top">
          <div className="hero-grid grid items-center">
            <motion.div
              className="hero-copy"
              variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.16 } } }}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
            >
              <motion.p className="eyebrow" variants={heroItem}>
                Full-stack developer in San Antonio
              </motion.p>
              <motion.h1
                aria-label="I build software that helps businesses run better."
                variants={heroItem}
              >
                I build software that helps businesses
                <RotatingHeroOutcome />
              </motion.h1>
              <motion.p className="hero-intro" variants={heroItem}>
                Custom websites and software systems for businesses that need bookings,
                payments, portals, dashboards, and better operational tools.
              </motion.p>
              <motion.div className="hero-actions flex items-center" variants={heroItem}>
                <motion.a
                  className="button button-primary"
                  href="#contact"
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.015 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  Tell me about your project
                  <ArrowUpRight size={18} />
                </motion.a>
                <a className="text-link" href="#work">
                  View my work
                  <ArrowDown size={17} />
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="system-visual"
              aria-label="Visual representation of an integrated business system"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.18, margin: '0px 0px -8% 0px' }}
              variants={{
                hidden: { opacity: 0, x: 42, rotateY: -4 },
                visible: {
                  opacity: 1,
                  x: 0,
                  rotateY: 0,
                  transition: { duration: 0.78, ease: revealEase },
                },
              }}
            >
              <div className="visual-topbar">
                <span>COMPLETE SYSTEMS</span>
              </div>
              <div className="visual-canvas">
                <motion.div
                  className="flow-card flow-card-main"
                  variants={{
                    hidden: { opacity: 0, y: -16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, delay: 0.3, ease: revealEase },
                    },
                  }}
                >
                  <small>NEW CUSTOMER</small>
                  <strong>Qualified lead captured</strong>
                  <div className="mini-progress">
                    <motion.span
                      variants={{
                        hidden: { scaleX: 0 },
                        visible: {
                          scaleX: 1,
                          transition: { duration: 0.8, delay: 0.62, ease: revealEase },
                        },
                      }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  className="flow-connector connector-one"
                  variants={{
                    hidden: { opacity: 0, scaleY: 0 },
                    visible: {
                      opacity: 1,
                      scaleY: 1,
                      transition: { duration: 0.45, delay: 0.72 },
                    },
                  }}
                />
                <motion.div
                  className="flow-connector connector-two"
                  variants={{
                    hidden: { opacity: 0, scaleX: 0 },
                    visible: {
                      opacity: 1,
                      scaleX: 1,
                      transition: { duration: 0.45, delay: 0.98 },
                    },
                  }}
                />
                <motion.div
                  className="flow-card flow-card-small flow-booking"
                  variants={{
                    hidden: { opacity: 0, x: 25 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, delay: 0.75, ease: revealEase },
                    },
                  }}
                >
                  <CalendarCheck2 size={19} />
                  <span><small>BOOKING</small><strong>Confirmed</strong></span>
                  <Check size={15} />
                </motion.div>
                <motion.div
                  className="flow-card flow-card-small flow-payment"
                  variants={{
                    hidden: { opacity: 0, x: -25 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, delay: 1.02, ease: revealEase },
                    },
                  }}
                >
                  <CircleDollarSign size={19} />
                  <span><small>PAYMENT</small><strong>Processed</strong></span>
                  <Check size={15} />
                </motion.div>
                <motion.div
                  className="flow-card flow-card-small flow-portal"
                  variants={{
                    hidden: { opacity: 0, x: 25 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, delay: 1.28, ease: revealEase },
                    },
                  }}
                >
                  <Users size={19} />
                  <span><small>PORTAL</small><strong>Account ready</strong></span>
                  <Check size={15} />
                </motion.div>
                <motion.div
                  className="visual-label visual-label-one"
                  variants={{
                    hidden: { opacity: 0, scale: 0.7 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.35, delay: 1.42 },
                    },
                  }}
                >
                  AUTOMATED
                </motion.div>
                <motion.div
                  className="visual-label visual-label-two"
                  variants={{
                    hidden: { opacity: 0, scale: 0.7 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.35, delay: 1.55 },
                    },
                  }}
                >
                  ONE RELIABLE SYSTEM
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="trust-strip flex items-center justify-between"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.45 }}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: revealEase },
              },
            }}
          >
            <span>Built for real operations</span>
            <div className="tech-list" aria-label="Core technologies">
              {['React', 'TypeScript', 'Firebase', 'Stripe', 'Vercel'].map((technology, index) => (
                <motion.span
                  key={technology}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, delay: 0.08 + index * 0.06 },
                    },
                  }}
                >
                  {technology}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="statement-section section mx-auto grid max-w-[1400px]">
          <Reveal className="section-label">THE OPPORTUNITY</Reveal>
          <Reveal className="statement-copy" delay={0.08}>
            <h2>More than a website.</h2>
            <p>
              Your website can collect qualified leads, accept bookings and payments,
              organize business data, automate repetitive tasks, and give your team a
              clear view of what is happening.
            </p>
            <p>
              I build around the way your business actually works—not the limits of a
              generic template.
            </p>
          </Reveal>
        </section>

        <section className="services-section section mx-auto max-w-[1400px]" id="services">
          <Reveal className="section-heading grid items-end">
            <div>
              <p className="section-kicker">WHAT I BUILD</p>
              <h2>Software shaped around your business.</h2>
            </div>
            <p>
              From a focused marketing site to the system that runs your daily
              operation, every build starts with the outcome you need.
            </p>
          </Reveal>

          <div className="services-grid grid md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.article
                  className="service-card flex flex-col"
                  key={service.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 42, scale: 0.985 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={revealViewport}
                  transition={{ duration: 0.65, delay: (index % 2) * 0.1, ease: revealEase }}
                  whileHover={reduceMotion ? undefined : { y: -7 }}
                >
                  <div className="service-card-top flex items-center justify-between">
                    <span>{service.number}</span>
                    <motion.span
                      whileHover={reduceMotion ? undefined : { rotate: 8, scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    >
                      <Icon size={23} strokeWidth={1.8} />
                    </motion.span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.features.map((feature) => (
                      <li key={feature}><Check size={14} />{feature}</li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="work-section section mx-auto max-w-[1400px]" id="work">
          <Reveal className="section-heading grid items-end">
            <div>
              <p className="section-kicker">PROOF OF CONCEPT</p>
              <h2>Systems designed around real problems.</h2>
            </div>
            <p>
              A few examples of how focused software can connect people, payments,
              information, and day-to-day operations.
            </p>
          </Reveal>

          <div className="projects-list grid md:grid-cols-2">
            {projects.map((project, index) => (
              <motion.article
                className={`project-card project-${project.accent} relative flex flex-col overflow-hidden`}
                key={project.name}
                initial={reduceMotion ? false : { opacity: 0, y: 54, rotateX: 2 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
                viewport={revealViewport}
                transition={{ duration: 0.72, delay: (index % 2) * 0.11, ease: revealEase }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: 1.008 }}
              >
                <div className="project-meta relative z-10 flex items-center justify-between">
                  <span>{project.index}</span>
                  <span>{project.category}</span>
                </div>
                <div className="project-content relative z-10 flex flex-1 flex-col justify-center">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>
                  <div className="project-tags flex flex-wrap">
                    {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
                <div className="project-footer relative z-10">
                  <a
                    className="project-link"
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${project.name}`}
                  >
                    <span>{project.cta}</span>
                    <span className="project-link-icon" aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </span>
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="capabilities-section section mx-auto grid max-w-[1400px]">
          <Reveal className="capability-intro">
            <p className="section-kicker">BEHIND THE SCREEN</p>
            <h2>The interface is only the beginning.</h2>
            <p>
              I build the underlying systems that make a product secure, reliable,
              and useful—from account permissions to payments and operational data.
            </p>
          </Reveal>
          <div className="capabilities-grid grid md:grid-cols-2">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              return (
                <motion.div
                  className="capability-item flex items-center"
                  key={capability.label}
                  initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={revealViewport}
                  transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: revealEase }}
                  whileHover={reduceMotion ? undefined : { backgroundColor: 'rgba(216, 255, 101, 0.055)' }}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{capability.label}</span>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="process-section section mx-auto max-w-[1400px]" id="process">
          <Reveal className="section-heading grid items-end">
            <div>
              <p className="section-kicker">HOW WE GET THERE</p>
              <h2>A practical development process.</h2>
            </div>
            <p>
              Clear decisions, direct communication, and a focused first version
              keep the project moving toward a useful result.
            </p>
          </Reveal>
          <div className="process-grid grid sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item, index) => (
              <motion.article
                className="process-card"
                key={item.step}
                initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={revealViewport}
                transition={{ duration: 0.58, delay: index * 0.09, ease: revealEase }}
                whileHover={reduceMotion ? undefined : { y: -6, backgroundColor: 'rgba(216, 255, 101, 0.12)' }}
              >
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="about-section section mx-auto grid max-w-[1400px] items-center" id="about">
          <motion.div
            className="about-portrait"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, x: -45, rotate: -1.5 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, rotate: 0 }}
            viewport={revealViewport}
            transition={{ duration: 0.78, ease: revealEase }}
          >
            <div className="portrait-code">
              <span>const builder = {'{'}</span>
              <span>&nbsp;&nbsp;name: 'Rafa',</span>
              <span>&nbsp;&nbsp;base: 'San Antonio',</span>
              <span>&nbsp;&nbsp;focus: 'useful software'</span>
              <span>{'}'}</span>
            </div>
            <motion.div
              className="portrait-monogram"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={revealViewport}
              transition={{ duration: 0.8, delay: 0.18, ease: revealEase }}
            >
              RC
            </motion.div>
            <span className="portrait-caption">FOUNDER / BUILDER</span>
          </motion.div>
          <Reveal className="about-copy" delay={0.08}>
            <p className="section-kicker">ABOUT RAFA</p>
            <h2>Hi, I’m Rafa.</h2>
            <p className="about-lead">
              I’m a full-stack developer based in San Antonio and the owner of
              Devnetiks LLC.
            </p>
            <p>
              I enjoy understanding how a business works and turning that process
              into software that feels clear, useful, and intentional. My projects
              have included marketplaces, booking platforms, payment systems,
              operations software, dashboards, portals, and analytics tools.
            </p>
            <p>
              When we work together, you communicate directly with the person
              planning and building the system. My goal is not to add technology
              for the sake of it—it is to build the right system for the problem.
            </p>
            <a
              className="text-link instagram-about"
              href="https://www.instagram.com/rafathedev/"
              target="_blank"
              rel="noreferrer"
            >
              <Camera size={18} />
              Follow the build at @rafathedev
              <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </section>

        <section className="fit-section section mx-auto grid max-w-[1400px]">
          <Reveal className="section-label">A GOOD FIT</Reveal>
          <Reveal className="fit-content" delay={0.08}>
            <h2>For businesses that need more than a template.</h2>
            <div className="fit-list">
              {[
                'You have a web application idea but need help defining the right first version.',
                'Your team relies on spreadsheets, text messages, or repetitive manual work.',
                'Your customers need accounts, bookings, payments, or a private portal.',
                'Existing software does not match the way your business operates.',
                'You want to work directly with the developer building the product.',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={revealViewport}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Check size={17} /><span>{item}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="faq-section section mx-auto grid max-w-[1400px]">
          <Reveal className="faq-heading">
            <p className="section-kicker">COMMON QUESTIONS</p>
            <h2>A few things clients usually ask.</h2>
          </Reveal>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={revealViewport}
                transition={{ duration: 0.5, delay: index * 0.07, ease: revealEase }}
              >
                <details>
                  <summary>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {faq.question}
                    <i />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="contact-section section mx-auto grid max-w-[1400px]" id="contact">
          <Reveal className="contact-copy">
            <p className="section-kicker">START A CONVERSATION</p>
            <h2>Have a project in mind?</h2>
            <p>
              Tell me what your business does, what you are trying to improve, and
              what you would like the software to handle.
            </p>
            <p>
              You do not need a finished technical plan. We can start with the
              problem and define the right first version together.
            </p>
            <div className="contact-note flex items-start">
              <MessageSquare size={20} />
              <span>
                You’ll communicate directly with Rafa—not a sales team or account
                manager.
              </span>
            </div>
          </Reveal>

          <Reveal className="inquiry-panel" delay={0.1}>
            <AnimatePresence mode="wait" initial={false}>
            {!briefReady ? (
              <motion.form
                key="inquiry-form"
                className="flex flex-col"
                onSubmit={buildBrief}
                initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: 0.35, ease: revealEase }}
              >
                <input type="hidden" name="leadSource" value="rafathedev" />
                <div className="form-row grid">
                  <label>
                    Your name <span>*</span>
                    <input name="name" type="text" autoComplete="name" required placeholder="Name" />
                  </label>
                  <label>
                    Email address <span>*</span>
                    <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
                  </label>
                </div>
                <label>
                  Business or organization
                  <input name="business" type="text" autoComplete="organization" placeholder="Company name" />
                </label>
                <fieldset>
                  <legend>What do you need?</legend>
                  <div className="choice-grid flex flex-wrap">
                    {projectTypes.map((type) => (
                      <label className="choice" key={type}>
                        <input type="checkbox" name="capabilities" value={type} />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label>
                  What are you trying to build or improve? <span>*</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me about the problem, your current process, and what a better outcome would look like."
                  />
                </label>
                <div className="form-row grid">
                  <label>
                    Desired timing
                    <select name="timing" defaultValue="">
                      <option value="" disabled>Select timing</option>
                      <option>As soon as possible</option>
                      <option>Within 1–2 months</option>
                      <option>Within 3–6 months</option>
                      <option>Still exploring</option>
                    </select>
                  </label>
                  <label>
                    Approximate budget
                    <select name="budget" defaultValue="">
                      <option value="" disabled>Select range</option>
                      <option>Under $2,500</option>
                      <option>$2,500–$5,000</option>
                      <option>$5,000–$10,000</option>
                      <option>$10,000+</option>
                      <option>I need help estimating</option>
                    </select>
                  </label>
                </div>
                <button className="button button-primary form-submit" type="submit">
                  Prepare my project brief
                  <ArrowUpRight size={18} />
                </button>
                <p className="form-disclaimer">
                  No account required. Your details stay in your browser until you
                  choose how to send them.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="brief-ready"
                className="brief-ready flex flex-col items-start justify-center"
                aria-live="polite"
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: revealEase }}
              >
                <motion.div
                  className="success-icon"
                  initial={reduceMotion ? false : { scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                >
                  <Check size={27} />
                </motion.div>
                <p className="section-kicker">YOUR BRIEF IS READY</p>
                <h3>Let’s continue on Instagram.</h3>
                <p>
                  Copy your structured project brief, then open Instagram and paste it
                  into a message to <strong>@rafathedev</strong>.
                </p>
                <textarea value={projectBrief} readOnly rows={10} aria-label="Generated project brief" />
                <div className="brief-actions flex">
                  <button className="button button-secondary" type="button" onClick={copyBrief}>
                    {briefCopied ? <Check size={18} /> : <Copy size={18} />}
                    {briefCopied ? 'Copied' : 'Copy project brief'}
                  </button>
                  <a
                    className="button button-primary"
                    href="https://www.instagram.com/rafathedev/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Camera size={18} />
                    Open Instagram
                  </a>
                </div>
                <button className="start-over" type="button" onClick={() => setBriefReady(false)}>
                  Edit my answers
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </Reveal>
        </section>
      </main>

      <motion.footer
        className="site-footer mx-auto max-w-[1400px]"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: 0.65, ease: revealEase }}
      >
        <div className="footer-top flex items-center justify-between">
          <a className="brand footer-brand inline-flex items-center no-underline" href="#top">
            <LogoMark />
            <span className="brand-copy">
              <strong>RAFA THE DEV</strong>
              <small>CUSTOM SOFTWARE FOR REAL BUSINESSES</small>
            </span>
          </a>
          <div className="footer-links flex flex-wrap justify-end">
            <a href="#work">My Work</a>
            <a href="#services">Services</a>
            <a href="#process">The Process</a>
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
            <a href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom flex items-start justify-between">
          <p>© {new Date().getFullYear()} Rafa Castro. San Antonio, Texas.</p>
          <p>Rafa the Dev is the personal brand of Rafa Castro. Development services are provided by Devnetiks LLC.</p>
        </div>
      </motion.footer>
    </div>
  )
}

export default App
