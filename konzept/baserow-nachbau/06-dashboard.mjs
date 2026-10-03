// Zusatzprüfung: Dashboard „Lager-Übersicht“ mit Kennzahl-Kacheln (Widget „summary“, im Free-Umfang)
// und einem Versuch mit Diagramm (Widget „chart“, laut Code nur mit Premium-Lizenz).
import { anmelden, api, ladeIds, speichereIds } from "./lib.mjs";

const NAME = "Lager-Übersicht";
await anmelden();
const ids = ladeIds();
const U = ids.felder.Unikate;
const E = ids.felder.Editionsbestand;

for (const a of (await api("GET", `/applications/workspace/${ids.workspace}/`)).filter((a) => a.type === "dashboard" && a.name === NAME)) {
  await api("DELETE", `/applications/${a.id}/`);
}
const dash = await api("POST", `/applications/workspace/${ids.workspace}/`, { name: NAME, type: "dashboard" });
// Die Verbindung muss vor den Kacheln existieren: Neue Kacheln übernehmen sie beim Anlegen, ändern lässt sie sich danach nicht.
await api("POST", `/application/${dash.id}/integrations/`, { type: "local_baserow", name: "Lager-Datenbank" });

const KACHELN = [
  ["Unikate gesamt", "alle Status", ids.tabellen.Unikate, U.Name, "count", null],
  ["Außer Haus", "in Kommission oder ausgestellt", ids.tabellen.Unikate, U.Name, "count", ids.ansichten["Unikate/Außer Haus"]],
  ["Verkauft dieses Jahr", "Status verkauft, Verkauft am in diesem Jahr", ids.tabellen.Unikate, U.Name, "count", ids.ansichten["Unikate/Verkauft dieses Jahr"]],
  ["Editionsware", "Stück gesamt", ids.tabellen.Editionsbestand, E.Anzahl, "sum", null],
];
for (const [titel, beschreibung, tabelle, feld, art, view] of KACHELN) {
  const w = await api("POST", `/dashboard/${dash.id}/widgets/`, { type: "summary", title: titel, description: beschreibung });
  await api("PATCH", `/dashboard/data-sources/${w.data_source_id}/`, {
    table_id: tabelle,
    view_id: view,
    field_id: feld,
    aggregation_type: art,
  });
}
const diagramm = await api("POST", `/dashboard/${dash.id}/widgets/`, { type: "chart", title: "Unikate nach Typ" }, { erlaubtFehler: true });
console.log("Kennzahl-Kacheln (summary):", KACHELN.length, "angelegt");
console.log("Diagramm (chart):", diagramm.fehler ? `nicht möglich → ${diagramm.fehler} ${JSON.stringify(diagramm.daten).slice(0, 160)}` : "angelegt");

for (const ds of await api("GET", `/dashboard/${dash.id}/data-sources/`)) {
  const r = await api("POST", `/dashboard/data-sources/${ds.id}/dispatch/`, {}, { erlaubtFehler: true });
  console.log(" ", ds.name ?? ds.id, "→", JSON.stringify(r.result ?? r).slice(0, 80));
}
ids.dashboard = dash.id;
speichereIds(ids);
