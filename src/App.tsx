import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Copy,
  Gauge,
  Layers3,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import './App.css'
import AmbientVectorField from './AmbientVectorField'
import { parseProjectBudget, PROJECT_BUDGET_OPTIONS } from './projectInquiryOptions'

const services = [
  {
    number: '01',
    tag: 'Be understood',
    title: 'Websites that turn attention into action.',
    description:
      'Position your business clearly, build trust quickly, and give every visitor an obvious next step—on every screen size.',
    features: ['Strategy + information architecture', 'Responsive design + development', 'Lead capture + launch support'],
    icon: Layers3,
  },
  {
    number: '02',
    tag: 'Run smoother',
    title: 'Custom software shaped around your workflow.',
    description:
      'Replace scattered tools and repetitive steps with one focused system built around the way your team actually works.',
    features: ['Secure accounts + permissions', 'Dashboards + operational data', 'Purpose-built business logic'],
    icon: Workflow,
  },
  {
    number: '03',
    tag: 'Book more',
    title: 'Scheduling that respects real availability.',
    description:
      'Create a polished booking flow with the right rules for availability, pricing, confirmations, and rescheduling.',
    features: ['Live availability', 'Customer notifications', 'Flexible scheduling rules'],
    icon: CalendarDays,
  },
  {
    number: '04',
    tag: 'Get paid',
    title: 'Payment experiences clients can trust.',
    description:
      'From deposits and invoices to marketplace payouts, I connect the moving parts and keep the experience clear.',
    features: ['Stripe integrations', 'Payment status tracking', 'Checkout + payout workflows'],
    icon: CircleDollarSign,
  },
]

const packages = [
  {
    name: 'Launch Page',
    price: '$950',
    note: 'A sharp single-page presence for one clear offer.',
    timeline: '1–2 weeks',
    features: ['One custom responsive page', 'Conversion-focused structure', 'Contact or lead form', 'SEO + accessibility foundation'],
  },
  {
    name: 'Business Website',
    price: '$2,500',
    note: 'A complete digital home for a growing service business.',
    timeline: '2–4 weeks',
    featured: true,
    features: ['Up to five focused pages', 'Content + UX guidance', 'Custom responsive build', 'Analytics + launch support'],
  },
  {
    name: 'Custom Web System',
    price: '$5,000+',
    note: 'Software for bookings, portals, operations, or payments.',
    timeline: 'Scoped together',
    features: ['Technical product blueprint', 'Authentication + database', 'Custom workflows + integrations', 'Testing + production launch'],
  },
]

const process = [
  { number: '01', label: 'Discover', title: 'Start with the real problem.', copy: 'We define the people, friction, goals, and constraints before deciding what to build.' },
  { number: '02', label: 'Shape', title: 'Turn the idea into a focused plan.', copy: 'I map the content, flows, features, and technical path for the strongest first version.' },
  { number: '03', label: 'Build', title: 'Make progress visible.', copy: 'You see the product take shape in working increments with clear decisions along the way.' },
  { number: '04', label: 'Launch', title: 'Ship with confidence.', copy: 'I test, deploy, connect the details, and make sure the finished experience is ready to use.' },
]

