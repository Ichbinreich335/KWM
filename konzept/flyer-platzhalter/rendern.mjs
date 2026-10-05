// Rendert flyer.html als PNG (Bild für Variante A und B) und PDF (Variante C).
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const quelle = fileURLToPath(new URL('./flyer.html', import.meta.url));
const png = fileURLToPath(new URL('../../src/assets/img/konzept/flyer-kummerschalen.png', import.meta.url));
const pdf = fileURLToPath(new URL('../../public/konzept/flyer-kummerschalen.pdf', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1748 } });
await page.goto(`file://${quelle}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: png });
await page.pdf({ path: pdf, width: '1240px', height: '1748px', printBackground: true, pageRanges: '1' });
await browser.close();
