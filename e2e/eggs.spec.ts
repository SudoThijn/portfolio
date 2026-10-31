import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window {
    hack(): string
  }
}

const SECRET_COUNT = 7
const SECRET_IDS = ['overdrive', 'root', 'charge', 'console', 'leet', 'save', 'signal']
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

// Reduced motion makes every state change immediate, so most tests need no waiting.
test.use({ reducedMotion: 'reduce' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

const html = (page: Page) => page.locator('html')
const chip = (page: Page) => page.locator('.hud__secrets')
const toastTitles = (page: Page) => page.locator('.toast__title')
const terminal = (page: Page) => page.locator('dialog.term')
const termLog = (page: Page) => page.locator('.term__log')
const termInput = (page: Page) => page.locator('.term__input')

async function openTerminal(page: Page) {
  await page.keyboard.type('sudo')
  await expect(terminal(page)).toBeVisible()
}

async function runCommand(page: Page, command: string) {
  await termInput(page).fill(command)
  await page.keyboard.press('Enter')
}

async function enterKonami(page: Page) {
  for (const key of KONAMI) await page.keyboard.press(key)
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
    throw new Error('no empty spot in the viewport')
  })
}

async function storedSecrets(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('td-secrets') ?? '[]') as string[])
}

test.describe('secrets counter', () => {
  test('stays hidden until the first find', async ({ page }) => {
    await expect(chip(page)).toBeHidden()
    await page.evaluate(() => window.hack())
    await expect(chip(page)).toBeVisible()
    await expect(chip(page)).toContainText(`1/${SECRET_COUNT}`)
  })

  test('is remembered across a reload', async ({ page }) => {
    await page.evaluate(() => window.hack())
    await page.reload()
    await expect(chip(page)).toContainText(`1/${SECRET_COUNT}`)
    expect(await storedSecrets(page)).toEqual(['console'])
  })

  test('unlocking the same secret twice counts once', async ({ page }) => {
    await page.evaluate(() => window.hack())
    await page.evaluate(() => window.hack())
    await expect(chip(page)).toContainText(`1/${SECRET_COUNT}`)
    await expect(toastTitles(page)).toHaveCount(1)
  })

  test('survives broken storage', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('td-secrets', '{not json'))
    await page.reload()
    await expect(chip(page)).toBeHidden()
    await page.evaluate(() => window.hack())
    await expect(chip(page)).toContainText(`1/${SECRET_COUNT}`)
  })

  test('the last secret triggers the level-up dialog', async ({ page }) => {
    const sixFound = SECRET_IDS.filter((id) => id !== 'console')
    await page.evaluate((ids) => localStorage.setItem('td-secrets', JSON.stringify(ids)), sixFound)
    await page.reload()
    await page.evaluate(() => window.hack())

    const levelUp = page.locator('dialog.levelup')
    await expect(levelUp).toBeVisible()
    await expect(levelUp).toContainText('Level up!')
    await levelUp.getByRole('button', { name: 'Close' }).click()
    await expect(levelUp).toHaveCount(0)
  })
})

test.describe('console secret', () => {
  test('hack() unlocks Source diver', async ({ page }) => {
    const reply = await page.evaluate(() => window.hack())
    expect(reply).toContain('ACCESS GRANTED')
    await expect(toastTitles(page)).toHaveText(['Source diver'])
  })
})

