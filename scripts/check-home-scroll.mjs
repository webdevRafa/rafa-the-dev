import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

// Optional local QA dependency: npm install --no-save --package-lock=false playwright
// Run a Vite server on 5188 or set TEST_URL. Screenshots stay in ignored test-results/.
const url = process.env.TEST_URL || 'http://127.0.0.1:5188'
const viewports = [
  { width: 390, height: 844 },
  { width: 1672, height: 941 },
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 320, height: 700 },
  { width: 844, height: 390 },
]
// Named checkpoints in the four-unit, scroll-scrubbed city timeline.
const progress = { preview: .15, day: 1.12 / 4, sunset: 2.35 / 4, night: 1 }
const anchors = ['left-building', 'right-building', 'tower']
const browser = await chromium.launch({ channel: 'chrome', headless: true })
await mkdir('test-results', { recursive: true })

const opacity = (page, selector) => page.locator(selector).first()
  .evaluate(el => Number(getComputedStyle(el).opacity))

async function settledScroll(page, y) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
  // ScrollTrigger's scrub is .85s; sample only once it has caught up to the input.
  await page.waitForTimeout(1150)
}

async function scrollRange(page) {
  return page.locator('.pin-spacer').evaluate(el => ({
    start: el.getBoundingClientRect().top + window.scrollY,
    distance: parseFloat(getComputedStyle(el).paddingBottom),
  }))
}

async function seek(page, fraction) {
  const { start, distance } = await scrollRange(page)
  assert.ok(distance > 0, 'Pinned experience has a measurable scroll range')
  await settledScroll(page, start + distance * fraction)
}

async function geometry(page) {
  return page.locator('[data-scene-anchor]').evaluateAll(elements => Object.fromEntries(
    elements.map(el => {
      const { x, y, width, height } = el.getBoundingClientRect()
      return [el.getAttribute('data-scene-anchor'), { x, y, width, height }]
    }),
  ))
}

function assertSameGeometry(before, after) {
  for (const anchor of anchors) {
    assert.ok(before[anchor] && after[anchor], `Missing stable scene anchor: ${anchor}`)
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(before[anchor][key] - after[anchor][key]) < .2,
        `${anchor}.${key} shifted between day and night`)
    }
  }
}

async function assertCelestialVisible(page, body, viewport) {
  // First circle is the soft halo; second is the actual sun/moon disk.
  const disk = await page.locator(`.city-${body} > circle:nth-of-type(2)`).boundingBox()
  assert.ok(disk, `${body} disk exists`)
  const center = { x: disk.x + disk.width / 2, y: disk.y + disk.height / 2 }
  assert.ok(center.x > 0 && center.x < viewport.width && center.y > 0 && center.y < viewport.height,
    `${body} center stays on screen at ${viewport.width}x${viewport.height}: ${JSON.stringify(center)}`)
}

async function assertForegroundWindowVisible(page) {
  const substantialWindows = await page.locator('.window-warm-light').evaluateAll(elements => elements.filter(el => {
    const rect = el.getBoundingClientRect()
    const visibleWidth = Math.max(0, Math.min(innerWidth, rect.right) - Math.max(0, rect.left))
    const visibleHeight = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top))
    return visibleWidth >= 8 && visibleHeight >= 12
      && visibleWidth * visibleHeight >= rect.width * rect.height * .4
  }).length)
  assert.ok(substantialWindows >= 1, 'Portrait framing keeps at least one foreground window substantially visible')
}

