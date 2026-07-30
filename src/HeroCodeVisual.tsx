import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import Typed from 'typed.js'

const codeSnippets = [
  `<span class="syntax-punctuation">&lt;</span><span class="syntax-component">BusinessWebsite</span>
  <span class="syntax-property">message</span><span class="syntax-operator">=</span><span class="syntax-string">"clear and useful"</span>
  <span class="syntax-property">speed</span><span class="syntax-operator">=</span><span class="syntax-string">"fast on every screen"</span>
  <span class="syntax-property">goal</span><span class="syntax-operator">=</span><span class="syntax-string">"turn visits into leads"</span>
<span class="syntax-punctuation">/&gt;</span>`,
  `<span class="syntax-punctuation">&lt;</span><span class="syntax-component">BookingFlow</span>
  <span class="syntax-property">availability</span><span class="syntax-operator">=</span><span class="syntax-string">"always accurate"</span>
  <span class="syntax-property">reminders</span><span class="syntax-operator">=</span><span class="syntax-string">"automatic"</span>
  <span class="syntax-property">checkout</span><span class="syntax-operator">=</span><span class="syntax-string">"simple for customers"</span>
<span class="syntax-punctuation">/&gt;</span>`,
  `<span class="syntax-punctuation">&lt;</span><span class="syntax-component">ClientPortal</span>
  <span class="syntax-property">access</span><span class="syntax-operator">=</span><span class="syntax-string">"secure and effortless"</span>
  <span class="syntax-property">dashboard</span><span class="syntax-operator">=</span><span class="syntax-string">"everything in one place"</span>
  <span class="syntax-property">result</span><span class="syntax-operator">=</span><span class="syntax-string">"less admin, more momentum"</span>
<span class="syntax-punctuation">/&gt;</span>`,
  `<span class="syntax-punctuation">&lt;</span><span class="syntax-component">BusinessSystem</span>
  <span class="syntax-property">connects</span><span class="syntax-operator">=</span><span class="syntax-expression">{["bookings", "payments"]}</span>
  <span class="syntax-property">automates</span><span class="syntax-operator">=</span><span class="syntax-string">"the repetitive work"</span>
  <span class="syntax-property">outcome</span><span class="syntax-operator">=</span><span class="syntax-string">"a business that runs better"</span>
<span class="syntax-punctuation">/&gt;</span>`,
]

function HeroCodeVisual() {
  const typedTargetRef = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const target = typedTargetRef.current
    if (!target) return

    if (reduceMotion) {
      target.innerHTML = codeSnippets[0]
      return () => {
        target.replaceChildren()
      }
    }

    const typed = new Typed(target, {
      strings: codeSnippets,
      typeSpeed: 17,
      startDelay: 500,
      backSpeed: 8,
      backDelay: 2400,
      smartBackspace: false,
      loop: true,
      showCursor: true,
      cursorChar: '▋',
      autoInsertCss: false,
      contentType: 'html',
    })

    return () => typed.destroy()
  }, [reduceMotion])

  return (
    <>
      <div className="code-editor-topbar" aria-hidden="true">
        <div className="code-window-controls">
          <span />
          <span />
          <span />
        </div>
        <div className="code-file-tab">
          <span className="code-file-icon">&lt;&gt;</span>
          solution.tsx
        </div>
      </div>

      <div className="code-editor-body" aria-hidden="true">
        <div className="code-line-numbers">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre className="code-stage">
          <code>
            <span ref={typedTargetRef} />
          </code>
        </pre>
      </div>

      <p className="visually-hidden">
        Custom websites and software designed to make bookings, payments, customer
        portals, and everyday business operations easier.
      </p>
    </>
  )
}

export default HeroCodeVisual
