// Einmaliger Import der heutigen Website-Inhalte als ENTWÜRFE (drafts.*) in das Dataset.
// Aufruf: node scripts/import-inhalte.mjs <Ordner mit den Bildern> [--replace]
// Der Ordner enthält die Bilder aus src/assets/img/kwm/ des Branches phase-d3-aufklappen (siehe README).
// Token: Umgebungsvariable SANITY_AUTH_TOKEN, sonst die Anmeldung der Sanity-CLI. Es wird nichts veröffentlicht.
// Ohne --replace bleiben vorhandene Entwürfe unangetastet, damit Änderungen im Studio nicht überschrieben werden.
import { createClient } from '@sanity/client';
import { createReadStream, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const bilderOrdner = process.argv[2];
const ersetzen = process.argv.includes('--replace');
if (!bilderOrdner) throw new Error('Bitte den Ordner mit den Bildern angeben.');

const token =
  process.env.SANITY_AUTH_TOKEN ??
  JSON.parse(readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8')).authToken;
const client = createClient({ projectId: '135lyh9t', dataset: 'production', apiVersion: '2026-10-01', token, useCdn: false });

const FEHLT = 'Nachweis fehlt';
const hochgeladen = new Map();
const bild = async (datei, felder = {}) => {
  if (!hochgeladen.has(datei)) {
    const asset = await client.assets.upload('image', createReadStream(join(bilderOrdner, datei)), { filename: basename(datei) });
    hochgeladen.set(datei, asset._id);
  }
  return { _type: 'image', asset: { _type: 'reference', _ref: hochgeladen.get(datei) }, ...felder };
};
// Wie im Studio: schwache Referenz auf die veröffentlichte ID, wird beim Veröffentlichen des Ziels fest.
const ref = (id, typ) => ({ _type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: { type: typ } });
const absatz = (text) => [{ _type: 'block', _key: 'a1', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's1', text, marks: [] }] }];

const orteDaten = [
  ['koeln', 'Köln', 'Deutschland', 1, 'schalen-trio-1400.webp', 'Vier Schalen von Young-Jae Lee: ochsenblutrot, weiß mit blauem Tupfen, rosé und hellbraun'],
  ['muenchen', 'München', 'Deutschland', 2, 'regal.webp', 'Regal voller ungebrannter Becher, Schalen, Teller und Kannen in der Werkstatt'],
  ['tokio', 'Tokio', 'Japan', 3, 'seladon-schalen.webp', 'Flache Schalen mit blaugrüner Glasur, dicht nebeneinander auf dunklem Holz'],
  ['essen', 'Essen', 'Deutschland', 4, 'kummerschalen.webp', 'Viele flache Schalen in Seladon, Schwarz und Rotbraun, auf dem Boden ausgelegt'],
  ['korea', 'Korea', 'Südkorea', 5, 'teeschale.webp', 'Teeschale von Young-Jae Lee mit rötlich-brauner Glasur und hellen Pinselzügen'],
  ['boston', 'Boston', 'USA', 6, 'kugelvase.webp', 'Bauchige Kugelvase mit mattweißer, leicht gesprenkelter Glasur'],
  ['krakau-breslau', 'Krakau und Breslau', 'Polen', 7, 'schalen.webp', 'Drei weite Schalen in Seladon, Graugrün und Orangebraun mit einer kleinen Deckeldose'],
  ['chemnitz', 'Chemnitz', 'Deutschland', 8, 'schale_gross.webp', 'Sehr weite, flache Schale mit graublauer Glasur, von oben gesehen'],
  ['bonn', 'Bonn', 'Deutschland', 9, 'schalen2.webp', 'Zwei flache Salatschüsseln in Dunkelbraun und Seladon'],
  ['new-york', 'New York', 'USA', 10, 'spindelvase1.webp', 'Zwei Ansichten einer weißen Spindelvase mit weiter Schulter'],
  ['duesseldorf', 'Düsseldorf', 'Deutschland', 11, 'kannen.webp', 'Zwei Krüge und eine Tasse in Seladon, Weiß und Dunkelgrün'],
  ['wien', 'Wien', 'Österreich', 12, 'schale2.webp', 'Zwei große, flache Schalen in Seladon, von oben gesehen'],
  ['zuerich', 'Zürich', 'Schweiz', 13, 'schalen3.webp', 'Spitze Müslischalen und eine Schüssel in Braun, Weiß, Grün und Orange'],
  ['wesel', 'Wesel', 'Deutschland', 14],
  ['st-moritz', 'St. Moritz', 'Schweiz', 15],
];

