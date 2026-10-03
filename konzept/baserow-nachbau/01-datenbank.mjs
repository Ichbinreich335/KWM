// Schritt 1: Datenbank „Keramik-Lager KWM“ wie in konzept/softr/export/SCHEMA.md anlegen und die CSVs importieren.
// Aufruf: node konzept/baserow-nachbau/01-datenbank.mjs (läuft nur einmal, bricht ab, wenn die Datenbank schon existiert)
import { readFileSync } from "node:fs";
import path from "node:path";
import { anmelden, api, leseCsv, ladeIds, speichereIds, WURZEL } from "./lib.mjs";

const WORKSPACE = "KWM Lager (Nachbau)";
const DATENBANK = "Keramik-Lager KWM";
const TYPEN = ["Teller", "Schale", "Becher", "Vase", "Karaffe", "Obertopf"];
const TESTZEILEN = ["Test-Schale „Playwright“", "Test-Krug „Playwright“"];

/** Beispielfotos aus keramik/, damit Galerie und Formular prüfbar sind (Fotos sind nicht exportiert). */
const BEISPIELFOTOS = {
  "Mondvase „Seladon“": "01-seladon-gefaess.png",
  "Schalen-Trio „Nebel“": "02-schalen-ensemble.png",
  "Karaffe „Eisenquelle“": "03-glasur-detail.png",
  "Schale „Pflaumenblüte“": "07-schalen-streiflicht.png",
  "Obertopf „Wolke“": "08-keramik-im-raum.png",
};

const auswahl = (werte, farben) => werte.map((value, i) => ({ value, color: farben[i % farben.length] }));
const RUHIG = ["light-blue", "light-green", "light-orange", "light-red", "light-cyan", "light-purple", "light-brown"];
const datum = { type: "date", date_format: "EU", date_include_time: false };
const zeitstempel = {
  date_format: "EU",
  date_include_time: true,
  date_time_format: "24",
  date_force_timezone: "Europe/Berlin",
};

await anmelden();
const ids = ladeIds();
if (ids.datenbank) throw new Error(`Datenbank existiert schon (id ${ids.datenbank}). Nichts geändert.`);

const workspaces = await api("GET", "/workspaces/");
const ws = workspaces.find((w) => w.name === WORKSPACE) ?? (await api("POST", "/workspaces/", { name: WORKSPACE }));
const db = await api("POST", `/applications/workspace/${ws.id}/`, { name: DATENBANK, type: "database" });
ids.workspace = ws.id;
ids.datenbank = db.id;
ids.tabellen = {};
ids.felder = {};

async function tabelle(name, primaer) {
  const t = await api("POST", `/database/tables/database/${db.id}/`, {
    name,
    data: [[primaer]],
    first_row_header: true,
  });
  ids.tabellen[name] = t.id;
  ids.felder[name] = {};
  const [p] = (await api("GET", `/database/fields/table/${t.id}/`)).filter((f) => f.primary);
  ids.felder[name][primaer] = p.id;
  return t.id;
}

async function feld(tabellenName, name, optionen) {
  const f = await api("POST", `/database/fields/table/${ids.tabellen[tabellenName]}/`, { name, ...optionen });
  ids.felder[tabellenName][name] = f.id;
  return f;
}

const verweis = (ziel, mehrfach = false) => ({
  type: "link_row",
  link_row_table_id: ids.tabellen[ziel],
  has_related_field: false,
  link_row_multiple_relationships: mehrfach,
});

// --- Stammdaten
await tabelle("Künstler:innen", "Name");
await tabelle("Glasuren", "Name");
await tabelle("Lagerorte", "Name");
await feld("Lagerorte", "Bereich", { type: "single_select", select_options: auswahl(["Schauraum", "Lager", "Extern"], ["light-green", "light-blue", "light-orange"]) });
await tabelle("Partner", "Name");
await feld("Partner", "Kontakt", { type: "long_text" });
await feld("Partner", "Zusammenarbeit", { type: "single_select", select_options: auswahl(["aktiv", "beendet"], ["light-green", "light-gray"]) });
await feld("Partner", "Notiz", { type: "long_text" });
await feld("Partner", "Ort", { type: "text" });
await feld("Partner", "Art", { type: "single_select", select_options: auswahl(["Galerie", "Museum", "Ausstellung / Messe", "Leihnehmer privat"], RUHIG) });
await tabelle("Modelle", "Name");
await feld("Modelle", "Typ", { type: "single_select", select_options: auswahl(TYPEN, RUHIG) });
await feld("Modelle", "Maße", { type: "text" });
await feld("Modelle", "Foto", { type: "file" });

