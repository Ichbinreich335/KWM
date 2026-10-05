// Seitenköpfe (Sanity-Typ `seite`): Überschrift, Einleitung und Beschreibung für Suchmaschinen je Seite
import { abfrage } from '../sanity/client';
import { SEITEN_QUERY } from '../sanity/queries';
import type { SEITEN_QUERY_RESULT } from '../sanity/sanity.types';

/** Feste Dokument-IDs der Seiten in Sanity */
export type SeitenId =
  'startseite' | 'aktuelles' | 'meisterstuecke' | 'manufaktur' | 'young-jae-lee' | 'werkstatt' | 'besuch';

export interface Seitenkopf {
  titel: string;
  einleitung: string;
  beschreibung: string;
}

export async function ladeSeite(id: SeitenId): Promise<Seitenkopf> {
  const alle = await abfrage<SEITEN_QUERY_RESULT>('Seiten', SEITEN_QUERY);
  if (alle.length === 0) {
    throw new Error(
      'Sanity liefert keine Seiten: Sind die Inhalte im Studio veröffentlicht? Lokal mit Entwürfen bauen: SANITY_PERSPEKTIVE=drafts und SANITY_API_READ_TOKEN in .env (siehe .env.example).',
    );
  }
  const roh = alle.find((seite) => seite._id === id);
  if (!roh?.titel || !roh.einleitung || !roh.beschreibung) {
    throw new Error(`Seite „${id}“ fehlt in Sanity oder hat keine Überschrift, Einleitung oder Beschreibung.`);
  }
  return { titel: roh.titel, einleitung: roh.einleitung, beschreibung: roh.beschreibung };
}
