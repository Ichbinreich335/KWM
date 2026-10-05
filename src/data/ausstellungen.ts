// Ausstellungen und Veranstaltungen (Sanity-Typ `ausstellung`). Keine Preise, kein Bestand, keine Lagerorte.
import type { BildAngabe, Fakt } from './typen';

/** Bild mit Unterschrift (Bildnachweis steht in der Unterschrift) */
export interface Foto extends BildAngabe {
  unterschrift: string;
}

export interface Ausstellung {
  schluessel: string;
  titel: string;
  art: 'Museum' | 'Kirche' | 'Galerie' | 'Werkstatt' | 'Messe';
  /** Name des Hauses, wie die Zeile unter dem Titel ihn zeigt */
  haus: string;
  /** Stadt und gegebenenfalls Land hinter dem Haus */
  stadt: string;
  /** Schlüssel des Ortes in der Ortsliste (`orte.ts`, Phase D3) */
  ort: string;
  /** Anschrift in Zeilen */
  adresse?: readonly string[];
  /** Erster und letzter Tag, `JJJJ-MM-TT`; der Status wird daraus berechnet */
  start: string;
  ende: string;
  /** Genau eine laufende Ausstellung steht groß und mit offenen Details */
  spotlight?: boolean;
  beschreibung?: string;
  /** Eröffnung in Sinnabschnitten; die Startseite setzt sie in einen Satz */
  eroeffnung?: readonly string[];
  oeffnungszeiten?: readonly string[];
  /** Beschriftung der Zeiten, wenn nicht „Öffnungszeiten“ */
  oeffnungszeitenLabel?: string;
  kooperation?: readonly string[];
  link?: { href: string; text: string };
  /** Foto der Kachel auf der Startseite und Hauptbild der Seite Aktuelles */
  fotos: { kachel: Foto; haupt?: Foto };
  /** Angaben, die auf der Seite Aktuelles anders formuliert oder geordnet sind als auf der Startseite */
  aktuelles?: { fakten: readonly Fakt[] };
  /** Noch nicht dargestellt: Flyer der Ausstellung (Bild, Alternativtext) */
  flyer?: { src: string; alt: string };
  /** Noch nicht dargestellt: Schlüssel einer Galerie mit Ausstellungsansichten */
  galerie?: string;
}

