// Runde nach dem UI-Sweep vom 04.10.2026 (einheitliche Radien, Umschalter, Tabellen statt Balken, Archivieren).
// Aufruf: PREVIEW_URL='…' node konzept/softr/pruefung/screens-v5.mjs [seite …]   ohne Angabe alle Seiten.
import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = 'konzept/vergleich/softr-v5';
const only = process.argv.slice(2);
const want = (n) => only.length === 0 || only.some((o) => n.includes(o));
// PW_CHROMIUM: fest installierter Browser, falls die Playwright-Version einen anderen erwartet.
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, ignoreDefaultArgs: ['--hide-scrollbars'] });
const step = async (name, fn) => { if (!want(name)) return; try { await fn(); } catch (e) { console.log('FEHLER', name, e.message.split('\n')[0]); } };
const SHELL = /Keramik Lager|Search|Toggle sidebar|^a: 141x32|Erfassen 255|Übersicht 255|Bestand 255|Tabelle 255|Stammdaten 255|Made with/;
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  const shot = async (n, full = true) => {
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${n}-${k}.png`, fullPage: full });
    const m = await metrics(page);
    console.log(k, n, 'hScroll', m.horizontalScroll, 'overflow', m.overflow.length, 'klein', JSON.stringify(m.small.filter((s) => !SHELL.test(s))), 'englisch', JSON.stringify(m.english));
  };
  await step('uebersicht', async () => { await go('/'); await shot('01-uebersicht'); });
  await step('erfassen', async () => { await go('/erfassen'); await shot('10-erfassen-unikat'); });
  await step('erfassen-glasur', async () => { await go('/erfassen'); await page.getByLabel('Glasuren suchen').first().fill('sel'); await shot('11-erfassen-glasur-suche', false); });
  await step('erfassen-edition', async () => { await go('/erfassen'); await page.getByRole('tab', { name: 'Editionsware' }).first().click(); await page.getByRole('radio', { name: /glasiert/ }).first().click(); await shot('12-erfassen-editionsware'); });
  await step('bestand', async () => { await go('/bestand'); await shot('20-bestand-im-haus'); });
  await step('bestand-ausser', async () => { await go('/bestand'); await page.getByRole('tab', { name: /Außer Haus/ }).first().click(); await shot('21-bestand-ausser-haus'); });
  await step('bestand-edition', async () => { await go('/bestand?tab=edition'); await shot('22-bestand-editionsware'); });
  await step('bestand-stueck', async () => { await go('/bestand?tab=alle'); await page.getByText('Becher „Rauch“').first().click(); await shot('23-bestand-stueck', false); });
  await step('bestand-bearbeiten', async () => { await go('/bestand?tab=alle'); await page.getByText('Becher „Rauch“').first().click(); await page.getByRole('button', { name: /Alle Angaben bearbeiten/ }).first().click(); await page.waitForTimeout(500); await shot('24-bestand-bearbeiten', false); });
  await step('tabelle', async () => { await go('/tabelle'); await shot('30-tabelle'); });
  await step('stammdaten', async () => { await go('/stammdaten?tab=glasuren'); await shot('40-stammdaten-glasuren'); });
  await step('stammdaten-dialog', async () => { await go('/stammdaten?tab=glasuren'); await page.getByText('Aubergine', { exact: true }).first().click(); await shot('41-stammdaten-glasur-dialog', false); });
  console.log(k, 'Konsole', JSON.stringify(errs.filter((e) => !e.includes('DialogTitle')).slice(0, 5)));
  await ctx.close();
}
await browser.close();
