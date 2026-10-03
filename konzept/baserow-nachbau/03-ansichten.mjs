// Schritt 3a: Gespeicherte Ansichten in der Datenbank (Grid, Galerie, Formular). Nichts davon ist öffentlich.
// Aufruf: node konzept/baserow-nachbau/03-ansichten.mjs (legt die Ansichten neu an, bestehende eigene werden ersetzt)
import { anmelden, api, ladeIds, speichereIds } from "./lib.mjs";

await anmelden();
const ids = ladeIds();
ids.ansichten = {};
const ZEITZONE = "Europe/Berlin";

const felder = async (tabelle) =>
  Object.fromEntries((await api("GET", `/database/fields/table/${ids.tabellen[tabelle]}/`)).map((f) => [f.name, f]));
const option = (feld, wert) => String(feld.select_options.find((o) => o.value === wert).id);

async function ansicht(tabelle, name, typ, extra = {}) {
  const vorhanden = (await api("GET", `/database/views/table/${ids.tabellen[tabelle]}/`)).find((v) => v.name === name);
  if (vorhanden) await api("DELETE", `/database/views/${vorhanden.id}/`);
  const v = await api("POST", `/database/views/table/${ids.tabellen[tabelle]}/`, { name, type: typ, ...extra });
  ids.ansichten[`${tabelle}/${name}`] = v.id;
  return v.id;
}

/** Sichtbare Felder in dieser Reihenfolge, alle anderen ausblenden. */
async function spalten(viewId, f, reihenfolge, breiten = {}) {
  const optionen = {};
  for (const [name, feld] of Object.entries(f)) {
    const i = reihenfolge.indexOf(name);
    optionen[feld.id] = { hidden: i < 0, order: i < 0 ? 100 : i, ...(breiten[name] ? { width: breiten[name] } : {}) };
  }
  await api("PATCH", `/database/views/${viewId}/field-options/`, { field_options: optionen });
}

const filter = (viewId, feld, type, value) => api("POST", `/database/views/${viewId}/filters/`, { field: feld.id, type, value });
const sortierung = (viewId, feld, order = "ASC") => api("POST", `/database/views/${viewId}/sortings/`, { field: feld.id, order });

// Das Standard-Grid jeder Tabelle bekommt einen sprechenden Namen (Baserow nennt es „Grid“).
// Bei erneutem Lauf werden seine Sortierungen, Filter und Gruppierungen zuerst entfernt.
async function standardGrid(tabelle, name) {
  const views = await api("GET", `/database/views/table/${ids.tabellen[tabelle]}/?include=filters,sortings,group_bys`);
  const grid = views.find((v) => v.name === name) ?? views.find((v) => v.type === "grid");
  await api("PATCH", `/database/views/${grid.id}/`, { name });
  for (const s of grid.sortings ?? []) await api("DELETE", `/database/views/sort/${s.id}/`);
  for (const f of grid.filters ?? []) await api("DELETE", `/database/views/filter/${f.id}/`);
  for (const g of grid.group_bys ?? []) await api("DELETE", `/database/views/group_by/${g.id}/`);
  ids.ansichten[`${tabelle}/${name}`] = grid.id;
  return grid.id;
}

// --- Unikate
const U = await felder("Unikate");
const BREITEN = { Name: 240, Inventarnummer: 130, Status: 140, Lagerort: 190, Partner: 190, Glasur: 220 };
const ALLE_SPALTEN = [
  "Name", "Inventarnummer", "Fotos", "Typ", "Status", "Lagerort", "Partner", "Künstler:in", "Jahr", "Glasur", "Maße",
  "Preis intern", "Auf Website zeigen", "Außer Haus seit", "Rückgabe bis", "Verkauft am", "Bildnachweis", "Notiz",
  "Erfasst von", "Erfasst am", "Geändert am",
];

const alle = await standardGrid("Unikate", "Alle Unikate");
await spalten(alle, U, ALLE_SPALTEN, BREITEN);
await sortierung(alle, U.Nummer, "DESC");

const aussen = await ansicht("Unikate", "Außer Haus", "grid");
await filter(aussen, U.Status, "single_select_is_any_of", `${option(U.Status, "in Kommission")},${option(U.Status, "ausgestellt")}`);
await spalten(aussen, U, ["Name", "Inventarnummer", "Status", "Partner", "Rückgabe bis", "Außer Haus seit", "Lagerort", "Preis intern", "Fotos"], BREITEN);
await sortierung(aussen, U["Rückgabe bis"]);

const verkauft = await ansicht("Unikate", "Verkauft dieses Jahr", "grid", { filter_type: "AND" });
await filter(verkauft, U.Status, "single_select_equal", option(U.Status, "verkauft"));
await filter(verkauft, U["Verkauft am"], "date_is", `${ZEITZONE}??this_year`);
await spalten(verkauft, U, ["Name", "Inventarnummer", "Verkauft am", "Preis intern", "Künstler:in", "Typ", "Fotos"], BREITEN);
await sortierung(verkauft, U["Verkauft am"], "DESC");

const galerie = await ansicht("Unikate", "Bestand", "gallery", { card_cover_image_field: U.Fotos.id });
await api("PATCH", `/database/views/${galerie}/field-options/`, {
  field_options: Object.fromEntries(
    Object.entries(U).map(([n, f]) => {
      const i = ["Name", "Inventarnummer", "Status", "Lagerort"].indexOf(n);
      return [f.id, { hidden: i < 0, order: i < 0 ? 100 : i }];
    }),
  ),
});
await sortierung(galerie, U.Nummer, "DESC");