// --- Unikate
await tabelle("Unikate", "Name");
await feld("Unikate", "Nummer", { type: "autonumber" });
await feld("Unikate", "Typ", { type: "single_select", select_options: auswahl([...TYPEN, "Krug"], RUHIG) });
await feld("Unikate", "Status", {
  type: "single_select",
  select_options: auswahl(
    ["verfügbar", "reserviert", "verkauft", "in Kommission", "ausgestellt"],
    ["green", "yellow", "light-gray", "blue", "purple"],
  ),
});
await feld("Unikate", "Künstler:in", verweis("Künstler:innen"));
await feld("Unikate", "Jahr", { type: "number", number_decimal_places: 0, number_negative: false });
await feld("Unikate", "Glasur", verweis("Glasuren", true));
await feld("Unikate", "Maße", { type: "text" });
await feld("Unikate", "Fotos", { type: "file" });
await feld("Unikate", "Bildnachweis", { type: "text" });
await feld("Unikate", "Lagerort", verweis("Lagerorte"));
await feld("Unikate", "Partner", {
  ...verweis("Partner"),
  description: "Galerie, Museum oder Ausstellung, bei Status „in Kommission“ oder „ausgestellt“",
});
await feld("Unikate", "Preis intern", {
  type: "number",
  number_decimal_places: 0,
  number_negative: false,
  number_separator: "PERIOD_COMMA",
  number_suffix: " €",
});
await feld("Unikate", "Auf Website zeigen", { type: "boolean" });
await feld("Unikate", "Notiz", { type: "long_text" });
await feld("Unikate", "Erfasst von", { type: "text" });
await feld("Unikate", "Erfasst am", { type: "created_on", ...zeitstempel });
await feld("Unikate", "Geändert am", { type: "last_modified", ...zeitstempel });
await feld("Unikate", "Inventarnummer", {
  type: "formula",
  formula: "concat('U-', totext(year(field('Erfasst am'))), '-', right(concat('00', totext(field('Nummer'))), 3))",
  description: "Automatisch: U-Jahr der Erfassung-laufende Nummer, z. B. U-2026-013",
});
await feld("Unikate", "Verkauft am", { ...datum, description: "Setzt eine Automation, wenn der Status auf „verkauft“ wechselt." });
await feld("Unikate", "Außer Haus seit", datum);
await feld("Unikate", "Rückgabe bis", datum);

// --- Editionsbestand (Bezeichnung als Formel statt per App-Code gesetzt)
await tabelle("Editionsbestand", "Bezeichnung");
await feld("Editionsbestand", "Modell", verweis("Modelle"));
await feld("Editionsbestand", "Glasur", verweis("Glasuren"));
await feld("Editionsbestand", "Zustand", { type: "single_select", select_options: auswahl(["Rohling", "glasiert"], ["light-orange", "light-blue"]) });
await feld("Editionsbestand", "Anzahl", { type: "number", number_decimal_places: 0, number_negative: false });
await feld("Editionsbestand", "Lagerort", verweis("Lagerorte"));
await feld("Editionsbestand", "Foto", { type: "file" });
await feld("Editionsbestand", "Notiz", { type: "long_text" });
await feld("Editionsbestand", "Erfasst am", { type: "created_on", ...zeitstempel });
await feld("Editionsbestand", "Zuletzt geändert", { type: "last_modified", ...zeitstempel });
await feld("Editionsbestand", "Typ", {
  type: "lookup",
  through_field_id: ids.felder.Editionsbestand.Modell,
  target_field_id: ids.felder.Modelle.Typ,
});
await api("PATCH", `/database/fields/${ids.felder.Editionsbestand.Bezeichnung}/`, {
  type: "formula",
  formula:
    "concat(join(totext(lookup('Modell', 'Name')), ''), ' · ', if(count(field('Glasur')) = 0, 'Rohling', join(totext(lookup('Glasur', 'Name')), '')))",
  description: "Automatisch: Modell · Glasur, ohne Glasur „Rohling“",
});
speichereIds(ids);

// --- Daten
async function felderMitOptionen(name) {
  return Object.fromEntries((await api("GET", `/database/fields/table/${ids.tabellen[name]}/`)).map((f) => [f.name, f]));
}
const optionId = (f, wert) => (wert ? f.select_options.find((o) => o.value === wert)?.id ?? null : null);

