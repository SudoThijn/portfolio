import { expect, test, type Page } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

const scrollToSection = (page: Page, id: string) =>
  page.evaluate((target) => document.getElementById(target)?.scrollIntoView(), id)

test.describe('builds', () => {
  test('features the Keepiq extension as a work in progress', async ({ page }) => {
    const feature = page.locator('#builds .feature')
    await expect(feature.locator('.feature__title')).toHaveText('Keepiq browser extension')
    await expect(feature.locator('.block', { hasText: 'WIP' })).toBeVisible()
    await expect(feature.locator('.feature__facts')).toContainText('Lead frontend developer')

    const code = feature.getByRole('link', { name: 'View the code' })
    await expect(code).toHaveAttribute(
      'href',
      'https://github.com/ConductionNL/keepiq/tree/development/browser-extension',
    )
    await expect(code).toHaveAttribute('target', '_blank')
  })

  test('links only to the SudoThijn profile', async ({ page }) => {
    const links = await page
      .locator('#builds .repo')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')))
    expect(links).toEqual(['https://github.com/SudoThijn'])
  })
})

test.describe('password lab', () => {
  test('rates what you type and shows the numbers', async ({ page }) => {
    const lab = page.locator('#lab')
    await expect(lab).toHaveAttribute('data-rank', 'critical')
    await expect(page.locator('#pw-rank')).toHaveText('Leaked')
    await expect(page.locator('#meter i.on')).toHaveCount(1)

    await page.locator('#pw').fill('xK9#mQ2$vL7!pR4&wZ8@nB5%cT3^')
    await expect(lab).toHaveAttribute('data-rank', 'overkill')
    await expect(page.locator('#pw-rank')).toHaveText('Overkill')
    await expect(page.locator('#pw-len')).toHaveText('28')
    await expect(page.locator('#pw-pool')).toHaveText('95')
    await expect(page.locator('#pw-time')).toHaveText('after the universe ends')
    await expect(page.locator('#meter i.on')).toHaveCount(12)
  })

  test('Generate fills in a strong 20-character password', async ({ page }) => {
    await page.locator('#pw-gen').click()
    await expect(page.locator('#pw')).toHaveValue(/^.{20}$/)
    await expect(page.locator('#pw-len')).toHaveText('20')
    await expect(page.locator('#pw-rank')).not.toHaveText('Leaked')
  })
})

test.describe('stats', () => {
  test('hovering a stat inspects it', async ({ page }) => {
    await expect(page.locator('#stat-info-text')).toHaveText('Hover or focus a stat to inspect it.')
    await page.locator('.stat').nth(2).hover()
    await expect(page.locator('#stat-info-text')).toContainText('Vue: Production interfaces')
    await expect(page.locator('.stat.is-active')).toHaveCount(1)
  })

  test('focusing a stat inspects it too', async ({ page }) => {
    await page.locator('.stat').nth(4).focus()
    await expect(page.locator('#stat-info-text')).toContainText('PHP / backend: The basics')
  })

  test('the segments match each level', async ({ page }) => {
    await expect(page.locator('.stat').first().locator('.segs i')).toHaveCount(10)
    await expect(page.locator('.stat').first().locator('.segs i.on')).toHaveCount(8)
    await expect(page.locator('.stat').last().locator('.segs i.on')).toHaveCount(3)
  })
})

test.describe('navigation', () => {
  test('the nav marks the section in view', async ({ page }) => {
    await scrollToSection(page, 'quests')
    await expect(page.locator('.hud__nav a[href="#quests"]')).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.locator('.hud__nav a[href="#profile"]')).toHaveAttribute(
      'aria-current',
      'false',
    )

    await page.evaluate(() => scrollTo(0, 0))
    await expect(page.locator('.hud__nav a[aria-current="true"]')).toHaveCount(0)
  })

  test('the progress bar fills while scrolling', async ({ page }) => {
    await expect(page.locator('#progress')).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)')
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await expect(page.locator('#progress')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })

  test('the clock shows time in the Amsterdam zone', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-31T10:15:30Z') })
    await page.reload()
    await expect(page.locator('#clock')).toHaveText('11:15:30')
  })
})

test.describe('copy email', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('copies the address and confirms', async ({ page }) => {
    const button = page.locator('#copy-email')
    await button.click()
    await expect(button).toHaveText('Copied')
    await expect(button).toHaveClass(/is-done/)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'thijn.douwma@outlook.com',
    )
    await expect(button).toHaveText('Copy')
    await expect(button).not.toHaveClass(/is-done/)
  })
})

test.describe('ticker', () => {
  test('repeats its text to cover the band twice over', async ({ page }) => {
    for (const track of await page.locator('.ticker__track').all()) {
      const covered = await track.evaluate(
        (el) => el.scrollWidth >= 2 * el.parentElement!.clientWidth,
      )
      expect(covered).toBe(true)
    }
  })
})
