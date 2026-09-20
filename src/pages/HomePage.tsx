import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SkyScene from './SkyScene'
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
          end: () => `+=${window.innerHeight * 4.2}`,
          pin: true, pinSpacing: true, scrub: .6, anticipatePin: 1,
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
        .fromTo(select('.sky-meta'), { opacity: 0 }, { opacity: 1, duration: .2 }, .9)
        .addLabel('day', 1.1)
        .to(select('.sky-sunset'), { opacity: 1, duration: 1.0 }, 1.35)
        .to(select('.sun-track'), { x: () => window.innerWidth * .08, y: () => stage.current!.clientHeight * .53, duration: 1.1, ease: 'power1.in' }, 1.3)
        .to(select('.sun'), { scale: .8, backgroundColor: '#ffd2a0', duration: .9 }, 1.45)
        .to(select('.clouds-near'), { xPercent: 9, opacity: .3, duration: 1.45 }, 1.15)
        .to(select('.clouds-far'), { xPercent: -6, opacity: .2, duration: 1.55 }, 1.15)
        .to(select('.ridge-back'), { fill: '#8e718f', duration: .9 }, 1.35)
        .to(select('.ridge-mid'), { fill: '#685f7b', duration: .9 }, 1.35)
        .to(select('.ridge-front'), { fill: '#464965', duration: .9 }, 1.35)
        .to(select('.water'), { fill: '#b0869d', duration: .9 }, 1.35)
        .to(select('.sun-reflection'), { opacity: .45, duration: .65 }, 1.55)
        .addLabel('sunset', 2.2)
        .to(select('.sky-night'), { opacity: 1, duration: .9 }, 2.25)
        .to(select('.sun-track, .sun-reflection'), { opacity: 0, duration: .3 }, 2.35)
        .to(scene.current, { color: '#f1f0fa', duration: .5 }, 2.25)
        .to(select('.ridge-back'), { fill: '#273550', duration: .9 }, 2.25)
        .to(select('.ridge-mid'), { fill: '#182a40', duration: .9 }, 2.25)
        .to(select('.ridge-front'), { fill: '#102035', duration: .9 }, 2.25)
        .to(select('.water'), { fill: '#172940', duration: .9 }, 2.25)
        .to(select('.shore'), { fill: '#0b1a2a', duration: .9 }, 2.25)
        .to(select('.snowcaps'), { opacity: .1, duration: .9 }, 2.25)
        .fromTo(select('.moon-track'), { y: 75, opacity: 0 }, { y: 0, opacity: 1, duration: .85, ease: 'power2.out' }, 2.55)
        .to(select('.stars'), { opacity: 1, duration: .7 }, 2.6)
        .to(select('.moon-reflection'), { opacity: .5, duration: .7 }, 2.65)
        .to(select('.cabin-light'), { opacity: 1, duration: .4, stagger: .055 }, 2.6)
        .to(select('.phase-day'), { opacity: 0, duration: .15 }, 1.7)
        .fromTo(select('.phase-sunset'), { opacity: 0 }, { opacity: 1, duration: .15 }, 1.85)
        .to(select('.phase-sunset'), { opacity: 0, duration: .15 }, 2.6)
        .fromTo(select('.phase-night'), { opacity: 0 }, { opacity: 1, duration: .2 }, 2.8)
        .fromTo(select('.sky-progress-fill'), { scaleX: 0 }, { scaleX: 1, duration: 2.4 }, 1.1)
        .addLabel('night', 3.35)
        .to({}, { duration: .3 })

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
          <div className="sky-meta sky-top"><span>rafathedev / experiments</span><span>01 — A change of atmosphere</span></div>
          <div className="sky-copy">
            <p className="sky-eyebrow">Design in motion</p>
            <h2 id="sky-heading">I bring interfaces<br />to life.</h2>
            <p className="sky-description">Through motion, interaction, and the details that make a website feel good to use.</p>
          </div>
          <div className="sky-meta sky-bottom">
            <div className="sky-phase" aria-hidden="true"><span className="phase-day">01 / Daylight</span><span className="phase-sunset">02 / Golden hour</span><span className="phase-night">03 / After hours</span></div>
            <div className="sky-scroll-note"><span>Keep scrolling. Watch it change.</span><div className="sky-progress" aria-hidden="true"><div className="sky-progress-fill" /></div></div>
          </div>
        </section>
      </div>
      {/* Add section three here in normal document flow, not inside showcase-stage. */}
    </main>
  )
}
