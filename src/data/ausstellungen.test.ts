import { describe, expect, it } from 'vitest';
import { aktuellesFakten, type Ausstellung } from './ausstellungen';

const basis = {
  schluessel: 'a',
  titel: 'T',
  art: 'Kirche',
  haus: 'Dom',
  stadt: 'Wesel',
  ort: 'o',
  start: '2026-08-16',
  ende: '2026-10-31',
} as Ausstellung;

describe('aktuellesFakten', () => {
  it('führt Ort, Eröffnung, Zeiten und Partner in fester Reihenfolge mit festen Bezeichnungen', () => {
    const fakten = aktuellesFakten({
      ...basis,
      adresse: ['Großer Markt', '46483 Wesel'],
      eroeffnung: ['Sonntag'],
      oeffnungszeiten: ['Di–So'],
      oeffnungszeitenLabel: 'Öffnungszeiten Dom',
      kooperation: ['Verein'],
    });
    expect(fakten?.map((fakt) => fakt.label)).toEqual(['Ort', 'Eröffnung', 'Öffnungszeiten Dom', 'In Kooperation mit']);
    expect(fakten?.[0]?.wert).toEqual(['Dom', 'Großer Markt, 46483 Wesel']);
  });
  it('gibt ohne Eröffnung, Zeiten und Partner keine Tafel', () => {
    expect(aktuellesFakten(basis)).toBeUndefined();
  });
});
