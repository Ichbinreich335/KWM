// Hinweise unter „Aktuell“ (Sanity-Typ `hinweis`): erscheinen nur zwischen `von` und `bis`
import { abfrage } from '../sanity/client';
import { HINWEISE_QUERY } from '../sanity/queries';
import type { HINWEISE_QUERY_RESULT } from '../sanity/sanity.types';

export interface Hinweis {
  text: string;
  /** Erster und letzter Tag der Anzeige, `JJJJ-MM-TT`, jeweils einschließlich */
  von: string;
  bis: string;
}

/** Alle Hinweise; ob einer sichtbar ist, entscheidet beim Laden der Seite `sig-aktuell.ts` (Neubau täglich) */
export async function ladeHinweise(): Promise<readonly Hinweis[]> {
  const roh = await abfrage<HINWEISE_QUERY_RESULT>('Hinweise', HINWEISE_QUERY);
  return roh.map(({ _id, text, von, bis }) => {
    if (!text || !von || !bis) throw new Error(`Hinweis „${text ?? _id}“: Text, Beginn und Ende sind Pflicht.`);
    return { text, von, bis };
  });
}
