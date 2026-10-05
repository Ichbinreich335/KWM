import { defineConfig, devices } from '@playwright/test';
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
    // Ganzseitige Screens der Startseite (über 18.000 px hoch) brauchen unter Parallel-Last länger als 5 s,
    // vereinzelt auch knapp 15 s (Phase C2); 30 s geben Luft, ohne die Prüfung zu lockern.
    timeout: 30_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: Number(process.env.OPTIK_TOLERANZ ?? 0.002),
      animations: 'disabled',
      caret: 'hide',
    },
  },
  projects: [
    // Chromium mit reduzierter Bewegung: Optik-Referenzen und alle Funktions-Tests
    { name: 'desktop', testIgnore: /bewegung\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobil',
      testIgnore: /bewegung\.spec\.ts/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    // WebKit (Safari): eigene Optik-Referenzen je Projekt (Schriftglättung weicht von Chromium ab)
    {
      name: 'webkit-desktop',
      testIgnore: /bewegung\.spec\.ts/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
    {
      name: 'webkit-iphone',
      testIgnore: /bewegung\.spec\.ts/,
      use: { ...devices['iPhone 13'], deviceScaleFactor: 1 },
    },
    // Volle Bewegung (kein reducedMotion): nur tests/bewegung.spec.ts
    {
      name: 'bewegung-chromium',
      testMatch: /bewegung\.spec\.ts/,
      use: { viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
    },
    {
      name: 'bewegung-webkit',
      testMatch: /bewegung\.spec\.ts/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
    },
    {
      name: 'bewegung-webkit-iphone',
      testMatch: /bewegung\.spec\.ts/,
      use: { ...devices['iPhone 13'], reducedMotion: 'no-preference' },
    },
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
