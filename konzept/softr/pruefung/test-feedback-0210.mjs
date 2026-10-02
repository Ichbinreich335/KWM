// Prüft das Admin-Feedback vom 02.10.: ruhigere Übersicht, Außer Haus anklickbar bis in die Tabelle, Popup statt Seitenpanel.
import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = 'konzept/vergleich/softr-v3';
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/uebersicht');
  await page.screenshot({ path: `${OUT}/uebersicht-${k}.png`, fullPage: true });
  console.log(k, 'uebersicht', JSON.stringify(await metrics(page)), 'zu erledigen sichtbar:', await page.getByText('Zu erledigen').count());
  await page.getByRole('link', { name: /Außer Haus/ }).first().click();
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(3000);
  console.log(k, 'nach Klick', page.url().replace(/token=[^&]+/, 'token=…').replace(/t=[^&]+/, 't=…'));
  await page.screenshot({ path: `${OUT}/tabelle-ausser-haus-${k}.png`, fullPage: false });
  console.log(k, 'Zeilen', await page.locator('tbody tr').count(), 'Partner-Spalte', await page.getByRole('columnheader', { name: 'Partner' }).count());
  await go('/bestand');
  await page.getByText('Becher „Rauch“').first().click();
  await page.waitForTimeout(1500);
  const dlg = page.getByRole('dialog').first();
  if (await dlg.count()) {
    const b = await dlg.boundingBox();
    console.log(k, 'Popup', JSON.stringify(b));
  } else console.log(k, 'Popup nicht gefunden');
  await page.screenshot({ path: `${OUT}/bestand-popup-${k}.png`, fullPage: false });
  console.log(k, 'Konsole', JSON.stringify(errs.slice(0, 5)));
  await ctx.close();
}
await browser.close();