async function zeilenAnlegen(name, zeilen) {
  const angelegt = [];
  for (let i = 0; i < zeilen.length; i += 100) {
    const r = await api("POST", `/database/rows/table/${ids.tabellen[name]}/batch/?user_field_names=true`, {
      items: zeilen.slice(i, i + 100),
    });
    angelegt.push(...r.items);
  }
  return angelegt;
}

async function importiereEinfach(name, datei) {
  const f = await felderMitOptionen(name);
  const zeilen = leseCsv(datei).map((z) =>
    Object.fromEntries(
      Object.entries(z)
        .filter(([k]) => f[k] && f[k].type !== "file")
        .map(([k, v]) => [k, f[k].type === "single_select" ? optionId(f[k], v) : v]),
    ),
  );
  const angelegt = await zeilenAnlegen(name, zeilen);
  return Object.fromEntries(angelegt.map((z) => [z.Name, z.id]));
}

const kuenstler = await importiereEinfach("Künstler:innen", "kuenstlerinnen.csv");
const glasuren = await importiereEinfach("Glasuren", "glasuren.csv");
const lagerorte = await importiereEinfach("Lagerorte", "lagerorte.csv");
const partner = await importiereEinfach("Partner", "partner.csv");
const modelle = await importiereEinfach("Modelle", "modelle.csv");

const verweisIds = (karte, text) =>
  text ? text.split(",").map((n) => karte[n.trim()] ?? (() => { throw new Error(`Unbekannter Verweis „${n}“`); })()) : [];

const fu = await felderMitOptionen("Unikate");
const unikate = leseCsv("unikate.csv")
  .filter((z) => !TESTZEILEN.includes(z.Name))
  .sort((a, b) => Number(a.Nummer) - Number(b.Nummer))
  .map((z) => ({
    Name: z.Name,
    Typ: optionId(fu.Typ, z.Typ),
    Status: optionId(fu.Status, z.Status),
    "Künstler:in": verweisIds(kuenstler, z["Künstler:in"]),
    Jahr: z.Jahr ? Number(z.Jahr) : null,
    Glasur: verweisIds(glasuren, z.Glasur),
    Maße: z.Maße,
    Bildnachweis: z.Bildnachweis,
    Lagerort: verweisIds(lagerorte, z.Lagerort),
    Partner: verweisIds(partner, z.Partner),
    "Preis intern": z["Preis intern"] ? Number(z["Preis intern"]) : null,
    "Auf Website zeigen": z["Auf Website zeigen"] === "ja",
    Notiz: z.Notiz,
    "Erfasst von": z["Erfasst von"],
    "Verkauft am": z["Verkauft am"] || null,
    "Außer Haus seit": z["Außer Haus seit"] || null,
    "Rückgabe bis": z["Rückgabe bis"] || null,
  }));
const unikatZeilen = await zeilenAnlegen("Unikate", unikate);

const fe = await felderMitOptionen("Editionsbestand");
await zeilenAnlegen(
  "Editionsbestand",
  leseCsv("editionsbestand.csv").map((z) => ({
    Modell: verweisIds(modelle, z.Modell),
    Glasur: verweisIds(glasuren, z.Glasur),
    Zustand: optionId(fe.Zustand, z.Zustand),
    Anzahl: Number(z.Anzahl),
    Lagerort: verweisIds(lagerorte, z.Lagerort),
    Notiz: z.Notiz,
  })),
);

// --- Beispielfotos
for (const [name, datei] of Object.entries(BEISPIELFOTOS)) {
  const zeile = unikatZeilen.find((z) => z.Name === name);
  const form = new FormData();
  form.append("file", new Blob([readFileSync(path.join(WURZEL, "keramik", datei))], { type: "image/png" }), datei);
  const datei_ = await api("POST", "/user-files/upload-file/", form);
  await api("PATCH", `/database/rows/table/${ids.tabellen.Unikate}/${zeile.id}/?user_field_names=true`, {
    Fotos: [{ name: datei_.name, visible_name: `${name}.png` }],
  });
}

speichereIds(ids);
for (const [name, id] of Object.entries(ids.tabellen)) {
  const r = await api("GET", `/database/rows/table/${id}/?size=1`);
  console.log(`${name}: ${r.count} Zeilen`);
}
