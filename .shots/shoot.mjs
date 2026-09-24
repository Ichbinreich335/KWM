import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:4173/';
const tag = process.argv[3] || 'r1';
const b = await chromium.launch();
for (const [name, vp] of [['desktop', {width:1440,height:900}], ['mobile', {width:390,height:844}]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `.shots/${tag}-${name}-fold.png` });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += vp.height * 0.6) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(220); }
  await p.waitForTimeout(2600);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.screenshot({ path: `.shots/${tag}-${name}-full.png`, fullPage: true });
  const overflow = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  console.log(name, 'height', h, 'scrollW/innerW', overflow, 'errors', errs);
  await p.close();
}
await b.close();
