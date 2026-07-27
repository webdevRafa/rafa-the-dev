import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ClipboardList,
  Gift,
  Globe2,
  HeartHandshake,
  MessageSquareText,
  Sparkles,
  Users,
} from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import './App.css'
import './FreeWebsitePage.css'

const revealEase = [0.22, 1, 0.36, 1] as const
const revealViewport = { once: true, amount: 0.14 } as const

const giveawaySteps = [
  {
    number: '01',
    icon: FaInstagram,
    title: 'Follow @rafathedev',
    copy: 'Follow Rafa the Dev on Instagram before the winner is announced. This is required to be eligible.',
  },
  {
    number: '02',
    icon: MessageSquareText,
    title: 'Share your story',
    copy: 'Tell me what you are building, why it matters, who it helps, and what a strong website could change for you.',
  },
  {
    number: '03',
    icon: HeartHandshake,
    title: 'One story is selected',
    copy: 'I will choose one project based on its story, potential impact, and a scope I can execute thoughtfully.',
  },
]

const includedItems = [
  'A custom, responsive marketing website',
  'Up to five focused pages or page sections',
  'Clear calls to action and contact experience',
  'Mobile, tablet, and desktop optimization',
  'Foundational accessibility and search setup',
  'Launch support for the finished website',
]

const scopeOptions = [
  'Home page',
  'About or story',
  'Services or offerings',
  'Gallery or portfolio',
  'Testimonials',
  'Contact or inquiry form',
  'Events or menu',
  'Not sure yet',
]

const giveawayHeroWords = [
  'STORY.',
  'IDEA.',
  'VISION.',
  'MISSION.',
  'PROBLEM.',
  'DREAM.',
] as const

function PageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={revealViewport}
      transition={{ duration: 0.7, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  )
}