const faqs = [
  {
    question: 'Do I need a complete plan before we start?',
    answer: 'No. Bring me the problem, goal, or rough idea. I will ask the right questions and help define the right first version before development begins.',
  },
  {
    question: 'How much will my project cost?',
    answer: 'The packages give you a useful starting point. After a short conversation, I will confirm the scope, timing, deliverables, and exact price in a clear proposal.',
  },
  {
    question: 'Will I be able to update the site later?',
    answer: 'Yes. I choose the editing approach around what you need to maintain. I can also handle ongoing improvements through a Care & Growth plan starting at $150 per month.',
  },
  {
    question: 'What happens after launch?',
    answer: 'I make sure everything is deployed and working as expected. From there, we can arrange ongoing support or plan the next useful improvement when the business needs it.',
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
const revealViewport = { once: true, amount: 0.14 } as const

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
      initial={reduceMotion ? false : { opacity: 0, y: distance, filter: 'blur(8px)' }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={revealViewport}
      transition={{ duration: 0.72, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  )
}

function FaqItem({ faq, index }: { faq: (typeof faqs)[number]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0)
  const reduceMotion = useReducedMotion()
  const questionId = `faq-question-${index}`
  const answerId = `faq-answer-${index}`

  return (
    <div className={`faq-item${isOpen ? ' is-open' : ''}`}>
      <button
        className="faq-question"
        id={questionId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="faq-number">0{index + 1}</span>
        <span>{faq.question}</span>
        <motion.i animate={{ rotate: isOpen ? 180 : 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}>
          <ChevronDown size={20} />
        </motion.i>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-answer-shell"
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: revealEase }}
          >
            <p>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HeroSignalBoard() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="signal-board"
      initial={reduceMotion ? false : { opacity: 0, x: 52, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: revealEase }}
    >
      <span className="signal-board__orb" />
      <div className="signal-board__art" aria-hidden="true">
        <span className="signal-board__mesh" />
        <span className="signal-board__loop signal-board__loop--outer" />
        <span className="signal-board__loop signal-board__loop--inner" />
        <span className="signal-board__shard signal-board__shard--one" />
        <span className="signal-board__shard signal-board__shard--two" />
        <span className="signal-board__shard signal-board__shard--three" />
        <span className="signal-board__core">
          <i />
          <i />
          <i />
        </span>
        <span className="signal-board__coordinate">08 / 13 / BUILD</span>
      </div>
      <motion.div
        className="signal-card signal-card--top"
        animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-2, 0, -2] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>NOW BUILDING</span>
        <strong>Clearer systems for real businesses.</strong>
      </motion.div>
      <motion.div
        className="signal-card signal-card--bottom"
        animate={reduceMotion ? undefined : { y: [0, 9, 0], rotate: [2, 0, 2] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="live-dot" />
        <div><strong>AVAILABLE</strong><small>For select projects</small></div>
      </motion.div>
      <div className="signal-board__rail" aria-hidden="true">
        <span>WEB</span><span>APPS</span><span>SYSTEMS</span>
      </div>
    </motion.div>
  )
}

function App() {
  const [briefReady, setBriefReady] = useState(false)
  const [briefCopied, setBriefCopied] = useState(false)
  const [projectBrief, setProjectBrief] = useState('')
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false)
  const [briefSubmitError, setBriefSubmitError] = useState('')
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 180, damping: 28, restDelta: 0.001 })

  const buildBrief = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingBrief) return

    const form = new FormData(event.currentTarget)
    const getValue = (name: string) => String(form.get(name) ?? '')
    const capabilities = form.getAll('capabilities').map(String)
    const budget = parseProjectBudget(getValue('budget'))
    const brief = [
      'PROJECT INQUIRY — RAFATHEDEV.COM', '',
      `Name: ${getValue('name')}`,
      `Email: ${getValue('email')}`,
      `Business: ${getValue('business') || 'Not provided'}`,
      `Project type: ${capabilities.join(', ') || 'Not sure yet'}`,
      `Timing: ${getValue('timing') || 'Not provided'}`,
      `Budget: ${budget || 'Not provided'}`, '',
      'What I want to build or improve:', getValue('message'), '',
      'Lead source: rafathedev',
    ].join('\n')

    setIsSubmittingBrief(true)
    setBriefSubmitError('')
    try {
      const { submitProjectInquiry } = await import('./firebase/submissions')
      await submitProjectInquiry({
        name: getValue('name'), email: getValue('email'), business: getValue('business'),
        capabilities, message: getValue('message'), timing: getValue('timing'), budget,
      })
      setProjectBrief(brief)
      setBriefReady(true)
      setBriefCopied(false)
    } catch (error) {
      console.error('Unable to save project inquiry.', error)
      setBriefSubmitError('Your project could not be sent right now. Please check your connection and try again.')
    } finally {
      setIsSubmittingBrief(false)
    }
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
    <div className="site-shell public-site-shell">
      {!reduceMotion && <motion.div className="scroll-progress" style={{ scaleX: smoothScrollProgress }} aria-hidden="true" />}
      <AmbientVectorField />
      <main id="main">
        <section className="hero-section page-frame" id="top" data-ambient-scene="0">
          <div className="hero-copy">
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } } }}
            >
              <motion.p className="eyebrow" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}>
                <span /> Full-stack developer · San Antonio
              </motion.p>
              <motion.h1 variants={{ hidden: { opacity: 0, y: 35, filter: 'blur(9px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.82, ease: revealEase } } }}>
                From rough idea to <em>useful software.</em>
              </motion.h1>
              <motion.p className="hero-intro" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}>
                I design and build websites, portals, booking flows, payment systems, and custom tools that help small businesses move with less friction.
              </motion.p>
              <motion.div className="hero-actions" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.62 } } }}>
                <a className="button button-primary" href="#contact">Start a project <ArrowUpRight size={18} /></a>
                <a className="text-link" href="#services">See what I build <ArrowDown size={17} /></a>
              </motion.div>
            </motion.div>
          </div>
          <HeroSignalBoard />
          <div className="hero-proof" aria-label="Core technologies and approach">
            <span>STRATEGY TO LAUNCH</span>
            <div>{['React', 'TypeScript', 'Firebase', 'Stripe', 'Vercel'].map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </section>

        <section className="signal-section page-frame" data-ambient-scene="1">
          <Reveal className="signal-section__lead">
            <p className="section-kicker">THE REAL OPPORTUNITY</p>
            <h2>Your website should do more than <span>exist.</span></h2>
          </Reveal>
          <Reveal className="signal-section__copy" delay={0.08}>
            <p>It should explain your value, earn trust, collect the right information, and make the next step feel easy.</p>
            <div className="signal-outcomes">
              <span>Less admin work</span><span>Better-qualified leads</span><span>A clearer customer journey</span>
            </div>
          </Reveal>
        </section>

        <section className="services-section page-frame" id="services" data-ambient-scene="2">
          <Reveal className="section-heading">
            <div><p className="section-kicker">WHAT I BUILD</p><h2>Digital experiences with a job to do.</h2></div>
            <p>Start with the outcome. I will help decide the right experience, system, and first version to get you there.</p>
          </Reveal>
          <div className="services-grid">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.article
                  className={`service-card service-card--${index + 1}`}
                  key={service.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 38 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={revealViewport}
                  transition={{ duration: 0.65, delay: index * 0.07, ease: revealEase }}
                >
                  <div className="service-card__meta"><span>{service.number}</span><Icon size={22} /></div>
                  <p className="service-card__tag">{service.tag}</p>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>{service.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
                </motion.article>
              )
            })}
          </div>
          <Reveal className="capability-ribbon" delay={0.1}>
            <div><ShieldCheck size={19} /><span>Secure authentication</span></div>
            <div><Gauge size={19} /><span>Dashboards + analytics</span></div>
            <div><MessageSquareMore size={19} /><span>Email + API integrations</span></div>
            <div><Sparkles size={19} /><span>Automation + AI</span></div>
          </Reveal>
        </section>

        <section className="packages-section page-frame" id="packages" data-ambient-scene="3">
          <Reveal className="section-heading packages-heading">
            <div><p className="section-kicker">CLEAR STARTING POINTS</p><h2>Choose the size of the first move.</h2></div>
            <p>These packages create a practical baseline. Your final proposal is tailored to the work you actually need.</p>
          </Reveal>
          <div className="packages-grid">
            {packages.map((item, index) => (
              <Reveal className={`package-card${item.featured ? ' is-featured' : ''}`} delay={index * 0.08} key={item.name}>
                {item.featured && <span className="package-badge">MOST POPULAR</span>}
                <p className="package-index">0{index + 1} / {item.timeline}</p>
                <h3>{item.name}</h3>
                <strong className="package-price">{item.price}</strong>
                <p>{item.note}</p>
                <ul>{item.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                <a href="#contact">Talk about this package <ArrowRight size={17} /></a>
              </Reveal>
            ))}
          </div>
          <Reveal className="care-strip">
            <span>AFTER LAUNCH</span><strong>Care & Growth</strong><p>Ongoing updates, support, and measured improvements.</p><b>From $150/mo</b>
          </Reveal>
        </section>

        <section className="process-section page-frame" id="process" data-ambient-scene="4">
          <Reveal className="process-intro">
            <p className="section-kicker">THE BUILD PATH</p>
            <h2>A calm process from first conversation to launch.</h2>
            <p>You work directly with the person designing and building the product. No handoff maze. No mystery layer.</p>
          </Reveal>
          <div className="process-list">
            {process.map((item, index) => (
              <motion.article
                key={item.number}
                initial={reduceMotion ? false : { opacity: 0, x: 34 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={revealViewport}
                transition={{ duration: 0.6, delay: index * 0.08, ease: revealEase }}
              >
                <span className="process-number">{item.number}</span><p>{item.label}</p><h3>{item.title}</h3><small>{item.copy}</small>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="about-section page-frame" id="about" data-ambient-scene="5">
          <Reveal className="about-visual">
            <div className="about-system-art" aria-hidden="true">
              <span className="about-system-art__grid" />
              <span className="about-system-art__orbit about-system-art__orbit--one" />
              <span className="about-system-art__orbit about-system-art__orbit--two" />
              <span className="about-system-art__module about-system-art__module--strategy"><i>01</i><b>STRATEGY</b></span>
              <span className="about-system-art__module about-system-art__module--design"><i>02</i><b>DESIGN</b></span>
              <span className="about-system-art__module about-system-art__module--build"><i>03</i><b>BUILD</b></span>
              <span className="about-system-art__node about-system-art__node--one" />
              <span className="about-system-art__node about-system-art__node--two" />
              <span className="about-system-art__node about-system-art__node--three" />
            </div>
            <span className="about-stamp">SAN ANTONIO<br />TEXAS</span>
          </Reveal>
          <Reveal className="about-copy" delay={0.08}>
            <p className="section-kicker">THE PERSON BEHIND THE BUILD</p>
            <h2>Thoughtful software. Straightforward collaboration.</h2>
            <p className="about-lead">I’m Rafa, a full-stack developer who likes understanding how a business works before writing the first line of code.</p>
            <p>My projects have included marketplaces, booking platforms, payment systems, dashboards, portals, analytics tools, and custom operations software.</p>
            <p>I will listen, ask useful questions, explain decisions clearly, and keep you close to the work while we build something that makes day-to-day business easier.</p>
            <a className="text-link" href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer"><FaInstagram /> Follow @rafathedev <ArrowUpRight size={16} /></a>
          </Reveal>
        </section>

        <section className="faq-section page-frame" data-ambient-scene="6">
          <Reveal className="faq-heading"><p className="section-kicker">BEFORE WE BEGIN</p><h2>Questions are part of the process.</h2></Reveal>
          <Reveal className="faq-list" delay={0.08}>{faqs.map((faq, index) => <FaqItem key={faq.question} faq={faq} index={index} />)}</Reveal>
        </section>

        <section className="contact-section page-frame" id="contact" data-ambient-scene="7">
          <Reveal className="contact-copy">
            <p className="section-kicker">START WITH THE IDEA</p>
            <h2>What would make your business easier to run?</h2>
            <p>Tell me where you are now and what you want to improve. You do not need a technical plan—I will help shape the right next step.</p>
            <div className="contact-note"><span>NO PRESSURE</span><p>A clear conversation first. A scoped proposal only if the fit makes sense.</p></div>
          </Reveal>
          <Reveal className="inquiry-panel" delay={0.1}>
            <AnimatePresence mode="wait" initial={false}>
              {!briefReady ? (
                <motion.form key="inquiry-form" onSubmit={buildBrief} aria-busy={isSubmittingBrief} initial={reduceMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}>
                  <div className="form-intro"><span>PROJECT INQUIRY</span><p>Fields marked * are required.</p></div>
                  <div className="form-row">
                    <label>Your name <span>*</span><input name="name" type="text" autoComplete="name" required placeholder="Name" /></label>
                    <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
                  </div>
                  <label>Business or organization<input name="business" type="text" autoComplete="organization" placeholder="Company name" /></label>
                  <fieldset><legend>What do you need?</legend><div className="choice-grid">{projectTypes.map((type) => <label className="choice" key={type}><input type="checkbox" name="capabilities" value={type} /><span>{type}</span></label>)}</div></fieldset>
                  <label>What are you trying to build or improve? <span>*</span><textarea name="message" required rows={5} placeholder="Tell me about the problem, your current process, and what a better outcome would look like." /></label>
                  <div className="form-row">
                    <label>Desired timing<select name="timing" defaultValue=""><option value="" disabled>Select timing</option><option>As soon as possible</option><option>Within 1–2 months</option><option>Within 3–6 months</option><option>Still exploring</option></select></label>
                    <label>Approximate budget<select name="budget" defaultValue=""><option value="" disabled>Select range</option>{PROJECT_BUDGET_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
                  </div>
                  <button className="button button-primary form-submit" type="submit" disabled={isSubmittingBrief}>{isSubmittingBrief ? 'Sending your project...' : 'Send my project inquiry'}<ArrowUpRight size={18} /></button>
                  {briefSubmitError && <p className="form-error" role="alert">{briefSubmitError}</p>}
                  <p className="form-disclaimer">No account required. Your details are securely submitted so I can follow up.</p>
                </motion.form>
              ) : (
                <motion.div key="brief-ready" className="brief-ready" aria-live="polite" initial={reduceMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="success-icon"><Check size={26} /></div><p className="section-kicker">YOUR PROJECT WAS RECEIVED</p><h3>Thanks for sharing your idea.</h3>
                  <p>Your details are saved and ready for review. I will read through the project and follow up shortly.</p>
                  <textarea value={projectBrief} readOnly rows={10} aria-label="Generated project brief" />
                  <div className="brief-actions"><button className="button button-secondary" type="button" onClick={copyBrief}>{briefCopied ? <Check size={18} /> : <Copy size={18} />}{briefCopied ? 'Copied' : 'Copy project brief'}</button><a className="button button-primary" href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer"><FaInstagram /> Open Instagram</a></div>
                  <button className="start-over" type="button" onClick={() => setBriefReady(false)}>Submit another project</button>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer page-frame">
        <div className="footer-callout"><p>READY WHEN YOU ARE</p><h2>Let’s make the next useful thing.</h2><a className="button button-primary" href="#contact">Start a project <ArrowUpRight size={18} /></a></div>
        <div className="footer-grid">
          <Link className="brand footer-brand" to="/#top"><span className="brand-mark">R</span><span className="brand-copy"><strong>RAFA / THE DEV</strong><small>DESIGN · CODE · LAUNCH</small></span></Link>
          <div className="footer-links"><a href="#services">Services</a><a href="#packages">Packages</a><a href="#process">Process</a><a href="#about">About</a><Link to="/free-website">Free website</Link></div>
          <a className="footer-instagram" href="https://www.instagram.com/rafathedev/" target="_blank" rel="noreferrer"><FaInstagram /> @rafathedev <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Rafa the Dev</p><p>Development services provided by Devnetiks LLC.</p></div>
      </footer>
    </div>
  )
}

export default App
