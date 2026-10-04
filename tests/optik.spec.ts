import { expect, test } from '@playwright/test';
import { seiteVorbereiten } from './hilfen';
import { seiten, ziel } from './seiten';

for (const seite of seiten) {
  test(`Optik: ${seite.name}`, async ({ page }) => {
    const fehler = await seiteVorbereiten(page, `${seite[ziel]}?praesentation`, {
      erwarte404: seite.name === '404',
    });
    await expect(page).toHaveScreenshot(`${seite.name}.png`, { fullPage: true });
    expect(fehler, 'Konsolenfehler').toEqual([]);
  });
}
