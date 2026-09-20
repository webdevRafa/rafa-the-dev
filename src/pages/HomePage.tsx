import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HomePage.css'

gsap.registerPlugin(ScrollTrigger)
const colors = [
  { name: 'Magenta', value: '#ed168e', light: '#ffc9ee', dark: '#64023e' },
  { name: 'Blue', value: '#405ff6', light: '#c9e9ff', dark: '#14145e' },
  { name: 'Orange', value: '#f47827', light: '#ffe7af', dark: '#702000' },
]

export default function HomePage() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const demo = useRef<HTMLElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [color, setColor] = useState(0)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root.current!)
      gsap.set(demo.current, { autoAlpha: 0, clipPath: 'inset(36% 42% round 24px)' })
      gsap.set(select('.playground-content'), { scale: .32, opacity: .6 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage.current, start: 'top top', end: () => `+=${window.innerHeight * 1.6}`,
          pin: true, scrub: .55, anticipatePin: 1, invalidateOnRefresh: true,
        },
        onUpdate: () => setReady(tl.progress() > .94),
      })
      timeline.current = tl
      tl.to(select('.intro-description, .scroll-invitation'), { autoAlpha: 0, y: -18, duration: .18 }, .04)
        .to(select('.intro-brand'), { opacity: 0, y: -30, duration: .25 }, .12)
        .to(select('.word-front'), { x: () => -window.innerWidth * .65, opacity: 0, duration: .5, ease: 'power2.inOut' }, .16)
        .to(select('.word-developer'), { x: () => window.innerWidth * .65, opacity: 0, duration: .5, ease: 'power2.inOut' }, .16)
        .to(demo.current, { autoAlpha: 1, duration: .15 }, .25)
        .to(demo.current, { clipPath: 'inset(0% 0% round 0px)', duration: .6, ease: 'power2.inOut' }, .42)
        .to(select('.playground-content'), { scale: 1, opacity: 1, duration: .6, ease: 'power2.inOut' }, .42)
        .fromTo(select('.playground-meta'), { opacity: 0 }, { opacity: 1, duration: .18 }, .85)
      let active = true
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh() })
      return () => { active = false; timeline.current = null }
    }, root)
    return () => media.revert()
  }, [])

  const enter = () => {
    const trigger = timeline.current?.scrollTrigger
    if (trigger) window.scrollTo({ top: trigger.end, behavior: 'auto' })
    else demo.current?.scrollIntoView({ behavior: 'auto' })
  }
  const palette = colors[color]
  return (
    <main className="scroll-showcase" ref={root}>
      <div className="showcase-stage" ref={stage}>
        <section className="showcase-intro" aria-labelledby="intro-heading">
          <div className="intro-copy">
            <p className="intro-brand"><span aria-hidden="true">@</span> rafathedev</p>
            <h1 id="intro-heading" className="intro-heading"><span className="word-front">FRONTEND</span>{' '}<span className="word-developer">DEVELOPER</span></h1>
            <p className="intro-description">I build interactive experiences for the web.</p>
          </div>
          <button className="scroll-invitation" onClick={enter}>Scroll to explore <span aria-hidden="true">↓</span></button>
        </section>
        <section ref={demo} className={`showcase-playground${ready ? ' is-ready' : ''}`} aria-labelledby="playground-heading" style={{ '--orb-color': palette.value, '--orb-light': palette.light, '--orb-dark': palette.dark } as CSSProperties}>
          <div className="playground-meta"><span>rafathedev / experiments</span><span>01 — Color & motion</span></div>
          <div className="playground-content">
            <p className="playground-eyebrow">A little less static.</p>
            <h2 id="playground-heading">Make it yours.</h2>
            <p className="playground-description">A simple idea. A different feeling. Pick a color.</p>
            <div className="orb-scene" aria-hidden="true"><div className="color-orb" /><div className="orb-shadow" /></div>
            <div className="color-controls" role="group" aria-label="Choose a color">
              {colors.map((item, i) => <button key={item.name} aria-label={item.name} aria-pressed={color === i} onClick={() => setColor(i)} style={{ '--swatch': item.value } as CSSProperties}><span /></button>)}
            </div>
            <p className="color-name" aria-live="polite">{palette.name}</p>
          </div>
          <p className="playground-footer playground-meta">Small details. Real interaction. <span>Scroll back to replay ↑</span></p>
        </section>
      </div>
    </main>
  )
}
