import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './InterfaceLayers.css'

gsap.registerPlugin(ScrollTrigger)

function LayerArtwork() {
  return (
    <svg className="interface-artwork" viewBox="0 0 520 420" aria-hidden="true">
      <defs>
        <linearGradient id="interface-surface" x2=".8" y2="1">
          <stop stopColor="#354763" /><stop offset="1" stopColor="#202d45" />
        </linearGradient>
        <linearGradient id="interface-accent" x2="1" y2="1">
          <stop stopColor="#c6f1e4" /><stop offset="1" stopColor="#76bfb9" />
        </linearGradient>
      </defs>
      <ellipse cx="258" cy="381" rx="116" ry="12" fill="#0c1425" opacity=".32" />
      <g className="interface-object">
        <g className="layer-structure" transform="translate(0 16)">
          <g transform="matrix(.82 .36 -.82 .36 258 210)">
            <rect x="-105" y="-80" width="210" height="160" rx="12" fill="#1c2b40" stroke="#65839e" strokeWidth="1.6" />
            <path d="M-85-40H85M-85 0H85M-85 40H85M-45-60V60M0-60V60M45-60V60" fill="none" stroke="#6b8ca8" strokeWidth="1" strokeDasharray="3 5" opacity=".55" />
            <rect x="-86" y="-60" width="172" height="120" rx="4" fill="none" stroke="#8daabf" strokeWidth="1.3" />
            {[-86, 86].flatMap(x => [-60, 60].map(y => <rect key={`${x}-${y}`} x={x-3} y={y-3} width="6" height="6" fill="#bed4df" />))}
          </g>
        </g>
        <g className="layer-interaction" transform="translate(0 8)">
          <g transform="matrix(.82 .36 -.82 .36 258 210)">
            <rect x="-105" y="-80" width="210" height="160" rx="12" fill="#26324a" stroke="#9d9bbf" strokeWidth="1.6" />
            <path d="M-61-32H0V32H61M0-32H61M-61 32H0" fill="none" stroke="#b5aed8" strokeWidth="2" />
            {[[-61,-32],[61,-32],[-61,32],[61,32]].map(([x,y]) => <g key={`${x}-${y}`}><rect x={x-17} y={y-13} width="34" height="26" rx="7" fill="#343f59" stroke="#b5aed8" /><circle cx={x} cy={y} r="3" fill="#d1c7eb" /></g>)}
            <circle r="8" fill="#b5aed8" /><circle r="3" fill="#26324a" />
          </g>
        </g>
        <g className="layer-polish">
          <g transform="matrix(.82 .36 -.82 .36 258 210)">
            <rect x="-105" y="-80" width="210" height="160" rx="12" fill="url(#interface-surface)" stroke="#a7c3d3" strokeWidth="1.6" />
            <path d="M-104-48H104" stroke="#839eb7" opacity=".45" />
            <g fill="#b4c6d8"><circle cx="-86" cy="-64" r="3" /><circle cx="-74" cy="-64" r="3" opacity=".6" /><circle cx="-62" cy="-64" r="3" opacity=".3" /></g>
            <rect x="-85" y="-29" width="66" height="87" rx="6" fill="#172438" />
            <path d="M-72 38l14-25 12 13 14-31" fill="none" stroke="#8dc9c5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="-65" cy="-12" r="5" fill="#b9e5db" opacity=".75" />
            <rect x="-2" y="-27" width="72" height="6" rx="3" fill="#e2eaf0" />
            <rect x="-2" y="-12" width="88" height="3" rx="1.5" fill="#91a8bd" />
            <rect x="-2" y="-3" width="74" height="3" rx="1.5" fill="#91a8bd" opacity=".65" />
            <rect x="-2" y="18" width="87" height="39" rx="6" fill="url(#interface-accent)" />
            <path d="M29 37h25m-6-6 6 6-6 6" fill="none" stroke="#254b50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </g>
      <g className="layer-labels" fill="none" stroke="#9fb0c5" strokeWidth="1">
        <g className="layer-label"><path d="M389 120h17v-16h9" opacity=".45" /><text x="420" y="108" fill="#c8e9e3" stroke="none">Polish</text></g>
        <g className="layer-label"><path d="M389 210h26" opacity=".45" /><text x="420" y="214" fill="#d0c6e7" stroke="none">Interaction</text></g>
        <g className="layer-label"><path d="M389 300h17v16h9" opacity=".45" /><text x="420" y="320" fill="#bdd2e0" stroke="none">Structure</text></g>
      </g>
    </svg>
  )
}

export default function InterfaceLayers() {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(section.current!)
      gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          id: 'interface-layers', trigger: section.current,
          start: 'top top', end: () => `+=${window.innerHeight * 2.2}`,
          pin: true, pinSpacing: true, scrub: .65, anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(select('.layer-structure'), { y: 90, duration: .8 }, .3)
        .to(select('.layer-interaction'), { y: 0, duration: .8 }, .3)
        .to(select('.layer-polish'), { y: -90, duration: .8 }, .3)
        .to(select('.layer-label'), { opacity: 1, duration: .25, stagger: .08 }, .95)
        .to(select('.layer-label'), { opacity: 0, duration: .2 }, 2.05)
        .to(select('.layer-structure'), { y: 16, duration: .7 }, 2.2)
        .to(select('.layer-interaction'), { y: 8, duration: .7 }, 2.2)
        .to(select('.layer-polish'), { y: 0, duration: .7 }, 2.2)
        .to(select('.interface-object'), { scale: .86, svgOrigin: '258 210', duration: .45 }, 2.8)
        .to({}, { duration: .25 }, 3.25)
    }, section)
    return () => media.revert()
  }, [])

  return (
    <section className="interface-section" id="behind-the-experience" aria-labelledby="interface-heading" ref={section}>
      <div className="interface-layout">
        <div className="interface-copy">
          <p className="interface-eyebrow">Behind the experience</p>
          <h2 id="interface-heading">Good interfaces go deeper than what you see.</h2>
          <p className="interface-description">I build responsive, accessible interfaces with clean components, thoughtful state, and attention to performance.</p>
        </div>
        <div className="interface-figure"><LayerArtwork /></div>
      </div>
    </section>
  )
}
