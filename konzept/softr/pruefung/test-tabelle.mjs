import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/tabelle');
  const b = page.locator('#vibe-coding1');
  await b.getByText(/von \d+ Einträgen/).waitFor({ timeout: 40000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/softr-40-tabelle-${k}.png`, fullPage: false });
  console.log(k, await b.getByText(/von \d+ Einträgen/).innerText(), '| Menü:', (await page.locator('nav, aside').first().innerText().catch(() => '')).replace(/\n/g, ' ').slice(0, 120));
  console.log(k, 'metrics', JSON.stringify(await metrics(page)));
  // Filter: Typ ist Schale oder Becher UND Status ist verfügbar
  await b.getByRole('button', { name: /^Filter/ }).click();
  await b.getByRole('button', { name: 'Typ: Werte wählen' }).click();
  await page.getByRole('dialog').getByText('Schale', { exact: true }).click().catch(async () => { await page.getByText('Schale', { exact: true }).last().click(); });
  await page.getByText('Becher', { exact: true }).last().click();
  await page.keyboard.press('Escape');
  await b.getByRole('button', { name: 'Bedingung hinzufügen' }).click();
  const rows = b.locator('select[aria-label="Feld"]');
  await rows.nth(1).selectOption('status');
  await b.getByRole('button', { name: 'Status / Zustand: Werte wählen' }).click();
  await page.getByText('verfügbar', { exact: true }).last().click();
  await page.getByText('glasiert', { exact: true }).last().click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  console.log(k, 'Filter Typ∈{Schale,Becher} und Status∈{verfügbar,glasiert}:', await b.getByText(/von \d+ Einträgen/).innerText());
  console.log(k, 'Summe:', await b.locator('tfoot').innerText().catch(() => ''));
  await b.locator('select[aria-label="Verknüpfung"]').selectOption('oder');
  await page.waitForTimeout(300);
  console.log(k, 'mit ODER:', await b.getByText(/von \d+ Einträgen/).innerText());
  await b.locator('select[aria-label="Verknüpfung"]').selectOption('und');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/softr-41-tabelle-filter-${k}.png`, fullPage: false });
  console.log(k, 'metrics filter', JSON.stringify(await metrics(page)));
  if (k === 'd') {
    await b.getByRole('button', { name: 'Spalten' }).click();
    await page.getByText('Künstler:in', { exact: true }).last().click();
    await page.getByText('Erfasst am', { exact: true }).last().click();
    await page.keyboard.press('Escape');
    await b.getByRole('button', { name: 'Anzahl' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/softr-42-tabelle-spalten-${k}.png`, fullPage: false });
    console.log('Spaltenköpfe:', (await b.locator('thead th').allInnerTexts()).join(' | '));
    await b.locator('select[aria-label="Gespeicherte Ansicht"]').selectOption({ label: 'Seladon-Stücke verfügbar ab 2026' });
    await page.waitForTimeout(600);
    console.log('alte Ansicht geladen:', await b.getByText(/von \d+ Einträgen/).innerText());
    await b.locator('tbody tr').first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/softr-43-tabelle-detail-${k}.png`, fullPage: false });
  }
  console.log(k, 'errors', errs);
  await ctx.close();
}
await browser.close();
