// Funktionstest der App als Werkstatt: Unikat erfassen, im Stück-Fenster auf „in Kommission“ setzen,
// prüfen, dass die Automation den Lagerort setzt. Danach wird das Prüfstück wieder gelöscht.
import { browserStarten, DESKTOP } from "./browser.mjs";
import { anmelden as apiAnmelden, api, ladeIds, ENV } from "./lib.mjs";

const PRUEFSTUECK = "Prüfstück App-Test";
const WARTEN_MS = 500;
const MAX_WARTEN_MS = 30000;

await apiAnmelden();
const ids = ladeIds();
const T = ids.tabellen.Unikate;
const suchen = async () =>
  (await api("GET", `/database/rows/table/${T}/?user_field_names=true&search=${encodeURIComponent(PRUEFSTUECK)}`)).results.find((z) => z.Name === PRUEFSTUECK);
async function wartenBis(pruefung) {
  for (let t = 0; t < MAX_WARTEN_MS; t += WARTEN_MS) {
    const z = await suchen();
    if (z && pruefung(z)) return z;
    await new Promise((weiter) => setTimeout(weiter, WARTEN_MS));
  }
  return suchen();
}

const { browser, seite, anmelden, fehler } = await browserStarten();
const editor = await seite(DESKTOP);
await anmelden(editor);
await editor.goto(`${ENV.BASEROW_URL}/builder/${ids.app}/page/${ids.seiten.Erfassen}`, { waitUntil: "networkidle" });
const [app] = await Promise.all([editor.context().waitForEvent("page"), editor.getByRole("button", { name: "Vorschau" }).click()]);
await app.waitForLoadState("networkidle");
await app.setViewportSize(DESKTOP);
const vorschau = `${ENV.BASEROW_URL}/builder/preview/${ids.app}`;

await app.goto(`${vorschau}/anmelden`, { waitUntil: "networkidle" });
await app.getByPlaceholder("Geben Sie Ihre E-Mail ein").fill(ENV.BASEROW_APP_WERKSTATT_EMAIL);
await app.getByPlaceholder("Geben Sie Ihr Passwort ein").fill(ENV.BASEROW_APP_WERKSTATT_PASSWORD);
await app.getByRole("button", { name: "Anmelden" }).click();
await app.waitForURL((url) => !url.pathname.endsWith("/anmelden"));

/** Baserow-Klappliste: Feld über seine Beschriftung finden, öffnen, Eintrag wählen. */
async function waehlen(beschriftung, eintrag) {
  const feld = app.locator(".ab-form-group, .form-group").filter({ hasText: beschriftung }).first();
  await feld.locator(".ab-dropdown, [class*=dropdown]").first().click();
  await app.locator("[class*=dropdown__item], li").filter({ hasText: new RegExp(`^\\s*${eintrag}\\s*$`) }).first().click();
}

const ergebnis = [];
await app.goto(`${vorschau}/`, { waitUntil: "networkidle" });
await app.getByPlaceholder("z. B. Mondvase „Seladon“").fill(PRUEFSTUECK);
await waehlen("Typ", "Schale");
await waehlen("Lagerort", "Regal B – Lager");
await app.getByRole("button", { name: "Speichern" }).click();
let z = await wartenBis(() => true);
ergebnis.push(["Erfassen legt Unikat an", Boolean(z), z ? `${z.Inventarnummer} · ${z.Typ?.value} · ${z.Status?.value} · ${z.Lagerort[0]?.value} · erfasst von ${z["Erfasst von"]}` : "keine Zeile"]);

if (z) {
  await app.goto(`${vorschau}/stueck/${z.id}`, { waitUntil: "networkidle" });
  await waehlen("Status", "in Kommission");
  await waehlen("Partner", "Galerie am Markt");
  await app.getByRole("button", { name: "Änderungen speichern" }).click();
  z = await wartenBis((x) => x.Lagerort[0]?.value === "Außer Haus");
  ergebnis.push([
    "Stück auf „in Kommission“, Automation setzt Lagerort",
    z.Lagerort[0]?.value === "Außer Haus" && Boolean(z["Außer Haus seit"]),
    `${z.Status?.value} · ${z.Lagerort[0]?.value} · ${z.Partner[0]?.value} · seit ${z["Außer Haus seit"]}`,
  ]);
  await api("DELETE", `/database/rows/table/${T}/${z.id}/`);
  ergebnis.push(["Prüfstück wieder gelöscht", !(await suchen()), ""]);
}

for (const [titel, ok, info] of ergebnis) console.log(`${ok ? "OK  " : "FEHL"} ${titel}${info ? ` → ${info}` : ""}`);
console.log("Konsole:", fehler.filter((f) => !f.includes("Hydration")).slice(0, 5));
await browser.close();
