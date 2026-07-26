import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
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
  Layers3,
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
    category: 'Operations software',
    description:
      'A roofing operations platform that brings job progress, scheduling, crews, payouts, invoices, materials, and financial reporting into one system.',
    tags: ['Job pipelines', 'Crew management', 'Reporting', 'Payout tracking'],
    accent: 'blue',
    cta: 'Private client system',
  },
  {
    index: '03',
    name: 'Rancho de Paloma Blanca',
    category: 'Reservation system',
    description:
      'A custom booking and payment experience built around limited hunting dates, daily capacity, party options, packages, and secure checkout.',
    tags: ['Capacity controls', 'Date-based pricing', 'Reservations', 'Online payments'],
    accent: 'sand',
    cta: 'Custom booking platform',
  },
  {
    index: '04',
    name: 'MMA Cortex',
    category: 'Analytics application',
    description:
      'A private analytics product organizing MMA events, fighter histories, betting lines, projections, and AI-assisted analysis.',
    tags: ['Structured data', 'AI workflows', 'Private access', 'Analytics'],
    accent: 'coral',
    cta: 'Private product',
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

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      R/
    </span>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [briefReady, setBriefReady] = useState(false)
  const [briefCopied, setBriefCopied] = useState(false)
  const [projectBrief, setProjectBrief] = useState('')

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
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between">
        <a className="brand inline-flex items-center no-underline" href="#top" aria-label="Rafa the Dev home">
          <LogoMark />
          <span className="brand-copy">
            <strong>RAFA THE DEV</strong>
            <small>FULL-STACK DEVELOPER</small>
          </span>
        </a>

        <nav className={`nav-links items-center ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#process" onClick={closeMenu}>Process</a>
          <a href="#about" onClick={closeMenu}>About</a>
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
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero-section mx-auto min-h-screen max-w-[1400px]" id="top">
          <div className="hero-grid grid items-center">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="status-dot" />
                Full-stack developer in San Antonio
              </p>
              <h1>
                I build software that helps businesses <em>run better.</em>
              </h1>
              <p className="hero-intro">
                Custom websites and software systems for businesses that need bookings,
                payments, portals, dashboards, and better operational tools.
              </p>
              <div className="hero-actions flex items-center">
                <a className="button button-primary" href="#contact">
                  Tell me about your project
                  <ArrowUpRight size={18} />
                </a>
                <a className="text-link" href="#work">
                  View my work
                  <ArrowDown size={17} />
                </a>
              </div>
            </div>

            <div className="system-visual" aria-label="Visual representation of an integrated business system">
              <div className="visual-topbar">
                <span>BUSINESS OS / LIVE</span>
                <span className="visual-status"><i /> All systems online</span>
              </div>
              <div className="visual-canvas">
                <div className="flow-card flow-card-main">
                  <small>NEW CUSTOMER</small>
                  <strong>Qualified lead captured</strong>
                  <div className="mini-progress"><span /></div>
                </div>
                <div className="flow-connector connector-one" />
                <div className="flow-connector connector-two" />
                <div className="flow-card flow-card-small flow-booking">
                  <CalendarCheck2 size={19} />
                  <span><small>BOOKING</small><strong>Confirmed</strong></span>
                  <Check size={15} />
                </div>
                <div className="flow-card flow-card-small flow-payment">
                  <CircleDollarSign size={19} />
                  <span><small>PAYMENT</small><strong>Processed</strong></span>
                  <Check size={15} />
                </div>
                <div className="flow-card flow-card-small flow-portal">
                  <Users size={19} />
                  <span><small>PORTAL</small><strong>Account ready</strong></span>
                  <Check size={15} />
                </div>
                <div className="visual-label visual-label-one">AUTOMATED</div>
                <div className="visual-label visual-label-two">ONE RELIABLE SYSTEM</div>
              </div>
            </div>
          </div>

          <div className="trust-strip flex items-center justify-between">
            <span>Built for real operations</span>
            <div className="tech-list" aria-label="Core technologies">
              <span>React</span>
              <span>TypeScript</span>
              <span>Firebase</span>
              <span>Stripe</span>
              <span>Vercel</span>
            </div>
          </div>
        </section>

        <section className="statement-section section mx-auto grid max-w-[1400px]">
          <div className="section-label">THE OPPORTUNITY</div>
          <div className="statement-copy">
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
          </div>
        </section>

        <section className="services-section section mx-auto max-w-[1400px]" id="services">
          <div className="section-heading grid items-end">
            <div>
              <p className="section-kicker">WHAT I BUILD</p>
              <h2>Software shaped around your business.</h2>
            </div>
            <p>
              From a focused marketing site to the system that runs your daily
              operation, every build starts with the outcome you need.
            </p>
          </div>

          <div className="services-grid grid md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <article className="service-card flex flex-col" key={service.title}>
                  <div className="service-card-top flex items-center justify-between">
                    <span>{service.number}</span>
                    <Icon size={23} strokeWidth={1.8} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.features.map((feature) => (
                      <li key={feature}><Check size={14} />{feature}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        <section className="work-section section mx-auto max-w-[1400px]" id="work">
          <div className="section-heading grid items-end">
            <div>
              <p className="section-kicker">SELECTED WORK</p>
              <h2>Systems designed around real problems.</h2>
            </div>
            <p>
              A few examples of how focused software can connect people, payments,
              information, and day-to-day operations.
            </p>
          </div>

          <div className="projects-list grid md:grid-cols-2">
            {projects.map((project) => (
              <article className={`project-card project-${project.accent} relative flex flex-col overflow-hidden`} key={project.name}>
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
                <div className="project-footer relative z-10 flex items-center justify-between">
                  <span>{project.cta}</span>
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Visit ${project.name}`}
                    >
                      <ArrowUpRight size={20} />
                    </a>
                  ) : (
                    <span className="project-private"><Layers3 size={18} /></span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities-section section mx-auto grid max-w-[1400px]">
          <div className="capability-intro">
            <p className="section-kicker">BEHIND THE SCREEN</p>
            <h2>The interface is only the beginning.</h2>
            <p>
              I build the underlying systems that make a product secure, reliable,
              and useful—from account permissions to payments and operational data.
            </p>
          </div>
          <div className="capabilities-grid grid md:grid-cols-2">
            {capabilities.map((capability) => {
              const Icon = capability.icon
              return (
                <div className="capability-item flex items-center" key={capability.label}>
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{capability.label}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="process-section section mx-auto max-w-[1400px]" id="process">
          <div className="section-heading grid items-end">
            <div>
              <p className="section-kicker">HOW WE GET THERE</p>
              <h2>A practical development process.</h2>
            </div>
            <p>
              Clear decisions, direct communication, and a focused first version
              keep the project moving toward a useful result.
            </p>
          </div>
          <div className="process-grid grid sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <article className="process-card" key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section section mx-auto grid max-w-[1400px] items-center" id="about">
          <div className="about-portrait" aria-hidden="true">
            <div className="portrait-code">
              <span>const builder = {'{'}</span>
              <span>&nbsp;&nbsp;name: 'Rafa',</span>
              <span>&nbsp;&nbsp;base: 'San Antonio',</span>
              <span>&nbsp;&nbsp;focus: 'useful software'</span>
              <span>{'}'}</span>
            </div>
            <div className="portrait-monogram">RC</div>
            <span className="portrait-caption">FOUNDER / BUILDER</span>
          </div>
          <div className="about-copy">
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
          </div>
        </section>

        <section className="fit-section section mx-auto grid max-w-[1400px]">
          <div className="section-label">A GOOD FIT</div>
          <div className="fit-content">
            <h2>For businesses that need more than a template.</h2>
            <div className="fit-list">
              {[
                'You have a web application idea but need help defining the right first version.',
                'Your team relies on spreadsheets, text messages, or repetitive manual work.',
                'Your customers need accounts, bookings, payments, or a private portal.',
                'Existing software does not match the way your business operates.',
                'You want to work directly with the developer building the product.',
              ].map((item) => (
                <div key={item}><Check size={17} /><span>{item}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section section mx-auto grid max-w-[1400px]">
          <div className="faq-heading">
            <p className="section-kicker">COMMON QUESTIONS</p>
            <h2>A few things clients usually ask.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={faq.question}>
                <summary>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {faq.question}
                  <i />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact-section section mx-auto grid max-w-[1400px]" id="contact">
          <div className="contact-copy">
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
          </div>

          <div className="inquiry-panel">
            {!briefReady ? (
              <form className="flex flex-col" onSubmit={buildBrief}>
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
              </form>
            ) : (
              <div className="brief-ready flex flex-col items-start justify-center" aria-live="polite">
                <div className="success-icon"><Check size={27} /></div>
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
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer mx-auto max-w-[1400px]">
        <div className="footer-top flex items-center justify-between">
          <a className="brand footer-brand inline-flex items-center no-underline" href="#top">
            <LogoMark />
            <span className="brand-copy">
              <strong>RAFA THE DEV</strong>
              <small>CUSTOM SOFTWARE FOR REAL BUSINESSES</small>
            </span>
          </a>
          <div className="footer-links flex flex-wrap justify-end">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
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
      </footer>
    </div>
  )
}

export default App
