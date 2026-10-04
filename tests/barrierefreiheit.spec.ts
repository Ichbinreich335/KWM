import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seiteVorbereiten } from './hilfen';
import { seiten, ziel } from './seiten';

test.skip(ziel !== 'astro', 'prüft den Astro-Build unter wrangler dev');

for (const seite of seiten) {
  // Prüft jede Seite mit axe-core gegen WCAG 2.2 AA.
  test(`Barrierefreiheit (WCAG 2.2 AA): ${seite.name}`, async ({ page }) => {
    await seiteVorbereiten(page, `${seite.astro}?praesentation`, { erwarte404: seite.name === '404' });
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(ergebnis.violations.map((v) => `${v.id}: ${v.nodes.length}× ${v.help}`)).toEqual([]);
  });
}
