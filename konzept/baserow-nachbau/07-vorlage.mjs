// KWM Lager auf Basis der Baserow-Vorlage „Car Dealership Inventory“.
// Die Vorlage wird frisch installiert. Danach werden nur Texte, Formeln, Datenquellen und Farben umgestellt.
// Aufbau, Karten, Abstände und Schriften bleiben so, wie Baserow sie gestaltet hat.
// Aufruf: node konzept/baserow-nachbau/07-vorlage.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { anmelden, api, ladeIds, speichereIds, WURZEL } from "./lib.mjs";

const VORLAGE_ID = 70; // car-dealership-inventory
const APP_NAME = "KWM Lager";
const WARTEN_MS = 2000;
const MAX_VERSUCHE = 120;

await anmelden();
const ids = ladeIds();
const T = ids.tabellen;
const U = ids.felder.Unikate;
const formel = (text) => ({ mode: "simple", version: "0.1", formula: text });
const lit = (text) => `'${String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
const rec = (feld, pfad = "") => `get('current_record.field_${feld}${pfad}')`;
const euro = (f) => `if(is_empty(${f}), '–', concat(number_format(${f}, 0, '.', ','), ' €'))`;

// ---------- 1. Vorlage frisch installieren (vorherige eigene Installation ersetzen)
for (const id of Object.values(ids.vorlage ?? {})) await api("DELETE", `/applications/${id}/`, null, { erlaubtFehler: true });
const vorher = new Set((await api("GET", `/applications/workspace/${ids.workspace}/`)).map((a) => a.id));
const job = await api("POST", `/templates/install/${ids.workspace}/${VORLAGE_ID}/async/`);
for (let i = 0; i < MAX_VERSUCHE; i++) {
  const j = await api("GET", `/jobs/${job.id}/`);
  if (j.state === "failed") throw new Error(`Vorlage nicht installiert: ${j.error}`);
  if (j.state === "finished") break;
  await new Promise((weiter) => setTimeout(weiter, WARTEN_MS));
}
const neu = (await api("GET", `/applications/workspace/${ids.workspace}/`)).filter((a) => !vorher.has(a.id));
ids.vorlage = Object.fromEntries(neu.map((a) => [a.type, a.id]));
speichereIds(ids);
const appId = ids.vorlage.builder;
await api("PATCH", `/applications/${appId}/`, { name: APP_NAME });

// ---------- Werkzeuge
const app = await api("GET", `/applications/${appId}/`);
const seite = (name) => app.pages.find((p) => (name === "__shared__" ? p.shared : p.name === name));
const elementeCache = {};
async function elemente(p) {
  elementeCache[p.id] ??= await api("GET", `/builder/page/${p.id}/elements/`);
  return elementeCache[p.id];
}
const wert = (e) => [e.value, e.label, e.image_url].map((v) => v?.formula).find(Boolean) ?? "";
/** Element der Vorlage über seine ursprüngliche Formel finden (Vorlage ist frisch installiert). */
async function finde(p, typ, original) {
  const e = (await elemente(p)).find((x) => x.type === typ && wert(x) === original);
  if (!e) throw new Error(`Vorlage geändert? ${typ} „${original}“ auf „${p.name}“ nicht gefunden`);
  return e.id;
}
const aendern = (id, props) => api("PATCH", `/builder/element/${id}/`, props);
const loeschen = (id) => api("DELETE", `/builder/element/${id}/`);
async function setze(p, typ, original, props) {
  return aendern(await finde(p, typ, original), props);
}
const text = (t) => ({ value: formel(lit(t)) });
const datenquellen = async (p) => api("GET", `/builder/page/${p.id}/data-sources/`);

// ---------- 2. Farben: Petrol statt Dunkelblau, sonst Theme der Vorlage
await api("PATCH", `/builder/${appId}/theme/`, {
  primary_color: "#2F5D62",
  secondary_color: "#4F8A8B",
  button_active_background_color: "#3E7478",
  button_active_border_color: "#244A4E",
  link_hover_text_color: "#7FA9AB",
  link_active_text_color: "#244A4E",
});

// ---------- 3. Kopf und Fuß (geteilte Seite)
const geteilt = seite("__shared__");
const uebersicht = seite("Homepage");
const bestand = seite("Cars");
const stueck = seite("Car details");
const erfassen = seite("Contact");
const stammdaten = seite("Profile");
const login = seite("Login");

const banner = new FormData();
banner.append("file", new Blob([readFileSync(path.join(WURZEL, "konzept/baserow-nachbau/assets/kwm-banner.png"))], { type: "image/png" }), "kwm-banner.png");
const bannerDatei = await api("POST", "/user-files/upload-file/", banner);
const bild = (await elemente(geteilt)).find((e) => e.type === "image");
await aendern(bild.id, { image_source_type: "upload", image_file: { name: bannerDatei.name }, alt_text: formel(lit("KWM Lager")) });

const [dsMaxPreis, dsMaxKm] = await datenquellen(geteilt);
await api("PATCH", `/builder/data-source/${dsMaxPreis.id}/`, { name: "Höchster Preis", table_id: T.Unikate, view_id: null, field_id: U["Preis intern"] });
await api("DELETE", `/builder/data-source/${dsMaxKm.id}/`);

await setze(geteilt, "link", "'HOME'", text("ÜBERSICHT"));
await setze(geteilt, "link", "'OUR INVENTORY'", {
  ...text("BESTAND"),
  query_parameters: [
    { name: "lagerort", value: formel("") },
    { name: "status", value: formel("") },
    { name: "max_preis", value: formel(`get('data_source.${dsMaxPreis.id}.result')`) },
    { name: "suche", value: formel("") },
  ],
});
await setze(geteilt, "link", "'CONTACT US'", text("ERFASSEN"));
await setze(geteilt, "link", "'LOGIN'", { ...text("STAMMDATEN"), navigate_to_page_id: stammdaten.id });

await setze(geteilt, "heading", "'Socials'", text("KWM Lager"));
await setze(geteilt, "heading", "'Legal'", text("Konto"));
await setze(geteilt, "heading", "'Visit our showroom'", text("Werkstatt"));
for (const t of ["'Facebook'", "'Instagram'", "'LinkedIn'", "'Youtube'", "'Privacy policy'", "'Terms of service'", "'Disclaimer'"]) {
  await loeschen(await finde(geteilt, "link", t));
}
await setze(geteilt, "link", "concat('      👤 ',get('user.username'),' ')", { value: formel("concat('Angemeldet als ', get('user.username'))") });
const oeffnungszeiten = (await elemente(geteilt)).find((e) => e.type === "text" && wert(e).startsWith("concat('Mon - Fri"));
await aendern(oeffnungszeiten.id, text("Lager der Keramischen Werkstatt Margaretenhöhe"));

// ---------- 4. Bestand (Vorlage „Cars“: Filter oben, Foto-Karten darunter)
await api("PATCH", `/builder/pages/${bestand.id}/`, {
  name: "Bestand",
  path: "/bestand",
  query_params: [
    { name: "lagerort", type: "numeric" },
    { name: "status", type: "numeric" },
    { name: "max_preis", type: "numeric" },
    { name: "suche", type: "text" },
  ],
  visibility: "logged-in",
  role_type: "allow_all",
  roles: [],
});
const [dsKarten, dsModelle] = await datenquellen(bestand);
const param = (n) => `get('page_parameter.${n}')`;
await api("PATCH", `/builder/data-source/${dsKarten.id}/`, {
  name: "Unikate",
  table_id: T.Unikate,
  view_id: null,
  search_query: formel(param("suche")),
  sortings: [{ field: U.Nummer, order_by: "DESC" }],
  filter_type: "AND",
  filters: [
    { field: U.Lagerort, type: "link_row_has", value: formel(param("lagerort")) },
    { field: U.Status, type: "single_select_equal", value: formel(param("status")) },
    { field: U["Preis intern"], type: "lower_than_or_equal", value: formel(param("max_preis")) },
  ],
});
await api("PATCH", `/builder/data-source/${dsModelle.id}/`, {
  name: "Lagerorte",
  table_id: T.Lagerorte,
  view_id: null,
  sortings: [{ field: ids.felder.Lagerorte.Name, order_by: "ASC" }],
});

await setze(bestand, "heading", "'Explore Our Inventory'", text("Bestand"));
const fLager = await finde(bestand, "record_selector", "'MODEL'");
const fStatus = await finde(bestand, "choice", "'CONDITION'");
const fPreis = await finde(bestand, "input_text", "'MAXIMUM PRICE ($)'");
const fSuche = await finde(bestand, "input_text", "'MAXIMUM MILAGE'");
await aendern(fLager, { label: formel(lit("LAGERORT")), default_value: formel(param("lagerort")) });
await aendern(fStatus, {
  label: formel(lit("STATUS")),
  default_value: formel(param("status")),
  formula_value: formel(`get('data_source_context.${dsKarten.id}.field_${U.Status}.*.id')`),
  formula_name: formel(`get('data_source_context.${dsKarten.id}.field_${U.Status}.*.value')`),
});
await aendern(fPreis, { label: formel(lit("PREIS BIS (€)")), default_value: formel(param("max_preis")) });
await aendern(fSuche, { label: formel(lit("SUCHE (NAME, GLASUR, NUMMER)")), default_value: formel(param("suche")), validation_type: "any" });
const [filterAktion] = await api("GET", `/builder/page/${bestand.id}/workflow_actions/`);
await api("PATCH", `/builder/workflow_action/${filterAktion.id}/`, {
  query_parameters: [
    { name: "lagerort", value: formel(`get('form_data.${fLager}')`) },
    { name: "status", value: formel(`get('form_data.${fStatus}')`) },
    { name: "max_preis", value: formel(`get('form_data.${fPreis}')`) },
    { name: "suche", value: formel(`get('form_data.${fSuche}')`) },
  ],
});
const formular = (await elemente(bestand)).find((e) => e.type === "form_container");
await aendern(formular.id, { submit_button_label: formel(lit("FILTERN")) });

// Karte
const karte = {
  titel: (await elemente(bestand)).find((e) => e.type === "heading" && wert(e).startsWith("concat(get('current_record.")),
  foto: (await elemente(bestand)).find((e) => e.type === "image"),
  details: await finde(bestand, "link", "'DETAILS'"),
};
await aendern(karte.titel.id, { value: formel(rec(U.Name)) });
await aendern(karte.foto.id, { image_url: formel(rec(U.Fotos, ".*.url")), alt_text: formel(rec(U.Name)) });
await aendern(karte.details, { value: formel(lit("DETAILS")), page_parameters: [{ name: "car_id", value: formel("get('current_record.id')") }] });
const kartenTexte = (await elemente(bestand)).filter((e) => e.type === "text");
const preisText = kartenTexte.find((e) => wert(e).startsWith("concat('$ '"));
await aendern(preisText.id, { value: formel(euro(rec(U["Preis intern"]))) });
const KARTE_FELDER = [
  ["'YEAR'", "INVENTARNUMMER", rec(U.Inventarnummer)],
  ["'TYPE'", "TYP", rec(U.Typ, ".value")],
  ["'CONDITION'", "STATUS", rec(U.Status, ".value")],
  ["'AVAILABLE AT'", "LAGERORT", `if(is_empty(${rec(U.Partner)}), ${rec(U.Lagerort, ".*.value")}, concat(${rec(U.Lagerort, ".*.value")}, ' · ', ${rec(U.Partner, ".*.value")}))`],
];
// In der Vorlage folgt auf jede Beschriftung direkt ihr Wert (gleicher Container, nächste Reihenfolge).
async function paare(p, liste, quelle) {
  const alle = (await elemente(p)).filter((e) => e.type === "text");
  for (const [original, beschriftung, neuerWert] of liste) {
    const label = alle.find((e) => wert(e) === original);
    if (!label) throw new Error(`Beschriftung ${original} fehlt auf ${p.name}`);
    const geschwister = alle
      .filter((e) => e.parent_element_id === label.parent_element_id && e.place_in_container === label.place_in_container)
      .sort((a, b) => Number(a.order) - Number(b.order));
    const wertElement = geschwister[geschwister.indexOf(label) + 1];
    await aendern(label.id, text(beschriftung));
    await aendern(wertElement.id, { value: formel(neuerWert.replaceAll("current_record", quelle)) });
  }
}
await paare(bestand, KARTE_FELDER, "current_record");

// ---------- 5. Stück (Vorlage „Car details“: Angaben links, großes Foto rechts)
await api("PATCH", `/builder/pages/${stueck.id}/`, { name: "Stück", visibility: "logged-in", role_type: "allow_all", roles: [] });
const [dsStueck] = await datenquellen(stueck);
await api("PATCH", `/builder/data-source/${dsStueck.id}/`, { name: "Stück", table_id: T.Unikate, view_id: null });
const ds = `data_source.${dsStueck.id}`;
const q = (f) => f.replaceAll("current_record", ds);
const st = await elemente(stueck);
await aendern(st.find((e) => e.type === "heading").id, { value: formel(q(rec(U.Name))) });
await aendern(st.find((e) => e.type === "image").id, { image_url: formel(q(rec(U.Fotos, ".*.url"))), alt_text: formel(q(rec(U.Name))) });
await aendern(st.find((e) => e.type === "text" && wert(e).startsWith("concat('$ '")).id, { value: formel(q(euro(rec(U["Preis intern"])))) });
await setze(stueck, "link", "'MAKE OFFER'", text("BEARBEITEN"));
await loeschen(await finde(stueck, "link", "'Log in to make an offer'"));
const datum = (f) => `if(is_empty(${f}), '–', datetime_format(${f}, 'DD.MM.YYYY'))`;
await paare(
  stueck,
  [
    ["'YEAR'", "INVENTARNUMMER", rec(U.Inventarnummer)],
    ["'TYPE'", "TYP", rec(U.Typ, ".value")],
    ["'DIMENSIONS'", "MASSE", rec(U.Maße)],
    ["'CONDITION'", "STATUS", rec(U.Status, ".value")],
    ["'DATE ACQUIRED'", "KÜNSTLER:IN · JAHR", `concat(join(${rec(U["Künstler:in"], ".*.value")}, ', '), ' · ', ${rec(U.Jahr)})`],
    ["'AVAILABLE AT'", "LAGERORT", rec(U.Lagerort, ".*.value")],
    ["'MILAGE'", "PARTNER · RÜCKGABE BIS", `if(is_empty(${rec(U.Partner)}), '–', concat(join(${rec(U.Partner, ".*.value")}, ''), ' · ', ${datum(rec(U["Rückgabe bis"]))}))`],
    ["'COLOR'", "GLASUR", `join(${rec(U.Glasur, ".*.value")}, ', ')`],
    ["'ACCESSORIES'", "NOTIZ", `if(is_empty(${rec(U.Notiz)}), '–', ${rec(U.Notiz)})`],
  ],
  ds,
);

// ---------- 6. Anmelden: Nutzerquelle auf Tabelle „App-Nutzer“
const F = ids.felder["App-Nutzer"];
const integration = (await api("GET", `/application/${appId}/integrations/`))[0];
const alteQuelle = (await api("GET", `/application/${appId}/user-sources/`))[0];
await api("PATCH", `/user-source/${alteQuelle.id}/`, {
  name: "App-Nutzer",
  integration_id: integration.id,
  table_id: T["App-Nutzer"],
  email_field_id: F["E-Mail"],
  name_field_id: F.Name,
  role_field_id: F.Rolle,
  auth_providers: [{ type: "local_baserow_password", enabled: true, password_field_id: F.Passwort }],
});
await api("PATCH", `/builder/pages/${login.id}/`, { name: "Anmelden", path: "/anmelden" });
await setze(login, "heading", "'Drive into your account'", text("Anmelden"));
await setze(login, "text", (await elemente(login)).find((e) => e.type === "text").value.formula, text("Lager der Keramischen Werkstatt Margaretenhöhe. Zugang nur für die Werkstatt."));
await loeschen(await finde(login, "link", "'✉️ Contact us'"));
const authForm = (await elemente(login)).find((e) => e.type === "auth_form");
await aendern(authForm.id, { login_button_label: formel(lit("Anmelden")) });

ids.vorlageSeiten = { bestand: bestand.id, stueck: stueck.id, uebersicht: uebersicht.id, erfassen: erfassen.id, stammdaten: stammdaten.id, login: login.id };
speichereIds(ids);
console.log(`„${APP_NAME}“ (${appId}) aus Vorlage: Kopf, Bestand, Stück und Anmelden umgestellt.`);
