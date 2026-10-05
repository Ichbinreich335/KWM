// Manufakturprogramm: Geschirr und Edition in Warengruppen, jede mit Sätzen aus Foto und Teileliste
// (Sanity-Typ `manufakturteil`; Vorschlag: Foto je Satz, Teile als Liste). Keine Preise, kein Bestand.
import { BRENNTEMPERATUR, grad } from './brenntemperatur';
import type { BildAngabe, DatumEintrag, Regalfach } from './typen';

export interface Teil {
  name: string;
  masse: string;
  /** Nummer im gedruckten Programmkatalog (öffentlich), keine Lager- oder Inventarnummer; die Seite zeigt sie als „Nr. …“ */
  programmnr?: string;
  hinweis?: 'nicht mehr im Programm' | 'ohne Abbildung';
}

export interface Satz {
  /** Fehlt bei einem Satz, der nur aus Text besteht (Verweis auf ein Bild in einer anderen Gruppe) */
  bild?: BildAngabe;
  untertitel?: string;
  teile: readonly Teil[];
  /** Bild über die ganze Breite der Gruppe, Liste daneben */
  breit?: boolean;
  /** Freisteller auf dunklem Grund statt Foto im Format 3:2 */
  kontur?: boolean;
  /** Anmerkung unter der Liste */
  notiz?: string;
}

export interface Warengruppe {
  schluessel: string;
  titel: string;
  /** Drei Sätze nebeneinander (Edition) statt zwei */
  dreispaltig?: boolean;
  saetze: readonly Satz[];
  /** Anmerkung neben den Sätzen */
  hinweis?: string;
}

