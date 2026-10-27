// Configuration Playwright : un serveur statique local + 4 formats d'écran.
// BASE_URL permet de viser la vraie page GitHub Pages (test après mise en ligne).
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173/';

module.exports = defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL, browserName: 'chromium' },
  projects: [
    { name: 'telephone', use: { ...devices['Pixel 7'] } },
    { name: 'telephone-carre', use: { viewport: { width: 480, height: 480 }, isMobile: true, hasTouch: true } },
    { name: 'tablette', use: { ...devices['Galaxy Tab S4'] } },
    { name: 'ordinateur', use: { viewport: { width: 1366, height: 800 } } },
  ],
  // Serveur local uniquement quand on ne vise pas une URL distante.
  webServer: process.env.BASE_URL ? undefined : {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