// Formular „Neues Unikat“ (wie Erfassen in Softr). Partner und Rückgabe erscheinen nur, wenn das Stück außer Haus ist.
const formular = await ansicht("Unikate", "Neues Unikat", "form", {
  title: "Neues Stück erfassen",
  description: "Felder mit * sind Pflicht. Alles andere kann später ergänzt werden.",
  submit_text: "Speichern",
  submit_action: "MESSAGE",
  submit_action_message: "Gespeichert. Das Stück steht jetzt im Bestand.",
  public: false,
});
const FORMULAR_UNIKAT = [
  ["Fotos", "Fotos", "Am Handy öffnet sich Kamera oder Galerie.", true],
  ["Name", "Name", "z. B. Mondvase „Seladon“", true],
  ["Typ", "Typ", "", true, "radios"],
  ["Status", "Status", "", true, "radios"],
  ["Lagerort", "Lagerort", "", false],
  ["Partner", "Partner (Galerie, Museum …)", "Nur wenn das Stück außer Haus ist.", false],
  ["Rückgabe bis", "Rückgabe bis", "", false],
  ["Künstler:in", "Künstler:in", "", false],
  ["Jahr", "Jahr", "Entstehungsjahr, z. B. 2026", false],
  ["Glasur", "Glasur", "Mehrere möglich.", false],
  ["Maße", "Maße", "z. B. Ø 24 × H 8 cm", false],
  ["Bildnachweis", "Bildnachweis", "z. B. Foto: Name der Fotografin", false],
  ["Preis intern", "Preis intern (€)", "Nur intern, erscheint nie auf der Website.", false],
  ["Auf Website zeigen", "Auf Website zeigen", "Nur für die spätere Website-Anbindung.", false],
  ["Notiz", "Notiz", "", false],
  ["Erfasst von", "Erfasst von", "Ihr Vorname genügt.", false],
];
const ausserHausBedingung = () => ({
  show_when_matching_conditions: true,
  condition_type: "OR",
  conditions: ["in Kommission", "ausgestellt"].map((w, i) => ({
    id: -(i + 1),
    field: U.Status.id,
    type: "single_select_equal",
    value: option(U.Status, w),
    group: null,
  })),
  condition_groups: [],
});
async function formularFelder(viewId, f, liste, bedingt = {}) {
  const optionen = Object.fromEntries(Object.values(f).map((x) => [x.id, { enabled: false }]));
  liste.forEach(([feld, name, beschreibung, pflicht, komponente], i) => {
    optionen[f[feld].id] = {
      enabled: true,
      name,
      description: beschreibung,
      required: pflicht,
      order: i,
      ...(komponente ? { field_component: komponente } : {}),
      ...(bedingt[feld] ?? {}),
    };
  });
  await api("PATCH", `/database/views/${viewId}/field-options/`, { field_options: optionen });
}
await formularFelder(formular, U, FORMULAR_UNIKAT, {
  Partner: ausserHausBedingung(),
  "Rückgabe bis": ausserHausBedingung(),
});

// --- Editionsbestand
const E = await felder("Editionsbestand");
const edGrid = await standardGrid("Editionsbestand", "Nach Modell");
await spalten(edGrid, E, ["Bezeichnung", "Modell", "Typ", "Glasur", "Zustand", "Anzahl", "Lagerort", "Foto", "Notiz", "Zuletzt geändert"], { Bezeichnung: 280, Modell: 200 });
await api("POST", `/database/views/${edGrid}/group_bys/`, { field: E.Modell.id, order: "ASC" });
await sortierung(edGrid, E.Zustand);

const edForm = await ansicht("Editionsbestand", "Neue Editionsware", "form", {
  title: "Neue Editionsware erfassen",
  description: "Eine Zeile je Modell, Glasur und Zustand. Die Bezeichnung entsteht automatisch.",
  submit_text: "Speichern",
  submit_action: "MESSAGE",
  submit_action_message: "Gespeichert. Die Ware steht jetzt im Editionsbestand.",
  public: false,
});
await formularFelder(edForm, E, [
  ["Modell", "Modell", "Neue Modelle in der Tabelle „Modelle“ anlegen.", true],
  ["Zustand", "Zustand", "", true, "radios"],
  ["Glasur", "Glasur", "Nur bei glasierter Ware.", false],
  ["Anzahl", "Anzahl", "", true],
  ["Lagerort", "Lagerort", "", false],
  ["Foto", "Foto", "", false],
  ["Notiz", "Notiz", "", false],
], {
  Glasur: {
    show_when_matching_conditions: true,
    condition_type: "AND",
    conditions: [{ id: -1, field: E.Zustand.id, type: "single_select_equal", value: option(E.Zustand, "glasiert"), group: null }],
    condition_groups: [],
  },
});

// --- Stammdaten: je ein Grid, sortiert nach Name
const STAMMDATEN = {
  "Künstler:innen": ["Name"],
  Glasuren: ["Name"],
  Modelle: ["Name", "Foto", "Typ", "Maße"],
  Partner: ["Name", "Art", "Ort", "Zusammenarbeit", "Kontakt", "Notiz"],
  Lagerorte: ["Name", "Bereich"],
};
for (const [tabelle, reihenfolge] of Object.entries(STAMMDATEN)) {
  const f = await felder(tabelle);
  const g = await standardGrid(tabelle, `Alle ${tabelle}`);
  await spalten(g, f, reihenfolge, { Name: 260 });
  await sortierung(g, f.Name);
}

speichereIds(ids);
for (const [name, id] of Object.entries(ids.ansichten)) {
  const v = await api("GET", `/database/views/${id}/`);
  console.log(`${name.padEnd(36)} ${v.type.padEnd(8)} öffentlich: ${v.public ? "ja" : "nein"}`);
}
