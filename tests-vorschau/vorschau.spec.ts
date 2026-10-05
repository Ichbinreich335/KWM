import { expect, test } from '@playwright/test';

// Vorschau-Build: kein Turnstile-Widget, Hinweis sichtbar, Bestätigung ohne Versand und ohne Siteverify-Aufruf.
test('Vorschau: Hinweis statt Widget, Bestätigung ohne Versand', async ({ page }) => {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(e.message));
  const anfragen: string[] = [];
  page.on('request', (r) => anfragen.push(r.url()));

  await page.goto('/besuch#anfrage');
  await expect(page.locator('.anfrage__vorschau')).toHaveText('Vorschau – Anfragen werden noch nicht versendet.');
  await expect(page.locator('.anfrage__turnstile')).toHaveCount(0);

  await page.getByLabel('Name', { exact: true }).fill('Erika Mustermann');
  await page.getByLabel('E-Mail').fill('erika@beispiel.de');
  await page.getByLabel('Nachricht').fill('Gibt es die Teeschale auch in Blau?');
  const antwort = page.waitForResponse((r) => r.url().endsWith('/api/anfrage'));
  await page.getByRole('button', { name: 'Anfrage senden' }).click();
  expect((await antwort).status()).toBe(200);

  await expect(page.locator('.anfrage__done')).toBeVisible();
  await expect(page.locator('.anfrage__done')).toContainText('In dieser Vorschau wurde nichts versendet.');
  await expect(page.locator('.anfrage__form')).toBeHidden();
  expect(
    anfragen.filter((url) => url.includes('challenges.cloudflare.com')),
    'Turnstile darf nicht geladen werden',
  ).toEqual([]);
  expect(fehler, 'Konsolenfehler').toEqual([]);
});
