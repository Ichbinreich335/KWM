// Status einer Ausstellung aus Start und Ende. Läuft im Browser, damit er ohne täglichen Neubau stimmt.
export const MONATE = [
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

/** Heute um 0 Uhr (lokal), damit Start und Ende als ganze Tage verglichen werden. */
export function heuteTag(): Date {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return heute;
}

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

/** Ein Hinweis erscheint von `von` bis `bis`, beide Tage inklusive; ein ungültiges Datum blendet ihn aus. */
export function hinweisSichtbar(von: Date, bis: Date, heute: Date): boolean {
  return heute >= von && heute <= bis;
}
