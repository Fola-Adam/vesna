import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/integration',
  timeout: 30_000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3104', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
  webServer: {
    command: 'node scripts/start-integration-server.mjs',
    url: 'http://127.0.0.1:3104',
    timeout: 120_000,
    reuseExistingServer: false,
  },
})
