import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  timeout: 30_000,
  retries: 0,
  forbidOnly: true,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8123/',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'python3 -m http.server 8123',
    url: 'http://127.0.0.1:8123/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
