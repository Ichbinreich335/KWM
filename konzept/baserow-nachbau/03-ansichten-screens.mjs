// Screenshots der Datenbank-Ansichten (Desktop 1440, Handy 390) für den Vergleich.
import { browserStarten, ZIEL, DESKTOP, HANDY } from "./browser.mjs";
import { anmelden as apiAnmelden, api, ladeIds, ENV } from "./lib.mjs";

await apiAnmelden();
const ids = ladeIds();
const { browser, seite, anmelden, oeffnen, fehler } = await browserStarten();
const tabelle = (name) => `${ENV.BASEROW_URL}/database/${ids.datenbank}/table/${ids.tabellen[name.split("/")[0]]}/${ids.ansichten[name]}`;
const formularUrl = async (name) => `${ENV.BASEROW_URL}/form/${(await api("GET", `/database/views/${ids.ansichten[name]}/`)).slug}`;

const AUFNAHMEN = [
  ["03a-ausser-haus", tabelle("Unikate/Außer Haus"), [DESKTOP]],
  ["03b-galerie-bestand", tabelle("Unikate/Bestand"), [DESKTOP, HANDY]],
  ["03c-formular-unikat", await formularUrl("Unikate/Neues Unikat"), [DESKTOP, HANDY], true],
  ["03d-editionsbestand-nach-modell", tabelle("Editionsbestand/Nach Modell"), [DESKTOP]],
  ["03e-formular-editionsware", await formularUrl("Editionsbestand/Neue Editionsware"), [DESKTOP, HANDY], true],
];

for (const groesse of [DESKTOP, HANDY]) {
  const page = await seite(groesse);
  await anmelden(page);
  for (const [name, url, groessen, ganz] of AUFNAHMEN) {
    if (!groessen.includes(groesse)) continue;
    await oeffnen(page, url);
    const breite = await page.evaluate(() => document.documentElement.scrollWidth);
    const datei = `${ZIEL}/baserow-nachbau-${name}-${groesse === HANDY ? "m" : "d"}.png`;
    await page.screenshot({ path: datei, fullPage: Boolean(ganz) });
    console.log(name, groesse.width, "Seitenbreite", breite, breite > groesse.width ? "ZU BREIT" : "ok");
  }
}
console.log("Konsole:", fehler.filter((f) => !f.includes("Hydration")));
await browser.close();
