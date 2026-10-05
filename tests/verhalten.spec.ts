import { expect, test } from '@playwright/test';
import { ziel } from './seiten';

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

test('Expander (Zeile): Enter öffnet und schließt, Tab überspringt den geschlossenen Inhalt', async ({ page }) => {
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
