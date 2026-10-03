// Screenshots der App „KWM Lager“ (Vorschau im Editor), angemeldet als Werkstatt. Desktop 1440 und Handy 390.
// Prüft je Seite: kein seitliches Scrollen, Tippflächen ab 44 px, Konsole ohne Fehler.
import { browserStarten, ZIEL, DESKTOP, HANDY } from "./browser.mjs";
import { anmelden as apiAnmelden, api, ladeIds, ENV } from "./lib.mjs";

const MIN_TIPPFLAECHE = 44;

await apiAnmelden();
const ids = ladeIds();
const zeileId = async (tabelle, name) =>
  (await api("GET", `/database/rows/table/${ids.tabellen[tabelle]}/?user_field_names=true&search=${encodeURIComponent(name)}`)).results.find((z) => (z.Name ?? z.Bezeichnung) === name).id;
const becher = await zeileId("Unikate", "Becher „Rauch“");
const galerieNord = await zeileId("Partner", "Galerie Nord");

const VORSCHAU = `${ENV.BASEROW_URL}/builder/preview/${ids.app}`;
const AUFNAHMEN = [
  ["00-anmelden", "/anmelden", false],
  ["01-erfassen-unikat", "/"],
  ["02-erfassen-editionsware", "/?art=edition"],
  ["10-bestand-im-haus", "/bestand"],
  ["11-bestand-ausser-haus", "/bestand?reiter=ausser-haus"],
  ["12-bestand-editionsware", "/bestand?reiter=edition"],
  ["13-bestand-stueck", `/stueck/${becher}`],
  ["20-tabelle", "/tabelle"],
  ["30-uebersicht", "/uebersicht"],
  ["40-stammdaten-kuenstler", "/stammdaten"],
  ["41-stammdaten-partner", "/stammdaten?liste=partner"],
  ["42-stammdaten-lagerorte", "/stammdaten?liste=lagerorte"],
  ["43-stammdaten-modelle", "/stammdaten?liste=modelle"],
  ["44-stammdaten-partner-bearbeiten", `/stammdaten/partner/${galerieNord}`],
];

const { browser, seite, anmelden, fehler } = await browserStarten();
const nurDiese = process.argv[2];
for (const groesse of [DESKTOP, HANDY]) {
  const editor = await seite(DESKTOP);
  await anmelden(editor);
  // Die Vorschau einer unveröffentlichten App braucht eine Freigabe aus dem Editor: Knopf „Vorschau“ öffnet sie.
  await editor.goto(`${ENV.BASEROW_URL}/builder/${ids.app}/page/${ids.seiten.Erfassen}`, { waitUntil: "networkidle" });
  const [page] = await Promise.all([editor.context().waitForEvent("page"), editor.getByRole("button", { name: "Vorschau" }).click()]);
  await page.waitForLoadState("networkidle");
  await page.setViewportSize(groesse);
  page.on("console", (m) => m.type() === "error" && fehler.push(`${page.url()}: ${m.text()}`));
  let appAngemeldet = false;
  for (const [name, pfad, angemeldet = true] of AUFNAHMEN) {
    if (nurDiese && !name.startsWith(nurDiese)) continue;
    if (angemeldet && !appAngemeldet) {
      await page.goto(`${VORSCHAU}/anmelden`, { waitUntil: "networkidle" });
      await page.getByPlaceholder("Geben Sie Ihre E-Mail ein").fill(ENV.BASEROW_APP_WERKSTATT_EMAIL);
      await page.getByPlaceholder("Geben Sie Ihr Passwort ein").fill(ENV.BASEROW_APP_WERKSTATT_PASSWORD);
      await page.getByRole("button", { name: "Anmelden" }).click();
      await page.waitForURL((url) => !url.pathname.endsWith("/anmelden"), { timeout: 20000 });
      appAngemeldet = true;
    }
    await page.goto(`${VORSCHAU}${pfad}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const pruefung = await page.evaluate((min) => {
      const klein = [...document.querySelectorAll("a, button, input, select, textarea, [role=button]")]
        .filter((e) => e.offsetParent && !e.closest(".builder-page-preview__badge, [class*=badge]"))
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height < min)
        .map(({ e, r }) => `${e.tagName.toLowerCase()} „${(e.innerText || e.value || e.placeholder || e.type || "").trim().slice(0, 24)}“ ${Math.round(r.height)} px`);
      return { breite: document.documentElement.scrollWidth, klein };
    }, MIN_TIPPFLAECHE);
    const kuerzel = groesse === HANDY ? "m" : "d";
    await page.screenshot({ path: `${ZIEL}/baserow-nachbau-${name}-${kuerzel}.png`, fullPage: true });
    const zuBreit = pruefung.breite > groesse.width ? ` ZU BREIT (${pruefung.breite})` : "";
    console.log(`${name}-${kuerzel}${zuBreit} · kleine Tippflächen: ${pruefung.klein.length}${pruefung.klein.length ? ` (${[...new Set(pruefung.klein)].slice(0, 4).join("; ")})` : ""}`);
  }
}
console.log("Konsole:", [...new Set(fehler.filter((f) => !f.includes("Hydration")))].slice(0, 8));
await browser.close();
