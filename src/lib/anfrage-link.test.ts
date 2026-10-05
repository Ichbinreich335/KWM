import { describe, expect, it } from 'vitest';
import { anfrageLink } from './anfrage-link';

describe('anfrageLink', () => {
  it('führt ohne Stück zum Formular', () => {
    expect(anfrageLink()).toBe('/besuch#anfrage');
  });
  it('kodiert Umlaute, Leerzeichen und Klammern', () => {
    expect(anfrageLink('Große Schale (H 9,5 cm)')).toBe(
      '/besuch?stueck=Gro%C3%9Fe%20Schale%20%28H%209%2C5%20cm%29#anfrage',
    );
  });
});
