import { expect, test } from '@playwright/test';
import { seiten, ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

test('Unbekannte Seite: Status 404 mit eigener Seite, auch tief verschachtelt', async ({ page, request }) => {
  const antwort = await page.goto('/a/b/gibt-es-nicht');
  expect(antwort?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Diese Schale ist leer.');
  for (const href of await page
    .locator('.not-found__links a')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
    expect(href.startsWith('/'), `${href} ist relativ`).toBe(true);
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test('noindex bleibt bis zum Go-live', async ({ request }) => {
  const antwort = await request.get('/');
  expect(antwort.headers()['x-robots-tag']).toContain('noindex');
});

test('Seiten antworten ohne .html mit 200', async ({ request }) => {
  for (const seite of seiten.filter((s) => s.name !== '404')) {
    expect((await request.get(seite.astro, { maxRedirects: 0 })).status(), seite.astro).toBe(200);
  }
});

test('.html leitet auf die saubere URL um', async ({ request }) => {
  const antwort = await request.get('/aktuelles.html', { maxRedirects: 0 });
  expect(antwort.status()).toBeGreaterThanOrEqual(300);
  expect(antwort.status()).toBeLessThan(400);
  expect(antwort.headers()['location']).toBe('/aktuelles');
});

test('Alle internen Links, Bilder, Skripte und Stylesheets antworten mit 200', async ({ page, request }) => {
  const geprueft = new Set<string>();
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const ziele = await page
      .locator('a[href], img[src], link[href], script[src], [data-img]')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('data-img') ?? ''),
      );
    for (const ziel of ziele) {
      // Reine Anker (z. B. href="#" beim aktuellen Menüpunkt) zeigen auf die Seite selbst; auf der 404-Seite wäre das 404.
      if (ziel.startsWith('#')) continue;
      const url = new URL(ziel, page.url());
      if (url.origin !== new URL(page.url()).origin || geprueft.has(url.pathname)) continue;
      geprueft.add(url.pathname);
      expect((await request.get(url.pathname)).status(), `${seite.astro} → ${url.pathname}`).toBe(200);
    }
  }
});

test('Geteilte Prototyp-Links unter /v3/ führen auf die neue Seite, mit Parametern', async ({ page }) => {
  await page.goto('/v3/aktuelles.html?praesentation');
  expect(new URL(page.url()).pathname).toBe('/aktuelles');
  expect(new URL(page.url()).search).toBe('?praesentation');
  await page.goto('/v3/index.html');
  expect(new URL(page.url()).pathname).toBe('/');
});
