import { defineConfig } from '@playwright/test';

// Eigener Lauf für den Vorschau-Modus (Build auf einem Branch ungleich main, Worker mit ANFRAGE_MODUS=vorschau).
// Eigener Build-Ordner und eigener Port, damit die Hauptläufe auf 8787 unberührt bleiben.
const PORT = 8788;
const BASIS = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests-vorschau',
  use: { baseURL: BASIS, reducedMotion: 'reduce' },
  expect: { timeout: 30_000 },
  projects: [
    { name: 'vorschau-desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'vorschau-mobil', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: `WORKERS_CI=1 WORKERS_CI_BRANCH=vorschau-test npx astro build --outDir dist-vorschau && npx wrangler dev --port ${PORT} --assets dist-vorschau --var ANFRAGE_MODUS:vorschau --var ERLAUBTE_ORIGINS:${BASIS}`,
    url: `${BASIS}/robots.txt`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
