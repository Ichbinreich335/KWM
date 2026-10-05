// Status einer Ausstellung aus Start und Ende. Läuft im Browser, damit er ohne täglichen Neubau stimmt.
const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/** Liest ein Datum `JJJJ-MM-TT` als lokalen Tag; bei ungültiger Eingabe `Invalid Date`. */
export function tagAusIso(iso: string): Date {
  const [jahr, monat, tag] = iso.split('-').map(Number);
  if (jahr === undefined || monat === undefined || tag === undefined) return new Date(NaN);
  return new Date(jahr, monat - 1, tag);
}

export function tagFormat(datum: Date): string {
  return `${datum.getDate()}. ${MONATE[datum.getMonth()]}`;
}

/** „Ab …“ vor dem Start, „Beendet am …“ nach dem Ende, sonst „Läuft · bis …“. Start und Ende gelten inklusive. */
export function statusText(start: Date, ende: Date, heute: Date): string {
  if (heute < start) return `Ab ${tagFormat(start)}`;
  if (heute > ende) return `Beendet am ${tagFormat(ende)}`;
  return `Läuft · bis ${tagFormat(ende)}`;
}