async function assertDay(page) {
  assert.equal(await opacity(page, '.city-moon'), 0)
  assert.equal(await opacity(page, '.city-star'), 0)
  assert.equal(await opacity(page, '.window-warm-light'), 0)
  assert.equal(await opacity(page, '.lamp-glow'), 0)
  assert.equal(await opacity(page, '.city-sun'), 1)
  assert.ok(await opacity(page, '.day-shadows') > .3)
  assert.equal(await page.locator('.sky-section').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(121, 184, 245)')
}

async function assertNight(page) {
  assert.equal(await opacity(page, '.city-moon'), 1)
  assert.equal(await opacity(page, '.city-sun'), 0)
  assert.equal(await opacity(page, '.city-star'), 1)
  assert.equal(await opacity(page, '.day-shadows'), 0)
  const windows = await page.locator('.window-warm-light')
    .evaluateAll(elements => elements.map(el => Number(getComputedStyle(el).opacity)))
  assert.ok(windows.length >= 4 && windows.every(value => value === 1), 'Windows illuminate completely')
  assert.ok(await opacity(page, '.lamp-glow') > .7)
  assert.equal(await page.locator('.sky-section').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(7, 24, 50)')
}

async function assertUndergroundImage(page, viewport) {
  const image = page.locator('.underground-section picture img')
  await image.evaluate(async el => { await el.decode() })
  const asset = await image.evaluate(el => {
    const source = [...el.parentElement.querySelectorAll('source')]
      .find(node => !node.media || matchMedia(node.media).matches)
    const candidates = (source?.srcset || el.srcset || el.src).split(',')
      .map(candidate => new URL(candidate.trim().split(/\s+/)[0], location.href).href)
    return {
      complete: el.complete && el.naturalWidth > 0 && el.naturalHeight > 0,
      currentSrc: el.currentSrc,
      candidates,
      portrait: innerWidth < innerHeight,
      sourceMedia: source?.media || '',
    }
  })
  assert.equal(asset.complete, true, 'Underground illustration has fully decoded')
  assert.ok(asset.candidates.includes(asset.currentSrc),
    `Picture selects the expected responsive source at ${viewport.width}x${viewport.height}: ${asset.currentSrc}`)
  if (asset.portrait) {
    assert.ok(asset.sourceMedia, 'Portrait viewport uses an art-directed picture source')
  }
}

async function assertUndergroundCopy(page, viewport) {
  const section = page.locator('.underground-section')
  assert.equal(await section.getAttribute('id'), 'beneath-the-interface')
  assert.equal(await section.getAttribute('aria-labelledby'), 'underground-heading')
  assert.equal(await section.locator('h2').count(), 1)
  assert.match(await section.locator('h2').innerText(), /The details you don.t see\s+are the ones that make it work\./)
  const copy = await page.locator('.underground-copy').boundingBox()
  assert.ok(copy && copy.x >= 0 && copy.x + copy.width <= viewport.width + 1
    && copy.y >= 0 && copy.y + copy.height <= viewport.height + 1,
  `Underground copy fits the viewport at ${viewport.width}x${viewport.height}: ${JSON.stringify(copy)}`)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Third section does not introduce horizontal document overflow')
}

try {
  for (const viewport of viewports) {
    const name = `${viewport.width}x${viewport.height}`
    const page = await browser.newPage({ viewport })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/GSAP target.*not found|Invalid property.*Missing plugin/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await page.goto(url)
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.pin-spacer').waitFor()
    await page.waitForTimeout(350)
    assert.equal(await page.locator('.pin-spacer').count(), 1, 'Only the city experience is pinned')
    assert.equal(await page.locator('.underground-section').evaluate(el => !!el.closest('.pin-spacer')), false,
      'Underground section is outside the city pin')
    assert.equal(await page.locator('.sky-section').isVisible(), false)
    const svg = page.locator('.city-artwork')
    assert.equal(await svg.count(), 1, 'One shared SVG scene, not separate endpoint images')
    assert.equal(await svg.locator('image').count(), 0, 'The illustration contains no raster image layers')
    assert.ok(await svg.locator('*').count() < 900, 'Keep SVG scene complexity bounded')
    assert.equal(await page.locator('.sky-section').evaluate(el =>
      [el, ...el.querySelectorAll('*')].some(node => /url\([^)]*\.(png|jpe?g|webp)/i.test(getComputedStyle(node).backgroundImage)),
    ), false, 'No raster reference backgrounds')

    await seek(page, progress.preview)
    assert.equal(await page.locator('.sky-section').isVisible(), true)
    assert.ok(await opacity(page, '.intro-description') < .05)
    await page.screenshot({ path: `test-results/city-preview-${name}.png` })

    await seek(page, progress.day)
    await assertDay(page)
    const dayGeometry = await geometry(page)
    const copyBox = await page.locator('.sky-copy').boundingBox()
    assert.ok(copyBox && copyBox.x >= 0 && copyBox.x + copyBox.width <= viewport.width + 1
      && copyBox.y >= 0 && copyBox.y + copyBox.height <= viewport.height + 1,
      'Section copy fits its viewport')
    assert.equal(await page.locator('.sky-meta, .sky-phase, .sky-scroll-note, .sky-progress').count(), 0,
      'Corner labels and progress decoration are removed on every viewport')
    await page.screenshot({ path: `test-results/city-day-${name}.png` })
    await assertCelestialVisible(page, 'sun', viewport)
    if (viewport.width < viewport.height) await assertForegroundWindowVisible(page)

    await seek(page, progress.sunset)
    assert.ok(await opacity(page, '.city-sun') < .7, 'Sun is setting at golden hour')
    await page.screenshot({ path: `test-results/city-sunset-${name}.png` })

    await seek(page, progress.night)
    await assertNight(page)
    assertSameGeometry(dayGeometry, await geometry(page))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal document overflow')
    await page.screenshot({ path: `test-results/city-night-${name}.png` })
    await assertCelestialVisible(page, 'moon', viewport)

    // Refresh should recalculate the scroll distance without losing reversibility.
    const resized = { width: viewport.width + 24, height: viewport.height - 24 }
    await page.setViewportSize(resized)
    await page.waitForTimeout(350)
    await seek(page, progress.night)
    await assertNight(page)
    await seek(page, progress.day)
    await assertDay(page)
    await page.setViewportSize(viewport)
    await page.waitForTimeout(350)
    await seek(page, progress.day)
    await assertDay(page)
    assertSameGeometry(dayGeometry, await geometry(page))
    await seek(page, 0)
    assert.equal(await page.locator('.sky-section').isVisible(), false)
    assert.equal(await opacity(page, '.intro-description'), 1)

    // The real underground section follows the final night frame in normal DOM flow.
    const { start, distance } = await scrollRange(page)
    const stageHeight = await page.locator('.showcase-stage').evaluate(el => el.offsetHeight)
    await settledScroll(page, start + distance)
    await assertNight(page)
    await settledScroll(page, start + distance + stageHeight - viewport.height / 2)
    assert.ok(await page.locator('.showcase-stage').evaluate(el => el.getBoundingClientRect().top < -100))
    const seam = await page.evaluate(() => ({
      cityBottom: document.querySelector('.showcase-stage').getBoundingClientRect().bottom,
      undergroundTop: document.querySelector('.underground-section').getBoundingClientRect().top,
      scrollY,
    }))
    assert.ok(Math.abs(seam.undergroundTop - viewport.height / 2) < 3,
      'Underground section advances normally after pin release')
    assert.ok(Math.abs(seam.cityBottom - seam.undergroundTop) <= 2,
      'City and underground sections meet without a gap or overlap')
    await assertNight(page)
    await assertUndergroundImage(page, viewport)
    await page.screenshot({ path: `test-results/city-underground-seam-${name}.png` })

    await settledScroll(page, start + distance + stageHeight)
    const underground = await page.locator('.underground-section').evaluate(el => ({
      top: el.getBoundingClientRect().top, scrollY,
    }))
    assert.ok(Math.abs((seam.undergroundTop - underground.top) - (underground.scrollY - seam.scrollY)) < 2,
      'Third section tracks native scroll without an additional pin or transform')
    assert.ok(Math.abs(underground.top) < 3, 'Third section can reach the top of the viewport')
    await assertUndergroundCopy(page, viewport)
    await page.screenshot({ path: `test-results/underground-${name}.png` })
    assert.deepEqual(errors, [], 'No page errors or missing GSAP targets')
    await page.close()
    console.log(`PASS ${name}: reveal, day/sunset/night, fixed geometry, resize/rewind, seamless normal-flow underground, responsive image and copy`)
  }

  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url)
  await page.getByRole('heading', { name: 'I bring interfaces to life.' }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.locator('.pin-spacer').count(), 0)
  assert.equal(await page.locator('.sky-section').isVisible(), true)
  await assertNight(page)
  await page.locator('.sky-section').scrollIntoViewIfNeeded()
  const reducedGeometry = await geometry(page)
  await page.waitForTimeout(1000)
  assertSameGeometry(reducedGeometry, await geometry(page))
  await page.screenshot({ path: 'test-results/city-reduced-motion-390x844.png' })
  const undergroundTop = await page.locator('.underground-section').evaluate(el =>
    el.getBoundingClientRect().top + scrollY)
  await settledScroll(page, undergroundTop)
  await assertUndergroundImage(page, { width: 390, height: 844 })
  await assertUndergroundCopy(page, { width: 390, height: 844 })
  assert.equal(await page.locator('.pin-spacer').count(), 0, 'Reduced motion keeps both illustrations in normal flow')
  await page.screenshot({ path: 'test-results/underground-reduced-motion-390x844.png' })
  assert.deepEqual(errors, [])
  await page.close()
  console.log('PASS reduced motion: static night and underground scenes in normal document flow')
} finally {
  await browser.close()
}
