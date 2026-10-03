// Screenshots aller Seiten und wichtigen Zustände als Vorlage für den Baserow-Nachbau (Admin-Sicht, Desktop und Handy).
import { chromium, VIEWPORTS, openApp } from './lib.mjs';
const OUT = 'konzept/vergleich/softr-final';
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log('FEHLER', name, e.message.split('\n')[0]); } };
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  const shot = async (n, full = true) => { await page.waitForTimeout(800); await page.screenshot({ path: `${OUT}/${n}-${k}.png`, fullPage: full }); console.log('ok', n, k); };
  await step('erfassen', async () => { await go('/erfassen'); await shot('01-erfassen-unikat'); });
  await step('erfassen-edition', async () => { await page.getByRole('tab', { name: 'Editionsware' }).first().click(); await shot('02-erfassen-editionsware'); });
  await step('erfassen-neu', async () => { await go('/erfassen'); await page.getByRole('button', { name: /Neu/ }).first().click(); await shot('03-erfassen-neuer-typ', false); });
  await step('bestand', async () => { await go('/bestand'); await shot('10-bestand-alle'); });
  for (const [t, n] of [['Außer Haus', '11-bestand-ausser-haus'], ['Editionsware', '12-bestand-editionsware']]) {
    await step(n, async () => { await page.getByRole('tab', { name: new RegExp(t) }).first().click(); await shot(n); });
  }
  await step('bestand-popup', async () => { await go('/bestand'); await page.getByText('Becher „Rauch“').first().click(); await shot('13-bestand-stueck-popup', false); });
  await step('bestand-bearbeiten', async () => { await page.getByRole('button', { name: /Alle Angaben bearbeiten/ }).first().click(); await shot('14-bestand-alle-angaben-bearbeiten', false); });
  await step('bestand-admin', async () => { await go('/bestand'); await page.getByText('Becher „Rauch“').first().click(); await page.getByRole('button', { name: /Preis und Website/ }).first().click(); await shot('15-bestand-preis-website-admin', false); });
  await step('bestand-edition-popup', async () => { await go('/bestand'); await page.getByRole('tab', { name: /Editionsware/ }).first().click(); await page.getByText(/Becher „Salbei“/).first().click(); await shot('16-bestand-editionsware-popup', false); });
  await step('tabelle', async () => { await go('/tabelle'); await shot('20-tabelle'); });
  await step('tabelle-filter', async () => { await go('/tabelle?status=in%20Kommission%2Causgestellt'); await shot('21-tabelle-filter-ausser-haus'); });
  await step('tabelle-spalten', async () => { await go('/tabelle'); await page.getByRole('button', { name: 'Spalten', exact: true }).first().click(); await shot('22-tabelle-spalten', false); });
  await step('tabelle-detail', async () => { await go('/tabelle'); await page.locator('tbody tr').first().click(); await shot('23-tabelle-detail-popup', false); });
  await step('uebersicht', async () => { await go('/uebersicht'); await shot('30-uebersicht'); });
  console.log(k, 'Konsole', JSON.stringify(errs.filter(e => !e.includes('DialogTitle')).slice(0, 5)));
  await ctx.close();
}
await browser.close();
