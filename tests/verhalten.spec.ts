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

test('Kein Entwurf-Panel, feste Fassung auch mit früher gespeicherter Auswahl', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'kwm-entwurf',
      JSON.stringify({ grund: 'creme', lebensweg: 'zeichnen', einstieg: 'wortbild' }),
    ),
  );
  await page.goto('/?grund=porzellan&einstieg=wortbild');
  await expect(page.locator('html')).toHaveAttribute('data-grund', 'galerie');
  await expect(page.locator('html')).toHaveAttribute('data-lebensweg', 'scrollen');
  await expect(page.locator('[data-variant="einstieg:foto"]')).toBeVisible();
  await expect(page.locator('[data-variant="einstieg:wortbild"]')).toBeHidden();
  await expect(page.getByRole('button', { name: /Entwurf/ })).toHaveCount(0);
});
