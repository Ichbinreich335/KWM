import { chromium } from 'playwright';
const [url='http://localhost:4173/', tag='r1', w='1440', segH='1800'] = process.argv.slice(2);
const b = await chromium.launch();
const vp = { width: +w, height: +w > 600 ? 900 : 844 };
const p = await b.newPage({ viewport: vp });
await p.goto(url, { waitUntil: 'networkidle' });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += vp.height * 0.5) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(160); }
await p.waitForTimeout(2800); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
await p.addStyleTag({ content: '.masthead{position:absolute!important}' });
let i = 0;
for (let y = 0; y < h; y += +segH, i++) {
  await p.screenshot({ path: `.shots/${tag}-${w}-seg${i}.jpg`, fullPage: true, quality: 72, clip: { x: 0, y, width: vp.width, height: Math.min(+segH, h - y) } });
}
console.log('segments', i);
await b.close();
