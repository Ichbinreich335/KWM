import { expect, test } from '@playwright/test';
import { seiten, ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

test('Anfrage-Leiste kodiert das Stück für die Formular-URL', async ({ page }) => {
  await page.goto('/meisterstuecke');
  await expect(page.locator('.anfrage-band .button')).toHaveAttribute(
    'href',
    '/besuch?stueck=Anfrage%20Meisterst%C3%BCcke#anfrage',
  );
});

test('Geschützter Bindestrich in „Young‑Jae“ kommt als Zeichen an, nicht als Entity', async ({ page }) => {
  await page.goto('/young-jae-lee');
  const text = (await page.locator('.anfrage-band__text').textContent()) ?? '';
  expect(text).toContain('Young‑Jae');
  expect(text).not.toContain('&#8209;');
});

test('Anfrageformular übernimmt ?stueck= und springt zum Formular', async ({ page }) => {
  await page.goto('/besuch?stueck=Teeschale%20%C3%A0%20la%20Lee#anfrage');
  await expect(page.locator('#anfrage-stueck')).toHaveValue('Teeschale à la Lee');
  await expect(page.locator('#anfrage')).toBeInViewport();
});

test('Leerzeichen zwischen Inline-Links bleiben erhalten', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero__actions')).toHaveText(/Meisterstücke ansehen\s+Manufakturprogramm/);
});

test('Hinweiszeile erscheint nur in ihrem Zeitraum (Entscheidung im Browser, nicht beim Bauen)', async ({
  browser,
}) => {
  const erkunden = await browser.newPage();
  await erkunden.goto('/');
  const notiz = erkunden.locator('.aktuell__note').first();
  const { start, ende } = await notiz.evaluate((el: HTMLElement) => ({
    start: el.dataset.start ?? '',
    ende: el.dataset.end ?? '',
  }));
  await erkunden.close();

  const imZeitraum = await browser.newPage();
  await imZeitraum.clock.setFixedTime(new Date(`${start}T12:00:00`));
  await imZeitraum.goto('/');
  await expect(imZeitraum.locator('.aktuell__note').first()).toBeVisible();

  const danach = await browser.newPage();
  const tagDanach = new Date(`${ende}T12:00:00`);
  tagDanach.setDate(tagDanach.getDate() + 1);
  await danach.clock.setFixedTime(tagDanach);
  await danach.goto('/');
  await expect(danach.locator('.aktuell__note').first()).toBeHidden();
  await imZeitraum.close();
  await danach.close();
});

test('Kein Entwurf-Panel, feste Fassung der Startseite', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#top')).toBeVisible();
  await expect(page.locator('#einstieg')).toHaveCount(0);
  await expect(page.locator('.komposition')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Entwurf/ })).toHaveCount(0);
});

// Vorschau der Bauhaus-Station: entfällt mit dem Umschalter, sobald ein Entwurf gewählt ist
for (const [abfrage, sichtbar] of [
  ['', 1],
  ['?bauhaus=1', 1],
  ['?bauhaus=2', 2],
  ['?bauhaus=3', 3],
  ['?bauhaus=9', 1],
] as const) {
  test(`Bauhaus-Station zeigt genau Entwurf ${sichtbar} bei „${abfrage || 'ohne Angabe'}“`, async ({ page }) => {
    await page.goto(`/${abfrage}`);
    for (const entwurf of [1, 2, 3]) {
      await expect(page.locator(`.entwurf--${entwurf}`)).toBeVisible({ visible: entwurf === sichtbar });
    }
    await expect(page.locator('#bauhaus h2:visible')).toHaveCount(1);
  });
}

test('Expander (Zeile): Enter öffnet und schließt, Tab überspringt den geschlossenen Inhalt', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'Safari springt mit Tab standardmäßig nicht zu Links (nur Option+Tab)');
  await page.goto('/aktuelles');
  const erster = page.locator('#jahr-2026 .expander__btn');
  const zweiter = page.locator('#jahr-2025 .expander__btn');
  const inhalt = page.locator('#jahr-2026-liste');
  await expect(erster).toHaveAttribute('aria-expanded', 'false');
  await expect(inhalt).toBeHidden();
  await erster.focus();
  await page.keyboard.press('Tab');
  await expect(zweiter).toBeFocused();
  await erster.focus();
  await page.keyboard.press('Enter');
  await expect(erster).toHaveAttribute('aria-expanded', 'true');
  await expect(inhalt).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(inhalt.locator('a').first()).toBeFocused();
  await erster.focus();
  await page.keyboard.press('Space');
  await expect(erster).toHaveAttribute('aria-expanded', 'false');
  await expect(inhalt).toBeHidden();
});

