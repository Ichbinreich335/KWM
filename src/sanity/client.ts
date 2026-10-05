// Lesezugriff auf Sanity beim Bauen. Die Website bleibt statisch: Die Abfragen laufen nur im Build.
import { createClient, type QueryParams } from '@sanity/client';
import { SANITY_API_READ_TOKEN, SANITY_PERSPEKTIVE } from 'astro:env/server';
import { SANITY_PROJEKT } from './projekt';

/** Produktion liest nur Veröffentlichtes. Entwürfe gibt es nur lokal, mit Token (SANITY_PERSPEKTIVE=drafts). */
const perspektive = SANITY_PERSPEKTIVE;

if (perspektive === 'drafts' && !SANITY_API_READ_TOKEN) {
  throw new Error('SANITY_PERSPEKTIVE=drafts braucht SANITY_API_READ_TOKEN (Viewer-Token, nur in .env, nie im Repo).');
}

const client = createClient({
  ...SANITY_PROJEKT,
  apiVersion: '2026-10-01',
  useCdn: false,
  perspective: perspektive,
  ...(SANITY_API_READ_TOKEN ? { token: SANITY_API_READ_TOKEN } : {}),
});

const antworten = new Map<string, Promise<unknown>>();

/** Eine Abfrage pro Build nur einmal; schlägt sie fehl, bricht der Build mit klarer Meldung ab. */
export function abfrage<Ergebnis>(bezeichnung: string, query: string, params: QueryParams = {}): Promise<Ergebnis> {
  const schluessel = `${query}${JSON.stringify(params)}`;
  const vorhanden = antworten.get(schluessel);
  if (vorhanden) return vorhanden as Promise<Ergebnis>;
  const antwort = client.fetch<Ergebnis>(query, params).catch((fehler: unknown) => {
    const grund = fehler instanceof Error ? fehler.message : String(fehler);
    throw new Error(`Sanity-Abfrage „${bezeichnung}“ fehlgeschlagen: ${grund}`);
  });
  antworten.set(schluessel, antwort);
  return antwort;
}
