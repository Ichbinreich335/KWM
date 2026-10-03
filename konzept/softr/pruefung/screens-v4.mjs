// Runde nach dem Umbau auf gemeinsame Bauteile: alle Seiten, wichtige Fenster, Kennzahlen (Desktop und Handy).
import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = 'konzept/vergleich/softr-v4';
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log('FEHLER', name, e.message.split('\n')[0]); } };
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  const shot = async (n, full = true) => {
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${n}-${k}.png`, fullPage: full });
    const m = await metrics(page);
    console.log(k, n, 'hScroll', m.horizontalScroll, 'overflow', m.overflow.length, 'klein', JSON.stringify(m.small.filter((s) => !/Keramik Lager|Search|Toggle sidebar|^a: 141x32|Erfassen 255|Übersicht 255|Bestand 255|Tabelle 255|Stammdaten 255/.test(s))), 'englisch', JSON.stringify(m.english));
  };
  await step('erfassen', async () => { await go('/erfassen'); await shot('01-erfassen-unikat'); });
  await step('erfassen-edition', async () => { await page.getByRole('tab', { name: 'Editionsware' }).first().click(); await shot('02-erfassen-editionsware'); });
  await step('bestand', async () => { await go('/bestand'); await shot('10-bestand-im-haus'); });
  await step('bestand-ausser', async () => { await page.getByRole('tab', { name: /Außer Haus/ }).first().click(); await shot('11-bestand-ausser-haus'); });
  await step('bestand-edition', async () => { await page.getByRole('tab', { name: /Editionsware/ }).first().click(); await shot('12-bestand-editionsware'); });
  await step('bestand-popup', async () => { await go('/bestand?tab=alle'); await page.getByText('Becher „Rauch“').first().click(); await shot('13-bestand-stueck', false); });
  await step('bestand-bearbeiten', async () => { await page.getByRole('button', { name: /Alle Angaben bearbeiten/ }).first().click(); await page.waitForTimeout(500); await shot('14-bestand-bearbeiten', false); console.log(k, 'Preisfeld da:', await page.getByLabel('Preis intern (€)').count()); });
  await step('tabelle', async () => { await go('/tabelle'); await shot('20-tabelle'); });
  await step('tabelle-filter', async () => { await go('/tabelle?status=in%20Kommission%2Causgestellt'); await shot('21-tabelle-ausser-haus'); });
  await step('uebersicht', async () => { await go('/uebersicht'); await shot('30-uebersicht'); });
  await step('stammdaten', async () => { await go('/stammdaten'); await shot('40-stammdaten-kuenstler'); });
  for (const [t, n] of [['Partner', '41-stammdaten-partner'], ['Lagerorte', '42-stammdaten-lagerorte'], ['Modelle', '43-stammdaten-modelle']]) {
    await step(n, async () => { await page.getByRole('tab', { name: new RegExp(t) }).first().click(); await shot(n); });
  }
  await step('stammdaten-dialog', async () => { await page.getByRole('tab', { name: /Partner/ }).first().click(); await page.getByText('Galerie Nord').first().click(); await shot('44-stammdaten-partner-bearbeiten', false); });
  console.log(k, 'Konsole', JSON.stringify(errs.filter((e) => !e.includes('DialogTitle')).slice(0, 5)));
  await ctx.close();
}
await browser.close();
