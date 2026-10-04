// Nächtliche Sicherung der Softr-Datenbank nach Cloudflare R2.
// Legt je Tag eine vollständige Kopie ab (Schema und alle Datensätze) und sichert neue Fotos einmalig.
// Aufruf: node export.mjs   (Variablen siehe README.md)
import { createHash } from "node:crypto";
import { alleDatensaetze, env, liste, r2, r2Exists, r2Put, softr } from "./softr-api.mjs";

const db = env("SOFTR_DATABASE_ID", "4a2f1f1d-3c1b-409a-8bf0-247d4ea8a943");
const tag = new Date().toISOString().slice(0, 10);
const client = r2();

// Anhänge erkennen: Objekte mit url, die zu einem Anhangfeld gehören.
function anhaenge(wert) {
  const liste = Array.isArray(wert) ? wert : wert ? [wert] : [];
  return liste.filter((a) => a && typeof a === "object" && typeof a.url === "string" && (a.id || a.filename));
}

function fotoKey(a) {
  const id = createHash("sha256").update(String(a.id ?? a.url.split("?")[0])).digest("hex").slice(0, 32);
  const ext = (a.filename ?? "").match(/\.[a-z0-9]{2,5}$/i)?.[0]?.toLowerCase() ?? "";
  return `fotos/${id}${ext}`;
}

const tabellen = [];
let fotosNeu = 0;
let fotosVorhanden = 0;
for (const t of liste(await softr(`/databases/${db}/tables`))) {
  const schema = await softr(`/databases/${db}/tables/${t.id}`);
  const datensaetze = await alleDatensaetze(db, t.id);
  const anhangFelder = (schema?.data?.fields ?? schema?.fields ?? []).filter((f) => f.type === "ATTACHMENT").map((f) => f.id);
  for (const d of datensaetze) {
    for (const feld of anhangFelder) {
      for (const a of anhaenge(d.fields?.[feld])) {
        const key = fotoKey(a);
        a.sicherung = key;
        if (await r2Exists(client, key)) {
          fotosVorhanden++;
          continue;
        }
        const res = await fetch(a.url);
        if (!res.ok) throw new Error(`Foto ${a.filename ?? a.id}: ${res.status}`);
        await r2Put(client, key, Buffer.from(await res.arrayBuffer()), res.headers.get("content-type") ?? "application/octet-stream");
        fotosNeu++;
      }
    }
  }
  tabellen.push({ id: t.id, name: t.name, schema: schema?.data ?? schema, datensaetze });
  console.log(`${t.name}: ${datensaetze.length} Datensätze`);
}

if (tabellen.length === 0) throw new Error("Keine Tabellen gefunden. Stimmt die Datenbank-ID?");
const stand = { erstellt: new Date().toISOString(), datenbank: db, tabellen };
const json = JSON.stringify(stand);
await r2Put(client, `stand/${tag}.json`, json, "application/json");
await r2Put(client, "stand/aktuell.json", json, "application/json");
const summe = tabellen.reduce((n, t) => n + t.datensaetze.length, 0);
console.log(`Gesichert: ${tabellen.length} Tabellen, ${summe} Datensätze, Fotos neu ${fotosNeu}, schon da ${fotosVorhanden} → stand/${tag}.json`);