test('Expander (lang): Sprung auf ein Jahr im Archiv öffnet die Gesamtliste', async ({ page }) => {
  await page.goto('/young-jae-lee#ausst-1991');
  const liste = page.locator('#alle-ausstellungen');
  await expect(liste).toHaveClass(/is-open/);
  await expect(liste.locator('.expander__btn')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#ausst-1991')).toBeVisible();
});

test('Orte-Kacheln: Enter öffnet den Detailbereich, Escape schließt ihn und gibt den Fokus zurück', async ({
  page,
}) => {
  await page.goto('/');
  const orte = page.locator('#orte');
  await expect(orte).toHaveClass(/is-ready/);
  const koeln = orte.locator('.orte__toggle', { hasText: 'Köln' });
  const muenchen = orte.locator('.orte__toggle', { hasText: 'München' });
  await koeln.focus();
  await page.keyboard.press('Tab');
  await expect(muenchen).toBeFocused();
  await koeln.focus();
  await page.keyboard.press('Enter');
  await expect(koeln).toHaveAttribute('aria-expanded', 'true');
  const detail = orte.locator('.orte__detail');
  await expect(detail).toHaveCount(1);
  await expect(detail.locator('.orte__detail-title')).toHaveText('Köln');
  await expect(detail.locator('.orte__detail-in')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(koeln).toHaveAttribute('aria-expanded', 'false');
  await expect(koeln).toBeFocused();
  await expect(detail).toHaveCount(0);
});

test('Orte-Kacheln: Schließen-Knopf und zweite Kachel tauschen den Detailbereich', async ({ page }) => {
  await page.goto('/');
  const orte = page.locator('#orte');
  const koeln = orte.locator('.orte__toggle', { hasText: 'Köln' });
  const muenchen = orte.locator('.orte__toggle', { hasText: 'München' });
  await koeln.focus();
  await page.keyboard.press('Space');
  await expect(koeln).toHaveAttribute('aria-expanded', 'true');
  await muenchen.focus();
  await page.keyboard.press('Enter');
  await expect(muenchen).toHaveAttribute('aria-expanded', 'true');
  await expect(koeln).toHaveAttribute('aria-expanded', 'false');
  await expect(orte.locator('.orte__detail-title')).toHaveText('München');
  await orte.locator('.orte__close').press('Enter');
  await expect(muenchen).toHaveAttribute('aria-expanded', 'false');
});

test('Flyer auf Aktuelles: Vorschau öffnet den Dialog, Esc schließt und gibt den Fokus zurück', async ({ page }) => {
  await page.goto('/aktuelles');
  const rueckseite = page.getByRole('button', { name: 'Rückseite des Flyers vergrößern' }).first();
  await rueckseite.scrollIntoViewIfNeeded();
  const tippflaeche = await rueckseite.boundingBox();
  expect(tippflaeche?.height).toBeGreaterThanOrEqual(44);
  await rueckseite.click();
  const dialog = page.getByRole('dialog', { name: /Flyer „Kummerschalen“/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveCount(2);
  // Das niedrig aufgelöste Bild wird nicht über seine Originalgröße gezogen (330 px)
  const breite = await dialog
    .getByRole('img')
    .last()
    .evaluate((img) => img.getBoundingClientRect().width);
  expect(breite).toBeLessThanOrEqual(330);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(rueckseite).toBeFocused();
});

test('Flyer auf der Startseite: Textlink in der aufgeklappten Karte öffnet denselben Dialog', async ({ page }) => {
  await page.goto('/');
  const karte = page.locator('.aktuell__item', { hasText: 'Kummerschalen' });
  await karte.scrollIntoViewIfNeeded();
  await karte.getByRole('button', { name: 'Mehr zur Ausstellung' }).click();
  await karte.getByRole('button', { name: 'Flyer ansehen' }).click();
  const dialog = page.getByRole('dialog', { name: /Flyer „Kummerschalen“/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Schließen' }).click();
  await expect(dialog).toBeHidden();
  await expect(karte.getByRole('button', { name: 'Flyer ansehen' })).toBeFocused();
});

test('Mobilmenü: Seite dahinter ist inert, Tab bleibt im Menü, Escape schließt und gibt den Fokus zurück', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1440) > 900, 'Mobilmenü gibt es nur bis 900 px');
  await page.goto('/');
  const knopf = page.locator('[data-menu-toggle]');
  await knopf.click();
  await expect(knopf).toHaveAttribute('aria-expanded', 'true');
  for (const sel of ['main', 'footer', '.skip']) {
    await expect(page.locator(sel).first()).toHaveJSProperty('inert', true);
  }
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const imInhalt = await page.evaluate(() => !!document.activeElement?.closest('main, footer, .skip'));
    expect(imInhalt, `Fokus nach ${i + 1}. Tab im Seiteninhalt`).toBe(false);
  }
  await page.keyboard.press('Escape');
  await expect(knopf).toHaveAttribute('aria-expanded', 'false');
  await expect(knopf).toBeFocused();
  for (const sel of ['main', 'footer', '.skip']) {
    await expect(page.locator(sel).first()).toHaveJSProperty('inert', false);
  }
});

test('99-Schalen-Hinweis verweist auf die Ausstellung und verschwindet nach ihrem Ende', async ({ browser }) => {
  const davor = await browser.newPage();
  await davor.clock.setFixedTime(new Date('2026-10-04T10:00:00+02:00'));
  await davor.goto('/');
  await expect(davor.locator('#kosmos .cosmos__show[data-end]')).toHaveCount(2);
  await expect(davor.locator('#kosmos .cosmos__show[data-end]:not([hidden])')).toHaveCount(2);
  await expect(davor.locator('#kosmos .cosmos__show').first()).toContainText('bis 25. Oktober 2026');
  await expect(davor.locator('#kosmos a[href="/aktuelles#f-mok"]:not([hidden])')).toHaveCount(2);
  const danach = await browser.newPage();
  await danach.clock.setFixedTime(new Date('2026-10-26T10:00:00+01:00'));
  await danach.goto('/');
  await expect(danach.locator('#kosmos [data-end][hidden]')).toHaveCount(4);
  await davor.close();
  await danach.close();
});

for (const breite of [360, 375]) {
  test(`Kein waagrechter Überlauf bei ${breite} px auf allen Seiten`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: 800 });
    for (const seite of seiten) {
      await page.goto(seite.astro);
      const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(ueberlauf, `${seite.astro} bei ${breite} px`).toBeLessThanOrEqual(0);
      const titel = await page
        .locator('h1')
        .first()
        .evaluate((h) => h.getBoundingClientRect().right);
      expect(titel, `${seite.astro}: Titel ragt über den Rand`).toBeLessThanOrEqual(breite);
    }
  });
}
