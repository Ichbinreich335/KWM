// Meisterstücke: Katalog der Seite Meisterstücke und Werkschau der Startseite (Sanity-Typ `werk`)
// Keine Preise, kein Bestand, keine Lagerorte, keine Verfügbarkeit: nur freigegebene Angaben.
import { BRENNTEMPERATUR, grad } from './brenntemperatur';
import type { BildAngabe } from './typen';
import { SCHMALES_LEERZEICHEN } from './zeichen';

/** Eine Zeile der Werkangaben; Maße, Glasur, Brand, Ort und Jahr erscheinen mit ` · ` getrennt */
export interface Angabe {
  masse?: string;
  glasur?: string;
  brand?: string;
  ort?: string;
  jahr?: string;
}

export interface Werk {
  schluessel: string;
  titel: string;
  /** Jahr im Kopf der Werkschau; im Katalog steht das Jahr in den Angaben */
  jahr?: string;
  angaben: readonly Angabe[];
  bild: BildAngabe;
  /** Ziel der Kachel (Werkschau), sonst keine Verlinkung */
  verweis?: string;
}

/** Bild ohne Werk (Atmosphäre, Ausstellungsansicht) mit Unterschrift */
export interface Stimmung {
  schluessel: string;
  bild: BildAngabe;
  unterschrift: string;
}

/** Zeile der Angaben als Text */
export function angabeText(angabe: Angabe): string {
  const jahr = angabe.jahr && (angabe.ort ? `${angabe.ort} ${angabe.jahr}` : angabe.jahr);
  return [angabe.masse, angabe.glasur, angabe.brand, jahr].filter(Boolean).join(' · ');
}

/** Bezeichnung für das Feld „Stück“ im Anfrageformular (schmales Leerzeichen wird zum normalen) */
export function stueckBezeichnung(werk: Werk): string {
  return `${werk.titel} (${werk.angaben.map(angabeText).join('; ')})`.replaceAll(SCHMALES_LEERZEICHEN, ' ');
}

