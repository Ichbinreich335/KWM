// Screenshots der App aus der Vorlage (Vorschau, angemeldet als Werkstatt). Aufruf mit Seitenschlüsseln, z. B. „bestand stueck“.
import { browserStarten, ZIEL, DESKTOP, HANDY } from "./browser.mjs";
import { anmelden as apiAnmelden, api, ladeIds, ENV } from "./lib.mjs";

await apiAnmelden();
const ids = ladeIds();
const appId = ids.vorlage.builder;
const zeile = async (name) =>
  (await api("GET", `/database/rows/table/${ids.tabellen.Unikate}/?user_field_names=true&search=${encodeURIComponent(name)}`)).results.find((z) => z.Name === name).id;
const app = await api("GET", `/applications/${appId}/`);
const pfad = (id) => app.pages.find((p) => p.id === id).path;
const ALLE = {
  anmelden: ["v-00-anmelden", pfad(ids.vorlageSeiten.login), false],
  uebersicht: ["v-30-uebersicht", pfad(ids.vorlageSeiten.uebersicht)],
  bestand: ["v-10-bestand", pfad(ids.vorlageSeiten.bestand)],
  stueck: ["v-13-stueck", pfad(ids.vorlageSeiten.stueck).replace(/:[a-z_]+/, await zeile("Mondvase „Seladon“"))],
  erfassen: ["v-01-erfassen", pfad(ids.vorlageSeiten.erfassen)],
  stammdaten: ["v-40-stammdaten", pfad(ids.vorlageSeiten.stammdaten)],
  ...(ids.vorlageSeiten.bearbeiten ? { bearbeiten: ["v-14-bearbeiten", pfad(ids.vorlageSeiten.bearbeiten).replace(/:[a-z_]+/, await zeile("Becher „Rauch“"))] } : {}),
};
const auswahl = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALLE);

const { browser, seite, anmelden, fehler } = await browserStarten();
for (const groesse of [DESKTOP, HANDY]) {
  const editor = await seite(DESKTOP);
  await anmelden(editor);
  await editor.goto(`${ENV.BASEROW_URL}/builder/${appId}/page/${ids.vorlageSeiten.bestand}`, { waitUntil: "networkidle" });
  for (let i = 0; i < 12; i++) {
    const k = editor.locator('[class*="guided-tour"] button').last();
    if (!(await k.count())) break;
    await k.click();
    await editor.waitForTimeout(300);
  }
  const [page] = await Promise.all([editor.context().waitForEvent("page"), editor.getByRole("button", { name: "Vorschau" }).click()]);
  await page.waitForLoadState("networkidle");
  await page.setViewportSize(groesse);
  page.on("console", (m) => m.type() === "error" && fehler.push(`${page.url()}: ${m.text()}`));
  const basis = `${ENV.BASEROW_URL}/builder/preview/${appId}`;
  let angemeldet = false;
  for (const schluessel of auswahl) {
    const [name, weg, braucht = true] = ALLE[schluessel];
    if (braucht && !angemeldet) {
      await page.goto(`${basis}${pfad(ids.vorlageSeiten.login)}`, { waitUntil: "networkidle" });
      await page.locator("input").nth(0).fill(ENV.BASEROW_APP_WERKSTATT_EMAIL);
      await page.locator("input").nth(1).fill(ENV.BASEROW_APP_WERKSTATT_PASSWORD);
      await page.getByRole("button", { name: "Anmelden" }).click();
      await page.waitForTimeout(2500);
      angemeldet = true;
    }
    await page.goto(`${basis}${weg}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const breite = await page.evaluate(() => document.documentElement.scrollWidth);
    const k = groesse === HANDY ? "m" : "d";
    await page.screenshot({ path: `${ZIEL}/baserow-${name}-${k}.png`, fullPage: true });
    console.log(`${name}-${k}`, page.url().replace(basis, ""), breite > groesse.width ? `ZU BREIT (${breite})` : "ok");
  }
}
console.log("Konsole:", [...new Set(fehler.filter((f) => !f.includes("Hydration")))].slice(0, 6));
await browser.close();
