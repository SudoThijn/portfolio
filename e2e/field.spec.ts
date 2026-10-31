import { expect, test, type Page } from '@playwright/test'

// Playwright hides scrollbars by default, but desktop browsers show a classic one, and that is
// what squeezed the dot layer away from the cursor.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] }, reducedMotion: 'reduce' })

const fieldGeometry = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#field')
    if (!canvas) throw new Error('no #field canvas')
    const shown = canvas.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio, 2)
    return {
      scrollbar: innerWidth - document.documentElement.clientWidth,
      scaleX: shown.width / (canvas.width / dpr),
      scaleY: shown.height / (canvas.height / dpr),
    }
  })

test.describe('dot field', () => {
  test('is drawn at the size it is shown, so dots stay under the cursor', async ({ page }) => {
    await page.goto('/')
    const geometry = await fieldGeometry(page)
    // Without a scrollbar the test would pass for the wrong reason.
    expect(geometry.scrollbar).toBeGreaterThan(0)
    expect(geometry.scaleX).toBeCloseTo(1, 3)
    expect(geometry.scaleY).toBeCloseTo(1, 3)
  })

  test('stays that way after the window is resized', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 1100, height: 700 })
    await expect.poll(async () => (await fieldGeometry(page)).scaleX).toBeCloseTo(1, 3)
    expect((await fieldGeometry(page)).scaleY).toBeCloseTo(1, 3)
  })
})
