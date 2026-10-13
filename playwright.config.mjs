import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:4310', trace: 'off' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 5'] } }],
  webServer: { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4310', reuseExistingServer: false },
});
