import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
const tap = async (l) => { await l.evaluate(el => el.scrollIntoView({ block: 'center' })); await l.click(); };
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/bestand');
  const b = page.locator('#vibe-coding1');
  await b.getByText(/von \d+ Unikaten/).waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  await b.screenshot({ path: `${OUT}/softr-10-bestand-alle-${k}.png` });
  console.log(k, 'Reiter:', (await b.getByRole('tab').allInnerTexts()).join(' | '));
  console.log(k, 'metrics', JSON.stringify(await metrics(page)));
  await b.getByLabel('Suche').fill('Playwright');
  await tap(b.getByRole('button', { name: /Test-Schale/ }).first());
  const det = page.getByRole('dialog'); await det.waitFor(); await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/softr-17-bestand-detail-${k}.png` });
  if (k === 'm') {
    await tap(det.getByRole('button', { name: 'verfügbar', exact: true }));
    await page.getByText('Status: verfügbar').waitFor({ timeout: 20000 }).catch(() => console.log('kein Toast Status'));
    await page.waitForTimeout(1500);
    console.log('nach Schnell-Status:', (await det.locator('span.rounded-full').first().innerText()));
    await tap(det.getByRole('button', { name: 'Alle Angaben bearbeiten' }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/softr-18-bestand-bearbeiten-${k}.png` });
    console.log('Bearbeiten-Felder:', await det.locator('label').allInnerTexts());
    await tap(det.getByRole('button', { name: 'Abbrechen' }));
    await page.keyboard.press('Escape');
    // Erfassen mit neuem Typ
    await go('/erfassen');
    const e = page.locator('#vibe-coding1');
    await e.getByText('Neues Stück erfassen').waitFor({ timeout: 40000 });
    await page.setInputFiles('#foto-input', process.env.TESTFOTO);
    await page.fill('#u-name', 'Test-Krug „Playwright“');
    await tap(e.getByRole('button', { name: '+ Neuer Typ' }));
    await e.getByLabel('Neuer Typ').fill('krug');
    await e.getByLabel('Neuer Typ').fill('Krug');
    await tap(e.getByRole('button', { name: 'Übernehmen' }));
    await page.waitForTimeout(300);
    console.log('Typ gewählt:', await e.getByRole('radio', { checked: true }).allInnerTexts());
    await page.screenshot({ path: `${OUT}/softr-05-erfassen-neuer-typ-${k}.png` });
    await tap(e.getByRole('button', { name: 'Speichern' }));
    await e.getByText('Gespeichert').first().waitFor({ timeout: 60000 }).catch(err => console.log('NO SUCCESS', err.message));
    await page.waitForTimeout(2000);
    console.log('Ergebnis:', (await e.locator('[role=status]').innerText().catch(() => 'n/a')).replace(/\n+/g, ' | '));
  }
  console.log(k, 'errors', errs);
  await ctx.close();
}
await browser.close();
