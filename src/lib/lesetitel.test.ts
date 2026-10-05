import { describe, expect, it } from 'vitest';
import { lesetitel } from './lesetitel';

describe('lesetitel', () => {
  it('ersetzt geschützte Bindestriche und das Kaufmanns-Und', () => {
    expect(lesetitel('Ton\u2011in\u2011Ton & Feuer')).toBe('Ton-in-Ton und Feuer');
  });
  it('lässt gewöhnliche Titel unverändert', () => {
    expect(lesetitel('Meisterstücke')).toBe('Meisterstücke');
  });
});
