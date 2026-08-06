import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ClipboardList,
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

function FreeWebsitePage() {
  const [previewSubmitted, setPreviewSubmitted] = useState(false)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [applicationSubmitError, setApplicationSubmitError] = useState('')
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

  const handlePreviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingApplication) return

    const form = new FormData(event.currentTarget)
    const getValue = (name: string) => String(form.get(name) ?? '')

    setIsSubmittingApplication(true)
    setApplicationSubmitError('')

    try {
      const { submitFreeWebsiteApplication } = await import('./firebase/submissions')
      await submitFreeWebsiteApplication({
        name: getValue('name'),
        email: getValue('email'),
        phone: getValue('phone'),
        location: getValue('location'),
        projectName: getValue('projectName'),
        instagram: getValue('instagram'),
        projectType: getValue('projectType'),
        currentPresence: getValue('currentPresence'),
        story: getValue('story'),
        impact: getValue('impact'),
        audience: getValue('audience'),
        scope: form.getAll('scope').map(String),
        visitorAction: getValue('visitorAction'),
        contentReadiness: getValue('contentReadiness'),
        notes: getValue('notes'),
        followsInstagram: form.get('followsInstagram') === 'on',
        scopeAcknowledged: form.get('scopeAcknowledged') === 'on',
      })
      setPreviewSubmitted(true)
    } catch (error) {
      console.error('Unable to save free website application.', error)
      setApplicationSubmitError(
        'Your application could not be sent right now. Please check your connection and try again.',
      )
    } finally {
      setIsSubmittingApplication(false)
    }
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
        <section className="free-hero" id="top">
          <motion.div
            className="free-hero-meta"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: revealEase }}
          >
            <span>OPEN CALL / 2026</span>
            <span>ONE WEBSITE / NO FEE</span>
          </motion.div>

          <motion.div
            className="free-hero-copy"
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
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
              aria-label="One useful website. Built free."
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
              <span>One useful</span>
              <em>website.</em>
              <span>Built free.</span>
            </motion.h1>
            <motion.div
              className="free-hero-lower"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: revealEase } },
              }}
            >
              <p className="free-hero-intro">
                I&apos;m choosing one person, small business, creator, or community organization
                and building a focused website at no cost. You bring the work. I&apos;ll handle
                the structure, design, and build.
              </p>
              <div className="free-hero-actions">
                <a className="button button-primary" href="#application">
                  Submit your project
                  <ArrowDown size={18} />
                </a>
                <a
                  className="free-instagram-rule"
                  href="https://www.instagram.com/rafathedev/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram size={18} aria-hidden="true" />
                  Follow @rafathedev to enter
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="free-hero-landscape"
            role="img"
            aria-label="An abstract architectural landscape in sage, terracotta, sand, and forest green"
            initial={reduceMotion ? false : { opacity: 0, y: 46, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.82, delay: 0.4, ease: revealEase }}
          >
            <div className="free-landscape-brief">
              <span>THE BRIEF</span>
              <strong>A clear, responsive home for the work you already do.</strong>
              <small>STRATEGY / DESIGN / BUILD / LAUNCH</small>
            </div>
            <div className="free-landscape-scene" aria-hidden="true">
              <i className="free-landscape-sun" />
              <i className="free-landscape-wall" />
              <i className="free-landscape-ground" />
              <i className="free-landscape-path" />
              <span className="free-landscape-plant free-landscape-plant-one"><i /><i /><i /></span>
              <span className="free-landscape-plant free-landscape-plant-two"><i /><i /><i /></span>
              <small>SAN ANTONIO / OPEN TO ALL INDUSTRIES</small>
            </div>
          </motion.div>
        </section>

        <section className="free-section free-process mx-auto max-w-[1400px]" id="how-it-works">
          <PageReveal className="free-section-heading free-process-heading">
            <p className="section-kicker">HOW IT WORKS</p>
            <h2>Three steps. One clear outcome.</h2>
            <p>
              No technical brief or polished pitch required. A clear explanation of what you
              do, who it serves, and what the website needs to accomplish is enough.
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

        <section className="free-section free-scope mx-auto max-w-[1400px]" id="scope">
          <PageReveal className="free-scope-copy">
            <p className="section-kicker">WHAT THE WINNER RECEIVES</p>
            <h2>Everything needed for a strong first version.</h2>
            <p>
              The result will be a professional public-facing website, not a rushed template.
              I&apos;ll shape the structure, design the experience, build it responsively, and
              help launch it.
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
            <h2>Tell me what the site needs to do.</h2>
            <p>
              Specific details make it easier to compare submissions fairly. Share the real
              situation, the people you serve, and the outcome the website should support.
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
                <strong>Secure application</strong>
                Your answers will be saved after you submit this form.
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {!previewSubmitted ? (
                <motion.form
                  key="giveaway-form"
                  onSubmit={handlePreviewSubmit}
                  aria-busy={isSubmittingApplication}
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

                  <button
                    className="button button-primary form-submit"
                    type="submit"
                    disabled={isSubmittingApplication}
                  >
                    {isSubmittingApplication ? 'Sending your application...' : 'Submit my application'}
                    <ArrowUpRight size={18} />
                  </button>
                  {applicationSubmitError && (
                    <p className="form-error" role="alert">
                      {applicationSubmitError}
                    </p>
                  )}
                  <p className="form-disclaimer">
                    Your application is securely submitted for giveaway consideration.
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
                  <p className="section-kicker">APPLICATION RECEIVED</p>
                  <h3>Your story is in.</h3>
                  <p>
                    Your application was saved successfully. I will review your story, impact,
                    and proposed scope as part of this promotion.
                  </p>
                  <div className="giveaway-preview-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setPreviewSubmitted(false)}
                    >
                      Submit another application
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
            <span className="brand-copy">
              <strong>RAFA THE DEV</strong>
              <small>ONE WEBSITE / DESIGNED AND BUILT AT NO COST</small>
            </span>
          </Link>
          <div className="footer-links">
            <a href="#how-it-works">Process</a>
            <a href="#scope">What&apos;s included</a>
            <a href="#application">Apply</a>
            <Link to="/">Rafa the Dev</Link>
            <a href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Development services are provided by Devnetiks LLC.</p>
        </div>
      </motion.footer>
    </div>
  )
}

export default FreeWebsitePage
