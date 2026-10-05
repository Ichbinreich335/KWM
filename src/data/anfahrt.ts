import { kontakt } from './kontakt';

/** Satz mit einem Link mitten darin: `vor`, Link, `nach` */
export interface Hinweis {
  vor: string;
  linkText: string;
  href: string;
  nach: string;
}

/** Wegbeschreibung: Titel mit nummerierten Schritten, optional mit Hinweis */
export interface Weg {
  titel: string;
  schritte: readonly string[];
  hinweis?: Hinweis;
}

export const anfahrtAuto: readonly Weg[] = [
  {
    titel: 'Mit dem Auto von Norden',
    schritte: [
      'A 42, Ausfahrt Gelsenkirchen-Heßler / Essen-Katernberg',
      'im Kreisverkehr Ausfahrt Richtung Katernberg, Stoppenberg (Schalker Straße, Katernberger Str.)',
      'ca. 2,7 Kilometer dem Straßenverlauf folgen (durch Katernberg)',
      'an der ersten Ampel nach der S-Bahn-Unterführung rechts in die Bullmannaue abbiegen',
      'weiterfahren bis auf das Zechengelände – dann links abbiegen',
      'nach ca. 100 m liegt auf der linken Seite die Werkstatt',
    ],
  },
  {
    titel: 'Mit dem Auto von Süden',
    schritte: [
      'A 40, Ausfahrt Essen-Frillendorf / Essen-Katernberg Richtung Stoppenberg, Katernberg (Ernestinenstraße, Gelsenkirchener Straße)',
      'ca. 3,9 Kilometer dem Straßenverlauf folgen Richtung Zeche Zollverein',
      'an der ehemaligen Haupteinfahrt zur Zeche Zollverein, Schacht XII, vorbei',
      'nach ca. 400 Metern links in die Haldenstraße – dann wieder links in die Bullmannaue abbiegen',
      'weiterfahren bis auf das Zechengelände – dann links abbiegen',
      'nach ca. 100 m liegt auf der linken Seite die Werkstatt',
    ],
  },
  {
    titel: 'Mit dem Auto aus der Essener Innenstadt',
    schritte: [
      'vom Rathaus Richtung Stoppenberg, Katernberg (Schützenbahn, Stoppenberger Straße, Essener Straße, Gelsenkirchener Straße)',
      'ca. 4,5 Kilometer dem Straßenverlauf folgen',
      'an der ehemaligen Haupteinfahrt zur Zeche Zollverein, Schacht XII, vorbei',
      'nach ca. 400 Metern links in die Haldenstraße – dann wieder links in die Bullmannaue abbiegen',
      'weiterfahren bis auf das Zechengelände – dann links abbiegen',
      'nach ca. 100 m liegt auf der linken Seite die Werkstatt',
    ],
  },
];

export const oepnv: Weg = {
  titel: 'Mit öffentlichen Verkehrsmitteln',
  schritte: [kontakt.nahverkehr],
  hinweis: {
    vor: 'Fahrplanauskünfte erhalten Sie beim ',
    linkText: 'Verkehrsverbund Rhein-Ruhr',
    href: 'https://www.vrr.de/de/fahrplanauskunft/',
    nach: '.',
  },
};
