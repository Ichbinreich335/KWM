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
