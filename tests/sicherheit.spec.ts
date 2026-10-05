import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { seiten, ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

const SICHERHEITS_HEADER = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'x-frame-options': 'DENY',
  'content-security-policy': "frame-ancestors 'none'",
};

test('Antwort-Header enthalten die Sicherheits-Header', async ({ request }) => {
  const header = (await request.get('/')).headers();
  expect(header).toMatchObject(SICHERHEITS_HEADER);
});

for (const seite of seiten) {
  test(`CSP-Meta: genau ein Tag, Kopf-Skript-Hash stimmt: ${seite.name}`, async ({ request }) => {
    const html = await (await request.get(seite.astro)).text();
    const metas = [...html.matchAll(/<meta http-equiv="content-security-policy" content="([^"]*)"/g)];
    expect(metas).toHaveLength(1);
    // Inline-Skripte ohne Attribute sind nur das Kopf-Skript; sein Hash muss in der CSP stehen
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? '');
    expect(inline).toHaveLength(1);
    const hash = `'sha256-${createHash('sha256')
      .update(inline[0] ?? '')
      .digest('base64')}'`;
    expect(metas[0]?.[1]).toContain(hash);
  });
}
