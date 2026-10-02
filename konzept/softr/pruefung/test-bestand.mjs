import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
import { readFileSync } from 'node:fs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
const log = (...a) => console.log(...a);
const tap = async (l) => { await l.evaluate(el => el.scrollIntoView({ block: 'center' })); await l.click(); };
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/bestand');
  const b = page.locator('#vibe-coding1');
  await b.getByRole('heading', { name: 'Bestand' }).waitFor({ timeout: 40000 });
  await b.getByText(/von \d+ Unikaten/).waitFor({ timeout: 40000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/softr-10-bestand-alle-${k}.png`, fullPage: true });
  log(k, 'Alle:', await b.getByText(/von \d+ Unikaten/).innerText(), JSON.stringify(await metrics(page)));
  for (const t of ['Verfügbar', 'Schalen', 'Vasen', 'Teller', 'In Kommission']) {
    await b.getByRole('tab', { name: t }).click(); await page.waitForTimeout(400);
    log(k, t, await b.getByText(/von \d+ Unikaten/).innerText());
  }
  await page.screenshot({ path: `${OUT}/softr-11-bestand-kommission-${k}.png`, fullPage: true });
  // Editionsware
  await b.getByRole('tab', { name: 'Editionsware' }).click();
  await b.getByText(/Zeilen ·/).waitFor({ timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/softr-12-bestand-edition-${k}.png`, fullPage: true });
  log(k, 'Edition:', await b.getByText(/Zeilen ·/).innerText(), JSON.stringify(await metrics(page)));
  if (k === 'm') {
    const plus = b.getByRole('button', { name: 'Karaffe „Quelle“: eins mehr' });
    const before = await b.getByText(/Rohlinge ·/).innerText();
    await tap(plus); await page.waitForTimeout(3000);
    const after = await b.getByText(/Rohlinge ·/).innerText();
    await tap(b.getByRole('button', { name: 'Karaffe „Quelle“: eins weniger' })); await page.waitForTimeout(3000);
    log('±1:', before, '->', after, '->', await b.getByText(/Rohlinge ·/).innerText());
  }
  // Tabelle mit kombinierten Filtern
  await b.getByRole('tab', { name: 'Alle Stücke (Tabelle)' }).click(); await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/softr-13-bestand-tabelle-${k}.png`, fullPage: true });
  log(k, 'Tabelle metrics', JSON.stringify(await metrics(page)));
  await b.getByRole('button', { name: /^Filter/ }).click();
  const sheet = page.getByRole('dialog');
  await sheet.waitFor();
  await sheet.getByRole('button', { name: 'Vase', exact: true }).click();
  await sheet.getByRole('button', { name: 'Schale', exact: true }).click();
  await sheet.getByRole('button', { name: 'verfügbar', exact: true }).click();
  await sheet.getByRole('button', { name: 'Seladon Nebel', exact: true }).click();
  await sheet.getByRole('button', { name: 'Seladon', exact: true }).click();
  await sheet.getByLabel('Jahr von').fill('2026');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/softr-14-bestand-filter-${k}.png`, fullPage: false });
  await sheet.getByRole('button', { name: 'Fertig' }).click(); await page.waitForTimeout(500);
  log(k, 'Kombi-Filter (Vase|Schale, verfügbar, Seladon|Seladon Nebel, ab 2026):', await b.getByText(/von \d+ Unikaten/).innerText(),
      '| Zeilen:', await b.locator('tbody tr').allInnerTexts().then(r => r.map(x => x.split('\t').slice(1, 3).join(' ')).join(' / ')));
  // Sortierung Preis
  await b.getByRole('button', { name: 'Preis' }).click(); await page.waitForTimeout(300);
  log(k, 'nach Preis aufsteigend:', (await b.locator('tbody tr td:nth-child(10)').allInnerTexts()).join(', '));
  await page.screenshot({ path: `${OUT}/softr-15-bestand-tabelle-gefiltert-${k}.png`, fullPage: true });
  // CSV
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(() => null), b.getByRole('button', { name: 'CSV-Export' }).click()]);
  if (dl) { await dl.saveAs(`./export-${k}.csv`); log(k, 'CSV:', dl.suggestedFilename(), JSON.stringify(readFileSync(`./export-${k}.csv`, 'utf8').slice(0, 300))); } else log(k, 'CSV: kein Download');
  const already = (await b.locator('#saved-view option').evaluateAll(o => o.map(x => x.textContent))).includes('Seladon-Stücke verfügbar ab 2026');
  if (k === 'd' && !already) {
    // Ansicht speichern + laden
    await b.getByRole('button', { name: 'Ansicht speichern' }).click();
    await page.getByLabel('Name der Ansicht').fill('Seladon-Stücke verfügbar ab 2026');
    await page.getByRole('dialog').getByRole('button', { name: 'Speichern' }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/softr-16-bestand-ansicht-gespeichert-${k}.png`, fullPage: false });
    await go('/bestand');
    await b.getByRole('tab', { name: 'Alle Stücke (Tabelle)' }).click();
    await b.getByLabel('Gespeicherte Ansicht:').waitFor({ timeout: 20000 });
    const opt = await b.locator('#saved-view option').evaluateAll(o => o.map(x => x.textContent)); log('gespeicherte Ansichten:', opt);
    await b.locator('#saved-view').selectOption({ label: 'Seladon-Stücke verfügbar ab 2026' });
    await page.waitForTimeout(500);
    log('nach Laden der Ansicht:', await b.getByText(/von \d+ Unikaten/).innerText());
  }
  // Detail + Statusänderung am Testdatensatz
  await b.getByRole('tab', { name: 'Alle', exact: true }).click(); await page.waitForTimeout(300);
  await b.getByLabel('Suche').fill('Playwright'); await page.waitForTimeout(300);
  await b.getByRole('button', { name: /Test-Schale/ }).first().click();
  const det = page.getByRole('dialog');
  await det.waitFor(); await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/softr-17-bestand-detail-${k}.png`, fullPage: false });
  if (k === 'm') {
    await det.getByRole('button', { name: 'reserviert', exact: true }).click();
    await det.getByRole('button', { name: 'Änderungen speichern' }).click();
    await page.getByText('Änderungen gespeichert.').waitFor({ timeout: 20000 }).catch(e => log('kein Speicher-Toast'));
    await page.waitForTimeout(1500);
    log('Status nach Speichern:', await b.getByRole('button', { name: /Test-Schale/ }).first().innerText());
    await det.getByRole('button', { name: 'Alle Felder bearbeiten (Admin)' }).click();
    await page.getByText('Alle Felder bearbeiten').first().waitFor();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/softr-18-bestand-admin-bearbeiten-${k}.png`, fullPage: false });
    log('Admin-Panel:', (await page.getByRole('dialog').innerText()).slice(0, 200).replace(/\n/g, ' | '));
  }
  log(k, 'console errors', errs);
  await ctx.close();
}
await browser.close();
