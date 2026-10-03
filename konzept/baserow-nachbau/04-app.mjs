// Schritt 3b: Application Builder „KWM Lager“ nur aus fertigen Elementen (kein eigener Code).
// Seiten wie in Softr: Erfassen, Bestand, Tabelle, Übersicht, Stammdaten. Dazu Anmelden und Detailseiten.
// Aufruf: node konzept/baserow-nachbau/04-app.mjs (ersetzt die App „KWM Lager“, falls vorhanden)
import { anmelden, api, ladeIds, speichereIds, ENV } from "./lib.mjs";

const APP = "KWM Lager";
const PETROL = "#2F5D62";
const NACHSCHUB_UNTER = 5;

await anmelden();
const ids = ladeIds();
const T = ids.tabellen;
const F = ids.felder;

// ---------- Formeln
const formel = (text, mode = "advanced") => ({ mode, version: "0.1", formula: text });
const lit = (text) => `'${String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
const text = (t) => formel(lit(t));
const leer = formel("", "simple");
const rec = (feld, pfad = "") => `get('current_record.field_${feld}${pfad}')`;
const quelle = (ds, feld, pfad = "") => `get('data_source.${ds}.field_${feld}${pfad}')`;
const kontext = (ds, feld, pfad) => `get('data_source_context.${ds}.field_${feld}${pfad}')`;
const formular = (el) => `get('form_data.${el}')`;
const param = (name) => `get('page_parameter.${name}')`;

// ---------- 1. Nutzer-Tabelle „App-Nutzer“ (Login der App, getrennt von den Baserow-Konten)
async function nutzerTabelle() {
  if (T["App-Nutzer"]) return;
  const t = await api("POST", `/database/tables/database/${ids.datenbank}/`, { name: "App-Nutzer", data: [["Name"]], first_row_header: true });
  T["App-Nutzer"] = t.id;
  F["App-Nutzer"] = { Name: (await api("GET", `/database/fields/table/${t.id}/`))[0].id };
  for (const [name, optionen] of [
    ["E-Mail", { type: "email" }],
    ["Passwort", { type: "password" }],
    ["Rolle", { type: "single_select", select_options: [{ value: "Admin", color: "light-blue" }, { value: "Werkstatt", color: "light-green" }] }],
  ]) {
    F["App-Nutzer"][name] = (await api("POST", `/database/fields/table/${t.id}/`, { name, ...optionen })).id;
  }
  const rolle = await api("GET", `/database/fields/${F["App-Nutzer"].Rolle}/`);
  const option = (w) => rolle.select_options.find((o) => o.value === w).id;
  await api("POST", `/database/rows/table/${t.id}/batch/?user_field_names=true`, {
    items: [
      { Name: "KWM Admin", "E-Mail": ENV.BASEROW_APP_ADMIN_EMAIL, Passwort: ENV.BASEROW_APP_ADMIN_PASSWORD, Rolle: option("Admin") },
      { Name: "Werkstatt", "E-Mail": ENV.BASEROW_APP_WERKSTATT_EMAIL, Passwort: ENV.BASEROW_APP_WERKSTATT_PASSWORD, Rolle: option("Werkstatt") },
    ],
  });
  speichereIds(ids);
}
await nutzerTabelle();

// ---------- 2. App, Integration, Nutzerquelle, Theme
const vorhandene = await api("GET", `/applications/workspace/${ids.workspace}/`);
for (const a of vorhandene.filter((a) => a.type === "builder" && a.name === APP)) await api("DELETE", `/applications/${a.id}/`);
const app = await api("POST", `/applications/workspace/${ids.workspace}/`, { name: APP, type: "builder", init_with_data: false });
ids.app = app.id;

const integration = await api("POST", `/application/${app.id}/integrations/`, { type: "local_baserow", name: "Lager-Datenbank" });
const nutzerquelle = await api("POST", `/application/${app.id}/user-sources/`, {
  type: "local_baserow",
  name: "App-Nutzer",
  integration_id: integration.id,
  table_id: T["App-Nutzer"],
  email_field_id: F["App-Nutzer"]["E-Mail"],
  name_field_id: F["App-Nutzer"].Name,
  role_field_id: F["App-Nutzer"].Rolle,
  auth_providers: [{ type: "local_baserow_password", enabled: true, password_field_id: F["App-Nutzer"].Passwort }],
});

await api("PATCH", `/builder/${app.id}/theme/`, {
  primary_color: PETROL,
  secondary_color: "#E6EEEF",
  border_color: "#D9DEDF",
  main_success_color: "#2E7D5B",
  main_warning_color: "#B7791F",
  main_error_color: "#B42318",
  body_font_family: "inter",
  body_font_size: 15,
  body_text_color: "#1F2A2C",
  heading_1_font_size: 28,
  heading_1_text_color: "#1F2A2C",
  heading_2_font_size: 20,
  heading_2_text_color: "#1F2A2C",
  heading_3_font_size: 16,
  heading_3_text_color: "#1F2A2C",
  button_background_color: PETROL,
  button_hover_background_color: "#244A4E",
  button_text_color: "#FFFFFF",
  button_border_radius: 8,
  button_vertical_padding: 16,
  button_horizontal_padding: 18,
  input_border_radius: 8,
  input_vertical_padding: 14,
  input_border_color: "#C9D1D3",
  table_border_radius: 8,
  table_header_background_color: "#F2F5F5",
  table_cell_vertical_padding: 12,
  link_text_color: PETROL,
  link_hover_text_color: "#244A4E",
  page_background_color: "#FFFFFF",
});

// ---------- Bausteine
const seiten = {};
async function seite(name, pfad, { pfadParameter = [], abfrage = [], oeffentlich = false } = {}) {
  const p = await api("POST", `/builder/${app.id}/pages/`, {
    name,
    path: pfad,
    path_params: pfadParameter.map((n) => ({ name: n, type: "numeric" })),
    query_params: abfrage.map((n) => ({ name: n, type: "text" })),
  });
  if (!oeffentlich) await api("PATCH", `/builder/pages/${p.id}/`, { visibility: "logged-in", role_type: "allow_all", roles: [] });
  seiten[name] = { id: p.id, letztes: {} };
  return seiten[name];
}

/** Element anlegen: unter `in` (Container) oder auf oberster Ebene, jeweils hinter dem zuletzt angelegten. */
async function el(s, type, props = {}, { in: eltern = null, platz = null, sichtbar = null } = {}) {
  const schluessel = `${eltern ?? "oben"}:${platz ?? ""}`;
  const vorher = s.letztes[schluessel];
  const lage = vorher
    ? { reference_element_id: vorher, position: "south" }
    : eltern
      ? { reference_element_id: eltern, position: "child", place_in_container: platz }
      : {};
  // Spalten und Such-/Filter-Felder von Tabellen erst nach dem Anlegen setzen: Beim Anlegen
  // stolpert die API über die Spalten (wie beim Menü) und verwirft property_options stillschweigend.
  const { fields: spalten, property_options: suchfelder, ...rest } = props;
  const e = await api("POST", `/builder/page/${s.id}/elements/`, { type, ...lage, ...rest, ...(spalten ? { fields: [] } : {}) });
  const nachtrag = {
    ...(spalten ? { fields: spalten } : {}),
    ...(suchfelder ? { property_options: suchfelder } : {}),
    ...(sichtbar ? { visibility_condition: formel(sichtbar) } : {}),
  };
  if (Object.keys(nachtrag).length) await api("PATCH", `/builder/element/${e.id}/`, nachtrag);
  s.letztes[schluessel] = e.id;
  return e.id;
}

async function datenquelle(s, name, service) {
  const ds = await api("POST", `/builder/page/${s.id}/data-sources/`, { type: service.type, name });
  const { type: _typ, ...rest } = service;
  await api("PATCH", `/builder/data-source/${ds.id}/`, { integration_id: integration.id, ...rest });
  return ds.id;
}
const liste = (table_id, extra = {}) => ({ type: "local_baserow_list_rows", table_id, ...extra });
const zaehlen = (table_id, field_id, extra = {}) => ({ type: "local_baserow_aggregate_rows", table_id, field_id, aggregation_type: "count", ...extra });
const summe = (table_id, field_id, extra = {}) => ({ type: "local_baserow_aggregate_rows", table_id, field_id, aggregation_type: "sum", ...extra });
const filterAuswahl = (feld, werteIds) => ({
  filter_type: "OR",
  filters: werteIds.map((w) => ({ field: feld, type: "single_select_equal", value: formel(lit(w)) })),
});

async function aktion(s, element, event, type, extra = {}) {
  const a = await api("POST", `/builder/page/${s.id}/workflow_actions/`, { type, element_id: element, event });
  if (Object.keys(extra).length) await api("PATCH", `/builder/workflow_action/${a.id}/`, extra);
  return a.id;
}
const zeileAnlegen = (table_id, zuordnung) => ({
  service: { integration_id: integration.id, table_id, field_mappings: zuordnung.map(([field_id, f]) => ({ field_id, enabled: true, value: formel(f) })) },
});
const zeileAendern = (table_id, rowFormel, zuordnung) => ({
  service: { ...zeileAnlegen(table_id, zuordnung).service, row_id: formel(rowFormel) },
});
const hinweis = (titel, beschreibung) => ({ title: text(titel), description: text(beschreibung) });

// Formularfelder
const eingabe = (label, extra = {}) => ({ label: text(label), required: false, placeholder: leer, default_value: leer, validation_type: "any", ...extra });
const auswahlAusFeld = (label, ds, feld, extra = {}) => ({
  label: text(label),
  required: false,
  placeholder: text("Bitte wählen"),
  default_value: leer,
  multiple: false,
  show_as_dropdown: true,
  option_type: "formulas",
  formula_value: formel(kontext(ds, feld, ".*.id")),
  formula_name: formel(kontext(ds, feld, ".*.value")),
  ...extra,
});
const verweisAuswahl = (label, ds, extra = {}) => ({
  label: text(label),
  required: false,
  data_source_id: ds,
  items_per_page: 50,
  placeholder: text("Bitte wählen"),
  default_value: leer,
  multiple: false,
  option_name_suffix: leer,
  ...extra,
});

// Tabellen-Spalten
const spalte = (name, wert) => ({ name, type: "text", config: { value: formel(wert) } });
const tags = (name, wert, farbe) => ({ name, type: "tags", config: { values: formel(wert), colors: formel(farbe), colors_is_formula: true } });
const verweis = (name, seiteId, parameter, beschriftung) => ({
  name,
  type: "link",
  config: {
    navigation_type: "page",
    navigate_to_page_id: seiteId,
    page_parameters: [{ name: parameter, value: formel("get('current_record.id')") }],
    query_parameters: [],
    navigate_to_url: leer,
    target: "self",
    link_name: formel(beschriftung),
    variant: "link",
  },
});
// Textlinks in Tabellen sind nur ~15 px hoch. Darum: Name als Text, am Zeilenende ein Knopf „Öffnen“ (44 px).
const mitOeffnenKnopf = (felder) => {
  const link = felder.find((f) => f.type === "link");
  if (!link) return felder;
  const alsText = felder.map((f) => (f === link ? spalte(f.name, f.config.link_name.formula) : f));
  return [...alsText, { ...link, name: " ", config: { ...link.config, link_name: text("Öffnen"), variant: "button" } }];
};
const tabelle = (ds, felder, extra = {}) => ({
  data_source_id: ds,
  items_per_page: 20,
  button_load_more_label: text("Mehr anzeigen"),
  fields: mitOeffnenKnopf(felder).map(({ config, ...feld }) => ({ ...feld, ...config })),
  orientation: { desktop: "horizontal", tablet: "horizontal", smartphone: "vertical" },
  ...extra,
});
const durchsuchbar = (felder) => ({
  is_publicly_searchable: true,
  is_publicly_sortable: true,
  is_publicly_filterable: true,
  property_options: felder.map((f) => ({ schema_property: `field_${f}`, searchable: true, sortable: true, filterable: true })),
});

// Statusfarben wie in Softr
const U = F.Unikate;
const E = F.Editionsbestand;
const optionen = async (feld) => (await api("GET", `/database/fields/${feld}/`)).select_options;
const statusOpt = await optionen(U.Status);
const sid = (w) => statusOpt.find((o) => o.value === w).id;
const zustandOpt = await optionen(E.Zustand);
const statusFarbe = `if(equal(${rec(U.Status, ".value")}, 'verfügbar'), '#D7F2E3', if(equal(${rec(U.Status, ".value")}, 'reserviert'), '#FBEFC9', if(equal(${rec(U.Status, ".value")}, 'verkauft'), '#ECEEEF', if(equal(${rec(U.Status, ".value")}, 'in Kommission'), '#DCE8FA', '#EADFF7'))))`;
// Leere Werte abfangen, sonst zeigt Baserow „Invalid date“ bzw. „ €“. Beträge mit deutschem Tausenderpunkt.
const datum = (f) => `if(is_empty(${f}), '–', datetime_format(${f}, 'DD.MM.YYYY'))`;
const euro = (f) => `if(is_empty(${f}), '–', concat(number_format(${f}, 0, '.', ','), ' €'))`;
const euroSumme = (f) => `concat(number_format(if(is_empty(${f}), 0, ${f}), 0, '.', ','), ' €')`;

// ---------- 3. Seiten
const login = await seite("Anmelden", "/anmelden", { oeffentlich: true });
const erfassen = await seite("Erfassen", "/", { abfrage: ["art"] });
const bestand = await seite("Bestand", "/bestand", { abfrage: ["reiter"] });
const tabSeite = await seite("Tabelle", "/tabelle");
const uebersicht = await seite("Übersicht", "/uebersicht");
const stamm = await seite("Stammdaten", "/stammdaten", { abfrage: ["liste"] });
const stueck = await seite("Stück", "/stueck/:id", { pfadParameter: ["id"] });
const ware = await seite("Editionsware", "/ware/:id", { pfadParameter: ["id"] });
await api("PATCH", `/applications/${app.id}/`, { login_page_id: login.id });

// Kopfzeile mit Menü auf allen Seiten außer Anmelden. Kopfzeilen liegen auf der geteilten Seite „__shared__“.
const geteiltId = (await api("GET", `/applications/${app.id}/`)).pages.find((pg) => pg.shared).id;
const geteilt = { id: geteiltId, letztes: {} };
const kopf = await el(geteilt, "header", { style_padding_top: 12, style_padding_bottom: 12 });
await api("PATCH", `/builder/element/${kopf}/`, { share_type: "except", pages: [login.id] });
const kopfSpalten = await el(geteilt, "column", { column_amount: 2, column_gap: 16, alignment: "center" }, { in: kopf });
const menuePunkte = [
  ["Erfassen", erfassen],
  ["Bestand", bestand],
  ["Tabelle", tabSeite],
  ["Übersicht", uebersicht],
  ["Stammdaten", stamm],
];
await el(geteilt, "heading", { value: text("KWM Lager"), level: 3 }, { in: kopfSpalten, platz: "0" });
// Menüpunkte erst nach dem Anlegen setzen: Beim Anlegen verlangt die API „menu_item_order“, stolpert dann aber darüber.
const menue = await el(geteilt, "menu", { orientation: "horizontal", alignment: "right", menu_items: [] }, { in: kopfSpalten, platz: "1" });
const menuePunkt = (eintrag, i) => ({ variant: "link", uid: crypto.randomUUID(), menu_item_order: i, children: [], ...eintrag });
await api("PATCH", `/builder/element/${menue}/`, {
  menu_items: [
    ...menuePunkte.map(([name, s], i) =>
      menuePunkt(
        {
          type: "link",
          name,
          navigation_type: "page",
          navigate_to_page_id: s.id,
          navigate_to_url: leer,
          page_parameters: [],
          query_parameters: [],
          target: "self",
        },
        i,
      ),
    ),
    menuePunkt({ type: "button", name: "Abmelden" }, menuePunkte.length),
  ],
});
const menueDaten = await api("GET", `/builder/page/${geteilt.id}/elements/`);
const abmeldenUid = menueDaten.find((e) => e.id === menue).menu_items.find((m) => m.type === "button").uid;
await aktion(geteilt, menue, `${abmeldenUid}_click`, "logout");

// --- Anmelden
await el(login, "heading", { value: text("KWM Lager"), level: 1, style_margin_top: 40 });
await el(login, "text", { value: text("Lager der Keramischen Werkstatt Margaretenhöhe. Bitte melden Sie sich an."), format: "plain" });
const authForm = await el(login, "auth_form", { user_source_id: nutzerquelle.id, login_button_label: text("Anmelden") });
await aktion(login, authForm, "after_login", "open_page", {
  navigation_type: "page",
  navigate_to_page_id: erfassen.id,
  page_parameters: [],
  query_parameters: [],
  navigate_to_url: leer,
  target: "self",
});

// ---------- Erfassen
const dsUnikatOptionen = await datenquelle(erfassen, "Unikate (Auswahlwerte)", liste(T.Unikate, { default_result_count: 1 }));
const dsEditionOptionen = await datenquelle(erfassen, "Editionsbestand (Auswahlwerte)", liste(T.Editionsbestand, { default_result_count: 1 }));
const dsLagerorte = await datenquelle(erfassen, "Lagerorte", liste(T.Lagerorte, { sortings: [{ field: F.Lagerorte.Name, order_by: "ASC" }] }));
const dsKuenstler = await datenquelle(erfassen, "Künstler:innen", liste(T["Künstler:innen"], { sortings: [{ field: F["Künstler:innen"].Name, order_by: "ASC" }] }));
const dsGlasuren = await datenquelle(erfassen, "Glasuren", liste(T.Glasuren, { sortings: [{ field: F.Glasuren.Name, order_by: "ASC" }], default_result_count: 100 }));
const dsModelle = await datenquelle(erfassen, "Modelle", liste(T.Modelle, { sortings: [{ field: F.Modelle.Name, order_by: "ASC" }] }));
const dsPartnerE = await datenquelle(erfassen, "Partner", liste(T.Partner, { sortings: [{ field: F.Partner.Name, order_by: "ASC" }] }));

const istEdition = `equal(${param("art")}, 'edition')`;
const istUnikat = `not_equal(${param("art")}, 'edition')`;
await el(erfassen, "heading", { value: text("Neues Stück erfassen"), level: 1 });
await el(erfassen, "text", { value: text("Felder mit * sind Pflicht. Alles andere kann später ergänzt werden."), format: "plain" });
const umschalter = await el(erfassen, "column", { column_amount: 2, column_gap: 8, alignment: "top" });
for (const [i, [name, art]] of [["Unikat", ""], ["Editionsware", "edition"]].entries()) {
  await el(
    erfassen,
    "link",
    {
      value: text(name),
      variant: "button",
      navigation_type: "page",
      navigate_to_page_id: erfassen.id,
      page_parameters: [],
      query_parameters: [{ name: "art", value: text(art) }],
      navigate_to_url: leer,
      target: "self",
    },
    { in: umschalter, platz: String(i) },
  );
}
const fotoHinweis = await el(
  erfassen,
  "simple_container",
  { style_background: "color", style_background_color: "#F2F5F5", style_border_radius: 8, style_padding_top: 12, style_padding_bottom: 12, style_padding_left: 14, style_padding_right: 14 },
  { sichtbar: istUnikat },
);
await el(erfassen, "text", { value: text("Fotos: Die App hat keinen Foto-Upload (Datei-Element erst im Tarif Advanced). Foto über das Baserow-Formular „Neues Unikat“ aufnehmen, dafür ist ein Baserow-Konto nötig."), format: "plain" }, { in: fotoHinweis });
const formularSlug = (await api("GET", `/database/views/${ids.ansichten["Unikate/Neues Unikat"]}/`)).slug;
await el(
  erfassen,
  "link",
  { value: text("Foto-Formular öffnen"), variant: "button", navigation_type: "custom", navigate_to_page_id: null, page_parameters: [], query_parameters: [], navigate_to_url: text(`${ENV.BASEROW_URL}/form/${formularSlug}`), target: "blank" },
  { in: fotoHinweis },
);

// Formular Unikat
const fU = await el(erfassen, "form_container", { submit_button_label: text("Speichern"), reset_initial_values_post_submission: true }, { sichtbar: istUnikat });
const eu = {};
eu.name = await el(erfassen, "input_text", eingabe("Name", { required: true, placeholder: text("z. B. Mondvase „Seladon“") }), { in: fU });
eu.typ = await el(erfassen, "choice", auswahlAusFeld("Typ", dsUnikatOptionen, U.Typ, { required: true }), { in: fU });
eu.status = await el(erfassen, "choice", auswahlAusFeld("Status", dsUnikatOptionen, U.Status, { required: true, default_value: formel(String(sid("verfügbar"))) }), { in: fU });
eu.lagerort = await el(erfassen, "record_selector", verweisAuswahl("Lagerort", dsLagerorte), { in: fU });
eu.partner = await el(erfassen, "record_selector", verweisAuswahl("Partner (bei „in Kommission“ oder „ausgestellt“)", dsPartnerE), { in: fU });
eu.kuenstler = await el(erfassen, "record_selector", verweisAuswahl("Künstler:in", dsKuenstler), { in: fU });
eu.jahr = await el(erfassen, "input_text", eingabe("Jahr", { validation_type: "integer", default_value: formel("year(today())") }), { in: fU });
eu.glasur = await el(erfassen, "record_selector", verweisAuswahl("Glasur (mehrere möglich)", dsGlasuren, { multiple: true }), { in: fU });
eu.masse = await el(erfassen, "input_text", eingabe("Maße", { placeholder: text("z. B. Ø 24 × H 8 cm") }), { in: fU });
eu.bild = await el(erfassen, "input_text", eingabe("Bildnachweis", { placeholder: text("z. B. Foto: Name der Fotografin") }), { in: fU });
eu.preis = await el(erfassen, "input_text", eingabe("Preis intern (€), erscheint nie auf der Website", { validation_type: "integer", placeholder: text("z. B. 480") }), { in: fU });
eu.web = await el(erfassen, "checkbox", { label: text("Auf Website zeigen"), required: false, default_value: leer }, { in: fU });
eu.notiz = await el(erfassen, "input_text", eingabe("Notiz", { is_multiline: true, rows: 3 }), { in: fU });
await aktion(
  erfassen,
  fU,
  "submit",
  "create_row",
  zeileAnlegen(T.Unikate, [
    [U.Name, formular(eu.name)],
    [U.Typ, formular(eu.typ)],
    [U.Status, formular(eu.status)],
    [U.Lagerort, formular(eu.lagerort)],
    [U.Partner, formular(eu.partner)],
    [U["Künstler:in"], formular(eu.kuenstler)],
    [U.Jahr, formular(eu.jahr)],
    [U.Glasur, formular(eu.glasur)],
    [U.Maße, formular(eu.masse)],
    [U.Bildnachweis, formular(eu.bild)],
    [U["Preis intern"], formular(eu.preis)],
    [U["Auf Website zeigen"], formular(eu.web)],
    [U.Notiz, formular(eu.notiz)],
    [U["Erfasst von"], "get('user.username')"],
  ]),
);
await aktion(erfassen, fU, "submit", "notification", hinweis("Gespeichert", "Das Stück steht jetzt im Bestand. Die Inventarnummer vergibt die Datenbank."));

// Formular Editionsware
const fE = await el(erfassen, "form_container", { submit_button_label: text("Speichern"), reset_initial_values_post_submission: true }, { sichtbar: istEdition });
const ee = {};
ee.modell = await el(erfassen, "record_selector", verweisAuswahl("Modell", dsModelle, { required: true }), { in: fE });
ee.zustand = await el(erfassen, "choice", auswahlAusFeld("Zustand", dsEditionOptionen, E.Zustand, { required: true, default_value: formel(String(zustandOpt[0].id)) }), { in: fE });
ee.glasur = await el(erfassen, "record_selector", verweisAuswahl("Glasur (nur bei glasierter Ware)", dsGlasuren), { in: fE });
ee.anzahl = await el(erfassen, "input_text", eingabe("Anzahl", { required: true, validation_type: "integer", default_value: formel("1") }), { in: fE });
ee.lagerort = await el(erfassen, "record_selector", verweisAuswahl("Lagerort", dsLagerorte), { in: fE });
ee.notiz = await el(erfassen, "input_text", eingabe("Notiz", { is_multiline: true, rows: 3 }), { in: fE });
await aktion(
  erfassen,
  fE,
  "submit",
  "create_row",
  zeileAnlegen(T.Editionsbestand, [
    [E.Modell, formular(ee.modell)],
    [E.Zustand, formular(ee.zustand)],
    [E.Glasur, formular(ee.glasur)],
    [E.Anzahl, formular(ee.anzahl)],
    [E.Lagerort, formular(ee.lagerort)],
    [E.Notiz, formular(ee.notiz)],
  ]),
);
await aktion(erfassen, fE, "submit", "notification", hinweis("Gespeichert", "Die Ware steht jetzt im Editionsbestand."));
await el(erfassen, "text", { value: text("Neue Modelle unter „Stammdaten“ anlegen."), format: "plain" }, { sichtbar: istEdition });

// ---------- Bestand (Reiter über den Abfrage-Parameter „reiter“)
const REITER = [
  ["Im Haus", "", { ...filterAuswahl(U.Status, [sid("verfügbar"), sid("reserviert")]) }],
  ["Außer Haus", "ausser-haus", { view_id: ids.ansichten["Unikate/Außer Haus"] }],
  ["Verkauft", "verkauft", { ...filterAuswahl(U.Status, [sid("verkauft")]) }],
  ["Alle", "alle", {}],
];
await el(bestand, "heading", { value: text("Bestand"), level: 1 });
await el(bestand, "text", { value: text("Eintrag antippen für Details und Bearbeiten."), format: "plain" });
const reiterLeiste = await el(bestand, "column", { column_amount: 5, column_gap: 8, alignment: "top" });
const reiterZahl = {};
for (const [name, schluessel, filter] of REITER) {
  reiterZahl[schluessel] = await datenquelle(bestand, `Anzahl ${name}`, zaehlen(T.Unikate, U.Name, filter));
}
reiterZahl.edition = await datenquelle(bestand, "Anzahl Editionsware", zaehlen(T.Editionsbestand, E.Anzahl));
for (const [i, [name, schluessel]] of [...REITER, ["Editionsware", "edition"]].entries()) {
  await el(
    bestand,
    "link",
    {
      value: formel(`concat(${lit(name)}, ' ', get('data_source.${reiterZahl[schluessel]}.result'))`),
      variant: "button",
      navigation_type: "page",
      navigate_to_page_id: bestand.id,
      page_parameters: [],
      query_parameters: [{ name: "reiter", value: text(schluessel) }],
      navigate_to_url: leer,
      target: "self",
    },
    { in: reiterLeiste, platz: String(i) },
  );
}
// Keine Foto-Spalte: Bilder füllen in der Tabelle die ganze Spaltenbreite, eine Vorschaugröße gibt es nicht.
const unikatSpalten = (mitPartner) => [
  verweis("Name", stueck.id, "id", rec(U.Name)),
  spalte("Inv.-Nr.", rec(U.Inventarnummer)),
  spalte("Typ", rec(U.Typ, ".value")),
  tags("Status", rec(U.Status, ".value"), statusFarbe),
  mitPartner ? spalte("Partner", rec(U.Partner, ".0.value")) : spalte("Lagerort", rec(U.Lagerort, ".0.value")),
  mitPartner ? spalte("Rückgabe bis", datum(rec(U["Rückgabe bis"]))) : spalte("Preis intern", euro(rec(U["Preis intern"]))),
];
for (const [name, schluessel, filter] of REITER) {
  const ds = await datenquelle(bestand, `Unikate ${name}`, liste(T.Unikate, { ...filter, sortings: filter.view_id ? [] : [{ field: U.Nummer, order_by: "DESC" }] }));
  const bedingung = schluessel ? `equal(${param("reiter")}, '${schluessel}')` : `or(equal(${param("reiter")}, ''), is_empty(${param("reiter")}))`;
  await el(bestand, "table", tabelle(ds, unikatSpalten(schluessel === "ausser-haus"), durchsuchbar([U.Name, U.Inventarnummer, U.Maße])), { sichtbar: bedingung });
}
const dsEdition = await datenquelle(bestand, "Editionsbestand", liste(T.Editionsbestand, { view_id: ids.ansichten["Editionsbestand/Nach Modell"] }));
await el(
  bestand,
  "table",
  tabelle(dsEdition, [
    verweis("Bezeichnung", ware.id, "id", rec(E.Bezeichnung)),
    spalte("Typ", rec(E.Typ, ".0.value.value")),
    tags("Zustand", rec(E.Zustand, ".value"), `if(equal(${rec(E.Zustand, ".value")}, 'Rohling'), '#FDE7D7', '#DCE8FA')`),
    spalte("Anzahl", rec(E.Anzahl)),
    spalte("Lagerort", rec(E.Lagerort, ".0.value")),
  ], durchsuchbar([E.Bezeichnung])),
  { sichtbar: `equal(${param("reiter")}, 'edition')` },
);

// ---------- Stück (Details und Bearbeiten)
const dsStueck = await datenquelle(stueck, "Stück", { type: "local_baserow_get_row", table_id: T.Unikate, row_id: formel(param("id")) });
const dsStueckLager = await datenquelle(stueck, "Lagerorte", liste(T.Lagerorte, { sortings: [{ field: F.Lagerorte.Name, order_by: "ASC" }] }));
const dsStueckPartner = await datenquelle(stueck, "Partner", liste(T.Partner, { sortings: [{ field: F.Partner.Name, order_by: "ASC" }] }));
const dsStueckKuenstler = await datenquelle(stueck, "Künstler:innen", liste(T["Künstler:innen"]));
const dsStueckGlasuren = await datenquelle(stueck, "Glasuren", liste(T.Glasuren, { default_result_count: 100 }));
await el(stueck, "link", { value: text("← Zurück zum Bestand"), variant: "button", navigation_type: "page", navigate_to_page_id: bestand.id, page_parameters: [], query_parameters: [], navigate_to_url: leer, target: "self" });
await el(stueck, "heading", { value: formel(quelle(dsStueck, U.Name)), level: 1 });
await el(stueck, "text", { value: formel(`concat(${quelle(dsStueck, U.Inventarnummer)}, ' · ', ${quelle(dsStueck, U.Typ, ".value")}, ' · ', ${quelle(dsStueck, U.Status, ".value")})`), format: "plain" });
await el(stueck, "image", { image_source_type: "url", image_url: formel(quelle(dsStueck, U.Fotos, ".0.url")), alt_text: formel(quelle(dsStueck, U.Name)), style_width: "medium" }, { sichtbar: `not_equal(is_empty(${quelle(dsStueck, U.Fotos)}), true)` });
await el(stueck, "heading", { value: text("Bearbeiten"), level: 2 });
await el(stueck, "text", { value: text("Status, Lagerort und Partner oben, darunter alle weiteren Angaben."), format: "plain" });
const fS = await el(stueck, "form_container", { submit_button_label: text("Änderungen speichern"), reset_initial_values_post_submission: false });
const es = {};
es.status = await el(stueck, "choice", auswahlAusFeld("Status", dsStueck, U.Status, { required: true, default_value: formel(quelle(dsStueck, U.Status, ".id")) }), { in: fS });
es.lagerort = await el(stueck, "record_selector", verweisAuswahl("Lagerort", dsStueckLager, { default_value: formel(quelle(dsStueck, U.Lagerort, ".0.id")) }), { in: fS });
es.partner = await el(stueck, "record_selector", verweisAuswahl("Partner (Galerie, Museum …)", dsStueckPartner, { default_value: formel(quelle(dsStueck, U.Partner, ".0.id")) }), { in: fS });
es.rueckgabe = await el(stueck, "datetime_picker", { label: text("Rückgabe bis"), required: false, default_value: formel(quelle(dsStueck, U["Rückgabe bis"])), date_format: "EU", include_time: false, time_format: "24" }, { in: fS });
es.name = await el(stueck, "input_text", eingabe("Name", { required: true, default_value: formel(quelle(dsStueck, U.Name)) }), { in: fS });
es.typ = await el(stueck, "choice", auswahlAusFeld("Typ", dsStueck, U.Typ, { default_value: formel(quelle(dsStueck, U.Typ, ".id")) }), { in: fS });
es.kuenstler = await el(stueck, "record_selector", verweisAuswahl("Künstler:in", dsStueckKuenstler, { default_value: formel(quelle(dsStueck, U["Künstler:in"], ".0.id")) }), { in: fS });
es.jahr = await el(stueck, "input_text", eingabe("Jahr", { validation_type: "integer", default_value: formel(quelle(dsStueck, U.Jahr)) }), { in: fS });
es.glasur = await el(stueck, "record_selector", verweisAuswahl("Glasur", dsStueckGlasuren, { multiple: true, default_value: formel(quelle(dsStueck, U.Glasur, ".*.id")) }), { in: fS });
es.masse = await el(stueck, "input_text", eingabe("Maße", { default_value: formel(quelle(dsStueck, U.Maße)) }), { in: fS });
es.preis = await el(stueck, "input_text", eingabe("Preis intern (€)", { validation_type: "integer", default_value: formel(quelle(dsStueck, U["Preis intern"])) }), { in: fS });
es.web = await el(stueck, "checkbox", { label: text("Auf Website zeigen"), required: false, default_value: formel(quelle(dsStueck, U["Auf Website zeigen"])) }, { in: fS });
es.notiz = await el(stueck, "input_text", eingabe("Notiz", { is_multiline: true, rows: 3, default_value: formel(quelle(dsStueck, U.Notiz)) }), { in: fS });
await aktion(
  stueck,
  fS,
  "submit",
  "update_row",
  zeileAendern(T.Unikate, param("id"), [
    [U.Status, formular(es.status)],
    [U.Lagerort, formular(es.lagerort)],
    [U.Partner, formular(es.partner)],
    [U["Rückgabe bis"], formular(es.rueckgabe)],
    [U.Name, formular(es.name)],
    [U.Typ, formular(es.typ)],
    [U["Künstler:in"], formular(es.kuenstler)],
    [U.Jahr, formular(es.jahr)],
    [U.Glasur, formular(es.glasur)],
    [U.Maße, formular(es.masse)],
    [U["Preis intern"], formular(es.preis)],
    [U["Auf Website zeigen"], formular(es.web)],
    [U.Notiz, formular(es.notiz)],
  ]),
);
await aktion(stueck, fS, "submit", "notification", hinweis("Gespeichert", "Lagerort und Datumsfelder passt die Datenbank bei Statuswechsel selbst an."));
await aktion(stueck, fS, "submit", "refresh_data_source", { data_source_id: dsStueck });
await el(stueck, "text", {
  value: formel(
    `concat('Außer Haus seit: ', ${datum(quelle(dsStueck, U["Außer Haus seit"]))}, ' · Verkauft am: ', ${datum(quelle(dsStueck, U["Verkauft am"]))}, ' · Erfasst am: ', ${datum(quelle(dsStueck, U["Erfasst am"]))}, ' von ', ${quelle(dsStueck, U["Erfasst von"])})`,
  ),
  format: "plain",
});

// ---------- Editionsware (Details und Bearbeiten)
const dsWare = await datenquelle(ware, "Ware", { type: "local_baserow_get_row", table_id: T.Editionsbestand, row_id: formel(param("id")) });
const dsWareLager = await datenquelle(ware, "Lagerorte", liste(T.Lagerorte));
await el(ware, "link", { value: text("← Zurück zum Bestand"), variant: "button", navigation_type: "page", navigate_to_page_id: bestand.id, page_parameters: [], query_parameters: [{ name: "reiter", value: text("edition") }], navigate_to_url: leer, target: "self" });
await el(ware, "heading", { value: formel(quelle(dsWare, E.Bezeichnung)), level: 1 });
const fW = await el(ware, "form_container", { submit_button_label: text("Änderungen speichern"), reset_initial_values_post_submission: false });
const ew = {};
ew.anzahl = await el(ware, "input_text", eingabe("Anzahl", { required: true, validation_type: "integer", default_value: formel(quelle(dsWare, E.Anzahl)) }), { in: fW });
ew.zustand = await el(ware, "choice", auswahlAusFeld("Zustand", dsWare, E.Zustand, { default_value: formel(quelle(dsWare, E.Zustand, ".id")) }), { in: fW });
ew.lagerort = await el(ware, "record_selector", verweisAuswahl("Lagerort", dsWareLager, { default_value: formel(quelle(dsWare, E.Lagerort, ".0.id")) }), { in: fW });
ew.notiz = await el(ware, "input_text", eingabe("Notiz", { is_multiline: true, rows: 3, default_value: formel(quelle(dsWare, E.Notiz)) }), { in: fW });
await aktion(ware, fW, "submit", "update_row", zeileAendern(T.Editionsbestand, param("id"), [
  [E.Anzahl, formular(ew.anzahl)],
  [E.Zustand, formular(ew.zustand)],
  [E.Lagerort, formular(ew.lagerort)],
  [E.Notiz, formular(ew.notiz)],
]));
await aktion(ware, fW, "submit", "notification", hinweis("Gespeichert", "Der Editionsbestand ist aktualisiert."));

// ---------- Tabelle (alle Unikate, freie Suche, Sortierung und Filter)
const dsAlle = await datenquelle(tabSeite, "Alle Unikate", liste(T.Unikate, { sortings: [{ field: U.Nummer, order_by: "DESC" }], default_result_count: 50 }));
await el(tabSeite, "heading", { value: text("Tabelle"), level: 1 });
await el(tabSeite, "text", { value: text("Alle Unikate mit Suche, Filter und Sortierung. Eintrag antippen für Details."), format: "plain" });
await el(
  tabSeite,
  "table",
  tabelle(
    dsAlle,
    [
      spalte("Inv.-Nr.", rec(U.Inventarnummer)),
      verweis("Name", stueck.id, "id", rec(U.Name)),
      spalte("Typ", rec(U.Typ, ".value")),
      tags("Status", rec(U.Status, ".value"), statusFarbe),
      spalte("Künstler:in", rec(U["Künstler:in"], ".0.value")),
      spalte("Glasur", `join(${rec(U.Glasur, ".*.value")}, ', ')`),
      spalte("Lagerort / Partner", `if(is_empty(${rec(U.Partner)}), ${rec(U.Lagerort, ".0.value")}, ${rec(U.Partner, ".0.value")})`),
      spalte("Preis intern", euro(rec(U["Preis intern"]))),
    ],
    { ...durchsuchbar([U.Inventarnummer, U.Name, U.Typ, U.Status, U["Künstler:in"], U.Jahr, U.Glasur, U.Lagerort, U.Partner, U["Preis intern"], U["Auf Website zeigen"]]), items_per_page: 50 },
  ),
);

// ---------- Übersicht (Kennzahlen mit „Zählen“ und „Summe“, Listen)
const kennzahlen = [
  [lit("Verfügbar"), await datenquelle(uebersicht, "Verfügbar", zaehlen(T.Unikate, U.Name, filterAuswahl(U.Status, [sid("verfügbar")]))), await datenquelle(uebersicht, "Wert verfügbar", summe(T.Unikate, U["Preis intern"], filterAuswahl(U.Status, [sid("verfügbar")]))), "Wert"],
  [lit("Reserviert"), await datenquelle(uebersicht, "Reserviert", zaehlen(T.Unikate, U.Name, filterAuswahl(U.Status, [sid("reserviert")]))), null, ""],
  [lit("Außer Haus"), await datenquelle(uebersicht, "Außer Haus", zaehlen(T.Unikate, U.Name, { view_id: ids.ansichten["Unikate/Außer Haus"] })), null, ""],
  ["concat('Verkauft ', year(today()))", await datenquelle(uebersicht, "Verkauft dieses Jahr", zaehlen(T.Unikate, U.Name, { view_id: ids.ansichten["Unikate/Verkauft dieses Jahr"] })), await datenquelle(uebersicht, "Umsatz dieses Jahr", summe(T.Unikate, U["Preis intern"], { view_id: ids.ansichten["Unikate/Verkauft dieses Jahr"] })), "Umsatz"],
  [lit("Editionsware (Stück)"), await datenquelle(uebersicht, "Editionsware Stück", summe(T.Editionsbestand, E.Anzahl)), await datenquelle(uebersicht, "Rohlinge Stück", summe(T.Editionsbestand, E.Anzahl, filterAuswahl(E.Zustand, [zustandOpt.find((o) => o.value === "Rohling").id]))), "davon Rohlinge"],
];
await el(uebersicht, "heading", { value: text("Übersicht"), level: 1 });
await el(uebersicht, "text", { value: formel(`concat('Stand ', datetime_format(today(), 'DD.MM.YYYY'))`), format: "plain" });
const kacheln = await el(uebersicht, "column", { column_amount: 5, column_gap: 12, alignment: "top" });
for (const [i, [titel, zahl, zusatz, zusatzName]] of kennzahlen.entries()) {
  const kachel = await el(
    uebersicht,
    "simple_container",
    { style_border_top_size: 1, style_border_bottom_size: 1, style_border_left_size: 1, style_border_right_size: 1, style_border_top_color: "border", style_border_bottom_color: "border", style_border_left_color: "border", style_border_right_color: "border", style_border_radius: 10, style_padding_top: 14, style_padding_bottom: 14, style_padding_left: 16, style_padding_right: 16 },
    { in: kacheln, platz: String(i) },
  );
  await el(uebersicht, "text", { value: formel(titel), format: "plain" }, { in: kachel });
  await el(uebersicht, "heading", { value: formel(`get('data_source.${zahl}.result')`), level: 1 }, { in: kachel });
  if (zusatz) {
    const wert = zusatzName === "davon Rohlinge" ? `get('data_source.${zusatz}.result')` : euroSumme(`get('data_source.${zusatz}.result')`);
    await el(uebersicht, "text", { value: formel(`concat(${lit(zusatzName)}, ' ', ${wert})`), format: "plain" }, { in: kachel });
  }
}

const dsAussen = await datenquelle(uebersicht, "Außer Haus nach Partner", liste(T.Unikate, { view_id: ids.ansichten["Unikate/Außer Haus"], sortings: [{ field: U.Partner, order_by: "ASC" }, { field: U["Rückgabe bis"], order_by: "ASC" }] }));
await el(uebersicht, "heading", { value: text("Außer Haus nach Partner"), level: 2, style_margin_top: 24 });
await el(uebersicht, "text", { value: text("Galerien, Museen und Ausstellungen, sortiert nach Partner und Rückgabe."), format: "plain" });
await el(uebersicht, "table", tabelle(dsAussen, [
  spalte("Partner", `if(is_empty(${rec(U.Partner)}), 'Ohne Partner', ${rec(U.Partner, ".0.value")})`),
  verweis("Stück", stueck.id, "id", rec(U.Name)),
  spalte("Rückgabe bis", datum(rec(U["Rückgabe bis"]))),
  tags("Hinweis", `if(and(not_equal(is_empty(${rec(U["Rückgabe bis"])}), true), less_than(${rec(U["Rückgabe bis"])}, datetime_format(today(), 'YYYY-MM-DD'))), 'überfällig', '')`, "'#FDE2DF'"),
]));

const dsZuletzt = await datenquelle(uebersicht, "Zuletzt geändert", liste(T.Unikate, { sortings: [{ field: U["Geändert am"], order_by: "DESC" }], default_result_count: 6 }));
await el(uebersicht, "heading", { value: text("Zuletzt erfasst oder geändert"), level: 2, style_margin_top: 24 });
await el(uebersicht, "table", tabelle(dsZuletzt, [
  verweis("Stück", stueck.id, "id", rec(U.Name)),
  spalte("Inv.-Nr.", rec(U.Inventarnummer)),
  tags("Status", rec(U.Status, ".value"), statusFarbe),
  spalte("Geändert", `datetime_format(${rec(U["Geändert am"])}, 'DD.MM.YYYY HH:mm')`),
], { items_per_page: 6 }));

const dsNachschub = await datenquelle(uebersicht, "Nachschub nötig", liste(T.Editionsbestand, {
  filter_type: "AND",
  filters: [{ field: E.Anzahl, type: "lower_than", value: formel(lit(NACHSCHUB_UNTER)) }],
  sortings: [{ field: E.Anzahl, order_by: "ASC" }],
}));
await el(uebersicht, "heading", { value: text("Nachschub nötig"), level: 2, style_margin_top: 24 });
await el(uebersicht, "text", { value: text("Editionsware mit weniger als 5 Stück. Ist die Liste leer, ist alles ausreichend vorrätig."), format: "plain" });
await el(uebersicht, "table", tabelle(dsNachschub, [
  verweis("Ware", ware.id, "id", rec(E.Bezeichnung)),
  spalte("Anzahl", rec(E.Anzahl)),
  spalte("Lagerort", rec(E.Lagerort, ".0.value")),
]));

// ---------- Stammdaten (Reiter über „liste“, je Tabelle + Formular „Neu anlegen“, Bearbeiten auf eigener Seite)
const STAMMDATEN = [
  ["Künstler:innen", "kuenstler", "Wer ein Unikat gefertigt hat.", [["Name", "text", true]]],
  ["Glasuren", "glasuren", "Einheitliche Glasurnamen für Unikate und Editionsware.", [["Name", "text", true]]],
  ["Modelle", "modelle", "Modelle der Editionsware.", [["Name", "text", true], ["Typ", "auswahl"], ["Maße", "text"]]],
  ["Partner", "partner", "Galerien, Museen, Ausstellungen und Leihnehmer. Erscheinen als Auswahl, wenn ein Stück außer Haus geht.", [["Name", "text", true], ["Art", "auswahl"], ["Ort", "text"], ["Zusammenarbeit", "auswahl"], ["Kontakt", "lang"], ["Notiz", "lang"]]],
  ["Lagerorte", "lagerorte", "Feste Liste der Lagerorte. „Außer Haus“ bitte nicht umbenennen, die Regeln nutzen ihn.", [["Name", "text", true], ["Bereich", "auswahl"]]],
];
await el(stamm, "heading", { value: text("Stammdaten"), level: 1 });
await el(stamm, "text", { value: text("Die Auswahllisten für Erfassen und Bestand. Neue Einträge hier anlegen, Namen über „Bearbeiten“ korrigieren."), format: "plain" });
const stammLeiste = await el(stamm, "column", { column_amount: 5, column_gap: 8, alignment: "top" });
for (const [i, [name, schluessel]] of STAMMDATEN.entries()) {
  await el(stamm, "link", { value: text(name), variant: "button", navigation_type: "page", navigate_to_page_id: stamm.id, page_parameters: [], query_parameters: [{ name: "liste", value: text(schluessel) }], navigate_to_url: leer, target: "self" }, { in: stammLeiste, platz: String(i) });
}

for (const [name, schluessel, beschreibung, felder] of STAMMDATEN) {
  const tid = T[name];
  const f = F[name];
  const sichtbar = schluessel === "kuenstler" ? `or(equal(${param("liste")}, 'kuenstler'), is_empty(${param("liste")}))` : `equal(${param("liste")}, '${schluessel}')`;
  const ds = await datenquelle(stamm, name, liste(tid, { sortings: [{ field: f.Name, order_by: "ASC" }], default_result_count: 100 }));
  const dsOpt = await datenquelle(stamm, `${name} (Auswahlwerte)`, liste(tid, { default_result_count: 1 }));

  // Bearbeiten-Seite für diese Liste
  const bearbeiten = await seite(`${name} bearbeiten`, `/stammdaten/${schluessel}/:id`, { pfadParameter: ["id"] });
  const dsEintrag = await datenquelle(bearbeiten, "Eintrag", { type: "local_baserow_get_row", table_id: tid, row_id: formel(param("id")) });
  await el(bearbeiten, "link", { value: text(`← Zurück zu ${name}`), variant: "button", navigation_type: "page", navigate_to_page_id: stamm.id, page_parameters: [], query_parameters: [{ name: "liste", value: text(schluessel) }], navigate_to_url: leer, target: "self" });
  await el(bearbeiten, "heading", { value: formel(quelle(dsEintrag, f.Name)), level: 1 });
  const fB = await el(bearbeiten, "form_container", { submit_button_label: text("Änderungen speichern"), reset_initial_values_post_submission: false });
  const eingabenB = [];
  for (const [feld, art, pflicht] of felder) {
    const props =
      art === "auswahl"
        ? ["choice", auswahlAusFeld(feld, dsEintrag, f[feld], { default_value: formel(quelle(dsEintrag, f[feld], ".id")), show_as_dropdown: true })]
        : ["input_text", eingabe(feld, { required: Boolean(pflicht), is_multiline: art === "lang", rows: 3, default_value: formel(quelle(dsEintrag, f[feld])) })];
    eingabenB.push([f[feld], await el(bearbeiten, props[0], props[1], { in: fB })]);
  }
  await aktion(bearbeiten, fB, "submit", "update_row", zeileAendern(tid, param("id"), eingabenB.map(([fid, e]) => [fid, formular(e)])));
  await aktion(bearbeiten, fB, "submit", "notification", hinweis("Gespeichert", `${name}: Änderung gespeichert.`));

  // Liste und Neu-Formular auf der Stammdaten-Seite
  await el(stamm, "text", { value: text(beschreibung), format: "plain" }, { sichtbar });
  const spalten = [
    verweis("Name", bearbeiten.id, "id", rec(f.Name)),
    ...felder.filter(([feld, art]) => feld !== "Name" && art !== "lang").map(([feld, art]) => spalte(feld, rec(f[feld], art === "auswahl" ? ".value" : ""))),
  ];
  await el(stamm, "table", tabelle(ds, spalten, { items_per_page: 50 }), { sichtbar });
  await el(stamm, "heading", { value: text(`Neu anlegen: ${name}`), level: 3, style_margin_top: 16 }, { sichtbar });
  const fN = await el(stamm, "form_container", { submit_button_label: text("Anlegen"), reset_initial_values_post_submission: true }, { sichtbar });
  const eingabenN = [];
  for (const [feld, art, pflicht] of felder) {
    const props =
      art === "auswahl"
        ? ["choice", auswahlAusFeld(feld, dsOpt, f[feld], { show_as_dropdown: true })]
        : ["input_text", eingabe(feld, { required: Boolean(pflicht), is_multiline: art === "lang", rows: 3 })];
    eingabenN.push([f[feld], await el(stamm, props[0], props[1], { in: fN })]);
  }
  await aktion(stamm, fN, "submit", "create_row", zeileAnlegen(tid, eingabenN.map(([fid, e]) => [fid, formular(e)])));
  await aktion(stamm, fN, "submit", "notification", hinweis("Angelegt", `${name}: neuer Eintrag gespeichert.`));
  await aktion(stamm, fN, "submit", "refresh_data_source", { data_source_id: ds });
}

ids.seiten = Object.fromEntries(Object.entries(seiten).map(([n, s]) => [n, s.id]));
ids.nutzerquelle = nutzerquelle.id;
speichereIds(ids);
console.log(`App „${APP}“ (${app.id}) mit ${Object.keys(seiten).length} Seiten angelegt.`);
