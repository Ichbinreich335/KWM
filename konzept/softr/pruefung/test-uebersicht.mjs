import { chromium, VIEWPORTS, openApp, metrics } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/uebersicht');
  const b = page.locator('#vibe-coding1');
  await b.getByText('Zuletzt erfasst oder geändert').waitFor({ timeout: 40000 });
  await page.waitForTimeout(2500);
  await b.screenshot({ path: `${OUT}/softr-20-uebersicht-${k}.png` });
  console.log(k, 'tiles:', (await b.locator('a.min-h-28').allInnerTexts()).map(t => t.replace(/\n/g, ' ')).join(' | '));
  console.log(k, 'metrics', JSON.stringify(await metrics(page)));
  if (k === 'd') {
    const box = await b.locator('[role=img]').first().locator('span').first().boundingBox();
    await page.mouse.move(box.x + 5, box.y + 5); await page.waitForTimeout(600);
    console.log('tooltip:', await page.locator('[role=tooltip], [data-slot=tooltip-content]').allInnerTexts().catch(() => []));
    await b.getByRole('link', { name: /Reserviert/ }).click();
    await page.waitForTimeout(4000);
    const bb = page.locator('#vibe-coding1');
    console.log('nach Klick:', page.url().replace(/token=[^&]+/, 'token=…'), '|', await bb.getByText(/von \d+ Unikaten/).innerText().catch(() => 'n/a'), '|', await bb.getByRole('tab', { selected: true }).innerText().catch(() => ''));
  }
  console.log(k, 'console errors', errs);
  await ctx.close();
}
await browser.close();
