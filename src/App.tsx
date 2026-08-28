import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Gauge,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./App.css";
import AmbientVectorField from "./AmbientVectorField";
import CommerceExperience from "./CommerceExperience";
import {
  parseProjectBudget,
  PROJECT_BUDGET_OPTIONS,
} from "./projectInquiryOptions";

// Preserved for a future section. Set this to true when the capability ribbon returns.
const SHOW_CAPABILITY_RIBBON = false;
const capabilityHighlights = [
  { label: "Secure authentication", icon: ShieldCheck },
  { label: "Dashboards + analytics", icon: Gauge },
  { label: "Email + API integrations", icon: MessageSquareMore },
  { label: "Automation + AI", icon: Sparkles },
];

const process = [
  {
    number: "01",
    label: "Discover",
    title: "Understand how your business works.",
    copy: "We look at your day-to-day operations, the people involved, and where a better system can remove friction.",
  },
  {
    number: "02",
    label: "Design",
    title: "Design around your real operations.",
    copy: "I turn what we learn into clear workflows, useful features, and an experience that fits the way your team works.",
  },
  {
    number: "03",
    label: "Build",
    title: "Build the system together.",
    copy: "I develop the product in working stages, share progress, and make thoughtful adjustments as it comes to life.",
  },
  {
    number: "04",
    label: "Launch",
    title: "Test thoroughly. Launch confidently.",
    copy: "I test the complete experience, connect the final details, and make sure the system is ready for real use.",
  },
];

const faqs = [
  {
    question: "Do I need a complete plan before we start?",
    answer:
      "No. Bring me the problem, goal, or rough idea. I will ask the right questions and help define the right first version before development begins.",
  },
  {
    question: "How much will my project cost?",
    answer:
      "Every project is quoted individually. After I review your goals, scope, timing, and any integrations, I will follow up with questions if needed and send a clear proposal with exact pricing.",
  },
  {
    question: "Will I be able to update the site later?",
    answer:
      "Yes. I choose the editing approach around what you need to maintain. If you want ongoing help after launch, we can shape support around what the project actually needs.",
  },
  {
    question: "What happens after launch?",
    answer:
      "I make sure everything is deployed and working as expected. From there, we can arrange ongoing support or plan the next useful improvement when the business needs it.",
  },
];

const revealEase = [0.22, 1, 0.36, 1] as const;
const revealViewport = { once: true, amount: 0.14 } as const;
const PROJECT_TIMING_OPTIONS = [
  "As soon as possible",
  "Within 1–2 months",
  "Within 3–6 months",
  "Still exploring",
] as const;

