// Sanity-Bild in die Bildangabe der Website übersetzen. Der Build lädt das Bild von cdn.sanity.io und
// verarbeitet es wie ein lokales (`Bild.astro`), im Browser entsteht keine Anfrage an Sanity.
import { createImageUrlBuilder } from '@sanity/image-url';
import type { BildAngabe } from '../data/typen';
import { SANITY_PROJEKT } from './projekt';

const urlBuilder = createImageUrlBuilder(SANITY_PROJEKT);

/** Bildausschnitt als Anteile des Originals, wie ihn Sanity speichert */
interface Ausschnitt {
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
}

/** Bild einer Abfrage (Fragment `BILD` in `queries.ts`); fehlt das Bild, ist `asset` leer */
export interface SanityBild {
  asset: { _id: string; url: string | null; breite: number | null; hoehe: number | null } | null;
  alt: string | null;
  hotspot?: { x: number | null; y: number | null; width: number | null; height: number | null } | null;
  crop?: Ausschnitt | null;
}

/** Größe und Quelle des Bildes nach dem Zuschnitt (`crop`); der Fokuspunkt (`hotspot`) wirkt nur beim Zuschneiden per URL */
export function bildQuelle(bild: SanityBild): { url: string; breite: number; hoehe: number } | undefined {
  const { asset, crop } = bild;
  if (!asset?.url || !asset.breite || !asset.hoehe) return undefined;
  const anteil = (seite: keyof Ausschnitt) => crop?.[seite] ?? 0;
  const breite = Math.round(asset.breite * (1 - anteil('left') - anteil('right')));
  const hoehe = Math.round(asset.hoehe * (1 - anteil('top') - anteil('bottom')));
  // Die CDN kodiert jede Ausgabe neu und nähme sonst als Standard ein verlustbehaftetes JPEG. PNG hält die Pixel
  // des Originals, Astro kodiert danach genau einmal ins Ausgabeformat. Ein Zuschnitt hängt `rect=…` an die Adresse.
  const url = urlBuilder
    .image({ asset: { _ref: asset._id }, ...(crop ? { crop } : {}) })
    .format('png')
    .url();
  return { url, breite, hoehe };
}

/** Wie `bildQuelle`, aber mit Pflichtfehler: Ein Bild ohne Datei darf den Build nicht still durchrutschen */
export function pflichtBildQuelle(bild: SanityBild | null | undefined, wo: string) {
  const quelle = bild ? bildQuelle(bild) : undefined;
  if (!bild || !quelle) throw new Error(`${wo}: Das Bild fehlt oder hat keine Datei.`);
  return { ...quelle, alt: bild.alt ?? '' };
}

/** Breiten, die Astro für lokale Bilder als Kandidaten bildet, solange das Original sie hergibt */
const KANDIDATEN_BREITEN = [640, 750, 828, 1080, 1280, 1668, 2048, 2560, 3840] as const;

/** Darstellung eines Bildes: größte Breite, Zwischenstufen und `sizes` gehören zur Stelle der Seite, nicht zum Bild */
export interface Darstellung {
  /** Obergrenze der Anzeigebreite in Pixeln; kleinere Originale bleiben unverändert */
  maxBreite?: number;
  /** Zwischenstufen der srcset-Kandidaten, die kleiner als das Original sind (Anzeigebreite und Original kommen dazu) */
  stufen?: readonly number[];
  sizes?: string;
}

/**
 * Bildangabe mit Kandidatenliste. Bei entfernten Bildern kennt Astro die Größe des Originals nicht und würde
 * über das Original hinaus hochrechnen; deshalb stehen `widths` und `sizes` immer fest dabei.
 */
export function bildAngabe(bild: SanityBild | null | undefined, wo: string, darstellung: Darstellung = {}): BildAngabe {
  const quelle = pflichtBildQuelle(bild, wo);
  const breite = Math.min(quelle.breite, darstellung.maxBreite ?? quelle.breite);
  const hoehe = Math.round((breite * quelle.hoehe) / quelle.breite);
  const verkleinert = breite < quelle.breite;
  const stufen = verkleinert
    ? (darstellung.stufen ?? []).filter((stufe) => stufe < breite)
    : KANDIDATEN_BREITEN.filter((stufe) => stufe < quelle.breite);
  const widths = [...new Set([...stufen, breite, quelle.breite])].sort((a, b) => a - b);
  return {
    src: quelle.url,
    breite,
    hoehe,
    alt: quelle.alt,
    widths,
    sizes: darstellung.sizes ?? `(min-width: ${breite}px) ${breite}px, 100vw`,
  };
}