test.describe('Konami code and OVERDRIVE', () => {
  test('the code switches OVERDRIVE on and Escape switches it off', async ({ page }) => {
    await enterKonami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
    await expect(page.locator('.hero__tags .block--magenta > span')).toHaveText('LV.99')
    await expect(page.locator('.od-exit')).toBeVisible()
    await expect(toastTitles(page)).toHaveText(['Limit break'])

    await page.keyboard.press('Escape')
    await expect(html(page)).not.toHaveClass(/overdrive/)
    await expect(page.locator('.od-exit')).toBeHidden()
  })

  test('the exit button switches OVERDRIVE off', async ({ page }) => {
    await enterKonami(page)
    await page.locator('.od-exit').click()
    await expect(html(page)).not.toHaveClass(/overdrive/)
  })

  test('holding Shift for a capital B does not break the code', async ({ page }) => {
    for (const key of KONAMI.slice(0, 8)) await page.keyboard.press(key)
    await page.keyboard.press('Shift+B')
    await page.keyboard.press('a')
    await expect(html(page)).toHaveClass(/overdrive/)
  })

  test('an extra Up keeps the sequence alive', async ({ page }) => {
    await page.keyboard.press('ArrowUp')
    await enterKonami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
  })

  test('a wrong key resets the sequence', async ({ page }) => {
    for (const key of KONAMI.slice(0, 5)) await page.keyboard.press(key)
    await page.keyboard.press('x')
    for (const key of KONAMI.slice(5)) await page.keyboard.press(key)
    await expect(html(page)).not.toHaveClass(/overdrive/)
  })

  test('keys typed into an input do not count', async ({ page }) => {
    await page.locator('#pw').focus()
    await enterKonami(page)
    await expect(html(page)).not.toHaveClass(/overdrive/)
  })
})

test.describe('Konami code with animations', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('plays the cut-in, then switches over and unlocks', async ({ page }) => {
    await enterKonami(page)
    await expect(page.locator('.cutin')).toHaveClass(/is-playing/)
    await expect(html(page)).toHaveClass(/overdrive/)
    await expect(toastTitles(page)).toHaveText(['Limit break'])
    await expect(page.locator('.cutin')).not.toHaveClass(/is-playing/)
  })
})

test.describe('terminal', () => {
  test('typing sudo opens it, without leaking the last letter into the input', async ({ page }) => {
    await openTerminal(page)
    await expect(termInput(page)).toBeFocused()
    await expect(termInput(page)).toHaveValue('')
    await expect(toastTitles(page)).toHaveText(['Root access'])
  })

  test('the ID button opens it', async ({ page }) => {
    await page.locator('#open-terminal').click()
    await expect(terminal(page)).toBeVisible()
  })

  test('Escape closes it', async ({ page }) => {
    await openTerminal(page)
    await page.keyboard.press('Escape')
    await expect(terminal(page)).toBeHidden()
  })

  test('typing sudo in an input does not open it', async ({ page }) => {
    await page.locator('#pw').focus()
    await page.keyboard.type('sudo')
    await expect(terminal(page)).toBeHidden()
  })

  test('answers commands and rejects unknown ones', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, 'whoami')
    await expect(termLog(page)).toContainText('The owner is Thijn Douwma')
    await runCommand(page, 'nope')
    await expect(termLog(page)).toContainText('command not found: nope')
  })

  test('cd, pwd, ls and cat move through the tiny file system', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, 'cd secrets')
    await expect(page.locator('.term__prompt')).toHaveText('guest@td-os:~/secrets$')
    await runCommand(page, 'pwd')
    await expect(termLog(page)).toContainText('/home/guest/secrets')
    await runCommand(page, 'ls')
    await expect(termLog(page)).toContainText('classified-1.locked')

    await runCommand(page, 'cat classified-1.locked')
    await expect(termLog(page)).toContainText('permission denied')
    await expect(termLog(page)).toContainText('hint: An old cheat code still works here')

    await runCommand(page, 'cd ..')
    await expect(page.locator('.term__prompt')).toHaveText('guest@td-os:~$')
    await runCommand(page, 'cd /etc')
    await expect(termLog(page)).toContainText('permission denied. Guests stay in ~')
  })

  test('a found secret replaces its locked file', async ({ page }) => {
    await page.evaluate(() => window.hack())
    await openTerminal(page)
    await runCommand(page, 'ls secrets')
    await expect(termLog(page)).toContainText('source-diver.txt')
    await runCommand(page, 'cat secrets/source-diver.txt')
    await expect(termLog(page)).toContainText('Ran a command from the dev console')
  })

  test('Tab completes commands, paths and shared prefixes', async ({ page }) => {
    await openTerminal(page)
    await termInput(page).pressSequentially('cat ab')
    await page.keyboard.press('Tab')
    await expect(termInput(page)).toHaveValue('cat about.txt ')

    await termInput(page).fill('who')
    await page.keyboard.press('Tab')
    await expect(termInput(page)).toHaveValue('whoami ')

    await termInput(page).fill('cd sec')
    await page.keyboard.press('Tab')
    await expect(termInput(page)).toHaveValue('cd secrets/')
  })

  test('Tab lists the options when the prefix is ambiguous', async ({ page }) => {
    await openTerminal(page)
    await termInput(page).pressSequentially('c')
    await page.keyboard.press('Tab')
    await expect(termLog(page)).toContainText('cd  cat  clear')
  })

  test('ArrowUp and ArrowDown walk through the history', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, 'pwd')
    await runCommand(page, 'whoami')
    await page.keyboard.press('ArrowUp')
    await expect(termInput(page)).toHaveValue('whoami')
    await page.keyboard.press('ArrowUp')
    await expect(termInput(page)).toHaveValue('pwd')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(termInput(page)).toHaveValue('')
  })

  test('secrets lists progress and secrets reset clears it', async ({ page }) => {
    await page.evaluate(() => window.hack())
    await openTerminal(page)
    await runCommand(page, 'secrets')
    await expect(termLog(page)).toContainText('[x] Source diver')
    await expect(termLog(page)).toContainText('[ ] ???:')

    await runCommand(page, 'secrets reset')
    await expect(termLog(page)).toContainText('Secrets reset')
    await expect(chip(page)).toBeHidden()
    expect(await storedSecrets(page)).toEqual([])
  })

  test('clear empties the log and exit closes the terminal', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, 'clear')
    await expect(termLog(page).locator('div')).toHaveCount(0)
    await runCommand(page, 'exit')
    await expect(terminal(page)).toBeHidden()
  })

  test('Ctrl+S inside the terminal saves from there', async ({ page }) => {
    await openTerminal(page)
    await page.keyboard.press('Control+s')
    await expect(termLog(page)).toContainText('Game saved.')
    await expect(toastTitles(page)).toContainText(['Save point'])
  })
})

