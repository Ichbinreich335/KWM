import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/erfassen');
  await page.getByText('Neues Stück erfassen').first().waitFor({ timeout: 30000 });
  await page.screenshot({ path: `${OUT}/softr-01-erfassen-unikat-${k}.png`, fullPage: true });
  console.log(k, 'metrics', JSON.stringify(await metrics(page)));
  const b = page.locator('#vibe-coding1');
  if (k === 'm') {
    await b.getByRole('button', { name: 'Speichern' }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/softr-02-erfassen-pflichtfelder-${k}.png`, fullPage: true });
    console.log('errors shown:', await b.locator('[role=alert]').allInnerTexts());
    await page.setInputFiles('#foto-input', process.env.TESTFOTO);
    await page.fill('#u-name', 'Test-Schale „Playwright“');
    await b.getByRole('radio', { name: 'Schale' }).click();
    await page.selectOption('#u-lagerort', { label: 'Regal B – Lager' });
    await page.selectOption('#u-kuenstler', { label: 'Anna Keller' });
    await page.fill('#u-masse', 'Ø 20 × H 7 cm');
    await page.fill('#u-preis', '150');
    await b.getByRole('button', { name: 'Speichern' }).click();
    await page.getByText('Gespeichert').first().waitFor({ timeout: 60000 }).catch(e => console.log('NO SUCCESS', e.message));
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/softr-03-erfassen-erfolg-${k}.png`, fullPage: true });
    console.log('success text:', (await page.locator('[role=status]').allInnerTexts()).join(' | '));
    // Editionsware: vorhandene Kombination erhöhen
    await b.getByRole('button', { name: 'Nächstes Stück erfassen' }).click();
    await b.getByRole('tab', { name: 'Editionsware' }).click();
    await page.selectOption('#e-modell', { label: 'Karaffe „Quelle“' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/softr-04-erfassen-edition-${k}.png`, fullPage: true });
    console.log('edition hint:', await page.locator('p.bg-muted').allInnerTexts());
    console.log(k, 'metrics edition', JSON.stringify(await metrics(page)));
  }
  console.log(k, 'console errors', errs);
  await ctx.close();
}
await browser.close();
