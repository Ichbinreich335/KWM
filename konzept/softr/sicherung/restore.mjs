// Wiederherstellung aus einer Sicherung. Ohne --anwenden wird nur angezeigt, was sich ändern würde.
//
//   node restore.mjs --datum 2026-10-04 --tabelle Unikate                 Unterschiede einer Tabelle anzeigen
//   node restore.mjs --datum 2026-10-04 --tabelle Unikate --datensatz ID  nur einen Datensatz
//   ... --anwenden                                                        Unterschiede wirklich zurückschreiben
//
// Zurückgeschrieben werden nur bearbeitbare Felder. Berechnete Felder (Formel, Nachschlagen, Zeitstempel,
// Nummern) setzt Softr selbst. Fotos werden nicht zurückgeschrieben; sie liegen in R2 unter fotos/.
// Gelöschte Datensätze werden neu angelegt und bekommen dabei eine neue ID.
import { alleDatensaetze, env, r2, r2GetJson, softr } from "./softr-api.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? true : all[i + 1]]] : acc), []),
);
const datum = args.datum;
const tabelleName = args.tabelle;
if (!datum || !tabelleName) {
  console.error("Bitte --datum JJJJ-MM-TT und --tabelle Name angeben.");
  process.exit(1);
}
const anwenden = args.anwenden === true;

const NUR_LESEN = new Set(["AUTONUMBER", "CREATED_AT", "CREATED_BY", "FORMULA", "LOOKUP", "RECORD_ID", "ROLLUP", "UPDATED_AT", "UPDATED_BY", "ATTACHMENT"]);

// Lesewerte in Schreibwerte umwandeln: Auswahl als Text, Verknüpfungen als ID-Liste.
export function schreibwert(feld, wert) {
  if (wert === "" || wert === undefined) return null;
  if (feld.type === "SELECT") {
    const labels = (Array.isArray(wert) ? wert : [wert]).map((w) => (typeof w === "object" ? w.label : w));
    return feld.allowMultipleEntries ? labels : (labels[0] ?? null);
  }
  if (feld.type === "LINKED_RECORD") return (Array.isArray(wert) ? wert : [wert]).filter(Boolean).map((w) => (typeof w === "object" ? w.id : w));
  return wert;
}

const gleich = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const client = r2();
const stand = await r2GetJson(client, `stand/${datum}.json`);
const db = env("SOFTR_DATABASE_ID", stand.datenbank);
const tabelle = stand.tabellen.find((t) => t.name === tabelleName || t.id === tabelleName);
if (!tabelle) throw new Error(`Tabelle „${tabelleName}“ ist in der Sicherung vom ${datum} nicht enthalten.`);
const felder = (tabelle.schema?.fields ?? []).filter((f) => !NUR_LESEN.has(f.type));
const jetzt = new Map((await alleDatensaetze(db, tabelle.id)).map((d) => [d.id, d]));
const quelle = tabelle.datensaetze.filter((d) => !args.datensatz || d.id === args.datensatz);

let geaendert = 0;
let neu = 0;
for (const alt of quelle) {
  const fields = Object.fromEntries(felder.map((f) => [f.id, schreibwert(f, alt.fields?.[f.id])]));
  const aktuell = jetzt.get(alt.id);
  if (!aktuell) {
    console.log(`NEU ANLEGEN (war gelöscht): ${alt.id}`, JSON.stringify(fields));
    if (anwenden) await softr(`/databases/${db}/tables/${tabelle.id}/records`, { method: "POST", body: { fields } });
    neu++;
    continue;
  }
  const diff = Object.fromEntries(felder.filter((f) => !gleich(fields[f.id], schreibwert(f, aktuell.fields?.[f.id]))).map((f) => [f.id, fields[f.id]]));
  if (Object.keys(diff).length === 0) continue;
  console.log(`ÄNDERN ${alt.id}:`, felder.filter((f) => f.id in diff).map((f) => `${f.name}: ${JSON.stringify(schreibwert(f, aktuell.fields?.[f.id]))} → ${JSON.stringify(diff[f.id])}`).join("; "));
  if (anwenden) await softr(`/databases/${db}/tables/${tabelle.id}/records/${alt.id}`, { method: "PATCH", body: { fields: diff } });
  geaendert++;
}
console.log(`${anwenden ? "Zurückgeschrieben" : "Trockenlauf"}: ${geaendert} geändert, ${neu} neu angelegt. ${anwenden ? "" : "Mit --anwenden wirklich zurückschreiben."}`);