test.describe('charge shot', () => {
  test('holding on empty space until full, then releasing, unlocks Full charge', async ({
    page,
  }) => {
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await expect(page.locator('.charge')).toHaveClass(/is-full/)
    await page.mouse.up()
    await expect(toastTitles(page)).toHaveText(['Full charge'])
  })

  test('a quick click does nothing', async ({ page }) => {
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.up()
    await expect(toastTitles(page)).toHaveCount(0)
    await expect(chip(page)).toBeHidden()
  })

  test('releasing before the ring is full does not fire', async ({ page }) => {
    const { x, y } = await emptySpot(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await expect(page.locator('.charge')).toHaveClass(/is-on/)
    await page.mouse.up()
    await expect(toastTitles(page)).toHaveCount(0)
  })

  test('holding on a button does not charge', async ({ page }) => {
    await page.locator('#open-terminal').hover()
    await page.mouse.down()
    await expect(page.locator('.charge')).not.toHaveClass(/is-on/)
    await page.mouse.up()
  })
})

test.describe('LEET mode', () => {
  const clickClock = async (page: Page, times: number) => {
    for (let i = 0; i < times; i++) await page.locator('#clock').click()
  }

  test('five clicks on the clock turn the text into leetspeak', async ({ page }) => {
    await clickClock(page, 5)
    await expect(html(page)).toHaveClass(/leet/)
    await expect(page.locator('.hud__place')).toHaveText('D20n73n')
    await expect(toastTitles(page)).toHaveText(['Elite'])
  })

  test('four clicks are not enough', async ({ page }) => {
    await clickClock(page, 4)
    await expect(html(page)).not.toHaveClass(/leet/)
  })

  test('typing 1337 in the terminal closes it and starts LEET', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, '1337')
    await expect(termLog(page)).toContainText('3l173 m0d3 3n6463d')
    await expect(terminal(page)).toBeHidden()
    await expect(html(page)).toHaveClass(/leet/)
  })

  test('Escape ends it and restores the text', async ({ page }) => {
    await clickClock(page, 5)
    await expect(html(page)).toHaveClass(/leet/)
    await page.keyboard.press('Escape')
    await expect(html(page)).not.toHaveClass(/leet/)
    await expect(page.locator('.hud__place')).toHaveText('Dronten')
  })

  test('ends by itself after 13.37 seconds', async ({ page }) => {
    await page.clock.install()
    await page.reload()
    await clickClock(page, 5)
    await expect(html(page)).toHaveClass(/leet/)

    await page.clock.runFor(13000)
    await expect(html(page)).toHaveClass(/leet/)
    await page.clock.runFor(1000)
    await expect(html(page)).not.toHaveClass(/leet/)
    await expect(page.locator('.hud__place')).toHaveText('Dronten')
  })

  test('starts by itself at 13:37 in Dronten', async ({ page }) => {
    // 12:36:58 UTC is 13:36:58 in Amsterdam, which is on CET at the end of October.
    await page.clock.install({ time: new Date('2026-10-31T12:36:58Z') })
    await page.reload()
    await page.clock.runFor(1000)
    await expect(html(page)).not.toHaveClass(/leet/)
    await page.clock.runFor(2000)
    await expect(html(page)).toHaveClass(/leet/)
  })

  test('OVERDRIVE and LEET replace each other', async ({ page }) => {
    await enterKonami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
    await clickClock(page, 5)
    await expect(html(page)).toHaveClass(/leet/)
    await expect(html(page)).not.toHaveClass(/overdrive/)

    await enterKonami(page)
    await expect(html(page)).toHaveClass(/overdrive/)
    await expect(html(page)).not.toHaveClass(/leet/)
  })
})

