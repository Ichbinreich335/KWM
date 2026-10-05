// Ausstellungen und Veranstaltungen (Sanity-Typ `ausstellung`), beim Bauen aus Sanity geladen.
// Keine Preise, kein Bestand, keine Lagerorte.
import { bildAngabe, type SanityBild } from '../sanity/bild';
import { abfrage } from '../sanity/client';
import { AUSSTELLUNGEN_QUERY } from '../sanity/queries';
import type { AUSSTELLUNGEN_QUERY_RESULT } from '../sanity/sanity.types';
import { absaetze } from '../sanity/text';
import type { BildAngabe, Fakt } from './typen';

/** Bild mit Unterschrift (Bildnachweis steht in der Unterschrift) */
export interface Foto extends BildAngabe {
  unterschrift: string;
}

export type Art = 'Museum' | 'Kirche' | 'Galerie' | 'Werkstatt' | 'Messe';

export interface Ausstellung {
  /** Dokument-ID in Sanity; Bedienelemente der Seite leiten ihre Ids daraus ab */
  schluessel: string;
  /** Stabiler Anker auf der Seite Aktuelles (`/aktuelles#…`): die Dokument-ID ohne das Präfix `ausstellung-` */
  anker: string;
  titel: string;
  art: Art;
  /** Name des Hauses, wie die Zeile unter dem Titel ihn zeigt */
  haus: string;
  /** Stadt und gegebenenfalls Land hinter dem Haus */
  stadt: string;
  /** Dokument-ID des Ortes (Referenz `ort` des Sanity-Typs `ausstellung`) */
  ort: string;
  /** Name der Galerie, wenn die Ausstellung in einer Galerie stattfindet */
  galerie?: string;
  /** Anschrift in Zeilen */
  adresse?: readonly string[];
  /** Erster und letzter Tag, `JJJJ-MM-TT`; der Status wird daraus berechnet */
  start: string;
  ende: string;
  /** Genau eine laufende Ausstellung steht groß und mit offenen Details */
  spotlight?: boolean;
  /** Absätze der Beschreibung als HTML (Absatz, fett, kursiv, Link) */
  beschreibung?: readonly string[];
  /** Eröffnung in Sinnabschnitten; die Startseite setzt sie in einen Satz */
  eroeffnung?: readonly string[];
  oeffnungszeiten?: readonly string[];
  /** Beschriftung der Zeiten, wenn nicht „Öffnungszeiten“ */
  oeffnungszeitenLabel?: string;
  kooperation?: readonly string[];
  link?: { href: string; text: string };
  /** Foto der Kachel auf der Startseite und Bild der Seite Aktuelles (das erste weitere Bild, sonst das Hauptbild) */
  fotos: { kachel: Foto; haupt: Foto };
}

type Roh = AUSSTELLUNGEN_QUERY_RESULT[number];

const ARTEN: Record<NonNullable<Roh['art']>, Art> = {
  museum: 'Museum',
  kirche: 'Kirche',
  galerie: 'Galerie',
  werkstatt: 'Werkstatt',
  messe: 'Messe',
};

/** Dieser Wert steht im Studio, wenn der Urheber eines Fotos unbekannt ist; er gehört nicht auf die Seite */
const NACHWEIS_FEHLT = 'Nachweis fehlt';

const KACHEL_SPOTLIGHT = { maxBreite: 1400, stufen: [960], sizes: '(min-width: 900px) 64vw, 100vw' } as const;
const KACHEL = { maxBreite: 640, sizes: '(min-width: 900px) 31vw, 100vw' } as const;
const HAUPT_SPOTLIGHT = { sizes: '100vw' } as const;

type Foto_ = SanityBild & { bildunterschrift: string | null; nachweis: string | null };

/** Unterschrift aus Bildunterschrift und Nachweis, getrennt durch einen Mittelpunkt */
const unterschrift = (bild: Foto_) =>
  [bild.bildunterschrift, bild.nachweis === NACHWEIS_FEHLT ? null : bild.nachweis].filter(Boolean).join(' · ');

const foto = (bild: Foto_ | null | undefined, wo: string, darstellung: Parameters<typeof bildAngabe>[2]): Foto => ({
  ...bildAngabe(bild, wo, darstellung),
  unterschrift: bild ? unterschrift(bild) : '',
});

const landZusatz = (land: string | null) => (land && land !== 'Deutschland' ? `, ${land}` : '');

