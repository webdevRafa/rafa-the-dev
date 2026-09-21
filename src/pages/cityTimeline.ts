// The geometry never changes between lighting states. A shared palette colors
// gradients, facade planes, foliage and reflected light on the same SVG tree.
const goldenHour = {
  '--sky-top': '#577fae', '--sky-mid': '#daa08f', '--sky-bottom': '#f3c58e',
  '--cloud': '#f9dcc4', '--cloud-shade': '#bc9fb4',
  '--pale': '#dec2a7', '--pale-light': '#ffe0b5', '--pale-shadow': '#a28e95',
  '--brick': '#ac745d', '--brick-light': '#d6976d', '--brick-shadow': '#75535c',
  '--trim': '#d4bdac', '--glass': '#706e84', '--glass-light': '#b5a1a4',
  '--foliage': '#657747', '--foliage-light': '#c4ab5e', '--foliage-dark': '#304c3e',
  '--trunk': '#625044', '--skyline': '#837f9e', '--skyline-far': '#afa0b0',
  '--water': '#759ab7', '--water-light': '#e9c8b1',
  '--paving': '#cbb1a2', '--paving-light': '#f2cba0',
  '--road': '#4b4852', '--road-light': '#83737c', '--awning': '#4a4b5b',
}

const afterHours = {
  '--sky-top': '#071832', '--sky-mid': '#143467', '--sky-bottom': '#315786',
  '--cloud': '#294d82', '--cloud-shade': '#1b3965',
  '--pale': '#636b80', '--pale-light': '#8990a1', '--pale-shadow': '#3b4358',
  '--brick': '#61464b', '--brick-light': '#805952', '--brick-shadow': '#362f3e',
  '--trim': '#86818c', '--glass': '#283b52', '--glass-light': '#4d5a70',
  '--foliage': '#28473d', '--foliage-light': '#61764a', '--foliage-dark': '#122f30',
  '--trunk': '#3b3332', '--skyline': '#244878', '--skyline-far': '#355b8a',
  '--water': '#143c69', '--water-light': '#6393bb',
  '--paving': '#494d63', '--paving-light': '#737085',
  '--road': '#171f34', '--road-light': '#303e59', '--awning': '#28334a',
}

export function addCityLighting(
  tl: gsap.core.Timeline,
  section: HTMLElement,
  select: gsap.utils.SelectorFunc,
) {
  tl.addLabel('day', 1.12)
    .addLabel('afternoon', 1.45)
    .addLabel('sunset', 2.35)
    .addLabel('dusk', 2.55)
    .addLabel('night', 3.65)
    .to(section, { ...goldenHour, duration: 1.0 }, 'afternoon')
    .to(section, { ...afterHours, duration: 1.0 }, 'dusk')
    .to(select('.city-cloud-far'), { x: 24, duration: 2.4 }, 1.2)
    .to(select('.city-cloud-near'), { x: -32, duration: 2.4 }, 1.2)
    .to(select('.city-sun'), { x: 70, y: 145, duration: 1.1, ease: 'power1.in' }, 1.35)
    .to(select('.city-sun'), { opacity: 0, duration: .48 }, 2.08)
    .fromTo(select('.city-moon'), { y: 95, opacity: 0 }, { y: 0, opacity: 1, duration: .85, ease: 'power1.out' }, 2.7)
    .to(select('.city-star'), { opacity: 1, duration: .45, stagger: { amount: .2 } }, 2.92)
    .to(select('.day-shadows'), { skewX: 12, scaleX: 1.12, opacity: .26, svgOrigin: '850 790', duration: 1.0 }, 1.45)
    .to(select('.day-shadows'), { opacity: 0, duration: .8 }, 2.45)
    .to(select('.window-warm-light'), { opacity: 1, duration: .45, stagger: { amount: .4 } }, 2.62)
    .to(select('.city-lights, .bridge-lights'), { opacity: 1, duration: .65 }, 2.9)
    .to(select('.water-warm-reflection'), { opacity: .75, duration: .65 }, 3.0)
    .to(select('.lamp-glow'), { opacity: .8, duration: .6 }, 2.75)
    .to(select('.lamp-bulb'), { fill: '#fff0b0', duration: .5 }, 2.7)
    .to(select('.light-pool'), { opacity: .7, duration: .65 }, 2.8)
    .to(section, { color: '#faf1e2', duration: .55 }, 2.5)
    .to({}, { duration: .3 }, 3.7)
}
