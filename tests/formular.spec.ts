import { expect, test, type Page } from '@playwright/test';

const FORMULAR = '/besuch#anfrage';

async function ausfuellen(page: Page) {
  await page.getByLabel('Name', { exact: true }).fill('Erika Mustermann');
  await page.getByLabel('E-Mail').fill('erika@beispiel.de');
  await page.getByLabel('Nachricht').fill('Gibt es die Teeschale auch in Blau?');
}

function konsolenFehler(page: Page): string[] {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
  return fehler;
}

test('Absenden mit Turnstile-Testschlüssel zeigt den Danke-Zustand', async ({ page }) => {
  const fehler = konsolenFehler(page);
  await page.goto(FORMULAR);
  await ausfuellen(page);
  await page.getByRole('button', { name: 'Anfrage senden' }).click();
  await expect(page.locator('.anfrage__done')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.anfrage__done')).toBeFocused();
  await expect(page.locator('.anfrage__form')).toBeHidden();
  expect(fehler, 'Konsolenfehler').toEqual([]);
});

test('Turnstile lädt erst beim Antippen eines Feldes', async ({ page }) => {
  await page.goto(FORMULAR);
  const skript = page.locator('script[src*="challenges.cloudflare.com"]');
  await expect(skript).toHaveCount(0);
  await expect(page.locator('.anfrage__turnstile-hinweis')).toBeVisible();
  await page.getByLabel('Name', { exact: true }).focus();
  await expect(skript).toHaveCount(1);
  // Das Widget hängt sein Element in den Behälter (die Prüfung selbst liegt in einem geschlossenen Shadow-DOM)
  await expect(page.locator('.anfrage__turnstile-hinweis')).toHaveCount(0);
  await expect(page.locator('.anfrage__turnstile > *')).not.toHaveCount(0, { timeout: 30_000 });
});

test('Versandfehler zeigt Meldung mit Telefon und E-Mail als Ausweg', async ({ page }) => {
  await page.route('**/api/anfrage', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, meldung: 'Ihre Anfrage konnte gerade nicht zugestellt werden.' }),
    }),
  );
  await page.goto(FORMULAR);
  await ausfuellen(page);
  await page.getByRole('button', { name: 'Anfrage senden' }).click();
  const fehler = page.locator('.anfrage__fail');
  await expect(fehler).toBeVisible({ timeout: 30_000 });
  await expect(fehler).toContainText('nicht zugestellt');
  await expect(fehler.getByRole('link', { name: '+49 201 30 50 80' })).toHaveAttribute('href', 'tel:+49201305080');
  await expect(fehler.getByRole('link', { name: 'kontakt@kwm1924.de' })).toBeVisible();
  // Angaben bleiben erhalten, erneutes Senden ist möglich
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Erika Mustermann');
  await expect(page.getByRole('button', { name: 'Anfrage senden' })).toBeEnabled();
});

test('Feldfehler aus der Antwort erscheinen am Feld', async ({ page }) => {
  await page.route('**/api/anfrage', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        meldung: 'Bitte prüfen Sie die markierten Felder.',
        felder: { email: 'Bitte prüfen.' },
      }),
    }),
  );
  await page.goto(FORMULAR);
  await ausfuellen(page);
  await page.getByRole('button', { name: 'Anfrage senden' }).click();
  await expect(page.locator('#anfrage-email-fehler')).toHaveText('Bitte prüfen.', { timeout: 30_000 });
  await expect(page.getByLabel('E-Mail')).toBeFocused();
  await expect(page.locator('.anfrage__fail')).toBeHidden();
});

test('leeres Formular meldet fehlende Felder, ohne zu senden', async ({ page }) => {
  let gesendet = false;
  await page.route('**/api/anfrage', (route) => {
    gesendet = true;
    return route.abort();
  });
  await page.goto(FORMULAR);
  await page.getByRole('button', { name: 'Anfrage senden' }).click();
  await expect(page.locator('.anfrage__summary')).toHaveText('3 Felder brauchen noch Ihre Angabe.');
  expect(gesendet).toBe(false);
});
