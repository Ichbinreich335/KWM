import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4391/', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right)));
console.log(r.join('\n'));
await p.evaluate(() => window.scrollTo(0, document.querySelector('.spread').offsetTop)); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { const f = document.querySelector('.spread__media'); const i = f.querySelector('img'); return [f.className, i.complete, i.naturalWidth, getComputedStyle(f).clipPath]; }));
await b.close();
