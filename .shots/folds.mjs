import { chromium } from 'playwright';
const pages = process.argv.slice(2);
const b = await chromium.launch();
for (const pg of pages) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:4391/${pg}.html`, { waitUntil: 'networkidle' });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 450) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(90); }
  await p.waitForTimeout(2200); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.addStyleTag({ content: '.masthead{position:absolute!important} .subnav{position:static!important}' });
  await p.screenshot({ path: `.shots/fold-${pg}.jpg`, fullPage: true, quality: 55, clip: { x: 0, y: 0, width: 1440, height: Math.min(h, 5400) } });
  const ow = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(pg, 'h', h, 'w', ow, errs);
  await p.close();
}
await b.close();