test.describe('save point', () => {
  test('Ctrl+S shows the save box and unlocks Save point', async ({ page }) => {
    await page.keyboard.press('Control+s')
    const box = page.locator('.savepoint')
    await expect(box).toContainText('Saving')
    await expect(box).toContainText('Game saved.')
    await expect(box).toContainText(`Secrets 1/${SECRET_COUNT}`)
    await expect(toastTitles(page)).toHaveText(['Save point'])
  })

  test('typing save in the terminal also unlocks it', async ({ page }) => {
    await openTerminal(page)
    await runCommand(page, 'save')
    await expect(termLog(page)).toContainText('Game saved.')
    await expect(toastTitles(page)).toContainText(['Save point'])
  })

  test('Ctrl+S does not open the browser save dialog', async ({ page }) => {
    const prevented = await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    })
    expect(prevented).toBe(true)
  })
})

test.describe('tab-away', () => {
  const setHidden = (page: Page, hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => value })
      document.dispatchEvent(new Event('visibilitychange'))
    }, hidden)

  test('the title calls the visitor back, and returning unlocks Signal restored', async ({
    page,
  }) => {
    const title = await page.title()
    const icon = page.locator('link[rel="icon"]')
    const iconBefore = (await icon.getAttribute('href')) ?? ''

    await setHidden(page, true)
    await expect(page).toHaveTitle('⚠ Signal lost…')
    await expect(icon).not.toHaveAttribute('href', iconBefore)

    await setHidden(page, false)
    await expect(page).toHaveTitle(title)
    await expect(icon).toHaveAttribute('href', iconBefore)
    await expect(toastTitles(page)).toHaveText(['Signal restored'])
  })

  test('the title alternates while away', async ({ page }) => {
    await page.clock.install()
    await page.reload()
    await setHidden(page, true)
    await expect(page).toHaveTitle('⚠ Signal lost…')
    await page.clock.runFor(1000)
    await expect(page).toHaveTitle('Come back?')
  })
})

test.describe('every secret', () => {
  test('all seven can be found, ending in the level-up dialog', async ({ page }) => {
    await enterKonami(page)
    await page.evaluate(() => window.hack())
    await page.keyboard.press('Control+s')
    await expect(chip(page)).toContainText(`3/${SECRET_COUNT}`)

    const spot = await emptySpot(page)
    await page.mouse.move(spot.x, spot.y)
    await page.mouse.down()
    await expect(page.locator('.charge')).toHaveClass(/is-full/)
    await page.mouse.up()

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
      document.dispatchEvent(new Event('visibilitychange'))
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await openTerminal(page)
    await runCommand(page, '1337')

    await expect(chip(page)).toContainText(`${SECRET_COUNT}/${SECRET_COUNT}`)
    expect((await storedSecrets(page)).sort()).toEqual([...SECRET_IDS].sort())
    await expect(page.locator('dialog.levelup')).toBeVisible()
  })
})
