// Prüft die vier Status-Regeln an einem bestehenden Unikat und stellt es danach wieder her.
// Eine neue Testzeile würde die Autonummer dauerhaft weiterzählen, deshalb ein vorhandenes Stück.
import { anmelden, api, ladeIds } from "./lib.mjs";

const TESTSTUECK = "Karaffe „Eisenquelle“";
const WARTEN_MS = 500;
const MAX_WARTEN_MS = 30000;

await anmelden();
const ids = ladeIds();
const T = ids.tabellen.Unikate;
const heute = new Date().toISOString().slice(0, 10);

const name = (liste) => liste?.map((x) => x.value).join(", ") || "–";
const lagerorte = (await api("GET", `/database/rows/table/${ids.tabellen.Lagerorte}/?user_field_names=true`)).results;
const partner = (await api("GET", `/database/rows/table/${ids.tabellen.Partner}/?user_field_names=true`)).results;
const ort = (n) => lagerorte.find((z) => z.Name === n).id;
const statusFeld = (await api("GET", `/database/fields/${ids.felder.Unikate.Status}/`)).select_options;
const status = (w) => statusFeld.find((o) => o.value === w).id;

const alle = await api("GET", `/database/rows/table/${T}/?user_field_names=true&search=${encodeURIComponent("Eisenquelle")}`);
const vorher = alle.results.find((z) => z.Name === TESTSTUECK);
const zeile = () => api("GET", `/database/rows/table/${T}/${vorher.id}/?user_field_names=true`);
const setzen = (werte) => api("PATCH", `/database/rows/table/${T}/${vorher.id}/?user_field_names=true`, werte);

async function wartenBis(pruefung) {
  for (let t = 0; t < MAX_WARTEN_MS; t += WARTEN_MS) {
    const z = await zeile();
    if (pruefung(z)) return { z, ok: true };
    await new Promise((weiter) => setTimeout(weiter, WARTEN_MS));
  }
  return { z: await zeile(), ok: false };
}

const kurz = (z) =>
  `Status ${z.Status?.value} · Lagerort ${name(z.Lagerort)} · Partner ${name(z.Partner)} · seit ${z["Außer Haus seit"] ?? "–"} · Rückgabe ${z["Rückgabe bis"] ?? "–"} · verkauft ${z["Verkauft am"] ?? "–"}`;

const ergebnisse = [];
async function fall(titel, vorbereitung, aenderung, erwartung) {
  if (vorbereitung) await vorbereitung();
  await setzen(aenderung);
  const { z, ok } = await wartenBis(erwartung);
  ergebnisse.push({ titel, ok, ergebnis: kurz(z) });
}

console.log("Vorher:", kurz(vorher));

await fall(
  "1+2: Status „in Kommission“, Lagerort Regal B, Datum leer",
  null,
  { Status: status("in Kommission") },
  (z) => z.Lagerort[0]?.value === "Außer Haus" && z["Außer Haus seit"] === heute,
);
await fall(
  "1: Status „ausgestellt“, Lagerort falsch, Datum schon gesetzt (bleibt)",
  async () => {
    // „verfügbar“ löst Regel 3 aus. Erst abwarten, dann den falschen Lagerort setzen.
    await setzen({ Status: status("verfügbar") });
    await wartenBis((z) => !z.Lagerort.length);
    await setzen({ Lagerort: [ort("Regal B – Lager")] });
  },
  { Status: status("ausgestellt"), "Außer Haus seit": "2026-09-01" },
  (z) => z.Lagerort[0]?.value === "Außer Haus" && z["Außer Haus seit"] === "2026-09-01",
);
await fall(
  "3: zurück auf „verfügbar“ leert Lagerort, Partner, Daten",
  () => setzen({ Partner: [partner[0].id], "Rückgabe bis": "2026-12-31" }),
  { Status: status("verfügbar") },
  (z) => !z.Lagerort.length && !z.Partner.length && !z["Außer Haus seit"] && !z["Rückgabe bis"],
);
await fall(
  "4: Status „verkauft“ setzt Verkauft am",
  null,
  { Status: status("verkauft") },
  (z) => z["Verkauft am"] === heute,
);

await setzen({
  Status: vorher.Status.id,
  Lagerort: vorher.Lagerort.map((x) => x.id),
  Partner: vorher.Partner.map((x) => x.id),
  "Außer Haus seit": vorher["Außer Haus seit"],
  "Rückgabe bis": vorher["Rückgabe bis"],
  "Verkauft am": vorher["Verkauft am"],
});
const nachher = await zeile();

for (const e of ergebnisse) console.log(`${e.ok ? "OK  " : "FEHL"} ${e.titel}\n     → ${e.ergebnis}`);
console.log("Zurückgesetzt:", kurz(nachher));
