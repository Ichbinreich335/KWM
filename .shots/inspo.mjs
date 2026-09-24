import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const [n,u] of [['14islands','https://www.14islands.com'],['mouthwash','https://mouthwash.studio'],['kinfolk','https://www.kinfolk.com'],['dribbble-wonderfull','https://dribbble.com/shots/27642701-Wonderfull-Japan-Travel-Website']]) {
  try { await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000}); await p.waitForTimeout(4000);
    await p.screenshot({path:`.shots/inspo-${n}.jpg`,quality:60}); 
    await p.mouse.wheel(0,1800); await p.waitForTimeout(2000);
    await p.screenshot({path:`.shots/inspo-${n}-2.jpg`,quality:60}); console.log('ok',n);
  } catch(e){ console.log('fail',n,e.message.slice(0,100)); }
}
await b.close();