export const katalog: readonly Werk[] = [
  {
    schluessel: 'schale-spitz-xxl-1',
    titel: 'Schale, spitz, XXL',
    angaben: [{ masse: 'H 16 × Ø 29,5 cm', glasur: 'Petalit-Eichenasche-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_xxl_3.webp',
      alt: 'Spitz zulaufende Schale mit hellrosa geflammter Innenseite auf hohem Fuß',
    },
  },
  {
    schluessel: 'schale-spitz-xxl-2',
    titel: 'Schale, spitz, XXL',
    angaben: [{ masse: 'H 10,5 × Ø 22,5 cm', glasur: 'Petalit-Eichenasche-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_xxl_1.webp',
      alt: 'Große spitze Schale mit rosa Innenseite, von oben gesehen, auf gesprenkeltem Stein',
    },
  },
  {
    schluessel: 'schale-spitz-xxl-3',
    titel: 'Schale, spitz, XXL',
    angaben: [{ masse: 'H 11,5 × Ø 28,5 cm', glasur: 'Spodumen-Feldspat-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale-spitz_xxl_2.webp',
      alt: 'Weite, flache Schale in hellem Grau auf schmalem Fuß vor dunklem Grund',
    },
  },
  {
    schluessel: 'schale-spitz-xl-1',
    titel: 'Schale, spitz, XL',
    angaben: [{ masse: 'H 10,5 × Ø 21,5 cm', glasur: 'Strontium-Feldspat-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_xl_1.webp',
      alt: 'Spitze Schale mit graublauer Innenseite und bräunlichem Fuß',
    },
  },
  {
    schluessel: 'schale-spitz-xl-2',
    titel: 'Schale, spitz, XL',
    angaben: [{ masse: 'H 11 × Ø 21 cm', glasur: 'Barium-Feldspat-Glasur', jahr: '2004/05' }],
    bild: {
      src: '/img/kwm/schale_spitz_xl_2.webp',
      alt: 'Drei ineinandergestellte hellblaue Schalen im Streiflicht',
    },
  },
  {
    schluessel: 'schale-spitz-xl-3',
    titel: 'Schale, spitz, XL',
    angaben: [{ masse: 'H 10,5 × Ø 28 cm', glasur: 'Wollastonit-Feldspat-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_xl_3.webp',
      alt: 'Flache, weite Schale in Olivgrün vor grauem Grund',
    },
  },
  {
    schluessel: 'schale-spitz-gross-1',
    titel: 'Schale, spitz, groß',
    angaben: [{ masse: 'H 10,3 × Ø 18,8 cm', glasur: 'Barium-Feldspat-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_gross.webp',
      alt: 'Spitze Schale mit türkisgrüner Glasur auf kleinem Fuß',
    },
  },
  {
    schluessel: 'schale-spitz-mittel-1',
    titel: 'Schale, spitz, mittel',
    angaben: [{ masse: 'H 9 × Ø 15,8 cm', glasur: 'Spodumen-Feldspat-Glasur', jahr: '2003–2005' }],
    bild: {
      src: '/img/kwm/schale_spitz_mittel.webp',
      alt: 'Spitze Schale mit orangebraun geflammter Außenseite und hellem Rand',
    },
  },
  {
    schluessel: 'schalen-spitz-klein-1',
    titel: 'Schalen, spitz, klein',
    angaben: [
      { masse: 'H 8,2 × Ø 9,8 cm', glasur: 'Strontium-Feldspat-Glasur', jahr: '2003–2005' },
      { masse: 'H 8,3 × Ø 9,7 cm', glasur: 'Wollastonit-Feldspat-Glasur', jahr: '2003–2005' },
      { masse: 'H 8,2 × Ø 10 cm', glasur: 'Strontium-Feldspat-Glasur', jahr: '2003–2005' },
    ],
    bild: {
      src: '/img/kwm/schale_spitz.webp',
      alt: 'Drei kleine spitze Schalen in Seladon, Olivgrün und Hellgrün',
    },
  },
  {
    schluessel: 'grosse-schale-1',
    titel: 'Große Schale',
    angaben: [
      {
        masse: 'H 9,5 × Ø 53,5 cm',
        glasur: 'Wollastonit-Feldspat-Glasur',
        brand: 'Gasofen',
        ort: 'Essen',
        jahr: '1994',
      },
    ],
    bild: {
      src: '/img/kwm/schale_gross.webp',
      alt: 'Sehr weite, flache Schale mit graublauer Glasur, von oben gesehen',
    },
  },
  {
    schluessel: 'kummen-1',
    titel: 'Kummen',
    angaben: [
      {
        masse: 'H 18 × Ø 14,6 cm · H 18 × Ø 14 cm',
        glasur: 'Petalit-Eichenasche-Glasur',
        brand: 'Holzofen',
        ort: 'Essen',
        jahr: '1995',
      },
    ],
    bild: {
      src: '/img/kwm/kumme_2.webp',
      alt: 'Zwei Kummen mit großen dunkelblauen Flecken auf hellbraunem Grund',
    },
  },
  {
    schluessel: 'kumme-1',
    titel: 'Kumme',
    angaben: [
      {
        masse: 'H 16 × Ø 12,2 cm',
        glasur: 'Wollastonit-Feldspat-Glasur auf weißer Engobe',
        brand: 'Gasofen',
        ort: 'Essen',
        jahr: '1987',
      },
    ],
    bild: {
      src: '/img/kwm/kumme_1.webp',
      alt: 'Zwei Kummen in Türkis und Blaugrün, die rechte mit dunkleren Schlieren',
    },
  },
  {
    schluessel: 'bettelmoenchschale-1',
    titel: 'Bettelmönchschale',
    angaben: [
      { masse: 'H 10,2 × Ø 13,6 cm', glasur: 'Barium-Feldspat-Glasur', brand: 'Gasofen', ort: 'Essen', jahr: '1988' },
    ],
    bild: {
      src: '/img/kwm/kumme_3.webp',
      alt: 'Bauchige, türkisblaue Schale mit leicht eingezogenem Rand',
    },
  },
  {
    schluessel: 'zylindervasen-xl-1',
    titel: 'Zylindervasen, XL',
    angaben: [
      {
        masse: 'H ca. 49 × Ø ca. 15 cm',
        glasur: 'Petalit-Eichenasche-Glasur',
        brand: 'Holzofen',
        ort: 'Essen',
        jahr: '2003',
      },
    ],
    bild: {
      src: '/img/kwm/zylindervasen.webp',
      alt: 'Fünf hohe, schlanke Zylindervasen mit hellgrauer Glasur und bräunlichen Holzbrandspuren',
    },
  },
  {
    schluessel: 'zylindervasen-gross-1',
    titel: 'Zylindervasen, groß',
    angaben: [
      {
        masse: 'H ca. 30 × Ø ca. 11,5 cm',
        glasur: 'Petalit-Eichenasche-Glasur',
        brand: 'Holzofen',
        ort: 'Essen',
        jahr: '2003',
      },
    ],
    bild: {
      src: '/img/kwm/zylindervasen_gross.webp',
      alt: 'Hohe Zylindervasen mit schräg gesetzten dunkelbraunen Engobe-Strichen',
    },
  },
  {
    schluessel: 'zylindervasen-mittel-1',
    titel: 'Zylindervasen, mittel',
    angaben: [
      {
        masse:
          'H 29,5 × Ø 12,1 cm · H 21,3 × Ø 11,1 cm · H 30,5 × Ø 12,7 cm · H 19,1 × Ø 11 cm · H 27,1 × Ø 12,4 cm · H 24,1 × Ø 12 cm',
      },
      { glasur: 'Petalit-Eichenasche-Glasur', brand: 'Holzofen', ort: 'Essen', jahr: '2003' },
    ],
    bild: {
      src: '/img/kwm/zylindervase_mittel.webp',
      alt: 'Sechs Zylindervasen unterschiedlicher Höhe mit Ringen und Holzbrandfärbung',
    },
  },
  {
    schluessel: 'kleines-zylindervasenpaar-1',
    titel: 'Kleines Zylindervasenpaar',
    angaben: [
      {
        masse: 'H 14,5 × Ø 14,5 cm · H 13,3 × Ø 14,5 cm',
        glasur: 'Kalkspat-Glasur',
        brand: 'Gasofen',
        ort: 'Kassel',
        jahr: '1984/85',
      },
    ],
    bild: {
      src: '/img/kwm/zylindervase_klein.webp',
      alt: 'Zwei kleine Vasen in dunklem Olivgrün, eine leicht tailliert',
    },
  },
  {
    schluessel: 'kugelvase-1',
    titel: 'Kugelvase',
    angaben: [
      { masse: 'H 25 × Ø 32,5 cm', glasur: 'Barium-Feldspat-Glasur', brand: 'Holzofen', ort: 'Essen', jahr: '1996' },
    ],
    bild: {
      src: '/img/kwm/kugelvase.webp',
      alt: 'Bauchige Kugelvase mit mattweißer, leicht gesprenkelter Glasur',
    },
  },
  {
    schluessel: 'spindelvase-1',
    titel: 'Spindelvase',
    angaben: [
      {
        masse: 'H 35,5 × Ø 37 cm',
        glasur: 'Petalit-Eichenasche-Feldspat-Glasur',
        brand: `Holzofen ${grad(BRENNTEMPERATUR.holzofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase1.webp',
      alt: 'Zwei Ansichten einer weißen Spindelvase mit weiter Schulter',
    },
  },
  {
    schluessel: 'spindelvase-2',
    titel: 'Spindelvase',
    angaben: [
      {
        masse: 'H 40,4 × Ø 34,5 cm',
        glasur: 'Wollastonit-Feldspat-Glasur',
        brand: `Gasofen ${grad(BRENNTEMPERATUR.gasofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase2.webp',
      alt: 'Seladongrüne Spindelvase und Nahaufnahme der fein gerissenen Glasur',
    },
  },
  {
    schluessel: 'spindelvase-3',
    titel: 'Spindelvase',
    angaben: [
      {
        masse: 'H 37,5 × Ø 33 cm',
        glasur: 'Petalit-Eichenasche-Feldspat-Glasur',
        brand: `Holzofen ${grad(BRENNTEMPERATUR.holzofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase3.webp',
      alt: 'Zwei Ansichten einer Spindelvase mit zartvioletter Glasur',
    },
  },
  {
    schluessel: 'spindelvasen-1',
    titel: 'Spindelvasen',
    angaben: [
      {
        masse: 'H 34,7 × Ø 33 cm',
        glasur: 'Magnesium-Zinn-Feldspat-Glasur',
        brand: `Gasofen ca. ${grad(BRENNTEMPERATUR.gasofen)} · Reduktion`,
      },
      {
        masse: 'H 45 × Ø 36 cm',
        glasur: 'Magnesium-Zinn-Feldspat-Glasur',
        brand: `Gasofen ca. ${grad(BRENNTEMPERATUR.gasofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase4.webp',
      alt: 'Zwei Spindelvasen mit honigfarben bis weiß verlaufender Glasur',
    },
  },
  {
    schluessel: 'spindelvasen-2',
    titel: 'Spindelvasen',
    angaben: [
      {
        masse: 'H 40,4 × Ø 34,5 cm',
        glasur: 'Wollastonit-Feldspat-Glasur',
        brand: `Gasofen ${grad(BRENNTEMPERATUR.gasofen)} · Reduktion`,
      },
      {
        masse: 'H 34,5 × Ø 36,5 cm',
        glasur: 'Petalit-Eichenasche-Feldspat-Glasur',
        brand: `Holzofen ${grad(BRENNTEMPERATUR.holzofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase5.webp',
      alt: 'Eine seladonfarbene und eine weiße Spindelvase',
    },
  },
  {
    schluessel: 'spindelvasen-3',
    titel: 'Spindelvasen',
    angaben: [
      {
        masse: 'H 38,8 × Ø 35,3 cm',
        glasur: 'Petalit-Eichenasche-Feldspat-Glasur',
        brand: `Holzofen ${grad(BRENNTEMPERATUR.holzofen)} · Reduktion`,
      },
      {
        masse: 'H 35 × Ø 36,5 cm',
        glasur: 'Petalit-Eichenasche-Feldspat-Glasur',
        brand: `Holzofen ${grad(BRENNTEMPERATUR.holzofen)} · Reduktion`,
      },
    ],
    bild: {
      src: '/img/kwm/spindelvase6.webp',
      alt: 'Eine rosé geflammte und eine hellweiße Spindelvase',
    },
  },
];

export const stimmungen: readonly Stimmung[] = [
  {
    schluessel: 'seladon-schalen',
    bild: {
      src: '/img/kwm/seladon-schalen.webp',
      alt: 'Flache Schalen mit blaugrüner Glasur, dicht nebeneinander auf dunklem Holz',
    },
    unterschrift: 'Schalen von Young-Jae Lee · Foto: Christopher Clem Franken',
  },
  {
    schluessel: 'vasen-chemnitz',
    bild: {
      src: '/img/kwm/vasen-detail.webp',
      alt: 'Vasen dicht beieinander: rosé, elfenbein, seladon und honigbraun glasiert',
    },
    unterschrift: 'Vasen von Young-Jae Lee in der Ausstellung in Chemnitz, 2025',
  },
];

/**
 * Einzelwerk der Startseite (Meisterstücke): zwei Schalen aus dem Foto der Ausstellung „99 Schalen – ein Kosmos“
 * (MOK Köln 2026, alte Seite /neuigkeiten/aktuelles/). Titel, Jahr, Maße und Fotonachweis sind nicht belegt.
 */
export const einzelwerk: Werk & { unterschrift: string } = {
  schluessel: 'zwei-schalen-mok',
  titel: 'Zwei Schalen',
  angaben: [{ ort: 'gezeigt in „99 Schalen – ein Kosmos“, Köln', jahr: '2026' }],
  bild: {
    src: '/img/kwm/werke/zwei-schalen-mok.webp',
    alt: 'Zwei Schalen von Young-Jae Lee auf hellgrauem Grund: vorn eine ochsenblutrot glasierte, dahinter eine weiße mit blauem Tupfen',
  },
  unterschrift: 'Schalen von Young-Jae Lee aus der Ausstellung „99 Schalen – ein Kosmos“, Köln 2026',
};

/** Auswahl der Startseite: Kacheln mit Jahr, Maßen und Ausführung, verlinkt auf den Katalog */
export const werkschau: readonly Werk[] = [
  {
    schluessel: 'werkschau-1',
    titel: 'Kumme',
    jahr: '1995',
    angaben: [{ masse: 'H 18 × Ø 14,6 cm' }, { glasur: 'Petalit-Eichenasche-Glasur', brand: 'Holzofen' }],
    bild: { src: '/img/kwm/kumme_2.webp', alt: 'Zwei Kummen mit blau gesprenkelter Glasur' },
    verweis: '/meisterstuecke#kummen',
  },
  {
    schluessel: 'werkschau-2',
    titel: 'Schale, spitz, XXL',
    jahr: '2003–2005',
    angaben: [{ masse: 'H 10,5 × Ø 22,5 cm' }, { glasur: 'Petalit-Eichenasche-Glasur' }],
    bild: {
      src: '/img/kwm/schale_spitz_xxl_1.webp',
      alt: 'Große spitze Schale mit rosa Glasurverlauf',
    },
    verweis: '/meisterstuecke#schalen',
  },
  {
    schluessel: 'werkschau-3',
    titel: 'Zylindervasen, groß',
    jahr: '2003',
    angaben: [{ masse: 'H ca. 30 × Ø ca. 11,5 cm' }, { glasur: 'Petalit-Eichenasche-Glasur', brand: 'Holzofen' }],
    bild: {
      src: '/img/kwm/zylindervasen_gross.webp',
      alt: 'Drei große Zylindervasen mit Pinselbemalung',
    },
    verweis: '/meisterstuecke#vasen',
  },
  {
    schluessel: 'werkschau-4',
    titel: 'Schale, spitz, XL',
    jahr: '2003–2005',
    angaben: [{ masse: 'H 10,5 × Ø 21,5 cm' }, { glasur: 'Strontium-Feldspat-Glasur' }],
    bild: {
      src: '/img/kwm/schale_spitz_xl_1.webp',
      alt: 'Spitze Schale mit hellblauer Innenglasur',
    },
    verweis: '/meisterstuecke#schalen',
  },
  {
    schluessel: 'werkschau-5',
    titel: 'Bettelmönchschale',
    jahr: '1988',
    angaben: [{ masse: 'H 10,2 × Ø 13,6 cm' }, { glasur: 'Barium-Feldspat-Glasur', brand: 'Gasofen' }],
    bild: { src: '/img/kwm/kumme_3.webp', alt: 'Hellblaue Bettelmönchschale' },
    verweis: '/meisterstuecke#kummen',
  },
  {
    schluessel: 'werkschau-6',
    titel: 'Schale, spitz, groß',
    jahr: '2003–2005',
    angaben: [{ masse: 'H 10,3 × Ø 18,8 cm' }, { glasur: 'Barium-Feldspat-Glasur' }],
    bild: {
      src: '/img/kwm/schale_spitz_gross.webp',
      alt: 'Spitze Schale mit türkisgrüner Glasur auf kleinem Fuß',
    },
    verweis: '/meisterstuecke#schalen',
  },
];

const nachSchluessel = <T extends { schluessel: string }>(liste: readonly T[], schluessel: string): T => {
  const treffer = liste.find((eintrag) => eintrag.schluessel === schluessel);
  if (!treffer) throw new Error(`Eintrag nicht gefunden: ${schluessel}`);
  return treffer;
};

export const werk = (schluessel: string): Werk => nachSchluessel(katalog, schluessel);
export const stimmung = (schluessel: string): Stimmung => nachSchluessel(stimmungen, schluessel);
