import { expect, test, type Page } from '@playwright/test'

interface Voice {
  duration: number
  loop: boolean
  stopped: boolean
}

declare global {
  interface Window {
    __voices: Voice[]
    hack(): string
  }
}

// Durations of the shipped files, in seconds.
const HUM = 16
const OVERDRIVE_SONG = 80.1
const CHARGE_START = 1.2667
const CHARGE_LOOP = 4
const SHOT = 4.7147
const WARP = 4.117
const LEVEL_UP = 0.7739
const POPUP_OPEN = 0.656

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

test.use({ reducedMotion: 'reduce' })

// Holding the mouse and checking that nothing happened both need real time on the audio clock.
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// The page decides what to play, so the tests record every buffer the audio engine starts.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__voices = []
    const entries = new WeakMap<AudioBufferSourceNode, { stopped: boolean }>()
    const start = AudioBufferSourceNode.prototype.start
    const stop = AudioBufferSourceNode.prototype.stop
    AudioBufferSourceNode.prototype.start = function (...args) {
      const voice = { duration: this.buffer?.duration ?? 0, loop: this.loop, stopped: false }
      window.__voices.push(voice)
      entries.set(this, voice)
      return start.apply(this, args)
    }
    AudioBufferSourceNode.prototype.stop = function (...args) {
      const voice = entries.get(this)
      if (voice) voice.stopped = true
      return stop.apply(this, args)
    }
  })
})

const toggle = (page: Page) => page.locator('.hud__sound')
const voices = (page: Page) => page.evaluate(() => window.__voices)
const storedPreference = (page: Page) => page.evaluate(() => localStorage.getItem('td-sound'))

// Polls until a voice of this length (and looping state) has started, then returns it.
async function voiceLike(page: Page, duration: number, loop: boolean) {
  await expect
    .poll(async () =>
      (await voices(page)).some((v) => Math.abs(v.duration - duration) < 0.01 && v.loop === loop),
    )
    .toBe(true)
  return async () =>
    (await voices(page)).filter((v) => Math.abs(v.duration - duration) < 0.01 && v.loop === loop)
}

async function soundOn(page: Page) {
  await page.goto('/')
  await toggle(page).click()
  await expect(toggle(page)).toContainText('Sound: on')
}

// The charge shot ignores interactive elements, so it needs a point on plain page background.
async function emptySpot(page: Page) {
  return page.evaluate(() => {
    const blocked = 'a, button, input, textarea, select, label, dialog, .stat, .lab'
    for (let y = 120; y < innerHeight - 40; y += 40) {
      for (let x = 40; x < innerWidth - 40; x += 40) {
        const el = document.elementFromPoint(x, y)
        if (el && !el.closest(blocked)) return { x, y }
      }
    }
    throw new Error('no empty spot found')
  })
}

test.describe('switching sound on and off', () => {
  test('is off by default and loads nothing', async ({ page }) => {
    const audioRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().endsWith('.ogg')) audioRequests.push(request.url())
    })
    await page.goto('/')
    await expect(toggle(page)).toContainText('Sound: off')
    await pause(500)
    expect(audioRequests).toEqual([])
    expect(await voices(page)).toEqual([])
    expect(await storedPreference(page)).toBeNull()
  })

  test('starts the background hum, and stops it again', async ({ page }) => {
    await soundOn(page)
    const hum = await voiceLike(page, HUM, true)
    expect(await storedPreference(page)).toBe('on')

    await toggle(page).click()
    await expect(toggle(page)).toContainText('Sound: off')
    expect(await storedPreference(page)).toBe('off')
    await expect.poll(async () => (await hum()).every((v) => v.stopped)).toBe(true)
  })

  test('remembers the choice, and starts on the first gesture after a reload', async ({ page }) => {
    await soundOn(page)
    await voiceLike(page, HUM, true)

    await page.reload()
    await expect(toggle(page)).toContainText('Sound: on')
    await pause(400)
    expect(await voices(page)).toEqual([])

    await page.keyboard.press('x')
    await voiceLike(page, HUM, true)
  })
})

