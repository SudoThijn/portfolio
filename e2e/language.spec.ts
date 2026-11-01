import process from 'node:process'
import { expect, test, type Page } from '@playwright/test'

// The static reference design in design_example/ has no language switch.
test.skip(!process.env.E2E_URL, 'Needs the Vue app: set E2E_URL.')

test.use({ reducedMotion: 'reduce' })

const html = (page: Page) => page.locator('html')
const switcher = (page: Page) => page.getByRole('group', { name: /language|taal/i })
const pick = (page: Page, name: 'English' | 'Nederlands') =>
  switcher(page).getByRole('button', { name }).click()
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
async function konami(page: Page) {
  for (const key of KONAMI) await page.keyboard.press(key)
}
const terminal = (page: Page) => page.locator('dialog.term')
const termLog = (page: Page) => page.locator('.term__log')
const termInput = (page: Page) => page.locator('.term__input')

async function run(page: Page, command: string) {
  await termInput(page).fill(command)
  await termInput(page).press('Enter')
}

test.describe('language switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('defaults to English whatever the browser prefers', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'nl-NL', reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(html(page)).toHaveAttribute('lang', 'en')
    await expect(page.locator('.hero__lede')).toContainText('I build interfaces')
    await expect(switcher(page).getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await context.close()
  })

  test('switches the page to Dutch and back', async ({ page }) => {
    await pick(page, 'Nederlands')
    await expect(html(page)).toHaveAttribute('lang', 'nl')
    await expect(page.locator('.hero__lede')).toContainText('Ik bouw interfaces')
    await expect(page.locator('.hud__nav')).toContainText('Profiel')
    await expect(page.locator('.hud__sound-label')).toHaveText('Geluid: aan')
    await expect(page.locator('.status__text')).toHaveText('Beschikbaar vanaf januari 2027')
    await expect(page.locator('#profile-title')).toHaveText('Karakterprofiel')

    await pick(page, 'English')
    await expect(html(page)).toHaveAttribute('lang', 'en')
    await expect(page.locator('.hero__lede')).toContainText('I build interfaces')
  })

  test('remembers the choice after a reload', async ({ page }) => {
    await pick(page, 'Nederlands')
    await page.reload()
    await expect(html(page)).toHaveAttribute('lang', 'nl')
    await expect(page.locator('#profile-title')).toHaveText('Karakterprofiel')
  })

  test('opens in Dutch from a ?lang=nl link without saving it', async ({ page }) => {
    await page.goto('/?lang=nl')
    await expect(html(page)).toHaveAttribute('lang', 'nl')
    await page.goto('/')
    await expect(html(page)).toHaveAttribute('lang', 'en')
  })

  test('translates the password lab', async ({ page }) => {
    await pick(page, 'Nederlands')
    await expect(page.locator('#pw-rank')).toHaveText('Gelekt')
    await expect(page.locator('#pw-time')).toHaveText('direct')
    await page.locator('#pw').fill('abcDEF12')
    await expect(page.locator('#pw-time')).toContainText('in ')
    await expect(page.locator('#pw-bits')).toContainText('bits')
  })

  test('translates achievements, and the secrets keep their file names', async ({ page }) => {
    await pick(page, 'Nederlands')
    await page.keyboard.type('sudo')
    await expect(page.locator('.toast__title')).toHaveText('Root-toegang')
    await expect(page.locator('.toast__kicker')).toContainText('Achievement vrijgespeeld')

    await run(page, 'cd secrets')
    await run(page, 'ls')
    await expect(termLog(page)).toContainText('root-access.txt')
    await run(page, 'cat root-access.txt')
    await expect(termLog(page)).toContainText('De verborgen terminal geopend')
  })

  test('keeps the terminal commands in English and answers in Dutch', async ({ page }) => {
    await pick(page, 'Nederlands')
    await page.keyboard.type('sudo')
    await expect(terminal(page)).toBeVisible()
    await run(page, 'help')
    await expect(termLog(page)).toContainText('toon de commando’s')
    await run(page, 'cat about.txt')
    await expect(termLog(page)).toContainText('Frontend developer uit Dronten')
    await run(page, 'bestaatniet')
    await expect(termLog(page)).toContainText('commando niet gevonden: bestaatniet')

    await termInput(page).fill('ca')
    await termInput(page).press('Tab')
    await expect(termInput(page)).toHaveValue('cat ')
  })

  test('starts the terminal over in the new language after a switch', async ({ page }) => {
    await page.keyboard.type('sudo')
    await run(page, 'whoami')
    await expect(termLog(page)).toContainText('The owner is Thijn Douwma')
    await page.keyboard.press('Escape')
    await pick(page, 'Nederlands')
    await page.keyboard.type('sudo')
    await expect(termLog(page)).toContainText('root-toegang verleend')
    await expect(termLog(page)).not.toContainText('The owner is Thijn Douwma')
    await expect(termLog(page)).not.toContainText('root access granted')
  })

  test('keeps the save count from the moment of saving', async ({ page }) => {
    await page.keyboard.press('Control+s')
    await expect(page.locator('.savepoint__meta')).toContainText('Secrets 1/7')
    await page.keyboard.type('sudo')
    await expect(page.locator('.toast__title').first()).toBeVisible()
    await expect(page.locator('.savepoint__meta')).toContainText('Secrets 1/7')
  })

  test('ends LEET when the language changes, and leaves clean text', async ({ page }) => {
    await page.locator('#clock').click({ clickCount: 5, delay: 30 })
    await expect(html(page)).toHaveClass(/leet/)
    await pick(page, 'Nederlands')
    await expect(html(page)).not.toHaveClass(/leet/)
    await expect(page.locator('.hero__lede')).toContainText('Ik bouw interfaces')
    // The leftover exit sweep would run for about 750 ms, so wait it out.
    await new Promise((resolve) => setTimeout(resolve, 900))
    await expect(page.locator('.hero__lede')).toContainText('Ik bouw interfaces')
    await expect(page.locator('#profile-title')).toHaveText('Karakterprofiel')
  })

  test('LEET still turns Dutch text into leetspeak', async ({ page }) => {
    await pick(page, 'Nederlands')
    await page.locator('#clock').click({ clickCount: 5, delay: 30 })
    await expect(html(page)).toHaveClass(/leet/)
    await expect(page.locator('#profile-title')).toHaveText('K424k732p20f13l', { timeout: 3000 })
  })

  test('overdrive keeps its status text in the chosen language', async ({ page }) => {
    await konami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
    await expect(page.locator('.status__text')).toContainText('Overdrive active')
    await pick(page, 'Nederlands')
    await expect(page.locator('.status__text')).toContainText('Overdrive actief')
    await page.keyboard.press('Escape')
    await expect(page.locator('.status__text')).toHaveText('Beschikbaar vanaf januari 2027')
  })

  test('going from overdrive straight into LEET leetspeaks the status line, and ends clean', async ({
    page,
  }) => {
    await konami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
    await page.locator('#clock').click({ clickCount: 5, delay: 30 })
    await expect(html(page)).toHaveClass(/leet/)
    await expect(page.locator('.status__text')).toHaveText('4v41l48l3 f20m J4nu42y 2027')
    await page.keyboard.press('Escape')
    await expect(page.locator('.status__text')).toHaveText('Available from January 2027')
  })

  test('keeps a click on the other language after a ?lang= link', async ({ page }) => {
    await page.goto('/?lang=nl')
    await pick(page, 'English')
    await expect(page).not.toHaveURL(/lang=/)
    await page.reload()
    await expect(html(page)).toHaveAttribute('lang', 'en')
  })

  test('saves the language of a ?lang= link when its button is clicked', async ({ page }) => {
    await page.goto('/?lang=nl')
    await pick(page, 'Nederlands')
    await page.goto('/')
    await expect(html(page)).toHaveAttribute('lang', 'nl')
  })

  test('names the buttons so that they start with their visible text', async ({ page }) => {
    await expect(switcher(page).getByRole('button', { name: /^EN\b/ })).toBeVisible()
    await expect(switcher(page).getByRole('button', { name: /^NL\b/ })).toBeVisible()
  })

  test('translates the save box while it is showing', async ({ page }) => {
    await page.keyboard.press('Control+s')
    await expect(page.locator('.savepoint__meta')).toContainText('Secrets')
    await pick(page, 'Nederlands')
    await expect(page.locator('.savepoint__text')).toContainText('Spel opgeslagen.')
    await expect(page.locator('.savepoint__meta')).toContainText('Geheimen')
  })

  for (const width of [390, 900, 1440, 1920]) {
    test(`keeps the tickers full after switching language at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/?lang=nl')
      await pick(page, 'English')
      const gaps = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.ticker__track')]
          .map((track) => track.scrollWidth - (track.parentElement?.clientWidth ?? 0) * 2)
          .filter((spare) => spare < 0),
      )
      expect(gaps).toEqual([])
    })
  }
})

// Reduced motion skips the name scramble and the OVERDRIVE band, so these need the real animation.
test.describe('LEET with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('waits for the OVERDRIVE band, then takes over from it', async ({ page }) => {
    await page.goto('/')
    await konami(page)
    // The HUD shakes for the first 650 ms, and clicks on the moving clock would miss.
    await expect(html(page)).not.toHaveClass(/od-shake/)
    await page.locator('#clock').click({ clickCount: 5, delay: 30 })
    await expect(html(page)).not.toHaveClass(/leet/)
    await expect(html(page)).toHaveClass(/leet/, { timeout: 4000 })
    await expect(html(page)).not.toHaveClass(/overdrive/)
  })

  test('typing 1337 during the band is not lost either', async ({ page }) => {
    await page.goto('/')
    await konami(page)
    await page.keyboard.type('sudo')
    await page.locator('.term__input').fill('1337')
    await page.locator('.term__input').press('Enter')
    await expect(html(page)).toHaveClass(/leet/, { timeout: 4000 })
    await expect(html(page)).not.toHaveClass(/overdrive/)
  })

  test('the name is plain again right after a language switch', async ({ page }) => {
    await page.goto('/')
    await page.locator('#clock').click({ clickCount: 5, delay: 30 })
    await expect(html(page)).toHaveClass(/leet/)
    const firstLine = page.locator('.hero__line').first()
    await expect(firstLine).toHaveText('7h1jn', { timeout: 3000 })
    await pick(page, 'Nederlands')
    await expect(firstLine).toHaveText('Thijn', { timeout: 500 })
    await expect(page.locator('.hero__line').nth(1)).toHaveText('Douwma', { timeout: 500 })
  })
})
