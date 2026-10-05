// Ausstellungsorte und Galerien (Sanity-Typen `ort` und `galerie`). Keine Preise, kein Bestand, keine Lagerorte.
// Die Zahlen pro Ort (Zeitraum, Anzahl) werden aus den Auftritten berechnet, nicht gepflegt.
import type { BildAngabe } from './typen';

/** Galerie, die Young-Jae Lee zeigt oder vertritt (Sanity-Typ `galerie`; „Vertritt“ ist unbekannt und bleibt leer) */
export interface Galerie {
  schluessel: string;
  name: string;
  stadt: string;
  adresse?: string;
  link?: string;
  vertretung?: boolean;
  vertretungSeit?: number;
}

/** Haus eines Ortes: eine Galerie per Schlüssel (Name kommt aus `galerien`) oder ein Haus mit eigenem Namen */
export type Haus = { galerie: string } | { name: string };

/** Auftritt in der Liste einer Kachel, entspricht einer vergangenen `ausstellung` (Jahr des Beginns, Haus, Titel) */
export interface Auftritt {
  jahr: number;
  /** Haus, wie die Liste es nennt (kann länger sein als der Name in den Häusern) */
  haus: string;
  titel?: string;
  /** Schlüssel der Galerie, wenn der Auftritt in einer Galerie stattfand (Referenz `galerie` der `ausstellung`) */
  galerie?: string;
}

export interface Ort {
  schluessel: string;
  /** Name der Kachel; bei Sammelorten wie „Korea“ ein Gebiet statt einer Stadt */
  stadt: string;
  land: string;
  kurztext?: string;
  /** Ohne Bild gibt es keine Kachel */
  bild?: BildAngabe;
  /** Ergänzung zum Sanity-Modell (`reihenfolge` ist dort das Gewicht): Größe der Kachel im Raster */
  gewicht?: 'gross' | 'mittel' | 'klein';
  /** Ergänzung: Kachel läuft am Handy über die ganze Breite */
  breitAmHandy?: boolean;
  reihenfolge: number;
  haeuser: readonly Haus[];
  auftritte: readonly Auftritt[];
}

export const galerien: readonly Galerie[] = [
  {
    schluessel: 'karsten-greve',
    name: 'Galerie Karsten Greve',
    stadt: 'Köln',
    link: 'https://galerie-karsten-greve.com/',
  },
  {
    schluessel: 'udo-adam-pasquale',
    name: 'Galerie Udo Adam-Pasquale',
    stadt: 'Köln',
  },
  {
    schluessel: 'jahn-und-jahn',
    name: 'Galerie Jahn und Jahn',
    stadt: 'München',
    adresse: 'Baaderstraße 56C, 80469 München',
    link: 'https://www.jahnundjahn.com/',
  },
  {
    schluessel: 'galerie-handwerk',
    name: 'Galerie Handwerk',
    stadt: 'München',
  },
  {
    schluessel: 'gallery-tokyo',
    name: 'Gallery Tokyo',
    stadt: 'Tokio',
  },
  {
    schluessel: 'pucker-gallery',
    name: 'Pucker Gallery',
    stadt: 'Boston',
  },
  {
    schluessel: 'gisela-clement',
    name: 'Galerie Gisela Clement',
    stadt: 'Bonn',
  },
  {
    schluessel: 'david-nolan',
    name: 'David Nolan Gallery',
    stadt: 'New York',
  },
  {
    schluessel: 'galeria-neon',
    name: 'Galeria NEON',
    stadt: 'Breslau',
  },
];

