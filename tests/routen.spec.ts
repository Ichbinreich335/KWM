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

test('Stylesheet-Reihenfolge: Grundstile, Seiten-CSS, Signaturen, nur die Schrift-Stile inline', async ({ page }) => {
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const pfade = await page
      .locator('link[rel=stylesheet]')
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLLinkElement).href).pathname));
    const wo = `${seite.name}: ${pfade.join(', ')}`;
    expect(pfade[0], wo).toMatch(/^\/_astro\/basis\..+\.css$/);
    expect(pfade.at(-1), wo).toMatch(/^\/_astro\/signaturen\..+\.css$/);
    expect(pfade.length, wo).toBeLessThanOrEqual(3);
    const stile = await page.locator('head style').allTextContents();
    expect(stile.length, `${seite.name}: Anzahl <style> im Head (nur die drei der Fonts API)`).toBe(3);
    for (const stil of stile) {
      expect(stil, `${seite.name}: fremdes <style> im Head`).toMatch(/^@font-face\{.*:root\{--font-[a-z-]+:/s);
    }
  }
});

test('Schriften: genau zwei Preloads, Libre Caslon Display und Jost, jeweils die latin-Datei', async ({ page }) => {
  const latin = 'U+0000-00FF';
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const preloads = await page
      .locator('link[rel=preload][as=font]')
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLLinkElement).href).pathname));
    expect(preloads.length, `${seite.name}: Anzahl Schrift-Preloads`).toBe(2);
    const css = (await page.locator('head style').allTextContents()).join('');
    const familien: string[] = [];
    for (const pfad of preloads) {
      expect(pfad, seite.name).toMatch(/^\/_astro\/fonts\/.+\.woff2$/);
      const regel = css.split('@font-face{').find((r) => r.includes(`url("${pfad}")`));
      expect(regel, `${seite.name}: keine @font-face-Regel für ${pfad}`).toBeDefined();
      expect(regel, `${seite.name}: ${pfad} ist nicht die latin-Datei`).toContain(`unicode-range:${latin},`);
      familien.push(/font-family:([^;]+);/.exec(regel ?? '')?.[1] ?? '');
    }
    expect(preloads[0], `${seite.name}: beide Preloads zeigen auf dieselbe Datei`).not.toBe(preloads[1]);
    expect(familien.filter((f) => /^"?Libre Caslon Display/.test(f)).length, `${seite.name}: ${familien}`).toBe(1);
    expect(familien.filter((f) => /^"?Jost/.test(f)).length, `${seite.name}: ${familien}`).toBe(1);
  }
});

test('Sitemap: Index antwortet, alle Seiten ohne .html, ohne 404 und Datenschutz', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((treffer) => treffer[1] ?? '');
  const erwartet = seiten
    .filter((s) => s.name !== '404' && s.name !== 'datenschutz')
    .map((s) => new URL(s.astro, 'https://kwm-1924.de').href);
  expect([...urls].sort()).toEqual([...erwartet].sort());
  expect(urls.filter((url) => url.endsWith('.html'))).toEqual([]);
});

test('Canonical und Open Graph: je Seite genau ein Canonical ohne .html, og:title wie title, og:image antwortet', async ({
  page,
  request,
}) => {
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const canonical = await page
      .locator('link[rel=canonical]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href') ?? ''));
    if (seite.name === '404') {
      expect(canonical, '404: kein Canonical').toHaveLength(0);
      expect(await page.locator('meta[property="og:url"]').count(), '404: kein og:url').toBe(0);
    } else {
      expect(canonical.length, `${seite.name}: Anzahl Canonical`).toBe(1);
      expect(canonical[0], seite.name).toMatch(/^https:\/\/kwm-1924\.de\/[^.]*$/);
    }
    expect(await page.locator('meta[property="og:title"]').getAttribute('content'), seite.name).toBe(
      await page.title(),
    );
    // Die Domain ist noch nicht live; geprüft wird der Pfad auf dem Testserver.
    const bild = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect((await request.get(new URL(bild ?? '', 'https://kwm-1924.de').pathname)).status(), seite.name).toBe(200);
    for (const eigenschaft of ['width', 'height', 'alt']) {
      const wert = await page.locator(`meta[property="og:image:${eigenschaft}"]`).getAttribute('content');
      expect(wert, `${seite.name}: og:image:${eigenschaft}`).toBeTruthy();
    }
  }
});

test('Strukturierte Daten: nur die Startseite, genau ein parsebares JSON-LD ohne Preise', async ({ page }) => {
  for (const seite of seiten) {
    await page.goto(seite.astro);
    const bloecke = await page.locator('script[type="application/ld+json"]').allTextContents();
    if (seite.name !== 'start') {
      expect(bloecke.length, `${seite.name}: kein JSON-LD erwartet`).toBe(0);
      continue;
    }
    expect(bloecke.length).toBe(1);
    const daten = JSON.parse(bloecke[0] ?? '');
    expect(daten['@type']).toContain('LocalBusiness');
    expect(daten.address.postalCode).toBe('45327');
    expect(daten.openingHoursSpecification).toHaveLength(2);
    expect(bloecke[0]).not.toMatch(/Offer|Product|price/i);
  }
});
