import { expect, test } from '@playwright/test';
import { ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

// Die Optik-Tests laufen mit reduzierter Bewegung und sehen deshalb nicht, wenn Regeln mit Skriptklasse
// am html-Element wirkungslos sind. Diese Tests laufen mit voller Bewegung und mit Skript.
test.use({ reducedMotion: 'no-preference' });

const seitenMitKomponenten = [
  '/',
  '/young-jae-lee',
  '/aktuelles',
  '/meisterstuecke',
  '/besuch',
  '/werkstatt',
  '/manufaktur',
  '/404-x',
];

/** Zeigt einen Stil eines Elements (oder Pseudo-Elements) im Zustand, den die Seite gerade hat. */
async function stil(page: import('@playwright/test').Page, selektor: string, eigenschaft: string, pseudo?: string) {
  return page
    .locator(selektor)
    .first()
    .evaluate((el, [e, p]) => getComputedStyle(el, p ?? null).getPropertyValue(e!), [eigenschaft, pseudo]);
}

for (const pfad of seitenMitKomponenten) {
  test(`Astro-Scoping: keine Regel verliert Treffer durch ein Element außerhalb ihrer Komponente (${pfad})`, async ({
    page,
  }) => {
    await page.goto(pfad);
    await page.waitForLoadState('networkidle');
    const verluste = await page.evaluate(() => {
      const verloren: string[] = [];
      const markierung = /:where\(\.astro-[a-z0-9]+\)/g;
      const pruefe = (regeln: CSSRuleList) => {
        for (const regel of Array.from(regeln)) {
          if (!(regel instanceof CSSStyleRule)) {
            if ('cssRules' in regel) pruefe((regel as CSSGroupingRule).cssRules);
            continue;
          }
          if (!markierung.test(regel.selectorText)) continue;
          markierung.lastIndex = 0;
          for (const teil of regel.selectorText.split(/,(?![^(]*\))/)) {
            const ohne = teil.replace(markierung, '');
            try {
              if (document.querySelectorAll(ohne).length > document.querySelectorAll(teil).length) {
                verloren.push(ohne.trim());
              }
            } catch {
              // Selektor ohne Markierung ist nicht gültig, dann gibt es auch nichts zu vergleichen
            }
          }
        }
      };
      for (const blatt of Array.from(document.styleSheets)) pruefe(blatt.cssRules);
      return [...new Set(verloren)];
    });
    expect(verluste).toEqual([]);
  });
}

test('Startseite: Chronik und Lebensweg tragen ihre Skript-Stile (Startzustand und Einblendung)', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Mobil ist die Chronik ein Wischband ohne Einblendung der Einträge
  // weit unten, noch nicht eingeblendet: unsichtbar und nach unten versetzt
  const eintrag = '.chronicle__list li:last-child';
  expect(await stil(page, eintrag, 'opacity')).toBe(isMobile ? '1' : '0');
  expect((await stil(page, eintrag, 'transform')) === 'none').toBe(isMobile);
  // Jahreszahl und Punkt eines noch nicht erreichten Eintrags: gedämpft, Punkt auf Größe 0
  const jahr = '.chronicle__list li:not(.chronicle__item--quiet) .chronicle__year';
  const gedaempft = await stil(page, jahr, 'color');
  expect(await stil(page, jahr, 'scale', '::before')).toBe('0');
  expect(await stil(page, '.journey li', 'scale', '::after')).toBe('0');

  await page.locator(eintrag).scrollIntoViewIfNeeded();
  await page.locator('.chronicle__list').scrollIntoViewIfNeeded();
  await expect.poll(() => stil(page, eintrag, 'opacity')).toBe('1');
  expect(await stil(page, eintrag, 'transform')).toBe('none');
  await expect.poll(() => stil(page, jahr, 'color')).not.toBe(gedaempft);
  await expect.poll(() => stil(page, jahr, 'scale', '::before')).toBe('1');
});

test('Startseite: Details der Ausstellungskarten sind zu (.is-ready) und öffnen sich', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.aktuell')).toHaveClass(/is-ready/);
  const geschlossen = '.aktuell__item:not(.is-open)';
  expect(await stil(page, `${geschlossen} .aktuell__panel`, 'visibility')).toBe('hidden');
  expect(await stil(page, `${geschlossen} .aktuell__panel-in`, 'opacity')).toBe('0');
  expect(await stil(page, '.aktuell__more', 'display')).not.toBe('none');
  await page.locator(`${geschlossen} .aktuell__more`).first().click();
  await expect.poll(() => stil(page, '.aktuell__item.is-open .aktuell__panel', 'visibility')).toBe('visible');
  await expect.poll(() => stil(page, '.aktuell__item.is-open .aktuell__panel-in', 'opacity')).toBe('1');
});

test('Young-Jae Lee: Jahresarchiv ist zu, bis es geöffnet wird (visibility über .js)', async ({ page }) => {
  await page.goto('/young-jae-lee');
  await page.waitForLoadState('networkidle');
  const tafel = '.expander:not(.is-open) > .expander__panel';
  expect(await stil(page, tafel, 'visibility')).toBe('hidden');
  expect(await stil(page, tafel, 'grid-template-rows')).toBe('0px');
  await page.locator('.expander:not(.is-open) .expander__btn').first().click();
  await expect.poll(() => stil(page, '.expander.is-open > .expander__panel', 'visibility')).toBe('visible');
});

test('Aktuelles: Bild des Features füllt seine Fläche (Stil auf Kindelement der Komponente)', async ({ page }) => {
  await page.goto('/aktuelles');
  expect(await stil(page, '.feature__media img', 'object-fit')).toBe('cover');
});

test('Meisterstücke: Kopfzeile der Seite hat Stile aus der Komponente (Einblendung nach dem Scrollen)', async ({
  page,
}) => {
  await page.goto('/meisterstuecke');
  await page.waitForLoadState('networkidle');
  expect(await stil(page, '.subnav', 'position')).toBe('sticky');
});
