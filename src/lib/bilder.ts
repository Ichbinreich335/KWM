import type { ImageMetadata } from 'astro';

const bilder = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/**/*.{webp,jpg,png}', { eager: true });

/** Löst einen Seitenpfad wie `/img/kwm/kannen.webp` zu den Bilddaten unter `src/assets/img/` auf. */
export function bildMetadaten(src: string): ImageMetadata {
  const bild = bilder[`/src/assets${src}`];
  if (!bild) throw new Error(`Bild nicht gefunden: ${src}`);
  return bild.default;
}
