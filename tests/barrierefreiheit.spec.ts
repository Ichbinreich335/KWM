import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seiteVorbereiten } from './hilfen';
import { seiten } from './seiten';

for (const seite of seiten) {
  // Prüft jede Seite mit axe-core gegen WCAG 2.2 AA.
  test(`Barrierefreiheit (WCAG 2.2 AA): ${seite.name}`, async ({ page }) => {
    await seiteVorbereiten(page, seite.pfad, { erwarte404: seite.name === '404' });
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(ergebnis.violations.map((v) => `${v.id}: ${v.nodes.length}× ${v.help}`)).toEqual([]);
  });
}
