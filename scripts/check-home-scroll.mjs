import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

// Optional: npm install --no-save --package-lock=false playwright
const url = process.env.TEST_URL || 'http://127.0.0.1:5188'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
await mkdir('test-results', { recursive: true })
const viewports = [{ width: 390, height: 844 }, { width: 1672, height: 941 },
  { width: 1440, height: 900 }, { width: 768, height: 1024 },
  { width: 320, height: 700 }, { width: 844, height: 390 }]
const opacity = (page, selector) => page.locator(selector).first().evaluate(el => Number(getComputedStyle(el).opacity))
const near = (a, b, message, tolerance = .02) => assert.ok(Math.abs(a - b) < tolerance, `${message}: ${a} vs ${b}`)
async function scroll(page, y) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(1150)
}
async function range(page, selector) {
  return page.locator(selector).evaluate(section => {
    const spacer = section.parentElement
    return { start: spacer.getBoundingClientRect().top + scrollY,
      distance: parseFloat(getComputedStyle(spacer).paddingBottom), height: section.offsetHeight }
  })
}
async function layers(page, expected) {
  for (const [name, y] of Object.entries(expected)) {
    near(await page.locator(`.layer-${name}`).evaluate(el => el.transform.baseVal.consolidate().matrix.f), y, `${name} position`)
  }
}
async function fits(page, selector, viewport) {
  const box = await page.locator(selector).boundingBox()
  assert.ok(box && box.x >= -1 && box.y >= -1 && box.x + box.width <= viewport.width + 1
    && box.y + box.height <= viewport.height + 1, `${selector} fits ${JSON.stringify(viewport)}: ${JSON.stringify(box)}`)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow')
}
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/GSAP target.*not found|Invalid property.*Missing plugin/i.test(message.text())) errors.push(message.text())
    })
    await page.goto(url)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    assert.equal(await page.locator('.pin-spacer').count(), 2)
    assert.equal(await page.locator('.pin-spacer .pin-spacer').count(), 0)
    assert.equal(await page.locator('.underground-section').count(), 0)
    let city = await range(page, '.showcase-stage')
    await scroll(page, city.start + city.distance * .28)
    near(await opacity(page, '.city-sun'), 1, 'Day sun')
    near(await opacity(page, '.window-warm-light'), 0, 'Day windows')
    near(await opacity(page, '.city-exit-wash'), 0, 'No fade during pinned day')
    await fits(page, '.sky-copy', viewport)
    await scroll(page, city.start + city.distance)
    near(await opacity(page, '.city-moon'), 1, 'Night moon')
    near(await opacity(page, '.window-warm-light'), 1, 'Night windows')
    near(await opacity(page, '.city-exit-wash'), 0, 'Night holds until native exit')
    for (const fraction of [.25, .5, .75, 1, .5]) {
      await scroll(page, city.start + city.distance + city.height * fraction)
      near(await opacity(page, '.city-exit-wash'), fraction, 'Exit fade tracks viewport position')
      if (fraction === .5) {
        const seam = await page.evaluate(() => ({
          city: document.querySelector('.showcase-stage').getBoundingClientRect().bottom,
          third: document.querySelector('.interface-section').getBoundingClientRect().top,
        }))
        near(seam.city, seam.third, 'Gap-free normal-flow seam', 2)
        near(seam.third, city.height / 2, 'Third enters naturally', 2)
        await page.screenshot({ path: `test-results/interface-seam-${viewport.width}.png` })
      }
    }
    assert.equal(await page.locator('.interface-section').evaluate(el => getComputedStyle(el).backgroundColor),
      await page.locator('.city-exit-wash').evaluate(el => getComputedStyle(el).backgroundColor))
    const third = await range(page, '.interface-section')
    near(third.start, city.start + city.distance + city.height, 'Third pin follows native city exit', 2)
    for (const fraction of [0, 1.6 / 3.5, 1, 1.6 / 3.5, 0]) {
      await scroll(page, third.start + third.distance * fraction)
      const expanded = fraction > 0 && fraction < 1
      await layers(page, expanded ? { structure: 90, interaction: 0, polish: -90 } : { structure: 16, interaction: 8, polish: 0 })
      near(await opacity(page, '.layer-label'), expanded ? 1 : 0, 'Layer labels')
      near(await page.locator('.interface-section').evaluate(el => el.getBoundingClientRect().top), 0, 'Third pinned', 2)
      await fits(page, '.interface-copy', viewport)
      await fits(page, '.interface-artwork', viewport)
      await page.screenshot({ path: `test-results/interface-${expanded ? 'expanded' : fraction === 1 ? 'end' : 'start'}-${viewport.width}.png` })
    }
    await scroll(page, third.start + third.distance + third.height / 2)
    near(await page.locator('.next-chapter').evaluate(el => el.getBoundingClientRect().top), third.height / 2, 'Fourth enters naturally', 2)
    await scroll(page, third.start + third.distance + third.height)
    await fits(page, '.next-chapter > div', viewport)
    await page.screenshot({ path: `test-results/fourth-${viewport.width}.png` })
    await page.setViewportSize({ width: viewport.width + 24, height: viewport.height - 24 })
    await page.waitForTimeout(400)
    city = await range(page, '.showcase-stage')
    await scroll(page, city.start + city.distance + city.height / 2)
    near(await opacity(page, '.city-exit-wash'), .5, 'Fade survives resize')
    await scroll(page, 0)
    near(await opacity(page, '.intro-description'), 1, 'Hero restored on rewind')
    near(await opacity(page, '.city-exit-wash'), 0, 'Exit overlay restored on rewind')
    assert.equal(await page.locator('.pin-spacer').count(), 2)
    assert.deepEqual(errors, [])
    await page.close()
    console.log(`PASS ${viewport.width}x${viewport.height}: day/night, native exit/fade, layers/reverse, fourth, resize`)
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await page.goto(url)
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.locator('.pin-spacer').count(), 0)
  near(await opacity(page, '.city-moon'), 1, 'Reduced-motion night')
  near(await opacity(page, '.layer-label'), 1, 'Reduced-motion labels')
  await scroll(page, await page.locator('.interface-section').evaluate(el => el.getBoundingClientRect().top + scrollY))
  await fits(page, '.interface-copy', { width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/interface-reduced-motion.png' })
  await page.close()
  console.log('PASS reduced motion: static night and expanded layers, no pins')
} finally {
  await browser.close()
}