test.describe('what plays', () => {
  test('OVERDRIVE plays its song, and stops it with Esc', async ({ page }) => {
    await soundOn(page)
    for (const key of KONAMI) await page.keyboard.press(key)
    await expect(page.locator('html')).toHaveClass(/overdrive/)
    const song = await voiceLike(page, OVERDRIVE_SONG, true)

    await page.keyboard.press('Escape')
    await expect.poll(async () => (await song()).every((v) => v.stopped)).toBe(true)
  })

  test('OVERDRIVE entered before sound is switched on starts its song then', async ({ page }) => {
    await page.goto('/')
    for (const key of KONAMI) await page.keyboard.press(key)
    await expect(page.locator('html')).toHaveClass(/overdrive/)
    expect(await voices(page)).toHaveLength(0)

    await toggle(page).click()
    await voiceLike(page, OVERDRIVE_SONG, true)
  })

  test('LEET mode plays Warp Drive', async ({ page }) => {
    await soundOn(page)
    for (let i = 0; i < 5; i++) await page.locator('#clock').click()
    await expect(page.locator('html')).toHaveClass(/leet/)
    await voiceLike(page, WARP, false)
  })

  test('a full charge builds up, loops, then fires while the charge fades out', async ({
    page,
  }) => {
    await soundOn(page)
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await pause(1200)
    const start = await voiceLike(page, CHARGE_START, false)
    const loop = await voiceLike(page, CHARGE_LOOP, true)
    expect((await voices(page)).some((v) => Math.abs(v.duration - SHOT) < 0.01)).toBe(false)

    await page.mouse.up()
    await voiceLike(page, SHOT, false)
    await expect.poll(async () => (await start()).every((v) => v.stopped)).toBe(true)
    await expect.poll(async () => (await loop()).every((v) => v.stopped)).toBe(true)
  })

  test('letting go early fizzles out without a shot', async ({ page }) => {
    await soundOn(page)
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await pause(400)
    const loop = await voiceLike(page, CHARGE_LOOP, true)
    await page.mouse.up()

    await expect.poll(async () => (await loop()).every((v) => v.stopped)).toBe(true)
    await pause(500)
    expect((await voices(page)).some((v) => Math.abs(v.duration - SHOT) < 0.01)).toBe(false)
  })

  test('a quick click on the background makes no charge sound', async ({ page }) => {
    await soundOn(page)
    await voiceLike(page, HUM, true)
    const before = (await voices(page)).length
    const { x, y } = await emptySpot(page)
    await page.mouse.click(x, y)
    await pause(500)
    expect(await voices(page)).toHaveLength(before)
  })

  test('finding the last secret plays the level up', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'td-secrets',
        JSON.stringify(['overdrive', 'root', 'charge', 'leet', 'save', 'signal']),
      )
    })
    await soundOn(page)
    await page.evaluate(() => window.hack())
    await expect(page.locator('dialog.levelup')).toBeVisible({ timeout: 5000 })
    await voiceLike(page, LEVEL_UP, false)
  })

  test('nothing plays while sound is off', async ({ page }) => {
    await page.goto('/')
    for (let i = 0; i < 5; i++) await page.locator('#clock').click()
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await pause(1200)
    await page.mouse.up()
    expect(await voices(page)).toEqual([])
  })
})

test.describe('sound credits', () => {
  test('lists every sound with its author and licence, and closes with Esc', async ({ page }) => {
    await page.goto('/')
    await page.locator('.footer__link').click()
    const dialog = page.locator('dialog.credits')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('JC Sounds')
    await expect(dialog).toContainText('Packsmithy (packsmithy.com)')
    await expect(dialog).toContainText('Little Robot Sound Factory')
    await expect(dialog).toContainText('FiveBrosStopMosYT')
    await expect(dialog.locator('li')).toHaveCount(5)
    await expect(dialog.getByRole('link', { name: 'CC BY 4.0' }).first()).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/',
    )

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('opening it plays a popup sound when sound is on', async ({ page }) => {
    await soundOn(page)
    await page.locator('.footer__link').click()
    const popup = await voiceLike(page, POPUP_OPEN, false)
    expect(await popup()).not.toHaveLength(0)
  })
})