function RotatingGiveawayWord() {
  const reduceMotion = useReducedMotion()
  const [wordIndex, setWordIndex] = useState(0)
  const activeWordIndex = reduceMotion ? 0 : wordIndex

  useEffect(() => {
    if (reduceMotion) return

    const timer = window.setTimeout(() => {
      setWordIndex((current) => (current + 1) % giveawayHeroWords.length)
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [reduceMotion, wordIndex])

  return (
    <span className="free-hero-word-window" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.em
          className="free-hero-word"
          key={giveawayHeroWords[activeWordIndex]}
          initial={reduceMotion ? false : { opacity: 0, y: '90%', filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
          exit={reduceMotion ? undefined : { opacity: 0, y: '-90%', filter: 'blur(5px)' }}
          transition={{ duration: 0.48, ease: revealEase }}
        >
          {giveawayHeroWords[activeWordIndex]}
        </motion.em>
      </AnimatePresence>
    </span>
  )
}

function FreeWebsitePage() {
  const [previewSubmitted, setPreviewSubmitted] = useState(false)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  })

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Free Website Giveaway | Rafa the Dev'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const handlePreviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPreviewSubmitted(true)
  }

  return (
    <div className="site-shell free-site-shell min-h-screen overflow-hidden bg-ink text-paper">
      {!reduceMotion && (
        <motion.div
          className="scroll-progress"
          style={{ scaleX: smoothScrollProgress }}
          aria-hidden="true"
        />
      )}
      <main id="main">
        <section className="free-hero mx-auto max-w-[1400px]" id="top">
          <motion.div
            className="free-hero-copy"
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.18 } } }}
          >
            <motion.p
              className="section-kicker"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: revealEase } },
              }}
            >
              FREE WEBSITE GIVEAWAY
            </motion.p>
            <motion.h1
              aria-label="You bring the story. I'll build the solution."
              variants={{
                hidden: { opacity: 0, y: 28, filter: 'blur(7px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.75, ease: revealEase },
                },
              }}
            >
              <span className="free-hero-static-line">You bring the</span>
              <RotatingGiveawayWord />
              <span className="free-hero-static-line">I&apos;ll build the solution.</span>
            </motion.h1>
            <motion.p
              className="free-hero-intro"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: revealEase } },
              }}
            >
              I am choosing one person, small business, creator, or community organization
              and building their website for free. Tell me what you are working toward and
              why this website would matter.
            </motion.p>
            <motion.div
              className="free-hero-actions"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: revealEase } },
              }}
            >
              <a className="button button-primary" href="#application">
                Share your story
                <ArrowDown size={18} />
              </a>
              <a
                className="free-instagram-rule"
                href="https://www.instagram.com/rafathedev/"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram size={18} aria-hidden="true" />
                Must follow @rafathedev to enter
                <ArrowUpRight size={15} />
              </a>
            </motion.div>
          </motion.div>

          <motion.aside
            className="giveaway-brief"
            aria-label="Giveaway summary"
            initial={reduceMotion ? false : { opacity: 0, x: 38, filter: 'blur(7px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.35, ease: revealEase }}
          >
            <div className="giveaway-brief-top">
              <span>GIVEAWAY / 001</span>
              <Gift size={18} />
            </div>
            <div className="giveaway-brief-body">
              <p>ONE WINNER</p>
              <strong>FULLY CUSTOM WEBSITE</strong>
              <span>
                Built from scratch around your story, your goals, and what you need.
              </span>
            </div>
            <div className="giveaway-brief-grid">
              <div>
                <span>PRICE</span>
                <strong>$0</strong>
              </div>
              <div>
                <span>DELIVERABLE</span>
                <strong>RESPONSIVE WEBSITE</strong>
              </div>
              <div>
                <span>SELECTION BASED ON</span>
                <strong>STORY + IMPACT</strong>
              </div>
              <div>
                <span>MUST FOLLOW</span>
                <strong className="giveaway-brief-instagram">
                  <FaInstagram size={13} aria-hidden="true" />
                  @RAFATHEDEV
                </strong>
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="free-section free-process mx-auto max-w-[1400px]" id="how-it-works">
          <PageReveal className="free-section-heading free-process-heading">
            <p className="section-kicker">HOW IT WORKS</p>
            <p>
              You do not need technical language or a polished pitch. The best submission
              will help me understand the person, the need, and the difference this project
              could make.
            </p>
          </PageReveal>
          <div className="giveaway-steps">
            {giveawaySteps.map((step, index) => {
              const Icon = step.icon
              return (
                <PageReveal className="giveaway-step" delay={index * 0.08} key={step.number}>
                  <div className="giveaway-step-meta">
                    <span>{step.number}</span>
                    <Icon size={23} aria-hidden="true" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </PageReveal>
              )
            })}
          </div>
        </section>

        <section className="free-section free-scope mx-auto max-w-[1400px]">
          <PageReveal className="free-scope-copy">
            <p className="section-kicker">WHAT THE WINNER RECEIVES</p>
            <h2>A focused website built to be useful.</h2>
            <p>
              The goal is a professional public-facing website—not a rushed template. I will
              shape the structure, design the experience, build it responsively, and help
              launch a clear first version.
            </p>
            <div className="free-scope-note">
              <Sparkles size={21} />
              <span>
                Complex web applications, custom account systems, e-commerce catalogs, paid
                subscriptions, and ongoing third-party costs are outside this giveaway.
              </span>
            </div>
          </PageReveal>
          <PageReveal className="included-list" delay={0.1}>
            {includedItems.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <Check size={18} />
                <p>{item}</p>
              </div>
            ))}
          </PageReveal>
        </section>

        <section className="free-section free-application mx-auto max-w-[1400px]" id="application">
          <PageReveal className="free-application-copy">
            <p className="section-kicker">TELL ME YOUR STORY</p>
            <h2>Help me understand what this could unlock.</h2>
            <p>
              Specific details help me compare submissions fairly. Share the real situation,
              the people you serve, and what you hope becomes possible with the right website.
            </p>
            <div className="application-signals">
              <div>
                <HeartHandshake size={20} />
                <span>
                  <strong>Need</strong>
                  Why the website matters now
                </span>
              </div>
              <div>
                <Users size={20} />
                <span>
                  <strong>Impact</strong>
                  Who it will help or reach
                </span>
              </div>
              <div>
                <ClipboardList size={20} />
                <span>
                  <strong>Scope</strong>
                  What the first version needs
                </span>
              </div>
            </div>
          </PageReveal>

          <PageReveal className="inquiry-panel free-application-panel" delay={0.1}>
            <div className="preview-notice" role="note">
              <Globe2 size={18} />
              <span>
                <strong>Application preview</strong>
                This page is static for now. Submissions are not being saved yet.
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {!previewSubmitted ? (
                <motion.form
                  key="giveaway-form"
                  onSubmit={handlePreviewSubmit}
                  initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.35, ease: revealEase }}
                >
                  <div className="form-section-label">
                    <span>01</span>
                    <strong>YOUR DETAILS</strong>
                  </div>
                  <div className="form-row">
                    <label>
                      Full name <span>*</span>
                      <input name="name" type="text" autoComplete="name" required placeholder="Your name" />
                    </label>
                    <label>
                      Email address <span>*</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@email.com"
                      />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Phone number
                      <input name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
                    </label>
                    <label>
                      City and state <span>*</span>
                      <input
                        name="location"
                        type="text"
                        autoComplete="address-level2"
                        required
                        placeholder="San Antonio, TX"
                      />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Business or project name <span>*</span>
                      <input name="projectName" type="text" required placeholder="Name or working title" />
                    </label>
                    <label>
                      Instagram username <span>*</span>
                      <input name="instagram" type="text" required placeholder="@username" />
                    </label>
                  </div>

                  <div className="form-section-label">
                    <span>02</span>
                    <strong>THE PROJECT</strong>
                  </div>
                  <div className="form-row">
                    <label>
                      What best describes you? <span>*</span>
                      <select name="projectType" defaultValue="" required>
                        <option value="" disabled>Select one</option>
                        <option>Local service business</option>
                        <option>Creator or personal brand</option>
                        <option>Nonprofit or community project</option>
                        <option>Restaurant or food business</option>
                        <option>Artist, maker, or portfolio</option>
                        <option>New idea or early-stage business</option>
                        <option>Something else</option>
                      </select>
                    </label>
                    <label>
                      Current online presence
                      <input
                        name="currentPresence"
                        type="url"
                        inputMode="url"
                        placeholder="Website or social link"
                      />
                    </label>
                  </div>
                  <label>
                    Tell me your story <span>*</span>
                    <textarea
                      name="story"
                      rows={7}
                      required
                      placeholder="What are you building? How did it begin? What challenge are you trying to overcome?"
                    />
                  </label>
                  <label>
                    Why would a website make a difference right now? <span>*</span>
                    <textarea
                      name="impact"
                      rows={5}
                      required
                      placeholder="Describe what winning could help you start, improve, or make possible."
                    />
                  </label>
                  <label>
                    Who does this website need to reach or help? <span>*</span>
                    <textarea
                      name="audience"
                      rows={4}
                      required
                      placeholder="Tell me about the customers, clients, supporters, or community you want to reach."
                    />
                  </label>

                  <div className="form-section-label">
                    <span>03</span>
                    <strong>THE FIRST VERSION</strong>
                  </div>
                  <fieldset>
                    <legend>What might the website need?</legend>
                    <div className="choice-grid">
                      {scopeOptions.map((option) => (
                        <label className="choice" key={option}>
                          <input type="checkbox" name="scope" value={option} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="form-row">
                    <label>
                      Main action for visitors <span>*</span>
                      <select name="visitorAction" defaultValue="" required>
                        <option value="" disabled>Select the main goal</option>
                        <option>Call or request a quote</option>
                        <option>Book an appointment</option>
                        <option>Visit a location</option>
                        <option>View work or services</option>
                        <option>Donate or get involved</option>
                        <option>Send an inquiry</option>
                        <option>I need help deciding</option>
                      </select>
                    </label>
                    <label>
                      Content readiness <span>*</span>
                      <select name="contentReadiness" defaultValue="" required>
                        <option value="" disabled>Select one</option>
                        <option>I have copy and photos ready</option>
                        <option>I have some materials</option>
                        <option>I need help organizing everything</option>
                        <option>I am starting from scratch</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Anything else I should understand?
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Important deadlines, accessibility needs, collaborators, or other context."
                    />
                  </label>

                  <div className="eligibility-checks">
                    <label>
                      <input type="checkbox" name="followsInstagram" required />
                      <span>
                        I confirm that I follow <strong>@rafathedev</strong> on Instagram. <em>*</em>
                      </span>
                    </label>
                    <label>
                      <input type="checkbox" name="scopeAcknowledged" required />
                      <span>
                        I understand that the giveaway is for a focused marketing website and
                        does not include complex application functionality or ongoing paid costs. <em>*</em>
                      </span>
                    </label>
                  </div>

                  <button className="button button-primary form-submit" type="submit">
                    Preview my submission
                    <ArrowUpRight size={18} />
                  </button>
                  <p className="form-disclaimer">
                    Preview mode only. No information leaves your browser or is saved yet.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="giveaway-preview-ready"
                  className="giveaway-preview-ready"
                  aria-live="polite"
                  initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: revealEase }}
                >
                  <div className="success-icon">
                    <Check size={27} />
                  </div>
                  <p className="section-kicker">THE EXPERIENCE IS READY</p>
                  <h3>Your story has a place to land.</h3>
                  <p>
                    This is the static confirmation experience. Once Firebase is connected,
                    this step will securely save the submission and confirm that it was received.
                  </p>
                  <div className="giveaway-preview-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setPreviewSubmitted(false)}
                    >
                      Edit the preview
                    </button>
                    <a
                      className="button button-primary"
                      href="https://www.instagram.com/rafathedev/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaInstagram size={18} aria-hidden="true" />
                      Follow @rafathedev
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </PageReveal>
        </section>
      </main>

      <motion.footer
        className="site-footer mx-auto max-w-[1400px]"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: 0.65, ease: revealEase }}
      >
        <div className="footer-top">
          <Link className="brand footer-brand" to="/#top">
            <span className="logo-mark" aria-hidden="true">R/</span>
            <span className="brand-copy">
              <strong>RAFA THE DEV</strong>
              <small>CUSTOM SOFTWARE FOR REAL BUSINESSES</small>
            </span>
          </Link>
          <div className="footer-links">
            <Link to="/#work">My Work</Link>
            <Link to="/#services">Services</Link>
            <Link to="/#process">The Process</Link>
            <Link to="/#about">About Me</Link>
            <Link to="/free-website" aria-current="page">Free Website</Link>
            <a href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Rafa Castro. San Antonio, Texas.</p>
          <p>
            Rafa the Dev is the personal brand of Rafa Castro. Development services are
            provided by Devnetiks LLC.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default FreeWebsitePage
