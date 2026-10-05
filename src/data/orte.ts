// Ausstellungsorte (Sanity-Typ `ort`), beim Bauen aus Sanity geladen. Keine Preise, kein Bestand, keine Lagerorte.
// Die Zahlen pro Ort (Zeitraum, Anzahl) werden aus den Auftritten berechnet, nicht gepflegt:
// Auftritte sind die Archiv-Einträge (`archivEintrag`) und die Ausstellungen (`ausstellung`) mit Verweis auf den Ort.
import { bildAngabe } from '../sanity/bild';
import { abfrage } from '../sanity/client';
import { ARCHIV_QUERY, ORTE_QUERY } from '../sanity/queries';
import type { ARCHIV_QUERY_RESULT, ORTE_QUERY_RESULT } from '../sanity/sanity.types';
import { ladeAlleAusstellungen, heuteIso, type Ausstellung } from './ausstellungen';
import type { BildAngabe } from './typen';

/** Auftritt in der Liste einer Kachel: Jahr des Beginns, Haus, Titel */
export interface Auftritt {
  jahr: number;
  haus: string;
  titel?: string;
}

export interface Ort {
  /** Dokument-ID in Sanity */
  schluessel: string;
  /** Name der Kachel; bei Sammelorten wie „Korea“ ein Gebiet statt einer Stadt */
  stadt: string;
  land: string;
  kurztext?: string;
  /** Ohne Bild gibt es keine Kachel */
  bild?: BildAngabe;
  /** Größe der Kachel im Raster, aus der Reihenfolge abgeleitet (`kachelGroesse`) */
  gewicht: 'gross' | 'mittel' | 'klein';
  /** Kachel läuft am Handy über die ganze Breite */
  breitAmHandy: boolean;
  reihenfolge: number;
  /** Museen, Galerien und Räume, wie die Kachel sie nennt */
  haeuser: readonly string[];
  auftritte: readonly Auftritt[];
}

/** Die ersten zwei Orte stehen groß, die nächsten drei mittel, der Rest klein; die dritte Kachel läuft am Handy durch */
const GROSS_BIS = 2;
const MITTEL_BIS = 5;
const BREIT_AM_HANDY = 3;

export const kachelGroesse = (reihenfolge: number): Pick<Ort, 'gewicht' | 'breitAmHandy'> => ({
  gewicht: reihenfolge <= GROSS_BIS ? 'gross' : reihenfolge <= MITTEL_BIS ? 'mittel' : 'klein',
  breitAmHandy: reihenfolge === BREIT_AM_HANDY,
});

type OrtRoh = ORTE_QUERY_RESULT[number];
type ArchivRoh = ARCHIV_QUERY_RESULT[number];

/** Die Liste einer Kachel nennt das Haus ohne den Kurznamen in Klammern, zum Beispiel „Museum für Ostasiatische Kunst“ statt „… (MOK)“ */
const ohneKurzname = (haus: string): string => haus.replace(/\s*\([^)]*\)$/, '');

/** Auftritte eines Ortes: neueste zuerst, innerhalb eines Jahres Ausstellungen vor Archiv, dann in Listenreihenfolge */
export function auftritteVon(
  ortId: string,
  archiv: readonly ArchivRoh[],
  ausstellungen: readonly Ausstellung[],
  heute: string,
): Auftritt[] {
  const ausListe = ausstellungen
    .filter((eintrag) => eintrag.ort === ortId && eintrag.start <= heute)
    .map((eintrag, i) => ({
      jahr: Number(eintrag.start.slice(0, 4)),
      rang: -1000 + i,
      auftritt: {
        jahr: Number(eintrag.start.slice(0, 4)),
        haus: ohneKurzname(eintrag.galerie ?? eintrag.haus),
        titel: eintrag.titel,
      },
    }));
  const archivListe = archiv
    .filter((eintrag) => eintrag.ortId === ortId)
    .map((eintrag) => {
      const jahr = eintrag.beginnJahr ?? eintrag.jahr ?? 0;
      // Das Feld `haus` nennt das Haus so, wie die Liste der Kachel es zeigt; der Galerie-Name ist nur der Ersatz
      const haus = eintrag.haus ?? eintrag.galerie?.name ?? eintrag.titel ?? '';
      // Ein Titel, der nur den Namen der verknüpften Galerie enthält, wiederholt das Haus ebenfalls
      const galerieName = eintrag.galerie?.name;
      const nennt = (titel: string) =>
        haus.includes(titel) || (galerieName !== undefined && titel.includes(galerieName));
      return {
        jahr,
        rang: eintrag.reihenfolge ?? 0,
        // Ein Titel, der nur das Haus wiederholt, steht nicht doppelt in der Liste
        auftritt: {
          jahr,
          haus,
          ...(eintrag.titel && !nennt(eintrag.titel) ? { titel: eintrag.titel } : {}),
        },
      };
    });
  return [...ausListe, ...archivListe]
    .sort((a, b) => b.jahr - a.jahr || a.rang - b.rang)
    .map(({ auftritt }) => auftritt);
}

export function baueOrte(
  orte: readonly OrtRoh[],
  archiv: readonly ArchivRoh[],
  ausstellungen: readonly Ausstellung[],
  heute: string,
): Ort[] {
  return orte.map((roh) => {
    const wo = `Ort „${roh.stadt ?? roh._id}“`;
    if (!roh.stadt || !roh.land || roh.reihenfolge === null) {
      throw new Error(`${wo}: Stadt, Land und Reihenfolge sind Pflicht.`);
    }
    return {
      schluessel: roh._id,
      stadt: roh.stadt,
      land: roh.land,
      ...(roh.kurztext ? { kurztext: roh.kurztext } : {}),
      ...(roh.bild?.asset ? { bild: bildAngabe(roh.bild, `${wo}, Bild`) } : {}),
      ...kachelGroesse(roh.reihenfolge),
      reihenfolge: roh.reihenfolge,
      haeuser: roh.haeuser ?? [],
      auftritte: auftritteVon(roh._id, archiv, ausstellungen, heute),
    };
  });
}

export async function ladeOrte(heute: string = heuteIso()): Promise<readonly Ort[]> {
  const [orte, archiv, ausstellungen] = await Promise.all([
    abfrage<ORTE_QUERY_RESULT>('Orte', ORTE_QUERY),
    abfrage<ARCHIV_QUERY_RESULT>('Archiv', ARCHIV_QUERY),
    ladeAlleAusstellungen(),
  ]);
  return baueOrte(orte, archiv, ausstellungen, heute);
}

/** Orte mit Kachel in der Reihenfolge der Seite */
export async function ladeKacheln(): Promise<readonly (Ort & { bild: BildAngabe })[]> {
  const kacheln = (await ladeOrte()).flatMap((ort) => (ort.bild ? [{ ...ort, bild: ort.bild }] : []));
  if (kacheln.length === 0) throw new Error('Kein Ort mit Bild gefunden: Die Startseite braucht Ausstellungsorte.');
  return kacheln;
}

/** Zeitraum („2018–2026“, bei einem Jahr nur das Jahr) und Anzahl („7 Ausstellungen“) aus den Auftritten */
export const ortZahlen = (ort: Ort): { zeitraum: string; anzahl: string } => {
  const jahre = ort.auftritte.map((auftritt) => auftritt.jahr);
  const erstes = Math.min(...jahre);
  const letztes = Math.max(...jahre);
  return {
    zeitraum: erstes === letztes ? String(erstes) : `${erstes}–${letztes}`,
    anzahl: jahre.length === 1 ? '1 Ausstellung' : `${jahre.length} Ausstellungen`,
  };
};
