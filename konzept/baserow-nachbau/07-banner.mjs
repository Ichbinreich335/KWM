// Erzeugt das Kopfbild der App (1280 × 150 wie in der Vorlage) aus einem Werkstattfoto mit Petrol-Schleier.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import { WURZEL } from "./lib.mjs";

const FOTO = readFileSync(path.join(WURZEL, "keramik/07-schalen-streiflicht.png")).toString("base64");
const html = `<!doctype html><html><head><style>
  body { margin: 0; }
  .banner { width: 1280px; height: 150px; position: relative; overflow: hidden; font-family: Georgia, "Times New Roman", serif;
    background: url(data:image/png;base64,${FOTO}) center 62% / cover; }
  .banner::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(31,63,67,.94) 0%, rgba(47,93,98,.82) 48%, rgba(47,93,98,.35) 100%); }
  .text { position: absolute; left: 56px; top: 50%; transform: translateY(-50%); color: #fff; }
  .titel { font-size: 46px; letter-spacing: .5px; }
  .unter { font: 500 15px/1.4 Helvetica, Arial, sans-serif; letter-spacing: 3px; text-transform: uppercase; opacity: .85; margin-top: 6px; }
</style></head><body><div class="banner"><div class="text"><div class="titel">KWM Lager</div>
<div class="unter">Keramische Werkstatt Margaretenhöhe</div></div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 150 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator(".banner").screenshot({ path: path.join(WURZEL, "konzept/baserow-nachbau/assets/kwm-banner.png") });
await browser.close();
console.log("assets/kwm-banner.png");
