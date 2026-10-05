type Wochentag = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/** Öffnungszeit als Datenquelle für Text (Kopf, Fuß) und strukturierte Daten; Stunden voll, 24-Stunden-Zählung. */
interface Oeffnungszeit {
  /** Kurzform für die Anzeige, z. B. „Mo–Fr“ */
  tage: string;
  /** Wochentage in schema.org-Schreibweise */
  wochentage: readonly Wochentag[];
  von: number;
  bis: number;
}

const oeffnungszeiten: readonly Oeffnungszeit[] = [
  { tage: 'Mo–Fr', wochentage: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], von: 9, bis: 17 },
  { tage: 'Sa', wochentage: ['Saturday'], von: 11, bis: 15 },
];

/** Internationale Schreibweise für `tel:`-Link und strukturierte Daten */
const telefonE164 = '+49201305080';
const strasse = 'Bullmannaue 19';
const plz = '45327';
const ort = 'Essen';

const zeitenZeilen = oeffnungszeiten.map(({ tage, von, bis }) => `${tage} ${von}–${bis} Uhr`);

export const kontakt = {
  telefon: '+49 201 30 50 80',
  telefonE164,
  telefonHref: `tel:${telefonE164}`,
  mail: 'kontakt@kwm1924.de',
  mailHref: 'mailto:kontakt@kwm1924.de',
  oeffnungszeiten,
  zeitenKurz: zeitenZeilen.join(', '),
  zeiten: [...zeitenZeilen, 'sonst nach Vereinbarung'],
  firma: 'Keramische Werkstatt Margaretenhöhe GmbH',
  strasse,
  plz,
  ort,
  adresse: [`${strasse}, ${plz} ${ort}`, 'auf dem Gelände der Zeche Zollverein'],
  englischUrl: 'https://kwm-1924.de/en/news/current/',
} as const;