export const orte: readonly Ort[] = [
  {
    schluessel: 'koeln',
    stadt: 'Köln',
    land: 'Deutschland',
    bild: { src: '/img/kwm/schalen-trio.webp', alt: '', breite: 1400, hoehe: 652 },
    gewicht: 'gross',
    reihenfolge: 1,
    haeuser: [
      { name: 'Museum für Ostasiatische Kunst' },
      { galerie: 'karsten-greve' },
      { name: 'Kunst-Station Sankt Peter' },
      { galerie: 'udo-adam-pasquale' },
    ],
    auftritte: [
      { jahr: 2026, haus: 'Museum für Ostasiatische Kunst', titel: '„99 Schalen – ein Kosmos“' },
      { jahr: 2024, haus: 'Museum für Ostasiatische Kunst', titel: '„50 Jahre – 50 Schätze“' },
      { jahr: 2023, haus: 'Galerie Udo Adam-Pasquale, Köln-Sülz', galerie: 'udo-adam-pasquale' },
      { jahr: 2022, haus: 'Kunst-Station Sankt Peter', titel: '„SIEBEN MAL SIEBEN“' },
      { jahr: 2020, haus: 'Galerie Karsten Greve', titel: '„Spinatschalen“', galerie: 'karsten-greve' },
      {
        jahr: 2020,
        haus: 'Galerie Karsten Greve',
        titel: 'Buchpräsentation „Das Grün in den Schalen“',
        galerie: 'karsten-greve',
      },
      { jahr: 2018, haus: 'Galerie Karsten Greve', titel: '„Arbeiten in Keramik“', galerie: 'karsten-greve' },
    ],
  },
  {
    schluessel: 'muenchen',
    stadt: 'München',
    land: 'Deutschland',
    bild: { src: '/img/kwm/regal.webp', alt: '' },
    gewicht: 'gross',
    reihenfolge: 2,
    haeuser: [
      { galerie: 'jahn-und-jahn' },
      { galerie: 'galerie-handwerk' },
      { name: 'Bayerischer Kunstgewerbeverein' },
    ],
    auftritte: [
      { jahr: 2026, haus: 'Galerie Jahn und Jahn', titel: '„Young-Jae Lee“', galerie: 'jahn-und-jahn' },
      { jahr: 2025, haus: 'Galerie Jahn und Jahn', titel: '„Young-Jae Lee: Keramik“', galerie: 'jahn-und-jahn' },
      { jahr: 2024, haus: 'Bayerischer Kunstgewerbeverein' },
      {
        jahr: 2022,
        haus: 'Galerie Jahn und Jahn',
        titel: '„Young-Jae LEE – Spindelvasen und Spinatschalen“',
        galerie: 'jahn-und-jahn',
      },
      { jahr: 2020, haus: 'Galerie Handwerk', titel: '„es grünt“', galerie: 'galerie-handwerk' },
      { jahr: 2016, haus: 'Galerie Jahn', titel: '„Augenblicke“', galerie: 'jahn-und-jahn' },
    ],
  },
  {
    schluessel: 'tokio',
    stadt: 'Tokio',
    land: 'Japan',
    bild: { src: '/img/kwm/seladon-schalen.webp', alt: '' },
    gewicht: 'mittel',
    breitAmHandy: true,
    reihenfolge: 3,
    haeuser: [{ galerie: 'gallery-tokyo' }, { name: 'LIVING MOTIF' }],
    auftritte: [
      { jahr: 2025, haus: 'Gallery Tokyo', titel: '„Lee Young-Jae“', galerie: 'gallery-tokyo' },
      { jahr: 2023, haus: 'Gallery Tokyo', galerie: 'gallery-tokyo' },
      { jahr: 2021, haus: 'Gallery Tokyo', galerie: 'gallery-tokyo' },
      { jahr: 2019, haus: 'Gallery Tokyo', galerie: 'gallery-tokyo' },
      { jahr: 2017, haus: 'Gallery Tokyo', galerie: 'gallery-tokyo' },
      { jahr: 2016, haus: 'LIVING MOTIF', titel: '„Gefäße der Keramischen Werkstatt“' },
    ],
  },
  {
    schluessel: 'essen',
    stadt: 'Essen',
    land: 'Deutschland',
    bild: { src: '/img/kwm/kummerschalen.webp', alt: '' },
    gewicht: 'mittel',
    reihenfolge: 4,
    haeuser: [{ name: 'Museum Folkwang' }, { name: 'Kokerei Zollverein' }, { name: 'Kunsthaus Essen' }],
    auftritte: [
      { jahr: 2025, haus: 'Festival in Essen', titel: '„OPEN House“ – Future Heritage. Das Erbe von Morgen' },
      { jahr: 2022, haus: 'Kunsthaus Essen', titel: '„HOME! 3/5 Identitäten“' },
      { jahr: 2019, haus: 'Mischanlage Kokerei Zollverein', titel: '„MATERIAL ZU FORM – Körper zu Körper“' },
      { jahr: 2019, haus: 'Museum Folkwang', titel: '„Young-Jae Lee“' },
    ],
  },
  {
    schluessel: 'korea',
    stadt: 'Korea',
    land: 'Südkorea',
    bild: { src: '/img/kwm/kumme_3.webp', alt: '' },
    gewicht: 'mittel',
    reihenfolge: 5,
    haeuser: [
      { name: 'Gwangju Museum of Art' },
      { name: 'Ha Jung-woong Museum of Art' },
      { name: 'Shinsegae Gallery' },
    ],
    auftritte: [
      {
        jahr: 2019,
        haus: 'Gwangju Museum of Art und Ha Jung-woong Museum of Art',
        titel: '„Emptying, Filling and Emptying“',
      },
      { jahr: 2017, haus: 'Shinsegae Gallery in Daegu, Gwangju, Incheon und Busan' },
    ],
  },
  {
    schluessel: 'boston',
    stadt: 'Boston',
    land: 'USA',
    bild: { src: '/img/kwm/kugelvase.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 6,
    haeuser: [{ galerie: 'pucker-gallery' }],
    auftritte: [
      {
        jahr: 2022,
        haus: 'Pucker Gallery',
        titel: '„Hope / Hoffnung – Works by Young-Jae Lee“',
        galerie: 'pucker-gallery',
      },
      {
        jahr: 2019,
        haus: 'Pucker Gallery',
        titel: '„Fine Choices 2019 Featuring Young-Jae Lee“',
        galerie: 'pucker-gallery',
      },
      { jahr: 2016, haus: 'Pucker Gallery', titel: '„WITNESS TO AN ANCIENT TRUTH“', galerie: 'pucker-gallery' },
    ],
  },
  {
    schluessel: 'krakau-breslau',
    stadt: 'Krakau und Breslau',
    land: 'Polen',
    bild: { src: '/img/kwm/schalen.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 7,
    haeuser: [{ name: 'Manggha Museum' }, { name: 'Architekturmuseum Breslau' }, { galerie: 'galeria-neon' }],
    auftritte: [
      { jahr: 2016, haus: 'Manggha Museum, Krakau', titel: '„Young-Jae Lee Schalen“' },
      { jahr: 2016, haus: 'Architekturmuseum Breslau', titel: '„Young-Jae Lee – Gefäße“' },
      {
        jahr: 2016,
        haus: 'Galeria NEON, Breslau',
        titel: '„Keramische Werkstatt Margaretenhöhe – Young-Jae Lee“',
        galerie: 'galeria-neon',
      },
    ],
  },
  {
    schluessel: 'chemnitz',
    stadt: 'Chemnitz',
    land: 'Deutschland',
    bild: { src: '/img/kwm/schale_gross.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 8,
    haeuser: [{ name: 'Stadtkirche St. Jakobi' }],
    auftritte: [
      { jahr: 2025, haus: 'Stadtkirche St. Jakobi', titel: '„Young-Jae Lee: Vasen“' },
      { jahr: 2024, haus: 'Stadtkirche St. Jakobi', titel: '„Young-Jae Lee: SCHALEN“' },
    ],
  },
  {
    schluessel: 'bonn',
    stadt: 'Bonn',
    land: 'Deutschland',
    bild: { src: '/img/kwm/schalen2.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 9,
    haeuser: [{ galerie: 'gisela-clement' }, { name: 'ENTERVENTIONALE' }],
    auftritte: [
      { jahr: 2020, haus: 'ENTERVENTIONALE, Ausstellungsparcours', titel: '„ENTERVENTIONALE #2020“' },
      { jahr: 2019, haus: 'Galerie Gisela Clement', titel: '„Schönheit !?“', galerie: 'gisela-clement' },
    ],
  },
  {
    schluessel: 'new-york',
    stadt: 'New York',
    land: 'USA',
    bild: { src: '/img/kwm/spindelvase1.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 10,
    haeuser: [{ galerie: 'david-nolan' }],
    auftritte: [
      {
        jahr: 2024,
        haus: 'David Nolan Gallery',
        titel: '„Young-Jae Lee – Forms from the Earth“',
        galerie: 'david-nolan',
      },
    ],
  },
  {
    schluessel: 'duesseldorf',
    stadt: 'Düsseldorf',
    land: 'Deutschland',
    bild: { src: '/img/kwm/kannen.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 11,
    haeuser: [{ name: 'Hetjens-Museum' }],
    auftritte: [
      {
        jahr: 2024,
        haus: 'Hetjens-Museum',
        titel: '„100 Jahre Keramische Werkstatt Margaretenhöhe – Young-Jae Lee im Hetjens“',
      },
    ],
  },
  {
    schluessel: 'wien',
    stadt: 'Wien',
    land: 'Österreich',
    bild: { src: '/img/kwm/schale2.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 12,
    haeuser: [{ name: 'MAK – Museum für angewandte Kunst' }],
    auftritte: [{ jahr: 2016, haus: 'MAK – Österreichisches Museum für angewandte Kunst', titel: '„NICHT SCHÖN“' }],
  },
  {
    schluessel: 'zuerich',
    stadt: 'Zürich',
    land: 'Schweiz',
    bild: { src: '/img/kwm/schalen3.webp', alt: '' },
    gewicht: 'klein',
    reihenfolge: 13,
    haeuser: [{ name: 'Raum 49' }],
    auftritte: [{ jahr: 2023, haus: 'Raum 49' }],
  },
  { schluessel: 'wesel', stadt: 'Wesel', land: 'Deutschland', reihenfolge: 14, haeuser: [], auftritte: [] },
  { schluessel: 'st-moritz', stadt: 'St. Moritz', land: 'Schweiz', reihenfolge: 15, haeuser: [], auftritte: [] },
];

const galerieNachSchluessel = new Map(galerien.map((eintrag) => [eintrag.schluessel, eintrag]));

export const galerie = (schluessel: string): Galerie => {
  const treffer = galerieNachSchluessel.get(schluessel);
  if (!treffer) throw new Error(`Galerie nicht gefunden: ${schluessel}`);
  return treffer;
};

export const hausName = (haus: Haus): string => ('galerie' in haus ? galerie(haus.galerie).name : haus.name);

/** Orte mit Kachel in der Reihenfolge der Seite */
export const kacheln: readonly (Ort & { bild: BildAngabe })[] = orte
  .flatMap((ort) => (ort.bild ? [{ ...ort, bild: ort.bild }] : []))
  .sort((a, b) => a.reihenfolge - b.reihenfolge);

/** Zeitraum („2018–2026“, bei einem Jahr nur das Jahr) und Anzahl („7 Ausstellungen“) aus den Auftritten */
export const ortZahlen = (ort: Ort): { zeitraum: string; anzahl: string } => {
  const jahre = ort.auftritte.map((auftritt) => auftritt.jahr);
  const erstes = Math.min(...jahre);
  const letztes = Math.max(...jahre);
  return {
    zeitraum: erstes === letztes ? String(erstes) : `${erstes}–${letztes}`,
    anzahl: jahre.length === 1 ? '1 Ausstellung' : `${jahre.length} Ausstellungen`,
  };
};
