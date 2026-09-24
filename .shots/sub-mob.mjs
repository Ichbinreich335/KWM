import { chromium } from 'playwright';
import fs from 'fs';
const tag = process.argv[2];
const files = fs.readdirSync('.shots').filter(f => f.startsWith(`${tag}-390-seg`)).sort((a,b)=>parseInt(a.match(/seg(\d+)/)[1])-parseInt(b.match(/seg(\d+)/)[1]));
fs.writeFileSync(`.shots/${tag}-mob.html`, `<body style="margin:0;background:#888;display:flex;gap:12px;padding:12px;align-items:flex-start">${files.map(f=>`<img src="${f}" style="width:390px">`).join('')}</body>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 12 + files.length * 402, height: 1000 } });
await p.goto('file://' + process.cwd() + `/.shots/${tag}-mob.html`); await p.waitForTimeout(400);
await p.screenshot({ path: `.shots/${tag}-mob.jpg`, quality: 70, fullPage: true });
await b.close();
