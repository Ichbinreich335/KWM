import type { BildAngabe } from './typen';

/** Eigenschaften für `Bild.astro` aus einer Bildangabe; `widths` und `sizes` gehören zusammen */
export function bildProps(bild: BildAngabe) {
  return {
    src: bild.src,
    width: bild.breite,
    height: bild.hoehe,
    alt: bild.alt,
    ...(bild.widths && bild.sizes
      ? { widths: [...bild.widths], sizes: bild.sizes }
      : bild.sizes
        ? { sizes: bild.sizes }
        : {}),
  };
}
