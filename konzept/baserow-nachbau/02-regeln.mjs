// Schritt 2: Die vier Status-Regeln als Baserow-Automation (fertige Bausteine, kein Code-Knoten).
// Ablauf: Status geändert → für jede geänderte Zeile → Zeile lesen → Verteiler (Router) → Zeile ändern.
// Aufruf: node konzept/baserow-nachbau/02-regeln.mjs (ersetzt den Workflow „Status-Regeln“, falls vorhanden)
import { anmelden, api, ladeIds, speichereIds } from "./lib.mjs";

const WORKFLOW = "Status-Regeln";
const AUSSER_HAUS = "Außer Haus";

await anmelden();
const ids = ladeIds();
const U = ids.felder.Unikate;

const automation =
  (await api("GET", `/applications/workspace/${ids.workspace}/`)).find((a) => a.id === ids.automation) ??
  (await api("POST", `/applications/workspace/${ids.workspace}/`, { name: "Regeln Lager", type: "automation" }));
ids.automation = automation.id;

for (const wf of automation.workflows ?? []) await api("DELETE", `/automation/workflows/${wf.id}/`);
const integrationen = await api("GET", `/application/${automation.id}/integrations/`);
const integration =
  integrationen.find((i) => i.type === "local_baserow") ??
  (await api("POST", `/application/${automation.id}/integrations/`, { type: "local_baserow", name: "Lager-Datenbank" }));

const lagerorte = await api("GET", `/database/rows/table/${ids.tabellen.Lagerorte}/?user_field_names=true&size=200`);
const ausserHausId = lagerorte.results.find((z) => z.Name === AUSSER_HAUS).id;

const wf = await api("POST", `/automation/${automation.id}/workflows/`, { name: WORKFLOW });
const formel = (text) => ({ formula: text, mode: "advanced", version: "0.1" });
const knoten = (typ, bezug, position, label, output = "") =>
  api("POST", `/automation/workflow/${wf.id}/nodes/`, { type: typ, reference_node_id: bezug, position, output }).then(
    (k) => api("PATCH", `/automation/node/${k.id}/`, { label }).then(() => k),
  );

// Auslöser: nur wenn sich der Status ändert. So lösen die eigenen Änderungen der Regeln keine neue Runde aus.
const ausloeser = await api("POST", `/automation/workflow/${wf.id}/nodes/`, { type: "local_baserow_fields_updated" });
await api("PATCH", `/automation/node/${ausloeser.id}/`, {
  label: "Status eines Unikats geändert",
  service: { integration_id: integration.id, table_id: ids.tabellen.Unikate, field_ids: [U.Status] },
});

// Mehrere Zeilen auf einmal (z. B. Einfügen im Grid) werden einzeln abgearbeitet.
const schleife = await knoten("iterator", ausloeser.id, "south", "Für jedes geänderte Unikat");
await api("PATCH", `/automation/node/${schleife.id}/`, {
  service: { source: formel(`get('previous_node.${ausloeser.id}')`) },
});
const zeileId = `get('current_iteration.${schleife.id}.item.id')`;

const lesen = await knoten("local_baserow_get_row", schleife.id, "child", "Unikat vollständig lesen");
await api("PATCH", `/automation/node/${lesen.id}/`, {
  service: { integration_id: integration.id, table_id: ids.tabellen.Unikate, row_id: formel(zeileId) },
});

const wert = (feld, pfad = "") => `get('previous_node.${lesen.id}.field_${U[feld]}${pfad}')`;
const status = wert("Status", ".value");
const istStatus = (...werte) =>
  werte.map((w) => `equal(${status}, '${w}')`).reduce((a, b) => `or(${a}, ${b})`);
const istAusserHaus = `equal(${wert("Lagerort", ".0.id")}, ${ausserHausId})`;
const leer = (feld) => `is_empty(${wert(feld)})`;

const ZWEIGE = [
  {
    label: "Außer Haus, Datum fehlt",
    bedingung: `and(${istStatus("in Kommission", "ausgestellt")}, ${leer("Außer Haus seit")})`,
    knoten: "Lagerort „Außer Haus“ und Datum heute setzen",
    felder: { Lagerort: `${ausserHausId}`, "Außer Haus seit": "today()" },
  },
  {
    label: "Außer Haus, Lagerort falsch",
    bedingung: `and(${istStatus("in Kommission", "ausgestellt")}, not_equal(${wert("Lagerort", ".0.id")}, ${ausserHausId}))`,
    knoten: "Lagerort „Außer Haus“ setzen",
    felder: { Lagerort: `${ausserHausId}` },
  },
  {
    label: "Zurück im Haus",
    bedingung: `and(${istStatus("verfügbar", "reserviert")}, ${istAusserHaus})`,
    knoten: "Lagerort, Partner und Außer-Haus-Daten leeren",
    felder: { Lagerort: "null()", Partner: "null()", "Außer Haus seit": "null()", "Rückgabe bis": "null()" },
  },
  {
    label: "Verkauft, Datum fehlt",
    bedingung: `and(${istStatus("verkauft")}, ${leer("Verkauft am")})`,
    knoten: "Verkauft am = heute",
    felder: { "Verkauft am": "today()" },
  },
];

const verteiler = await knoten("router", lesen.id, "south", "Welche Regel greift?");
const kanten = ZWEIGE.map((z, i) => ({
  uid: i === 0 ? verteiler.service.edges[0].uid : crypto.randomUUID(),
  label: z.label,
  order: String(i + 1),
  condition: formel(z.bedingung),
}));
await api("PATCH", `/automation/node/${verteiler.id}/`, {
  service: { default_edge_label: "Keine Regel", edges: kanten },
});

for (const [i, zweig] of ZWEIGE.entries()) {
  const aendern = await knoten("local_baserow_update_row", verteiler.id, "south", zweig.knoten, kanten[i].uid);
  await api("PATCH", `/automation/node/${aendern.id}/`, {
    service: {
      integration_id: integration.id,
      table_id: ids.tabellen.Unikate,
      row_id: formel(zeileId),
      field_mappings: Object.entries(zweig.felder).map(([feld, f]) => ({
        field_id: U[feld],
        enabled: true,
        value: formel(f),
      })),
    },
  });
}

await api("POST", `/automation/workflows/${wf.id}/publish/async/`, {});
ids.workflow = wf.id;
speichereIds(ids);
console.log(`Workflow „${WORKFLOW}“ (${wf.id}) angelegt und veröffentlicht.`);