export const ausstellungen: readonly Ausstellung[] = [
  {
    schluessel: 'mok',
    titel: '„99 Schalen – ein Kosmos“',
    art: 'Museum',
    haus: 'Museum für Ostasiatische Kunst (MOK)',
    stadt: 'Köln',
    ort: 'koeln',
    adresse: ['Universitätsstraße 100', '50674 Köln'],
    start: '2026-04-23',
    ende: '2026-10-25',
    spotlight: true,
    beschreibung: 'Schalen von Young-Jae Lee im Museum für Ostasiatische Kunst in Köln.',
    link: { href: 'https://museum-fuer-ostasiatische-kunst.de/99-Schalen-ein-Kosmos', text: 'Zur Ausstellung im MOK' },
    fotos: {
      kachel: {
        src: '/img/kwm/aktuell/mok-2000.webp',
        breite: 1400,
        hoehe: 652,
        widths: [960, 1400, 2000],
        sizes: '(min-width: 900px) 64vw, 100vw',
        alt: 'Vier Schalen von Young-Jae Lee: ochsenblutrot, weiß mit blauem Tupfen, rosé und hellbraun',
        unterschrift: 'Schalen von Young-Jae Lee',
      },
      haupt: {
        src: '/img/kwm/schalen-trio.webp',
        breite: 2000,
        hoehe: 931,
        sizes: '100vw',
        alt: 'Vier Schalen von Young-Jae Lee: ochsenblutrot, weiß mit blauem Tupfen, rosé und hellbraun',
        unterschrift: 'Schalen von Young-Jae Lee',
      },
    },
  },
  {
    schluessel: 'wesel',
    titel: '„Kummerschalen“',
    art: 'Kirche',
    haus: 'Willibrordi-Dom',
    stadt: 'Wesel',
    ort: 'wesel',
    adresse: ['Großer Markt', '46483 Wesel'],
    start: '2026-08-16',
    ende: '2026-10-31',
    beschreibung:
      'Der Niederrheinische Kunstverein zeigt in Kooperation mit der Evangelischen Kirchengemeinde Wesel handgefertigte Schalen der international renommierten Keramikerin Young-Jae Lee.',
    eroeffnung: [
      'Sonntag, 16. August 2026, 11 Uhr',
      'Gottesdienst zur Ausstellung, 12.15 Uhr Eröffnung der Ausstellung.',
    ],
    oeffnungszeiten: ['Di–So 14.30–17.00 Uhr', 'Mi und Sa 10–12 Uhr'],
    fotos: {
      kachel: {
        src: '/img/kwm/aktuell/wesel-seladon-800.webp',
        breite: 640,
        hoehe: 480,
        widths: [640, 800],
        sizes: '(min-width: 900px) 31vw, 100vw',
        alt: 'Flache Schalen von Young-Jae Lee mit seladonfarbener Glasur, die sich in der Mitte sammelt',
        unterschrift: 'Foto: Christopher Clem Franken',
      },
      haupt: {
        src: '/img/kwm/kummerschalen.webp',
        breite: 937,
        hoehe: 1040,
        alt: 'Viele flache Schalen in Seladon, Schwarz und Rotbraun, auf dem Boden ausgelegt',
        unterschrift:
          'Schalen von Young-Jae Lee · Fotografie: Christopher Clem Franken, © Kunst-Station Sankt Peter, Köln',
      },
    },
    aktuelles: {
      fakten: [
        { label: 'Ort', wert: ['Willibrordi-Dom', 'Großer Markt, 46483 Wesel'] },
        {
          label: 'Eröffnung',
          wert: [
            'Sonntag, 16. August 2026, 11 Uhr',
            'Gottesdienst zur Ausstellung, 12.15 Uhr Eröffnung der Ausstellung. Die Künstlerin wird anwesend sein.',
          ],
        },
        { label: 'Öffnungszeiten Dom', wert: ['Di–So 14.30–17.00 Uhr', 'Mi und Sa 10–12 Uhr'] },
      ],
    },
  },
  {
    schluessel: 'greve',
    titel: '„Kathleen Jacobs / Young‑Jae Lee“',
    art: 'Galerie',
    haus: 'Galerie Karsten Greve',
    stadt: 'St. Moritz, Schweiz',
    ort: 'st-moritz',
    start: '2026-10-03',
    ende: '2026-12-12',
    beschreibung: 'Malerei von Kathleen Jacobs (Öl auf Leinen) und Keramik von Young‑Jae Lee.',
    link: { href: 'https://galerie-karsten-greve.com/', text: 'Galerie Karsten Greve' },
    fotos: {
      kachel: {
        src: '/img/kwm/aktuell/greve-533.webp',
        breite: 533,
        hoehe: 400,
        alt: 'Türkisfarbene Kumme von Young-Jae Lee mit feinem Craquelé',
        unterschrift: 'Kumme von Young-Jae Lee',
      },
    },
  },
  {
    schluessel: 'popup',
    titel: 'Mode, Taschen, Keramik & Licht im Dialog',
    art: 'Werkstatt',
    haus: 'Pop-up-Store Vol. 2 in der Werkstatt',
    stadt: 'Zeche Zollverein',
    ort: 'essen',
    adresse: ['Bullmannaue 19', '45327 Essen, Gelände der Zeche Zollverein'],
    start: '2026-11-06',
    ende: '2026-11-08',
    beschreibung: 'Pop-up-Store in den Räumen der Keramischen Werkstatt Margaretenhöhe.',
    oeffnungszeiten: ['Fr und Sa 11–18 Uhr', 'So 11–16 Uhr'],
    oeffnungszeitenLabel: 'Geöffnet',
    kooperation: [
      'Burggraf Burggraf (Taschen)',
      'Joachim Kern (Mode)',
      'Christiane Kuntz (Mode)',
      'Dietrich Pampus (Vintage Leuchten)',
    ],
    link: { href: '/besuch', text: 'Anfahrt zur Werkstatt' },
    fotos: {
      kachel: {
        src: '/img/kwm/aktuell/popup-954.webp',
        breite: 640,
        hoehe: 480,
        widths: [640, 954],
        sizes: '(min-width: 900px) 31vw, 100vw',
        alt: 'Regal voller ungebrannter Becher, Schalen, Teller und Kannen in der Werkstatt',
        unterschrift: 'In der Werkstatt · Foto: Haydar Koyupinar',
      },
      haupt: {
        src: '/img/kwm/regal.webp',
        breite: 954,
        hoehe: 905,
        alt: 'Regal voller ungebrannter Becher, Schalen, Teller und Kannen in der Werkstatt',
        unterschrift: 'In der Werkstatt · Foto: Haydar Koyupinar',
      },
    },
    aktuelles: {
      fakten: [
        { label: 'Geöffnet', wert: ['Fr und Sa 11–18 Uhr', 'So 11–16 Uhr'] },
        {
          label: 'In Kooperation mit',
          wert: [
            'Burggraf Burggraf (Taschen)',
            'Joachim Kern (Mode)',
            'Christiane Kuntz (Mode)',
            'Dietrich Pampus (Vintage Leuchten)',
          ],
        },
        { label: 'Ort', wert: ['Bullmannaue 19, 45327 Essen', 'auf dem Gelände der Zeche Zollverein'] },
      ],
    },
  },
];

export const ausstellung = (schluessel: string): Ausstellung => {
  const treffer = ausstellungen.find((eintrag) => eintrag.schluessel === schluessel);
  if (!treffer) throw new Error(`Ausstellung nicht gefunden: ${schluessel}`);
  return treffer;
};
