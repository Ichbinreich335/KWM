import { describe, expect, it } from 'vitest';
import { bildAngabe, bildQuelle, type SanityBild } from './bild';

const bild = (breite: number, hoehe: number, teil: Partial<SanityBild> = {}): SanityBild => ({
  asset: {
    _id: 'image-abc-' + breite + 'x' + hoehe + '-webp',
    url: `https://cdn.sanity.io/images/135lyh9t/production/abc-${breite}x${hoehe}.webp`,
    breite,
    hoehe,
  },
  alt: 'Alt',
  ...teil,
});

describe('bildAngabe', () => {
  it('übernimmt Größe des Originals und bildet Kandidaten bis dorthin, nicht darüber', () => {
    const angabe = bildAngabe(bild(937, 1040), 'Test');
    expect(angabe).toMatchObject({ breite: 937, hoehe: 1040, alt: 'Alt' });
    expect(angabe.widths).toEqual([640, 750, 828, 937]);
    expect(angabe.sizes).toBe('(min-width: 937px) 937px, 100vw');
  });
  it('zeigt große Originale verkleinert mit Zwischenstufen', () => {
    const angabe = bildAngabe(bild(2000, 931), 'Test', { maxBreite: 1400, stufen: [960], sizes: 'S' });
    expect(angabe).toMatchObject({ breite: 1400, hoehe: 652, sizes: 'S' });
    expect(angabe.widths).toEqual([960, 1400, 2000]);
  });
  it('lässt ein kleines Original unverändert', () => {
    expect(bildAngabe(bild(533, 400), 'Test', { maxBreite: 640 }).widths).toEqual([533]);
  });
  it('bricht ohne Bilddatei mit klarer Meldung ab', () => {
    expect(() => bildAngabe({ asset: null, alt: null }, 'Ausstellung „X“, Hauptbild')).toThrow(
      /Ausstellung „X“, Hauptbild/,
    );
  });
});

describe('bildQuelle', () => {
  it('fordert ohne Zuschnitt das Original als PNG an', () => {
    expect(bildQuelle(bild(600, 400))?.url).toBe(
      'https://cdn.sanity.io/images/135lyh9t/production/abc-600x400.webp?fm=png',
    );
  });
  it('rechnet mit Zuschnitt die Größe um und hängt den Ausschnitt an die Adresse', () => {
    const quelle = bildQuelle(bild(1000, 500, { crop: { top: 0, bottom: 0.2, left: 0.1, right: 0.1 } }));
    expect(quelle).toMatchObject({ breite: 800, hoehe: 400 });
    expect(quelle?.url).toContain('rect=');
  });
});
