import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1600,height:900}});
await p.goto('file://'+process.cwd()+'/.shots/sheet.html'); await p.waitForTimeout(500);
await p.screenshot({path:'.shots/sheet.jpg',fullPage:true,quality:70}); await b.close();
