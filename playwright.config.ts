import { defineConfig } from '@playwright/test';
import { basisUrl, externeBasis, ziel } from './tests/seiten';

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/__screens__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  use: {
    baseURL: basisUrl[ziel],
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
  expect: {
    // Ganzseitige Screens der Startseite (über 18.000 px hoch) brauchen unter Parallel-Last länger als 5 s.
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobil', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  // Mit BASIS_URL (Vorschau oder Produktion) startet kein lokaler Server.
  webServer: externeBasis
    ? []
    : ziel === 'prototyp'
      ? { command: 'npm run prototyp', url: `${basisUrl.prototyp}/v3/index.html`, reuseExistingServer: true }
      : {
          command: 'npm run build && npx wrangler dev --port 8787',
          // robots.txt gibt es immer; / antwortet erst, wenn die Startseite gebaut ist
          url: `${basisUrl.astro}/robots.txt`,
          reuseExistingServer: true,
          timeout: 180_000,
        },
});
