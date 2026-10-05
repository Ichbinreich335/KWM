import { expect, test } from '@playwright/test';
import { seiteVorbereiten } from './hilfen';
import { seiten } from './seiten';

// Breite Bildschirme: Das Raster wächst nur bis --raster-max (global.css), darüber wächst der Seitenrand (DESIGN.md §4).
// Die Breite setzt der Test selbst, deshalb nur in den Desktop-Projekten (Chromium und WebKit).
const RASTER_MAX = 1512;
const BREITEN = [1920, 2560] as const;

for (const breite of BREITEN) {
  test.describe(`${breite} px`, () => {
    test.use({ viewport: { width: breite, height: 1080 } });
    test.skip(({ isMobile }) => isMobile, 'Breite Bildschirme nur am Desktop');

    for (const seite of seiten) {
      test(`Kein Überlauf, nichts abgeschnitten, Raster begrenzt: ${seite.name}`, async ({ page }) => {
        const fehler = await seiteVorbereiten(page, seite.pfad, { erwarte404: seite.name === '404' });
        const befund = await page.evaluate((rasterMax) => {
          const funde: string[] = [];
          const breite = document.documentElement.clientWidth;
          const name = (el: Element) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`;
          for (const el of document.querySelectorAll<HTMLElement>('body *')) {
            // Ausgenommen: nur für Screenreader und der Honigtopf des Formulars (absichtlich außerhalb des Bildschirms)
            if (el.closest('.visually-hidden, [hidden], [aria-hidden="true"]')) continue;
            const hatText = [...el.childNodes].some((k) => k.nodeType === Node.TEXT_NODE && k.textContent?.trim());
            if (!hatText) continue;
            const box = el.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) continue;
            if (box.left < -1 || box.right > breite + 1) funde.push(`ragt hinaus: ${name(el)}`);
            const stil = getComputedStyle(el);
            const kappt = /hidden|clip/.test(stil.overflowX);
            if (kappt && el.scrollWidth > el.clientWidth + 1) funde.push(`abgeschnitten: ${name(el)}`);
          }
          for (const raster of document.querySelectorAll<HTMLElement>('.grid')) {
            const stil = getComputedStyle(raster);
            const inhalt = raster.clientWidth - parseFloat(stil.paddingLeft) - parseFloat(stil.paddingRight);
            if (inhalt > rasterMax + 1) funde.push(`Raster ${Math.round(inhalt)} px breit: ${name(raster)}`);
          }
          return funde;
        }, RASTER_MAX);
        expect(befund).toEqual([]);
        expect(fehler, 'Konsolenfehler').toEqual([]);
      });
    }
  });
}

test.describe('Optik 1920 px', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });
  test.skip(({ isMobile }) => isMobile, 'Breite Bildschirme nur am Desktop');

  test('Optik: start-1920', async ({ page }) => {
    const fehler = await seiteVorbereiten(page, '/?praesentation');
    await expect(page).toHaveScreenshot('start-1920.png', { fullPage: true });
    expect(fehler, 'Konsolenfehler').toEqual([]);
  });
});