export const geschirr: readonly Warengruppe[] = [
  {
    schluessel: 'teller',
    titel: 'Teller',
    saetze: [
      {
        bild: {
          src: '/img/kwm/teller.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Teller in Dunkelgrün, Hellgrün und Rostbraun, von oben gesehen',
        },
        teile: [
          { name: 'Brotschmierteller', masse: 'Ø 22,5 cm', programmnr: '15' },
          { name: 'Brotteller', masse: 'Ø 13 cm', programmnr: '14' },
          { name: 'Unterteller', masse: '2,8 × 12,5 cm', programmnr: '13' },
          { name: 'Essteller', masse: '2,8 × 28 cm', programmnr: '16' },
          { name: 'Platzteller', masse: 'Ø 35 cm', programmnr: '17' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/neue_serie-1.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Teller und Schalen der neuen Serie in Schwarz, Weiß, Ocker und Seladon',
        },
        untertitel: 'Neue Serie',
        teile: [
          { name: 'Dessertschale, hoch', masse: '6,0 × Ø 13,5 cm', programmnr: '50' },
          { name: 'Dessertschale, flach', masse: '4,0 × Ø 15 cm', programmnr: '51' },
          { name: 'Suppenteller', masse: '5,5 × Ø 18,5 cm', programmnr: '49' },
          { name: 'Vorspeisenteller', masse: '3,5 × Ø 22,5 cm', programmnr: '52', hinweis: 'nicht mehr im Programm' },
          { name: 'Essteller', masse: '3,5 × Ø 28,5 cm', programmnr: '53' },
          { name: 'Großer Anrichteteller', masse: '4,0 × Ø 38,5 cm', programmnr: '54' },
        ],
      },
    ],
  },
  {
    schluessel: 'viereckteller',
    titel: 'Viereckteller',
    saetze: [
      {
        bild: {
          src: '/img/kwm/viereckteller-2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Vier quadratische Teller in Hellgrün, Ocker, Dunkelgrün und Weiß',
        },
        teile: [
          { name: 'Viereckteller, groß', masse: '25,5 × 25,5 cm', programmnr: '18' },
          { name: 'Viereckteller, mittel', masse: '21,0 × 21,0 cm', programmnr: '19' },
          { name: 'Viereckteller, klein', masse: '16,0 × 16,0 cm', programmnr: '20' },
          { name: 'Rechteckteller', masse: '26,0 × 17,0 cm', programmnr: '21' },
        ],
      },
    ],
    hinweis:
      'Die Viereckteller werden aus Platten über Gipsmodellen geformt – alle anderen Stücke entstehen auf der Töpferscheibe.',
  },
  {
    schluessel: 'schalen-und-schuesseln',
    titel: 'Schalen und Schüsseln',
    saetze: [
      {
        bild: {
          src: '/img/kwm/schalen.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Schalen und Schüsseln in Seladon, Braun und Orange, dazu eine kleine Kugeldose',
        },
        teile: [
          { name: 'Salatschüssel', masse: '13 × 34 cm', programmnr: '1' },
          { name: 'Salatschüssel, medium', masse: '11 × 28 cm', programmnr: '2' },
          { name: 'Koreanische Suppenschale', masse: '8,5 × 23 cm', programmnr: '3' },
          { name: 'Kugeldose', masse: 'Ø 6–11 cm' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/schalen2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei flache Salatschüsseln in Dunkelbraun und Seladon',
        },
        teile: [
          { name: 'Salatschüssel, flach, mittel', masse: '6,5 × 26 cm', programmnr: '48a' },
          { name: 'Salatschüssel, flach', masse: '6 × 30 cm', programmnr: '48' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/schalen3.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Spitze Müslischalen und eine Schüssel in Braun, Weiß, Grün und Orange',
        },
        teile: [
          { name: 'Müslischale, spitz', masse: '8 × 12 cm', programmnr: '6' },
          { name: 'Müslischale, spitz, klein', masse: '6 × 10 cm', programmnr: '6a' },
          { name: 'Müslischale, spitz, groß', masse: '9,5 × 16 cm', programmnr: '7' },
          { name: 'Müslischale, spitz, flach', masse: '8,45 × 21 cm', programmnr: '8' },
          { name: 'Schüssel, spitz', masse: '12,5 × 22 cm', programmnr: '9' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/schalen4.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Breite Müslischale, Spaghettiteller und Schüssel in Weiß, Hellgrün und Olivbraun',
        },
        teile: [
          { name: 'Müslischale, breit', masse: '7,5 × 13,5 cm', programmnr: '11' },
          { name: 'Spaghettiteller', masse: '6 × 19 cm', programmnr: '10' },
          { name: 'Schüssel, breit', masse: '12,5 × 21,5 cm', programmnr: '12', hinweis: 'nicht mehr im Programm' },
        ],
      },
    ],
  },
  {
    schluessel: 'becher-und-tassen',
    titel: 'Becher und Tassen',
    saetze: [
      {
        bild: {
          src: '/img/kwm/tassen.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Espresso-, Cappuccino- und Kaffeetassen mit Untertassen in Hellgrün, Beige und Orange',
        },
        teile: [
          { name: 'Espressotasse', masse: '5,5 × 6 cm', programmnr: '33', hinweis: 'nicht mehr im Programm' },
          { name: 'Espressountertasse', masse: 'Ø 11,5 cm', programmnr: '34', hinweis: 'nicht mehr im Programm' },
          { name: 'Cappuccinotasse', masse: '7 × 9 cm', programmnr: '31', hinweis: 'nicht mehr im Programm' },
          { name: 'Cappuccinountertasse', masse: 'Ø 15,5 cm', programmnr: '32', hinweis: 'nicht mehr im Programm' },
          { name: 'Kaffeetasse', masse: '9 × 8,5 cm', programmnr: '30' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/tassen2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Teebecher und Trinkbecher in Beige, Seladon und Dunkelbraun',
        },
        teile: [
          { name: 'Teebecher', masse: '5,5 × 7 cm', programmnr: '23' },
          { name: 'Teebecher, groß', masse: '9,5 × 9,5 cm', programmnr: '22' },
          { name: 'Trinkbecher, klein', masse: '8 × 8 cm', programmnr: '24' },
        ],
      },
    ],
  },
  {
    schluessel: 'toepfe-und-dosen',
    titel: 'Töpfe und Dosen',
    saetze: [
      {
        bild: {
          src: '/img/kwm/toepfe.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Deckeldose und Deckeltöpfe in Dunkelbraun, Grau, Orange und Seladon',
        },
        teile: [
          { name: 'Deckeldose', masse: '8 × 8,5 cm', programmnr: '39' },
          { name: 'Deckeltopf, klein', masse: '10,5 × 12 cm', programmnr: '40' },
          { name: 'Deckeltopf, mittel', masse: '13 × 16 cm', programmnr: '40a' },
          { name: 'Deckeltopf, groß', masse: '19 × 18 cm', programmnr: '41' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/toepfe2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Koreanische Dose mit orangefarbener Glasur und flachem Deckel',
        },
        teile: [{ name: 'Koreanische Dose', masse: 'H 8,5 × 12,5 cm', programmnr: '42' }],
      },
      {
        bild: {
          src: '/img/kwm/toepfe3.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Drei Suppentöpfe mit Deckel in Orange, Weiß und Seladon',
        },
        teile: [
          { name: 'Suppentopf', masse: '11 × 20 cm', programmnr: '43' },
          { name: 'Suppentopf, extra klein', masse: '', programmnr: '43a', hinweis: 'ohne Abbildung' },
          { name: 'Suppentopf, mittel', masse: '14 × 24 cm', programmnr: '44' },
          { name: 'Suppentopf, groß', masse: '18 × 29,5 cm', programmnr: '45' },
        ],
      },
    ],
  },
  {
    schluessel: 'flaschen-kruege-kannen',
    titel: 'Flaschen, Krüge, Kannen',
    saetze: [
      {
        bild: {
          src: '/img/kwm/kannen.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Krüge in Seladon und Beige und ein dunkelgrüner Becher',
        },
        teile: [
          { name: 'Krug, 2 Liter', masse: '19 × 10 cm', programmnr: '25' },
          { name: 'Krug, 1 Liter', masse: '16 × 8,5 cm', programmnr: '26' },
          { name: 'Krug, 0,75 Liter', masse: '', programmnr: '26a', hinweis: 'ohne Abbildung' },
          { name: 'Krug, 0,5 Liter', masse: '10,5 × 8,5 cm', programmnr: '27' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/kannen2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Drei Teekannen in Weiß und Seladon mit Bambushenkeln',
        },
        teile: [
          { name: 'Teekanne, extraklein', masse: '10 cm', programmnr: '35a' },
          { name: 'Teekanne, klein', masse: '12 cm', programmnr: '35' },
          { name: 'Teekanne, groß', masse: '15 cm', programmnr: '36' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/kannen3.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei Flaschen mit schlankem Hals, eine dunkelbraun, eine seladongrün',
        },
        teile: [
          { name: 'Flasche, klein', masse: '13 cm', programmnr: '37' },
          { name: 'Flasche, groß', masse: '24 cm', programmnr: '38' },
        ],
      },
    ],
  },
  {
    schluessel: 'weitere-stuecke',
    titel: 'Weitere Stücke',
    saetze: [
      {
        bild: {
          src: '/img/kwm/suppenschale.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Ensemble aus Suppenschale, Salatschüsseln, Kugeldosen, Müslischale und Spaghettiteller in verschiedenen Glasuren',
        },
        breit: true,
        teile: [
          { name: 'Koreanische Suppenschale', masse: '8,5 × 23 cm', programmnr: '3' },
          { name: 'Salatschüssel, medium', masse: '11 × 28 cm', programmnr: '2' },
          { name: 'Salatschüssel', masse: '13 × 34 cm', programmnr: '1' },
          { name: 'Kugeldose', masse: 'Ø 6–11 cm', programmnr: '2020' },
          { name: 'Müslischale, breit', masse: '7,5 × 13,5 cm', programmnr: '11' },
          { name: 'Koreanische Dose', masse: '8,5 × 12,5 cm', programmnr: '42' },
          { name: 'Spaghettiteller', masse: '6 × 19 cm', programmnr: '10' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/sieb.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei gelochte Siebe mit Untersetzern in Beige und Seladon',
        },
        teile: [
          { name: 'Sieb, klein', masse: '10 × 17,5 cm', programmnr: '5' },
          { name: 'Sieb, groß', masse: '13,5 × 20,5 cm', programmnr: '4' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/milch.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Kleines Milchkännchen und Zuckerschale in Seladon und Dunkelbraun',
        },
        teile: [
          { name: 'Milch', masse: '5,5 × 7 cm', programmnr: '28' },
          { name: 'Zucker', masse: '5 × 7,5 cm', programmnr: '29' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/streuer.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei zylindrische Streuer in Dunkelgrün und Olivbraun',
        },
        teile: [
          { name: 'Pfefferstreuer', masse: '7 × 4 cm', programmnr: '47', hinweis: 'nicht mehr im Programm' },
          { name: 'Salzstreuer', masse: '7 × 4 cm', programmnr: '46', hinweis: 'nicht mehr im Programm' },
        ],
      },
    ],
  },
];

export const edition: readonly Warengruppe[] = [
  {
    schluessel: 'vasen-edition',
    titel: 'Vasen',
    dreispaltig: true,
    saetze: [
      {
        bild: {
          src: '/img/kwm/vasen.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Kleine Zylinder- und Kugelvasen in Grau, Seladon und Grün',
        },
        teile: [
          { name: 'Zylindervase, klein', masse: 'H 14 cm' },
          { name: 'Kugelvase, klein', masse: 'H ca. 14 cm' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/vasen2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei Kugelvasen mit gesprenkelter dunkelgrüner und seladongrüner Glasur',
        },
        teile: [{ name: 'Kugelvasen', masse: 'H ca. 20 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/vasen3.webp',
          breite: 296,
          hoehe: 400,
          alt: 'Zwei schmale, hohe Wandvasen in Weiß mit blaugrüner Pinselmalerei',
        },
        kontur: true,
        teile: [{ name: 'Wandvase', masse: 'H 39 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/vasen4.webp',
          breite: 300,
          hoehe: 198,
          alt: 'Zwei Tulpenvasen in Seladon vor dunklem Grund',
        },
        kontur: true,
        teile: [{ name: 'Tulpenvase', masse: 'H 20,0 cm, Ø 16,0 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/vasen5.webp',
          breite: 300,
          hoehe: 452,
          alt: 'Hohe Zylindervase in Seladon vor dunklem Grund',
        },
        kontur: true,
        teile: [{ name: 'Zylindervase, groß', masse: 'H 27,0 cm, Ø 16,0 cm' }],
      },
    ],
  },
  {
    schluessel: 'plattenteller-edition',
    titel: 'Plattenteller',
    dreispaltig: true,
    saetze: [
      {
        bild: {
          src: '/img/kwm/plattenteller.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei rechteckige Plattenteller mit gerillter Oberfläche in Seladon und Dunkelgrün',
        },
        teile: [{ name: 'Plattenteller', masse: '21 × 42 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/plattenteller2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei lange Plattenteller in Olivgrün und Türkis mit Pinselmotiv',
        },
        teile: [{ name: 'Plattenteller, lang', masse: '16,5 × 42 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/plattenteller3.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Vier Plattenteller unterschiedlicher Größe mit blauer Pinselmalerei auf Weiß',
        },
        teile: [
          { name: 'Plattenteller, klein', masse: '14,5 × 17 cm' },
          { name: 'Plattenteller, mittel', masse: '18 × 24 cm' },
          { name: 'Plattenteller, groß', masse: '23 × 31 cm' },
          { name: 'Plattenteller, extragroß', masse: '27,5 × 35 cm' },
        ],
      },
    ],
  },
  {
    schluessel: 'pflanzgefaesse-edition',
    titel: 'Pflanzgefäße',
    dreispaltig: true,
    saetze: [
      {
        bild: {
          src: '/img/kwm/pflanzgefaesse.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei Pflanzenübertöpfe, einer türkis mit blauem Farblauf',
        },
        teile: [
          { name: 'Pflanzenübertopf, klein', masse: 'H 15,5 cm, Ø 17,0 cm' },
          { name: 'Pflanzenübertopf, mittel', masse: 'H 19,5 cm, Ø 18,5 cm' },
          { name: 'Pflanzenübertopf, groß', masse: 'H 23,5 cm, Ø 23,5 cm' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/pflanzgefaesse2.webp',
          breite: 300,
          hoehe: 199,
          alt: 'Zwei zylindrische Pflanzenübertöpfe in Schwarzgrau vor dunklem Grund',
        },
        kontur: true,
        teile: [
          { name: 'Pflanzenübertopf, zylindrisch, klein', masse: 'H 15,0 cm, Ø 15,5 cm' },
          { name: 'Pflanzenübertopf, zylindrisch, mittel', masse: 'H 18,0 cm, Ø 19,0 cm' },
          { name: 'Pflanzenübertopf, zylindrisch, groß', masse: 'H 22,0 cm, Ø 23,0 cm' },
        ],
      },
      {
        bild: {
          src: '/img/kwm/pflanzgefaesse3.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Großes, weites Pflanzgefäß in gebrochenem Weiß',
        },
        teile: [{ name: 'Pflanzgefäß, weit', masse: 'H 43 cm, D 50 cm' }],
      },
    ],
  },
  {
    schluessel: 'schalen-und-dosen-edition',
    titel: 'Schalen und Dosen',
    dreispaltig: true,
    saetze: [
      {
        bild: {
          src: '/img/kwm/schale.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Große, flache Schale in hellem Grau, von der Seite',
        },
        teile: [{ name: 'Große Schale', masse: 'H 6,5 cm, Ø 36,5 cm' }],
      },
      {
        bild: {
          src: '/img/kwm/schale2.webp',
          breite: 600,
          hoehe: 400,
          alt: 'Zwei große, flache Schalen in Seladon, von oben gesehen',
        },
        teile: [{ name: 'Große Schale', masse: 'H 6,5 cm, Ø 36,5 cm' }],
      },
      {
        untertitel: 'Kugeldose',
        teile: [{ name: 'Kugeldose', masse: 'Ø 6–11 cm' }],
        notiz: 'Abgebildet unter Schalen und Schüsseln.',
      },
    ],
  },
];

const alle = [...geschirr, ...edition];

/** Warengruppe nach Schlüssel; wirft, wenn es sie nicht gibt */
export function gruppe(schluessel: string): Warengruppe {
  const treffer = alle.find((eintrag) => eintrag.schluessel === schluessel);
  if (!treffer) throw new Error(`Warengruppe nicht gefunden: ${schluessel}`);
  return treffer;
}

/** Arbeitsweise der Manufaktur: Stichwort links, Erklärung rechts */
export const arbeitsweise: readonly DatumEintrag[] = [
  {
    jahr: 'Masse',
    text: 'Westerwälder Steinzeugmasse, auf der Töpferscheibe gedreht. Die Viereckteller werden aus Platten über Gipsmodellen geformt.',
  },
  { jahr: grad(BRENNTEMPERATUR.schruehbrand), text: 'Schrühbrand im Elektroofen.' },
  {
    jahr: grad(BRENNTEMPERATUR.glasurbrandGas),
    text: 'Glasurbrand im Gasofen in reduzierender Atmosphäre – für matte bis glänzende Oberflächen und aufeinander abgestimmte Farben.',
  },
  { jahr: 'Umwelt', text: 'Es werden ausschließlich umweltschonende Materialien und Fertigungsverfahren angewendet.' },
  { jahr: 'Gebrauch', text: 'Alle Stücke sind spülmaschinenfest.' },
];

/** Grundformen auf der Startseite (Bauhaus-Station): Teller, Schale, Krug – die ersten Grundelemente des Programms */
export const grundformen: readonly Pick<Regalfach, 'bild' | 'beschriftung'>[] = [
  {
    bild: {
      src: '/img/kwm/teller.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Teller in Dunkelgrün, Hellgrün und Rostbraun, von oben gesehen',
    },
    beschriftung: 'Teller',
  },
  {
    bild: {
      src: '/img/kwm/schalen3.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Spitze Müslischalen und eine Schüssel in Braun, Weiß, Grün und Orange',
    },
    beschriftung: 'Schale',
  },
  {
    bild: {
      src: '/img/kwm/kannen.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Krüge in Seladon und Beige und ein dunkelgrüner Becher',
    },
    beschriftung: 'Krug',
  },
];

/** Regal im Kopf der Seite: je Warengruppe ein Foto mit Beschriftung (Vorschlag Sanity: Feld `kopfbild` je Gruppe) */
export const regal: readonly Regalfach[] = [
  {
    bild: {
      src: '/img/kwm/teller.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Teller in Dunkelgrün, Hellgrün und Rostbraun, von oben gesehen',
    },
    beschriftung: 'Teller',
    laden: 'prioritaet',
  },
  {
    bild: {
      src: '/img/kwm/kannen.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Krüge in Seladon und Beige und ein dunkelgrüner Becher',
    },
    beschriftung: 'Krüge und Kannen',
    laden: 'prioritaet',
  },
  {
    bild: {
      src: '/img/kwm/tassen2.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Teebecher und Trinkbecher in Beige, Seladon und Dunkelbraun',
    },
    beschriftung: 'Becher und Tassen',
    laden: 'sofort',
  },
  {
    bild: {
      src: '/img/kwm/toepfe.webp',
      breite: 600,
      hoehe: 400,
      alt: 'Deckeldose und Deckeltöpfe in Dunkelbraun, Grau, Orange und Seladon',
    },
    beschriftung: 'Töpfe und Dosen',
    laden: 'sofort',
  },
];
