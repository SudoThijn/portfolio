import { expect, test, type Page } from '@playwright/test'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

// The ring with a 24 s period turns 15 degrees a second, and 90 in overdrive (4 s per turn).
const RING = '.emblem .spin[data-period="24"]'
const NORMAL_SPEED = 15
const OVERDRIVE_SPEED = 90

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface Sample {
  t: number
  angle: number
}

// Records the ring's real angle on every frame until stopRecording is called.
async function startRecording(page: Page) {
  await page.evaluate((selector) => {
    const ring = document.querySelector(selector)
    if (!ring) throw new Error('ring not found')
    const samples: { t: number; angle: number }[] = []
    let running = true
    const frame = (t: number) => {
      const m = new DOMMatrix(getComputedStyle(ring).transform)
      samples.push({ t, angle: (Math.atan2(m.b, m.a) * 180) / Math.PI })
      if (running) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    Object.assign(window, {
      stopRecording: () => {
        running = false
        return samples
      },
    })
  }, RING)
}

const stopRecording = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { stopRecording(): unknown }).stopRecording() as Sample[],
  )

// Signed angle travelled between two samples, so crossing 180 degrees is not a jump.
const step = (a: Sample, b: Sample) => ((b.angle - a.angle + 540) % 360) - 180

// Degrees per second over a window of the recording.
function speedBetween(samples: Sample[], from: number, to: number) {
  const window = samples.filter((s) => s.t >= from && s.t <= to)
  const first = window[0]
  const last = window.at(-1)
  if (!first || !last) throw new Error('no samples in window')
  let travelled = 0
  for (let i = 1; i < window.length; i++) {
    travelled += step(window[i - 1] as Sample, window[i] as Sample)
  }
  return travelled / ((last.t - first.t) / 1000)
}

test.describe('the emblem rings', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('speed up and slow down where they are, without jumping', async ({ page }) => {
    await page.goto('/')
    await pause(800)
    await startRecording(page)
    await pause(600)

    const enteredAt = await page.evaluate(() => performance.now())
    for (const key of KONAMI) await page.keyboard.press(key)
    await expect(page.locator('html')).toHaveClass(/overdrive/)
    await pause(4500)

    const leftAt = await page.evaluate(() => performance.now())
    await page.keyboard.press('Escape')
    await expect(page.locator('html')).not.toHaveClass(/overdrive/)
    await pause(4500)
    const samples = await stopRecording(page)
    const end = samples.at(-1)?.t ?? 0

    // No frame may move further than the top speed allows, which a jump to another part of
    // the circle would. The margin covers a frame that arrives late.
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1] as Sample
      const b = samples[i] as Sample
      const allowed = (OVERDRIVE_SPEED * Math.min(b.t - a.t, 100)) / 1000 + 1
      expect(Math.abs(step(a, b)), `frame at ${Math.round(b.t)} ms`).toBeLessThan(allowed)
    }

    expect(speedBetween(samples, enteredAt - 500, enteredAt)).toBeCloseTo(NORMAL_SPEED, -1)
    expect(speedBetween(samples, leftAt - 500, leftAt)).toBeGreaterThan(OVERDRIVE_SPEED * 0.8)
    expect(speedBetween(samples, end - 500, end)).toBeLessThan(NORMAL_SPEED * 1.5)
    // It really is a ramp, not a switch: the speed a moment after the code is still low.
    expect(speedBetween(samples, enteredAt, enteredAt + 400)).toBeLessThan(OVERDRIVE_SPEED * 0.5)
  })

  test('the three rings keep their own direction and pace', async ({ page }) => {
    await page.goto('/')
    const periods = await page
      .locator('.emblem .spin')
      .evaluateAll((els) => els.map((el) => (el as SVGElement).dataset.period))
    expect(periods).toEqual(['60', '-18', '24'])
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the rings stay still', async ({ page }) => {
    await page.goto('/')
    await pause(500)
    const transforms = await page
      .locator('.emblem .spin')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
    expect(transforms).toEqual(['none', 'none', 'none'])
  })
})
