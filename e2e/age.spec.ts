import process from 'node:process'
import { expect, test, type Page } from '@playwright/test'

// The static reference design in design_example/ has a fixed age.
test.skip(!process.env.E2E_URL, 'Needs the Vue app: set E2E_URL.')

test.use({ reducedMotion: 'reduce' })

// Dronten is on Dutch time, so the date changes at its midnight, not at the visitor's.
async function openOn(page: Page, moment: string) {
  await page.clock.setFixedTime(new Date(moment))
  await page.goto('/')
}

async function aboutFile(page: Page) {
  await page.keyboard.type('sudo')
  await page.locator('.term__input').fill('cat about.txt')
  await page.locator('.term__input').press('Enter')
  return page.locator('.term__log')
}

test.describe('the age', () => {
  test('is 23 until the day before the birthday', async ({ page }) => {
    await openOn(page, '2027-10-06T23:30:00+02:00')
    await expect(page.locator('.hero__tags .block--magenta')).toHaveText('LV.23')
    await expect(page.locator('.level__num')).toHaveText('23')
    await expect(await aboutFile(page)).toContainText('Thijn Douwma, 23.')
  })

  test('goes up on 7 October in Dronten, in every place it shows', async ({ page }) => {
    await openOn(page, '2027-10-07T00:30:00+02:00')
    await expect(page.locator('.hero__tags .block--magenta')).toHaveText('LV.24')
    await expect(page.locator('.level__num')).toHaveText('24')
    await expect(await aboutFile(page)).toContainText('Thijn Douwma, 24.')
  })

  test('follows Dutch time for a visitor on the other side of the world', async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: 'Pacific/Auckland' })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date('2027-10-06T22:30:00Z'))
    await page.goto('/')
    // 22:30 UTC is 00:30 in Dronten and already the 7th, whatever the visitor's own date is.
    await expect(page.locator('.level__num')).toHaveText('24')
    await context.close()
  })
})
