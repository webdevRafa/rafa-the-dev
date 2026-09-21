import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SkyScene from './SkyScene'
import { addCityLighting } from './cityTimeline'
import './HomePage.css'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root.current!)
      gsap.set(scene.current, { autoAlpha: 0, clipPath: 'inset(36% 42% round 24px)' })
      gsap.set(select('.sky-copy'), { scale: .4, opacity: 0 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'home-sky', trigger: stage.current, start: 'top top',
          end: () => `+=${window.innerHeight * 4.5}`,
          pin: true, pinSpacing: true, scrub: .85, anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      timeline.current = tl
      // One reversible timeline: intro reveal, daylight, sunset, night, then release.
      // Future sections belong AFTER showcase-stage, outside the pinned container.
      tl.to(select('.intro-description, .scroll-invitation'), { autoAlpha: 0, y: -18, duration: .18 }, .04)
        .to(select('.intro-brand'), { autoAlpha: 0, y: -30, duration: .25 }, .12)
        .to(select('.word-front'), { x: () => -window.innerWidth * .65, opacity: 0, duration: .5, ease: 'power2.inOut' }, .16)
        .to(select('.word-developer'), { x: () => window.innerWidth * .65, opacity: 0, duration: .5, ease: 'power2.inOut' }, .16)
        .to(scene.current, { autoAlpha: 1, duration: .15 }, .25)
        .to(scene.current, { clipPath: 'inset(0% 0% round 0px)', duration: .6, ease: 'power2.inOut' }, .42)
        .to(select('.sky-copy'), { scale: 1, opacity: 1, duration: .55, ease: 'power2.out' }, .52)

      addCityLighting(tl, scene.current!, select)

      let active = true
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh() })
      return () => { active = false; timeline.current = null }
    }, root)
    return () => media.revert()
  }, [])

  const enter = () => {
    const trigger = timeline.current?.scrollTrigger
    if (trigger) window.scrollTo({ top: trigger.labelToScroll('day'), behavior: 'auto' })
    else scene.current?.scrollIntoView({ behavior: 'auto' })
  }

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
        <section ref={scene} className="sky-section" aria-labelledby="sky-heading">
          <SkyScene />
          <div className="sky-copy">
            <p className="sky-eyebrow">Design in motion</p>
            <h2 id="sky-heading">I bring interfaces<br />to life.</h2>
            <p className="sky-description">Through motion, interaction, and the details that make a website feel good to use.</p>
          </div>
        </section>
      </div>
      {/* Add section three here in normal document flow, not inside showcase-stage. */}
    </main>
  )
}