export function ausstellungAusSanity(roh: Roh): Ausstellung {
  const wo = `Ausstellung „${roh.titel ?? roh._id}“`;
  const { titel, art, haus, start, ende, ort } = roh;
  if (!titel || !art || !haus || !start || !ende || !ort?.stadt) {
    throw new Error(`${wo}: Titel, Art, Haus, Beginn, Ende und Ort sind Pflicht.`);
  }
  const hauptbild = roh.hauptbild;
  const weitere = roh.bilder?.[0];
  return {
    schluessel: roh._id,
    anker: roh._id.replace(/^ausstellung-/, ''),
    titel,
    art: ARTEN[art],
    haus,
    stadt: `${ort.stadt}${landZusatz(ort.land)}`,
    ort: ort._id,
    ...(roh.galerie?.name ? { galerie: roh.galerie.name } : {}),
    ...(roh.adresse?.length ? { adresse: roh.adresse } : {}),
    start,
    ende,
    ...(roh.spotlight ? { spotlight: true } : {}),
    ...(roh.beschreibung?.length ? { beschreibung: absaetze(roh.beschreibung) } : {}),
    ...(roh.eroeffnung?.length ? { eroeffnung: roh.eroeffnung } : {}),
    ...(roh.oeffnungszeiten?.length ? { oeffnungszeiten: roh.oeffnungszeiten } : {}),
    ...(roh.oeffnungszeiten?.length && roh.oeffnungszeitenBezeichnung
      ? { oeffnungszeitenLabel: roh.oeffnungszeitenBezeichnung }
      : {}),
    ...(roh.kooperation?.length ? { kooperation: roh.kooperation } : {}),
    ...(roh.link?.text && roh.link.url ? { link: { href: roh.link.url, text: roh.link.text } } : {}),
    fotos: {
      kachel: foto(hauptbild, `${wo}, Hauptbild`, roh.spotlight ? KACHEL_SPOTLIGHT : KACHEL),
      haupt: foto(weitere ?? hauptbild, `${wo}, Seitenbild`, roh.spotlight ? HAUPT_SPOTLIGHT : {}),
    },
  };
}

/**
 * Angaben der Seite Aktuelles aus den Feldern der Ausstellung, mit festen Bezeichnungen
 * (dieselben Felder wie auf der Startseite). Ohne Eröffnung, Zeiten und Partner gibt es keine Tafel.
 */
export function aktuellesFakten(ausstellung: Ausstellung): Fakt[] | undefined {
  const { haus, adresse, eroeffnung, oeffnungszeiten, kooperation } = ausstellung;
  if (!eroeffnung && !oeffnungszeiten && !kooperation) return undefined;
  return [
    { label: 'Ort', wert: [haus, ...(adresse?.length ? [adresse.join(', ')] : [])] },
    ...(eroeffnung ? [{ label: 'Eröffnung', wert: eroeffnung }] : []),
    ...(oeffnungszeiten
      ? [{ label: ausstellung.oeffnungszeitenLabel ?? 'Öffnungszeiten', wert: oeffnungszeiten }]
      : []),
    ...(kooperation ? [{ label: 'In Kooperation mit', wert: kooperation }] : []),
  ];
}

/** Alle Ausstellungen, nach Beginn geordnet */
export async function ladeAlleAusstellungen(): Promise<readonly Ausstellung[]> {
  const roh = await abfrage<AUSSTELLUNGEN_QUERY_RESULT>('Ausstellungen', AUSSTELLUNGEN_QUERY);
  return roh.map(ausstellungAusSanity);
}

/** Noch nicht beendete Ausstellungen (Startseite „Aktuell“) */
export async function ladeAusstellungen(heute: string = heuteIso()): Promise<readonly Ausstellung[]> {
  const alle = await ladeAlleAusstellungen();
  const kommend = alle.filter((eintrag) => eintrag.ende >= heute);
  if (kommend.length === 0) {
    throw new Error('Keine laufende oder kommende Ausstellung gefunden: Die Startseite braucht mindestens eine.');
  }
  return kommend;
}

/** Ausstellungen der Seite Aktuelles: alle laufenden und kommenden */
export async function ladeAktuelleSeite(heute: string = heuteIso()): Promise<readonly Ausstellung[]> {
  const roh = await abfrage<AUSSTELLUNGEN_QUERY_RESULT>('Ausstellungen', AUSSTELLUNGEN_QUERY);
  return roh.filter((eintrag) => (eintrag.ende ?? '') >= heute).map(ausstellungAusSanity);
}

export const heuteIso = (): string => new Date().toISOString().slice(0, 10);
