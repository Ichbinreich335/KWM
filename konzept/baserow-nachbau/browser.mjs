// Playwright-Helfer: im Baserow-Webinterface anmelden und Screenshots ablegen.
import { chromium } from "playwright";
import path from "node:path";
import { ENV, WURZEL } from "./lib.mjs";

export const ZIEL = path.join(WURZEL, "konzept/vergleich");
export const DESKTOP = { width: 1440, height: 900 };
export const HANDY = { width: 390, height: 844 };

export async function browserStarten() {
  const browser = await chromium.launch();
  const fehler = [];
  async function seite(groesse) {
    const kontext = await browser.newContext({ viewport: groesse, locale: "de-DE", deviceScaleFactor: 1 });
    const page = await kontext.newPage();
    page.on("console", (m) => m.type() === "error" && fehler.push(`${page.url()}: ${m.text()}`));
    return page;
  }
  async function anmelden(page) {
    await page.goto(`${ENV.BASEROW_URL}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', ENV.BASEROW_EMAIL);
    await page.fill('input[type="password"]', ENV.BASEROW_PASSWORD);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30000 });
  }
  /** Seite öffnen und Baserows Einführungstouren wegklicken (einmalig je Bereich, danach gemerkt). */
  async function oeffnen(page, url) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    for (let schritt = 0; schritt < 20; schritt++) {
      const knopf = page.locator('[class*="guided-tour"] button').last();
      if (!(await knopf.count())) break;
      await knopf.click();
      await page.waitForTimeout(400);
    }
  }
  return { browser, seite, anmelden, oeffnen, fehler };
}
