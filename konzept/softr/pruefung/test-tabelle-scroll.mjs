import { chromium, openApp, VIEWPORTS } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/tabelle');
  const b = page.locator('#vibe-coding1');
  await b.getByText(/von \d+ Einträgen/).waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  const wrap = b.locator('div.overflow-auto').first();
  console.log(k, await wrap.evaluate((el) => ({ cw: el.clientWidth, sw: el.scrollWidth, ch: el.clientHeight, oh: el.offsetHeight, scrollbarH: el.offsetHeight - el.clientHeight - 2 })));
  await wrap.screenshot({ path: `${OUT}/softr-45-tabelle-scroll-${k}.png` });
  const right = b.getByRole('button', { name: 'Spalten rechts zeigen' });
  console.log(k, 'Pfeile:', await right.count());
  if (await right.count()) { await right.click(); await page.waitForTimeout(600); console.log(k, 'scrollLeft nach Pfeil:', await wrap.evaluate((el) => el.scrollLeft)); }
  console.log(k, 'errors', errs, '| Seite hat noch alte Blöcke:', await page.locator('[id^=table], [id^=list], [id^=grid]').count());
  await ctx.close();
}
await browser.close();