const galerienDaten = [
  ['karsten-greve', 'Galerie Karsten Greve', 'koeln', undefined, 'https://galerie-karsten-greve.com/'],
  ['udo-adam-pasquale', 'Galerie Udo Adam-Pasquale', 'koeln'],
  ['jahn-und-jahn', 'Galerie Jahn und Jahn', 'muenchen', ['Baaderstraße 56C', '80469 München'], 'https://www.jahnundjahn.com/'],
  ['galerie-handwerk', 'Galerie Handwerk', 'muenchen'],
  ['gallery-tokyo', 'Gallery Tokyo', 'tokio'],
  ['pucker-gallery', 'Pucker Gallery', 'boston'],
  ['gisela-clement', 'Galerie Gisela Clement', 'bonn'],
  ['david-nolan', 'David Nolan Gallery', 'new-york'],
  ['galeria-neon', 'Galeria NEON', 'krakau-breslau'],
];

const schalenAlt = 'Vier Schalen von Young-Jae Lee: ochsenblutrot, weiß mit blauem Tupfen, rosé und hellbraun';
const regalAlt = 'Regal voller ungebrannter Becher, Schalen, Teller und Kannen in der Werkstatt';
const popupZeiten = ['Fr und Sa 11–18 Uhr', 'So 11–16 Uhr'];

const ausstellungen = async () => [
  {
    _id: 'drafts.ausstellung-99-schalen-mok', _type: 'ausstellung',
    titel: '„99 Schalen – ein Kosmos“', art: 'museum', haus: 'Museum für Ostasiatische Kunst (MOK)',
    adresse: ['Universitätsstraße 100', '50674 Köln'], start: '2026-04-23', ende: '2026-10-25', spotlight: true,
    ort: ref('ort-koeln', 'ort'),
    beschreibung: absatz('Schalen von Young-Jae Lee im Museum für Ostasiatische Kunst in Köln.'),
    link: { text: 'Zur Ausstellung im MOK', url: 'https://museum-fuer-ostasiatische-kunst.de/99-Schalen-ein-Kosmos' },
    hauptbild: await bild('aktuell/mok-2000.webp', { alt: schalenAlt, bildunterschrift: 'Schalen von Young-Jae Lee', nachweis: FEHLT }),
    bilder: [{ _key: 'b1', ...(await bild('schalen-trio.webp', { alt: schalenAlt, bildunterschrift: 'Schalen von Young-Jae Lee', nachweis: FEHLT })) }],
  },
  {
    _id: 'drafts.ausstellung-kummerschalen-wesel', _type: 'ausstellung',
    titel: '„Kummerschalen“', art: 'kirche', haus: 'Willibrordi-Dom',
    adresse: ['Großer Markt', '46483 Wesel'], start: '2026-08-16', ende: '2026-10-31', spotlight: false,
    ort: ref('ort-wesel', 'ort'),
    beschreibung: absatz('Der Niederrheinische Kunstverein zeigt in Kooperation mit der Evangelischen Kirchengemeinde Wesel handgefertigte Schalen der international renommierten Keramikerin Young-Jae Lee.'),
    eroeffnung: ['Sonntag, 16. August 2026, 11 Uhr', 'Gottesdienst zur Ausstellung, 12.15 Uhr Eröffnung der Ausstellung. Die Künstlerin wird anwesend sein.'],
    oeffnungszeiten: ['Di–So 14.30–17.00 Uhr', 'Mi und Sa 10–12 Uhr'], oeffnungszeitenBezeichnung: 'Öffnungszeiten Dom',
    hauptbild: await bild('aktuell/wesel-seladon-800.webp', { alt: 'Flache Schalen von Young-Jae Lee mit seladonfarbener Glasur, die sich in der Mitte sammelt', nachweis: 'Foto: Christopher Clem Franken' }),
    bilder: [{ _key: 'b1', ...(await bild('kummerschalen.webp', { alt: 'Viele flache Schalen in Seladon, Schwarz und Rotbraun, auf dem Boden ausgelegt', bildunterschrift: 'Schalen von Young-Jae Lee', nachweis: 'Fotografie: Christopher Clem Franken, © Kunst-Station Sankt Peter, Köln' })) }],
  },
  {
    _id: 'drafts.ausstellung-kathleen-jacobs-young-jae-lee-greve', _type: 'ausstellung',
    titel: '„Kathleen Jacobs / Young‑Jae Lee“', art: 'galerie', haus: 'Galerie Karsten Greve',
    start: '2026-10-03', ende: '2026-12-12', spotlight: false,
    ort: ref('ort-st-moritz', 'ort'), galerie: ref('galerie-karsten-greve', 'galerie'),
    beschreibung: absatz('Malerei von Kathleen Jacobs (Öl auf Leinen) und Keramik von Young‑Jae Lee.'),
    link: { text: 'Galerie Karsten Greve', url: 'https://galerie-karsten-greve.com/' },
    hauptbild: await bild('aktuell/greve-533.webp', { alt: 'Türkisfarbene Kumme von Young-Jae Lee mit feinem Craquelé', bildunterschrift: 'Kumme von Young-Jae Lee', nachweis: FEHLT }),
  },
  {
    _id: 'drafts.ausstellung-popup-store-vol-2-werkstatt', _type: 'ausstellung',
    titel: 'Mode, Taschen, Keramik & Licht im Dialog', art: 'werkstatt', haus: 'Pop-up-Store Vol. 2 in der Werkstatt',
    adresse: ['Bullmannaue 19', '45327 Essen, Gelände der Zeche Zollverein'], start: '2026-11-06', ende: '2026-11-08', spotlight: false,
    ort: ref('ort-essen', 'ort'),
    beschreibung: absatz('Pop-up-Store in den Räumen der Keramischen Werkstatt Margaretenhöhe.'),
    oeffnungszeiten: popupZeiten, oeffnungszeitenBezeichnung: 'Geöffnet',
    kooperation: ['Burggraf Burggraf (Taschen)', 'Joachim Kern (Mode)', 'Christiane Kuntz (Mode)', 'Dietrich Pampus (Vintage Leuchten)'],
    link: { text: 'Anfahrt zur Werkstatt', url: '/besuch' },
    hauptbild: await bild('aktuell/popup-954.webp', { alt: regalAlt, bildunterschrift: 'In der Werkstatt', nachweis: 'Foto: Haydar Koyupinar' }),
    bilder: [{ _key: 'b1', ...(await bild('regal.webp', { alt: regalAlt, bildunterschrift: 'In der Werkstatt', nachweis: 'Foto: Haydar Koyupinar' })) }],
  },
];

