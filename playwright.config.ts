import { defineConfig } from '@playwright/test'

const externalServer = process.env.TEST_BASE_URL
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 25_000,
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: externalServer ?? 'http://127.0.0.1:3102',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
    trace: 'retain-on-failure',
  },
  webServer: externalServer ? undefined : {
    command: 'node scripts/start-test-server.mjs',
    url: 'http://127.0.0.1:3102',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
