// Schritt 4: Website-Schnittstelle prüfen (nur prüfen). Legt einen Test-Token und eine Ansicht „Website“ an,
// testet Lese-/Schreibrechte und ausgeblendete Felder und räumt den Token danach wieder ab.
// Nichts wird öffentlich geschaltet. Der Webhook wird angelegt, aber deaktiviert und nie ausgelöst.
import { anmelden, api, ladeIds, speichereIds, ENV } from "./lib.mjs";

await anmelden();
const ids = ladeIds();
const T = ids.tabellen;
const U = ids.felder.Unikate;
const FREIGEGEBEN = ["Name", "Inventarnummer", "Typ", "Künstler:in", "Jahr", "Glasur", "Maße", "Fotos", "Bildnachweis", "Status"];
const ergebnis = [];
const notiere = (frage, ok, info) => ergebnis.push({ frage, ok, info });

// --- Ansicht „Website“: nur freigegebene Felder, nur „Auf Website zeigen“ = ja
const vorhanden = (await api("GET", `/database/views/table/${T.Unikate}/`)).find((v) => v.name === "Website");
if (vorhanden) await api("DELETE", `/database/views/${vorhanden.id}/`);
const view = await api("POST", `/database/views/table/${T.Unikate}/`, { name: "Website", type: "grid", public: false });
await api("POST", `/database/views/${view.id}/filters/`, { field: U["Auf Website zeigen"], type: "boolean", value: "1" });
await api("PATCH", `/database/views/${view.id}/field-options/`, {
  field_options: Object.fromEntries(Object.entries(U).map(([name, id]) => [id, { hidden: !FREIGEGEBEN.includes(name) }])),
});
ids.ansichten["Unikate/Website"] = view.id;
speichereIds(ids);

// --- 1. Token nur lesen, nur Tabelle Unikate
const token = await api("POST", "/database/tokens/", { name: "Test Website-Build (wird gelöscht)", workspace: ids.workspace });
await api("PATCH", `/database/tokens/${token.id}/`, {
  permissions: { create: false, read: [["table", T.Unikate]], update: false, delete: false },
});
const mitToken = (methode, pfad, body) =>
  fetch(`${ENV.BASEROW_URL}/api${pfad}`, {
    method: methode,
    headers: { Authorization: `Token ${token.key}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

const lesen = await mitToken("GET", `/database/rows/table/${T.Unikate}/?user_field_names=true&size=1`);
const fremd = await mitToken("GET", `/database/rows/table/${T.Partner}/?size=1`);
const schreiben = await mitToken("PATCH", `/database/rows/table/${T.Unikate}/1/?user_field_names=true`, { Notiz: "Test" });
notiere(
  "1. Token nur lesen, nur eine Tabelle",
  lesen.status === 200 && fremd.status !== 200 && schreiben.status !== 200,
  `Unikate lesen ${lesen.status}, Partner lesen ${fremd.status}, Unikat ändern ${schreiben.status}`,
);

// --- 2. Liefert die API über die Ansicht nur sichtbare Felder?
const ueberAnsicht = await (await mitToken("GET", `/database/rows/table/${T.Unikate}/?user_field_names=true&view_id=${view.id}`)).json();
const ohneAnsicht = await (await mitToken("GET", `/database/rows/table/${T.Unikate}/?user_field_names=true&size=1`)).json();
const felderAnsicht = Object.keys(ueberAnsicht.results?.[0] ?? {});
notiere(
  "2a. view_id blendet Preis aus",
  !felderAnsicht.includes("Preis intern"),
  `${ueberAnsicht.count} Zeilen (Filter greift), Felder: ${felderAnsicht.join(", ")}`,
);
notiere(
  "2b. Derselbe Token liest den Preis ohne view_id",
  Object.keys(ohneAnsicht.results?.[0] ?? {}).includes("Preis intern"),
  "Der Token ist an die Tabelle gebunden, nicht an die Ansicht",
);
const mitInclude = await (
  await mitToken("GET", `/database/rows/table/${T.Unikate}/?user_field_names=true&view_id=${view.id}&include=${encodeURIComponent(FREIGEGEBEN.join(","))}`)
).json();
notiere("2c. include= liefert nur die genannten Felder", !Object.keys(mitInclude.results?.[0] ?? {}).includes("Preis intern"), Object.keys(mitInclude.results?.[0] ?? {}).join(", "));
await api("DELETE", `/database/tokens/${token.id}/`);

// --- 3. Webhook bei Änderung von Status oder „Auf Website zeigen“ (deaktiviert, nie ausgelöst)
const alteHooks = await api("GET", `/database/webhooks/table/${T.Unikate}/`);
for (const h of alteHooks.filter((h) => h.name === "Website neu bauen (Test)")) await api("DELETE", `/database/webhooks/${h.id}/`);
const hook = await api(
  "POST",
  `/database/webhooks/table/${T.Unikate}/`,
  {
    name: "Website neu bauen (Test)",
    url: "https://example.com/platzhalter-deploy-hook",
    request_method: "POST",
    include_all_events: false,
    events: ["rows.updated", "rows.created", "rows.deleted"],
    event_config: [{ event_type: "rows.updated", fields: [U.Status, U["Auf Website zeigen"]], views: [] }],
    use_user_field_names: true,
  },
  { erlaubtFehler: true },
);
if (!hook.fehler) await api("PATCH", `/database/webhooks/${hook.id}/`, { active: false });
notiere(
  "3. Webhook nur bei Änderung bestimmter Felder",
  !hook.fehler && hook.event_config?.some((c) => c.fields?.length === 2),
  hook.fehler ? JSON.stringify(hook.daten).slice(0, 300) : `angelegt (deaktiviert), Felder-Filter: ${JSON.stringify(hook.event_config)}`,
);

// --- 4. Datei-URLs
const mitFoto = (await api("GET", `/database/rows/table/${T.Unikate}/?user_field_names=true&view_id=${view.id}`)).results.find((z) => z.Fotos.length);
const url = mitFoto?.Fotos[0]?.url ?? "";
const abruf = url ? await fetch(url) : null;
notiere("4. Datei-URL (lokal)", Boolean(abruf?.ok), `${url.replace(/[^/]+$/, "…")} · ohne Anmeldung abrufbar: ${abruf?.status} · Signatur/Ablauf im Link: ${/[?&](X-Amz|Expires|Signature|token)=/i.test(url) ? "ja" : "nein"}`);

for (const e of ergebnis) console.log(`${e.ok ? "JA  " : "NEIN"} ${e.frage}\n     ${e.info}`);