const dokumente = [
  ...(await Promise.all(
    orteDaten.map(async ([schluessel, stadt, land, reihenfolge, datei, alt]) => ({
      _id: `drafts.ort-${schluessel}`, _type: 'ort', stadt, land, reihenfolge,
      ...(datei ? { bild: await bild(datei, { alt }) } : {}),
    })),
  )),
  ...galerienDaten.map(([schluessel, name, ort, adresse, link]) => ({
    _id: `drafts.galerie-${schluessel}`, _type: 'galerie', name, ort: ref(`ort-${ort}`, 'ort'),
    ...(adresse ? { adresse } : {}), ...(link ? { link } : {}),
  })),
  ...(await ausstellungen()),
  {
    _id: 'drafts.hinweis-werkstatt-geschlossen-2026-10-03', _type: 'hinweis', wichtig: false,
    text: 'Am Samstag, 3. Oktober 2026 bleibt die Werkstatt geschlossen. Ab Montag, 5. Oktober sind wir wieder wie gewohnt für Sie da.',
    gueltigVon: '2026-10-01', gueltigBis: '2026-10-04',
  },
];

const tx = client.transaction();
for (const dokument of dokumente) (ersetzen ? tx.createOrReplace(dokument) : tx.createIfNotExists(dokument));
// Öffnungstage der Werkstatt strukturiert (Ruling 4): ersetzt den Freitext „wochentage“.
tx.patch('drafts.werkstatt-kontakt', (patch) =>
  patch.set({
    oeffnungszeiten: [
      { _key: 'mo-fr', _type: 'zeitraum', tagVon: 'Montag', tagBis: 'Freitag', von: '09:00', bis: '17:00' },
      { _key: 'sa', _type: 'zeitraum', tagVon: 'Samstag', von: '11:00', bis: '15:00' },
    ],
  }),
);
const ergebnis = await tx.commit();
console.log(`${dokumente.length} Entwürfe, ${hochgeladen.size} Bilder, ${ergebnis.results.length} Schreibvorgänge.`);
