import type { Page } from '@playwright/test';

/** Fester Tag für alle Optik-Vergleiche, damit Hinweise und Status gleich ausfallen. */
export const FESTER_TAG = new Date('2026-10-04T10:00:00+02:00');

interface Optionen {
  tag?: Date;
  /** Die 404-Seite meldet ihren eigenen Status als Konsolenfehler. */
  erwarte404?: boolean;
}

/**
 * Lädt eine Seite mit festem Datum, scrollt einmal durch (löst Einblendungen und
 * nachgeladene Signaturen aus) und gibt alle Konsolen- und Skriptfehler zurück.
 */
export async function seiteVorbereiten(page: Page, pfad: string, optionen: Optionen = {}): Promise<string[]> {
  const fehler: string[] = [];
  const webkit = page.context().browser()?.browserType().name() === 'webkit';
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (optionen.erwarte404 && m.text().includes('404')) return;
    // Playwrights Ganzseiten-Screenshot setzt in WebKit selbst ein Stylesheet ein, das unsere CSP blockiert (Werkzeug, kein Seitenfehler)
    if (webkit && m.text().startsWith('Refused to apply a stylesheet')) return;
    fehler.push(m.text());
  });
  await page.clock.setFixedTime(optionen.tag ?? FESTER_TAG);
  await page.goto(pfad);
  await page.waitForLoadState('networkidle');
  const hoehe = await page.evaluate(() => document.documentElement.scrollHeight);
  const schritt = (page.viewportSize()?.height ?? 800) * 0.6;
  for (let y = 0; y < hoehe; y += schritt) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  return fehler;
}
