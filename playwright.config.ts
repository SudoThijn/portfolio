import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

// By default the suite runs against the static reference design in design_example/.
// Set E2E_URL to run it against another server, such as the Vue dev server.
const port = 4180
const baseURL = process.env.E2E_URL ?? `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_URL
    ? undefined
    : {
        command: `npx vite design_example --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
})