function Reveal({
  children,
  className,
  delay = 0,
  distance = 34,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();
  const shouldSkipAnimation = Boolean(reduceMotion);

  return (
    <motion.div
      className={className}
      initial={
        shouldSkipAnimation ? false : { opacity: 0, y: distance }
      }
      whileInView={
        shouldSkipAnimation ? undefined : { opacity: 1, y: 0 }
      }
      viewport={revealViewport}
      transition={{
        duration: shouldSkipAnimation ? 0 : 0.72,
        delay: shouldSkipAnimation ? 0 : delay,
        ease: revealEase,
      }}
    >
      {children}
    </motion.div>
  );
}

function FaqItem({
  faq,
  index,
}: {
  faq: (typeof faqs)[number];
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const reduceMotion = useReducedMotion();
  const questionId = `faq-question-${index}`;
  const answerId = `faq-answer-${index}`;

  return (
    <div className={`faq-item${isOpen ? " is-open" : ""}`}>
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
        <motion.i
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
        >
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
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: revealEase }}
          >
            <p>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomSelect({
  label,
  name,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectId = useId();
  const reduceMotion = useReducedMotion();
  const selectedIndex = options.indexOf(value);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isOpen]);

  const openMenu = (preferredIndex = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(preferredIndex);
    setIsOpen(true);
  };

  const selectOption = (option: string) => {
    setValue(option);
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(
        event.key === "ArrowUp"
          ? selectedIndex >= 0
            ? selectedIndex
            : options.length - 1
          : selectedIndex >= 0
            ? selectedIndex
            : 0
      );
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(options[index]);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`custom-select${isOpen ? " is-open" : ""}`}
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <span className="custom-select__label" id={`${selectId}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} readOnly />
      <button
        className={`custom-select__trigger${value ? "" : " is-placeholder"}`}
        id={`${selectId}-trigger`}
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        aria-labelledby={`${selectId}-label ${selectId}-trigger`}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{value || placeholder}</span>
        <motion.span
          className="custom-select__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select__menu"
            id={`${selectId}-listbox`}
            role="listbox"
            aria-labelledby={`${selectId}-label`}
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {options.map((option, index) => (
              <button
                className={`custom-select__option${value === option ? " is-selected" : ""}`}
                key={option}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span>{option}</span>
                {value === option && <Check size={15} aria-hidden="true" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [briefReady, setBriefReady] = useState(false);
  const [briefCopied, setBriefCopied] = useState(false);
  const [projectBrief, setProjectBrief] = useState("");
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);
  const [briefSubmitError, setBriefSubmitError] = useState("");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  const buildBrief = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingBrief) return;

    const form = new FormData(event.currentTarget);
    const getValue = (name: string) => String(form.get(name) ?? "");
    const budget = parseProjectBudget(getValue("budget"));
    const brief = [
      "PROJECT INQUIRY — RAFATHEDEV.COM",
      "",
      `Name: ${getValue("name")}`,
      `Email: ${getValue("email")}`,
      `Business: ${getValue("business") || "Not provided"}`,
      `Timing: ${getValue("timing") || "Not provided"}`,
      `Budget: ${budget || "Not provided"}`,
      "",
      "What I want to build or improve:",
      getValue("message"),
      "",
      "Lead source: rafathedev",
    ].join("\n");

    setIsSubmittingBrief(true);
    setBriefSubmitError("");
    try {
      const { submitProjectInquiry } = await import("./firebase/submissions");
      await submitProjectInquiry({
        name: getValue("name"),
        email: getValue("email"),
        business: getValue("business"),
        message: getValue("message"),
        timing: getValue("timing"),
        budget,
      });
      setProjectBrief(brief);
      setBriefReady(true);
      setBriefCopied(false);
    } catch (error) {
      console.error("Unable to save project inquiry.", error);
      setBriefSubmitError(
        "Your project could not be sent right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmittingBrief(false);
    }
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(projectBrief);
      setBriefCopied(true);
    } catch {
      setBriefCopied(false);
    }
  };

  return (
    <div className="site-shell public-site-shell">
      {!reduceMotion && (
        <motion.div
          className="scroll-progress"
          style={{ scaleX: smoothScrollProgress }}
          aria-hidden="true"
        />
      )}
      <AmbientVectorField />
      <main id="main">
        <section
          className="hero-section page-frame"
          id="top"
          data-ambient-scene="0"
        >
          <div className="hero-copy">
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.09, delayChildren: 0.12 },
                },
              }}
            >
              <motion.p
                className="eyebrow"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
                }}
              >
                <span /> Full-stack developer · San Antonio
              </motion.p>
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 35, filter: "blur(9px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.82, ease: revealEase },
                  },
                }}
              >
                Websites and systems that <span>elevate your business.</span>
              </motion.h1>
              <motion.p
                className="hero-intro"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
                }}
              >
                I design and build websites, portals, booking flows, payment
                systems, and custom tools that make life a whole lot easier for
                small business owners.
              </motion.p>
              <motion.div
                className="hero-actions"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.62 } },
                }}
              >
                <a
                  className="button button-primary hero-primary-cta"
                  href="#contact"
                >
                  Start a project <ArrowUpRight size={18} />
                </a>
                <a className="text-link" href="#process">
                  See how I work <ArrowDown size={17} />
                </a>
              </motion.div>
            </motion.div>
          </div>
          <div className="hero-proof" aria-label="Core technologies">
            <span>THE STACK BEHIND THE WORK</span>
            <div>
              {["React", "TypeScript", "Firebase", "Stripe", "Vercel"].map(
                (item) => (
                  <span key={item}>{item}</span>
                )
              )}
            </div>
          </div>
        </section>

        <section className="signal-section page-frame" data-ambient-scene="1">
          <Reveal className="signal-section__lead">
            <p className="section-kicker">THE REAL OPPORTUNITY</p>
            <h2>
              Your website should do more than <span>exist.</span>
            </h2>
          </Reveal>
          <Reveal className="signal-section__copy" delay={0.08}>
            <p>
              It should explain your value, earn trust, collect the right
              information, and make the next step feel easy.
            </p>
            <div className="signal-outcomes">
              <span>Less admin work</span>
              <span>Better-qualified leads</span>
              <span>A clearer customer journey</span>
            </div>
          </Reveal>
        </section>

        <CommerceExperience />

        {SHOW_CAPABILITY_RIBBON && (
          <section className="capability-reserve page-frame" aria-label="Technical capabilities">
            <Reveal className="capability-ribbon" delay={0.1}>
              {capabilityHighlights.map(({ label, icon: Icon }) => (
                <div key={label}>
                  <Icon size={19} aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </Reveal>
          </section>
        )}

        <section
          className="process-section page-frame"
          id="process"
          data-ambient-scene="5"
        >
          <Reveal className="process-intro">
            <p className="section-kicker">TAILORED SOFTWARE FOR YOUR BUSINESS</p>
            <h2>Software designed for your operation—not a generic template.</h2>
            <p>
              You’ll work directly with Rafa to plan and build a system around
              the way your business actually operates.
            </p>
          </Reveal>
          <div className="process-list">
            {process.map((item, index) => (
              <motion.article
                key={item.number}
                initial={reduceMotion ? false : { opacity: 0, x: 34 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={revealViewport}
              transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: revealEase,
                }}
              >
                <p>{item.label}</p>
                <h3>{item.title}</h3>
                <small>{item.copy}</small>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          className="about-section page-frame"
          id="about"
          data-ambient-scene="6"
        >
          <Reveal className="about-aside">
            <p className="section-kicker">THE PERSON BEHIND THE BUILD</p>
            <div className="about-facts" aria-label="About Rafa">
              <div>
                <span>BASED IN</span>
                <strong>San Antonio, Texas</strong>
              </div>
              <div>
                <span>WORKING STYLE</span>
                <strong>Direct collaboration</strong>
              </div>
              <div>
                <span>APPROACH</span>
                <strong>Business-first thinking</strong>
              </div>
            </div>
          </Reveal>
          <Reveal className="about-copy" delay={0.08}>
            <h2>I’m Rafa, a full-stack developer.</h2>
            <p className="about-lead">
              I have a passion for understanding how a business works and
              building systems around the way people actually work.
            </p>
            <p>
              That has led me to create marketplaces, booking platforms,
              payment systems, dashboards, portals, analytics tools, and custom
              operations software.
            </p>
            <p>
              I keep the process direct and collaborative: I listen, ask useful
              questions, explain decisions clearly, and keep you close to the
              work from the first idea through launch.
            </p>
            <a
              className="text-link"
              href="https://www.instagram.com/rafathedev/"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram /> Follow @rafathedev <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </section>

        <section className="faq-section page-frame" data-ambient-scene="7">
          <Reveal className="faq-heading">
            <p className="section-kicker">BEFORE WE BEGIN</p>
            <h2>Questions are part of the process.</h2>
          </Reveal>
          <Reveal className="faq-list" delay={0.08}>
            {faqs.map((faq, index) => (
              <FaqItem key={faq.question} faq={faq} index={index} />
            ))}
          </Reveal>
        </section>

        <section
          className="contact-section page-frame"
          id="contact"
          data-ambient-scene="7"
        >
          <Reveal className="contact-copy">
            <p className="section-kicker">SHARE YOUR IDEA</p>
            <h2>What would make your business easier to run?</h2>
            <p>
              Tell me where you are now and what you want to improve or build.
              You don’t need a technical plan—I’ll turn your ideas into working
              software.
            </p>
            <div className="contact-note">
              <span>NO PRESSURE</span>
              <p>
                Start with a free consultation. I’ll follow up with a clear
                proposal, and you only pay once the system is complete and
                you’re happy with the result. No obligation.
              </p>
            </div>
          </Reveal>
          <Reveal className="inquiry-panel" delay={0.1}>
            <AnimatePresence mode="wait" initial={false}>
              {!briefReady ? (
                <motion.form
                  key="inquiry-form"
                  onSubmit={buildBrief}
                  aria-busy={isSubmittingBrief}
                  initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                >
                  <div className="form-intro">
                    <span>PROJECT INQUIRY</span>
                    <p>Fields marked * are required.</p>
                  </div>
                  <div className="form-row">
                    <label>
                      Your name <span>*</span>
                      <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Name"
                      />
                    </label>
                    <label>
                      Email address <span>*</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@company.com"
                      />
                    </label>
                  </div>
                  <label>
                    Business or organization
                    <input
                      name="business"
                      type="text"
                      autoComplete="organization"
                      placeholder="Company name"
                    />
                  </label>
                  <label>
                    What are you trying to build or improve? <span>*</span>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell me about the problem, your current process, and what a better outcome would look like."
                    />
                  </label>
                  <div className="form-row">
                    <CustomSelect
                      label="Desired timing"
                      name="timing"
                      options={PROJECT_TIMING_OPTIONS}
                      placeholder="Select timing"
                    />
                    <CustomSelect
                      label="Approximate budget"
                      name="budget"
                      options={PROJECT_BUDGET_OPTIONS}
                      placeholder="Select range"
                    />
                  </div>
                  <button
                    className="button button-primary form-submit"
                    type="submit"
                    disabled={isSubmittingBrief}
                  >
                    {isSubmittingBrief
                      ? "Sending your project..."
                      : "Request my custom quote"}
                    <ArrowUpRight size={18} />
                  </button>
                  {briefSubmitError && (
                    <p className="form-error" role="alert">
                      {briefSubmitError}
                    </p>
                  )}
                  <p className="form-disclaimer">
                    No account or payment required. I’ll review your details and
                    follow up with a custom quote.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="brief-ready"
                  className="brief-ready"
                  aria-live="polite"
                  initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="success-icon">
                    <Check size={26} />
                  </div>
                  <p className="section-kicker">YOUR PROJECT WAS RECEIVED</p>
                  <h3>Thanks for sharing your idea.</h3>
                  <p>
                    Your details are saved and ready for review. I’ll evaluate
                    the scope and follow up with any questions and a custom quote.
                  </p>
                  <textarea
                    value={projectBrief}
                    readOnly
                    rows={10}
                    aria-label="Generated project brief"
                  />
                  <div className="brief-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={copyBrief}
                    >
                      {briefCopied ? <Check size={18} /> : <Copy size={18} />}
                      {briefCopied ? "Copied" : "Copy project brief"}
                    </button>
                    <a
                      className="button button-primary"
                      href="https://www.instagram.com/rafathedev/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaInstagram /> Open Instagram
                    </a>
                  </div>
                  <button
                    className="start-over"
                    type="button"
                    onClick={() => setBriefReady(false)}
                  >
                    Submit another project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer page-frame">
        <div className="footer-callout">
          <p>READY WHEN YOU ARE</p>
          <h2>Let’s make the next useful thing.</h2>
          <a className="button button-primary" href="#contact">
            Start a project <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="footer-grid">
          <Link className="brand footer-brand" to="/#top">
            <span className="brand-copy">
              <strong>RAFA THE DEV</strong>
            </span>
          </Link>
          <div className="footer-links">
            <a href="#process">Process</a>
            <a href="#about">About</a>
          </div>
          <a
            className="footer-instagram"
            href="https://www.instagram.com/rafathedev/"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram /> @rafathedev <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Rafa the Dev</p>
          <p>Development services provided by Devnetiks LLC.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
