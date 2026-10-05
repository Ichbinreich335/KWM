import { expect, test, type Page } from '@playwright/test';
import { ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

// Diese Specs laufen mit voller Bewegung (Projekte bewegung-*): Sie sehen, was die Optik-Tests mit
// reduzierter Bewegung nicht sehen, nämlich Bewegung am Scrollen, Sprünge und fehlende Skripte.

const seiten = ['/', '/manufaktur', '/young-jae-lee', '/werkstatt'];
const SPRUNG_SCHWELLE = 0.02; // Layout-Shift-Summe (nur Chromium); gemessen 0 bis 0,0096
const LAGE_TOLERANZ = 2; // px, Bild gegenüber dem Dokument

/** Sammelt Inline-Stiländerungen, die ein Bild an das Scrollen hängen würden (translate, transform, --sticky-shift). */
async function beobachteStile(page: Page) {
  await page.addInitScript(() => {
    const funde = new Set<string>();
    (window as unknown as { __lagefunde: Set<string> }).__lagefunde = funde;
    new MutationObserver((liste) => {
      for (const m of liste) {
        if (!(m.target instanceof HTMLElement)) continue;
        const st = m.target.style;
        if (st.translate || st.transform || st.getPropertyValue('--sticky-shift')) {
          funde.add(`${m.target.tagName}.${m.target.className}`);
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ['style'], subtree: true });
    (window as unknown as { __cls: number }).__cls = 0;
    try {
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // WebKit kennt layout-shift nicht
    }
  });
}

async function langsamDurchScrollen(page: Page) {
  const hoehe = await page.evaluate(() => document.documentElement.scrollHeight);
  const fenster = page.viewportSize()?.height ?? 800;
  const hoehen = new Set<number>([hoehe]);
  for (let y = 0; y < hoehe; y += fenster / 3) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    hoehen.add(await page.evaluate(() => document.documentElement.scrollHeight));
  }
  return { hoehe, hoehen };
}

for (const pfad of seiten) {
  test(`Beim Scrollen bewegt sich kein Bild, nichts springt, keine Konsolenfehler (${pfad})`, async ({
    page,
    browserName,
  }) => {
    test.setTimeout(90_000);
    const fehler: string[] = [];
    page.on('pageerror', (e) => fehler.push(e.message));
    page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
    await beobachteStile(page);
    await page.goto(pfad);
    await page.waitForLoadState('networkidle');
    const { hoehen } = await langsamDurchScrollen(page);

    const funde = await page.evaluate(() => [...(window as unknown as { __lagefunde: Set<string> }).__lagefunde]);
    expect(funde, 'Elemente mit Lage-Stil am Scrollen').toEqual([]);

    // Bilder mit Haften (Porträt, Feuer, Startbild): Lage im Dokument bleibt beim Scrollen gleich
    const lagen: number[] = [];
    for (const y of [0, 120, 240]) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(250);
      lagen.push(
        ...(await page.evaluate(() =>
          [...document.querySelectorAll('.hero__media img, .sticky-bild img')].map(
            (img) => img.getBoundingClientRect().top + window.scrollY,
          ),
        )),
      );
    }
    if (pfad === '/') {
      expect(lagen.length, 'Bilder mit Haften gefunden').toBeGreaterThan(0);
    }
    // Mehrere Bilder liegen an verschiedenen Orten: gleiche Bilder bei gleichem Index vergleichen
    const proPosition = lagen.length / 3;
    for (let i = 0; i < proPosition; i++) {
      const werte = [0, 1, 2].map((p) => lagen[p * proPosition + i] ?? 0);
      expect(Math.max(...werte) - Math.min(...werte), `Bild ${i} verschiebt sich im Dokument`).toBeLessThanOrEqual(
        LAGE_TOLERANZ,
      );
    }

    expect(hoehen.size, `Seitenhöhe wechselt beim Scrollen: ${[...hoehen].join(', ')}`).toBeLessThanOrEqual(2);
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(ueberlauf, 'waagrechter Überlauf').toBeLessThanOrEqual(0);
    if (browserName === 'chromium') {
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls, 'Layout-Shift').toBeLessThan(SPRUNG_SCHWELLE);
    }
    expect(fehler, 'Konsole').toEqual([]);
  });
}

for (const pfad of ['/', '/besuch']) {
  test(`Ohne Hauptskript sind nach 3 s alle Inhalte sichtbar (${pfad})`, async ({ page }) => {
    await page.route(/\/_astro\/.*\.js/, (route) => route.abort());
    await page.goto(pfad);
    await page.waitForTimeout(4200);
    const verdeckt = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
        .filter((el) => {
          if (el.getClientRects().length === 0) return false; // nicht dargestellt (z. B. am Handy ausgeblendet)
          if (+getComputedStyle(el).opacity < 0.99) return true;
          const wort = el.querySelector<HTMLElement>('.w > span');
          if (
            wort &&
            getComputedStyle(wort).transform.replace(/\s/g, '') !== 'matrix(1,0,0,1,0,0)' &&
            getComputedStyle(wort).transform !== 'none'
          )
            return true;
          const decke = getComputedStyle(el, '::after');
          return el.dataset['reveal'] === 'img' && decke.content !== 'none' && +decke.opacity > 0.01;
        })
        .map((el) => `${el.tagName}.${el.className}[${el.dataset['reveal']}]`),
    );
    expect(verdeckt, 'weiterhin verdeckte Elemente').toEqual([]);
  });
}

test('Startseite ohne Hauptskript: Überschrift steht schon beim Bauen in Wort-Spans (kein Wegspringen)', async ({
  page,
}) => {
  await page.route(/\/_astro\/.*\.js/, (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.hero__title .w')).not.toHaveCount(0);
  await expect(page.locator('.hero__title .visually-hidden')).toContainText('Immer sind es Schalen');
});
