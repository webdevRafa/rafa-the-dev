import { chromium } from 'playwright'
import assert from 'node:assert/strict'

// Optional local QA dependency: npm install --no-save --package-lock=false playwright
// Run a Vite server on 5188 or set TEST_URL.
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5188')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.sky-section').isVisible(), false)
    const seek = async progress => {
      await page.evaluate(p => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p), progress)
      await page.waitForTimeout(1000)
    }
    await seek(.15)
    assert.equal(await page.locator('.sky-section').isVisible(), true)
    await page.screenshot({ path: `test-results/sky-preview-${width}.png` })
    await seek(.32)
    assert.equal(await page.locator('.sky-night').evaluate(el => getComputedStyle(el).opacity), '0')
    await page.screenshot({ path: `test-results/sky-day-${width}.png` })
    await seek(.59)
    await page.screenshot({ path: `test-results/sky-sunset-${width}.png` })
    await seek(1)
    assert.equal(await page.locator('.sky-night').evaluate(el => getComputedStyle(el).opacity), '1')
    assert.equal(await page.locator('.moon-track').evaluate(el => getComputedStyle(el).opacity), '1')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: `test-results/sky-night-${width}.png` })
    await seek(0)
    assert.equal(await page.locator('.sky-section').isVisible(), false)
    assert.equal(await page.locator('.intro-description').evaluate(el => getComputedStyle(el).opacity), '1')
    // Verify a future regular DOM section is not pinned, overlaid, or intercepted.
    const releaseY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    await page.evaluate(() => {
      const next = document.createElement('section')
      next.id = 'flow-test'; next.textContent = 'Normal next section'
      next.style.cssText = 'height:100vh;background:white;color:black;position:relative'
      document.querySelector('main').append(next)
    })
    await page.evaluate(y => window.scrollTo(0, y + innerHeight / 2), releaseY)
    await page.waitForTimeout(1000)
    assert.ok(await page.locator('.showcase-stage').evaluate(el => el.getBoundingClientRect().top < -100))
    const nextTop = await page.locator('#flow-test').evaluate(el => el.getBoundingClientRect().top)
    assert.ok(nextTop >= 0 && nextTop < 900)
    assert.deepEqual(errors, [])
    await page.close()
    console.log(`PASS ${width}px: reveal, day/sunset/night, rewind, no overflow, normal-flow release`)
  }
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5188')
  await page.getByRole('heading', { name: 'I bring interfaces to life.' }).waitFor()
  assert.equal(await page.locator('.pin-spacer').count(), 0)
  assert.equal(await page.locator('.sky-section').isVisible(), true)
  console.log('PASS reduced motion: readable static landscape in normal document flow')
} finally { await browser.close() }
