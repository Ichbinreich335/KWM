/** Wochentage in der Reihenfolge der Woche; die Schlüssel entsprechen der Auswahlliste im Sanity-Dokument `werkstatt` */
export const WOCHENTAGE = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'] as const;
export type Wochentag = (typeof WOCHENTAGE)[number];

/** Ein Öffnungszeit-Eintrag: ein Tag oder ein Tagesbereich (`tagVon` bis `tagBis`), Uhrzeiten als `HH:MM` */
export interface Oeffnungszeit {
  tagVon: Wochentag;
  tagBis?: Wochentag;
  von: string;
  bis: string;
}

/**
 * Das Sanity-Dokument `werkstatt` (Singleton). Die Felder tragen dieselben Namen; `fax` und `webseite`
 * sind Ergänzungen für das Modell, weil die Seiten beides ausgeben.
 */
export interface Werkstatt {
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
  adresszusatz: string;
  telefon: string;
  fax: string;
  email: string;
  webseite: string;
  oeffnungszeiten: readonly Oeffnungszeit[];
  hinweisZeiten: string;
  nahverkehr: string;
  englischeSeite: string;
}

export const werkstatt: Werkstatt = {
  firma: 'Keramische Werkstatt Margaretenhöhe GmbH',
  strasse: 'Bullmannaue 19',
  plz: '45327',
  ort: 'Essen',
  adresszusatz: 'auf dem Gelände der Zeche Zollverein',
  telefon: '+49 201 30 50 80',
  fax: '+49 201 30 30 31',
  email: 'kontakt@kwm1924.de',
  webseite: 'www.kwm1924.de',
  oeffnungszeiten: [
    { tagVon: 'montag', tagBis: 'freitag', von: '09:00', bis: '17:00' },
    { tagVon: 'samstag', von: '11:00', bis: '15:00' },
  ],
  hinweisZeiten: 'nach Vereinbarung',
  nahverkehr: 'Haltestelle Katernberg Süd',
  englischeSeite: 'https://kwm-1924.de/en/news/current/',
};

const TAG_LANG: Record<Wochentag, string> = {
  montag: 'Montag',
  dienstag: 'Dienstag',
  mittwoch: 'Mittwoch',
  donnerstag: 'Donnerstag',
  freitag: 'Freitag',
  samstag: 'Samstag',
  sonntag: 'Sonntag',
};

const TAG_KURZ: Record<Wochentag, string> = {
  montag: 'Mo',
  dienstag: 'Di',
  mittwoch: 'Mi',
  donnerstag: 'Do',
  freitag: 'Fr',
  samstag: 'Sa',
  sonntag: 'So',
};

/** Schreibweise der Tage: „Montag bis Freitag“ oder „Mo–Fr“ */
export type TagStil = 'lang' | 'kurz';

export function tageText(zeit: Oeffnungszeit, stil: TagStil): string {
  const namen = stil === 'lang' ? TAG_LANG : TAG_KURZ;
  const von = namen[zeit.tagVon];
  if (!zeit.tagBis) return von;
  return `${von}${stil === 'kurz' ? '–' : ' bis '}${namen[zeit.tagBis]}`;
}

/** „09:00“ wird „9“, „09:30“ wird „9:30“ */
function uhrzeit(hhmm: string): string {
  const [stunde = '', minute = ''] = hhmm.split(':');
  return minute === '00' ? String(Number(stunde)) : `${Number(stunde)}:${minute}`;
}

/** „9–17 Uhr“ */
export function zeitText(zeit: Oeffnungszeit): string {
  return `${uhrzeit(zeit.von)}–${uhrzeit(zeit.bis)} Uhr`;
}

/** Zeilen aus Tagen und Zeit, z. B. { tage: 'Montag bis Freitag', zeit: '9–17 Uhr' } */
export function oeffnungszeitZeilen(zeiten: readonly Oeffnungszeit[], stil: TagStil) {
  return zeiten.map((zeit) => ({ tage: tageText(zeit, stil), zeit: zeitText(zeit) }));
}

/** „Mo–Fr 9–17 Uhr“ je Eintrag */
export function oeffnungszeitKurz(zeiten: readonly Oeffnungszeit[]): string[] {
  return oeffnungszeitZeilen(zeiten, 'kurz').map(({ tage, zeit }) => `${tage} ${zeit}`);
}

/** Ableitungen, die die Seiten und Komponenten gemeinsam brauchen */
export const kontakt = {
  firma: werkstatt.firma,
  strasse: werkstatt.strasse,
  plzOrt: `${werkstatt.plz} ${werkstatt.ort}`,
  /** Straße, Postleitzahl und Ort in einer Zeile */
  anschrift: `${werkstatt.strasse}, ${werkstatt.plz} ${werkstatt.ort}`,
  adresse: [`${werkstatt.strasse}, ${werkstatt.plz} ${werkstatt.ort}`, werkstatt.adresszusatz],
  telefon: werkstatt.telefon,
  telefonHref: `tel:${werkstatt.telefon.replace(/\s/g, '')}`,
  fax: werkstatt.fax,
  mail: werkstatt.email,
  mailHref: `mailto:${werkstatt.email}`,
  webseite: werkstatt.webseite,
  nahverkehr: werkstatt.nahverkehr,
  englischUrl: werkstatt.englischeSeite,
  hinweisZeiten: werkstatt.hinweisZeiten,
  oeffnungszeiten: werkstatt.oeffnungszeiten,
  /** „Mo–Fr 9–17 Uhr, Sa 11–15 Uhr“ */
  zeitenKurz: oeffnungszeitKurz(werkstatt.oeffnungszeiten).join(', '),
  /** Kurzzeilen samt Hinweis: „Mo–Fr 9–17 Uhr“, „Sa 11–15 Uhr“, „sonst nach Vereinbarung“ */
  zeiten: [...oeffnungszeitKurz(werkstatt.oeffnungszeiten), `sonst ${werkstatt.hinweisZeiten}`],
} as const;
