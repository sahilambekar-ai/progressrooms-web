import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir: './tests/browser', testMatch: '**/*.spec.ts', fullyParallel: true, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
 workers: 2, reporter: [['list'], ['html', { open: 'never' }]],
 use: { baseURL: 'http://127.0.0.1:3110', channel: process.env.PLAYWRIGHT_CHANNEL || undefined, trace: 'retain-on-failure', screenshot: 'only-on-failure', serviceWorkers: 'block' },
 projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
 webServer: [
  { command: process.env.PLAYWRIGHT_PRODUCTION === '1' ? 'NEXT_DIST_DIR=.next-audit-item7 next start --hostname 127.0.0.1 -p 3110' : 'NEXT_PUBLIC_API_URL=http://127.0.0.1:3110/api/v1 NEXT_PUBLIC_APP_ENV=test NEXT_DIST_DIR=.next-audit-browser next dev --hostname 127.0.0.1 -p 3110', url: 'http://127.0.0.1:3110/login', reuseExistingServer: false, timeout: 120000 },
  { command: 'vite --config tests/browser/gallery/vite.config.mts', url: 'http://127.0.0.1:3111', reuseExistingServer: false },
 ],
});
