import { expect, test, type Locator, type Page } from '@playwright/test'

interface Voice {
  duration: number
  loop: boolean
  stopped: boolean
  startedAt: number
}

declare global {
  interface Window {
    __voices: Voice[]
    __lastKey: number
    __allowAutoplay?: boolean
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
      const voice = {
        duration: this.buffer?.duration ?? 0,
        loop: this.loop,
        stopped: false,
        startedAt: performance.now(),
      }
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

  // Headless Chromium plays without a gesture, unlike a visitor's browser. This makes a new
  // AudioContext act autoplay-blocked until the first interaction a browser accepts, unless a test
  // opts out to stand in for a browser that allows autoplay.
  await page.addInitScript(() => {
    let interacted = false
    const accepted = (event: Event) => {
      if (event.type === 'pointerdown' && (event as PointerEvent).pointerType !== 'mouse') return
      if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape') return
      interacted = true
    }
    for (const type of ['pointerdown', 'pointerup', 'keydown', 'touchend']) {
      addEventListener(type, accepted, true)
    }
    const Real = window.AudioContext
    class Gated extends Real {
      constructor(options?: AudioContextOptions) {
        super(options)
        // A browser that allows autoplay starts the context shortly after it is created.
        let allowed = false
        if (window.__allowAutoplay) {
          setTimeout(() => {
            allowed = true
            this.dispatchEvent(new Event('statechange'))
          }, 100)
        }
        Object.defineProperty(this, 'state', {
          get: () => (allowed || interacted ? 'running' : 'suspended'),
        })
        Object.defineProperty(this, 'resume', {
          value: () => {
            if (interacted) return Real.prototype.resume.call(this)
            return allowed ? Promise.resolve() : new Promise<void>(() => {})
          },
        })
      }
    }
    window.AudioContext = Gated
  })
})

const toggle = (page: Page) => page.locator('.hud__sound')

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('element is not visible')
  return box
}
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

// Sound is on by default but waits for a gesture, so a key press gets it going.
async function soundOn(page: Page) {
  await page.goto('/')
  await expect(toggle(page)).toContainText('Sound: on')
  await page.keyboard.press('x')
  await expect(toggle(page)).toHaveAttribute('data-playing', 'true')
}

// Seeds the saved choice, so call it before the page loads.
const soundOff = (page: Page) => page.addInitScript(() => localStorage.setItem('td-sound', 'off'))

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
  test('is on by default, and loads and plays nothing until the first gesture', async ({
    page,
  }) => {
    const audioRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().endsWith('.ogg')) audioRequests.push(request.url())
    })
    await page.goto('/')
    await expect(toggle(page)).toContainText('Sound: on')
    await expect(toggle(page)).toHaveAttribute('data-playing', 'false')
    await pause(500)
    expect(audioRequests).toEqual([])
    expect(await voices(page)).toEqual([])
    expect(await storedPreference(page)).toBeNull()

    await page.keyboard.press('x')
    await expect(toggle(page)).toHaveAttribute('data-playing', 'true')
    await voiceLike(page, HUM, true)
    expect(audioRequests.some((url) => url.includes('bed-hum'))).toBe(true)
    // The big OVERDRIVE song is fetched in the background, so the egg can start it instantly.
    await expect.poll(() => audioRequests.some((url) => url.includes('overdrive-music'))).toBe(true)
  })

  test('starts by itself when the browser allows autoplay', async ({ page }) => {
    await page.addInitScript(() => {
      window.__allowAutoplay = true
    })
    await page.goto('/')
    await expect(toggle(page)).toHaveAttribute('data-playing', 'true')
    await voiceLike(page, HUM, true)
  })

  test('starts on a mouse press, without waiting for the click to finish', async ({ page }) => {
    await page.goto('/')
    await expect(toggle(page)).toHaveAttribute('data-playing', 'false')
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await voiceLike(page, HUM, true)
    await page.mouse.up()
  })

  test('ignores Escape, which browsers do not count, until a real gesture', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')
    await pause(300)
    expect(await voices(page)).toEqual([])
    await page.keyboard.press('x')
    await voiceLike(page, HUM, true)
  })

  test('can be switched off, which stops the hum and is remembered', async ({ page }) => {
    await soundOn(page)
    const hum = await voiceLike(page, HUM, true)

    await toggle(page).click()
    await expect(toggle(page)).toContainText('Sound: off')
    await expect(toggle(page)).toHaveAttribute('data-playing', 'false')
    expect(await storedPreference(page)).toBe('off')
    await expect.poll(async () => (await hum()).every((v) => v.stopped)).toBe(true)

    await page.reload()
    await expect(toggle(page)).toContainText('Sound: off')
    await page.keyboard.press('x')
    await pause(400)
    expect(await voices(page)).toEqual([])
  })

  test('can be switched back on', async ({ page }) => {
    await soundOff(page)
    await page.goto('/')
    await expect(toggle(page)).toContainText('Sound: off')

    await toggle(page).click()
    await expect(toggle(page)).toContainText('Sound: on')
    await voiceLike(page, HUM, true)
    expect(await storedPreference(page)).toBe('on')
  })
})

test.describe('the HUD toggle', () => {
  test('sits to the left of the secrets counter and the clock', async ({ page }) => {
    await page.goto('/')
    const sound = await boxOf(toggle(page))
    const clock = await boxOf(page.locator('#clock'))
    const nav = await boxOf(page.locator('.hud__nav'))
    expect(sound.x).toBeGreaterThan(nav.x + nav.width)
    expect(sound.x + sound.width).toBeLessThan(clock.x)
  })

  test('shows the secrets counter right of the toggle once something is found', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => window.hack())
    const chip = page.locator('.hud__secrets')
    await expect(chip).toBeVisible()
    const sound = await boxOf(toggle(page))
    const secrets = await boxOf(chip)
    expect(sound.x + sound.width).toBeLessThan(secrets.x)
  })
})

test.describe('OVERDRIVE timing', () => {
  // The cut-in animation only runs with motion, and it is what used to hold the song back.
  test.use({ reducedMotion: 'no-preference' })

  test('the song starts with the code, not after the cut-in', async ({ page }) => {
    await soundOn(page)
    await expect
      .poll(async () => page.evaluate(() => performance.getEntriesByType('resource').length))
      .toBeGreaterThan(0)
    // Gives the background preload of the song time to finish.
    await pause(1000)
    await page.evaluate(() => {
      addEventListener(
        'keydown',
        (e) => e.key === 'a' && (window.__lastKey = performance.now()),
        true,
      )
    })
    for (const key of KONAMI) await page.keyboard.press(key)
    await voiceLike(page, OVERDRIVE_SONG, true)

    const delay = await page.evaluate(() => {
      const song = window.__voices.find((v) => Math.abs(v.duration - 80.1) < 0.01)
      return (song?.startedAt ?? Infinity) - window.__lastKey
    })
    // The palette swap still waits 520ms for the band, but the song must not.
    expect(delay).toBeLessThan(200)
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

  test('OVERDRIVE entered while sound is off starts its song once switched on', async ({
    page,
  }) => {
    await soundOff(page)
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
    await soundOff(page)
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
