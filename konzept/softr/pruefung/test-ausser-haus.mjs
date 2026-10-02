import { chromium, openApp, metrics, VIEWPORTS } from './lib.mjs';
const OUT = new URL('../../vergleich', import.meta.url).pathname;
const browser = await chromium.launch();
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const { ctx, page, errs, go } = await openApp(browser, vp);
  await go('/uebersicht');
  const b = page.locator('#vibe-coding1');
  await b.getByRole('heading', { name: 'Außer Haus' }).waitFor({ timeout: 40000 });
  await page.waitForTimeout(2000);
  const sec = b.locator('#ausser-haus');
  await sec.screenshot({ path: `${OUT}/softr-21-uebersicht-ausser-haus-${k}.png` });
  console.log(k, (await sec.innerText()).replace(/\n+/g, ' | ').slice(0, 400));
  console.log(k, 'Kachel:', (await b.locator('a[href="#ausser-haus"]').innerText()).replace(/\n+/g, ' '));
  console.log(k, 'metrics', JSON.stringify(await metrics(page)), 'errors', errs);
  await ctx.close();
}
await browser.close();
