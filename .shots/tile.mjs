import { chromium } from 'playwright';
import fs from 'fs';
// node .shots/tile.mjs <prefix> <perSheet> <imgWidth>
const [prefix, per = '3', w = '640'] = process.argv.slice(2);
const files = fs.readdirSync('.shots').filter(f => f.startsWith(prefix + '-seg')).sort((a, b) => parseInt(a.match(/seg(\d+)/)[1]) - parseInt(b.match(/seg(\d+)/)[1]));
const b = await chromium.launch();
for (let i = 0; i < files.length; i += +per) {
  const group = files.slice(i, i + +per);
  fs.writeFileSync('.shots/tile.html', `<body style="margin:0;background:#777;display:flex;gap:8px;padding:8px;align-items:flex-start">${group.map(f => `<img src="${f}" style="width:${w}px">`).join('')}</body>`);
  const p = await b.newPage({ viewport: { width: 16 + group.length * (+w + 8), height: 800 } });
  await p.goto('file://' + process.cwd() + '/.shots/tile.html'); await p.waitForTimeout(300);
  await p.screenshot({ path: `.shots/${prefix}-tile${i / +per}.jpg`, fullPage: true, quality: 72 });
  await p.close();
}
await b.close();
console.log(Math.ceil(files.length / +per));
