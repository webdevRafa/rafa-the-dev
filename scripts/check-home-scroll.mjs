import { chromium } from 'playwright'
import assert from 'node:assert/strict'

// Optional local QA: npm install --no-save --package-lock=false playwright
// Run with the Vite server on 5188 (or set TEST_URL).
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5188')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.showcase-playground').isVisible(), false)
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * .6))
    await page.waitForTimeout(900)
    assert.equal(await page.locator('.showcase-playground').isVisible(), true)
    assert.notEqual(await page.locator('.word-front').evaluate(el => getComputedStyle(el).transform), 'none')
    await page.screenshot({ path: `test-results/home-transition-${width}.png` })
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: 'Blue', exact: true }).click()
    assert.equal(await page.getByRole('button', { name: 'Blue', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.color-name').textContent(), 'Blue')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: `test-results/home-complete-${width}.png` })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(900)
    assert.equal(await page.locator('.showcase-playground').isVisible(), false)
    assert.equal(await page.locator('.intro-description').evaluate(el => getComputedStyle(el).opacity), '1')
    assert.deepEqual(errors, [])
    await page.close()
    console.log(`PASS ${width}px: preview, completion, color selection, rewind, no overflow or runtime errors`)
  }
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5188')
  await page.getByRole('heading', { name: 'Make it yours.' }).waitFor()
  assert.equal(await page.locator('.pin-spacer').count(), 0)
  await page.getByRole('button', { name: 'Orange', exact: true }).click()
  assert.equal(await page.locator('.color-name').textContent(), 'Orange')
  console.log('PASS reduced motion: normal document flow, working controls')
} finally {
  await browser.close()
}
