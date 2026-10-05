import { describe, expect, it } from 'vitest';
import { kontakt, oeffnungszeitKurz, oeffnungszeitZeilen, tageText, zeitText, type Oeffnungszeit } from './kontakt';

const werktags: Oeffnungszeit = { tagVon: 'montag', tagBis: 'freitag', von: '09:00', bis: '17:00' };
const samstag: Oeffnungszeit = { tagVon: 'samstag', von: '11:00', bis: '15:00' };

describe('tageText', () => {
  it('schreibt einen Bereich lang und kurz', () => {
    expect(tageText(werktags, 'lang')).toBe('Montag bis Freitag');
    expect(tageText(werktags, 'kurz')).toBe('Mo–Fr');
  });
  it('schreibt einen einzelnen Tag ohne Bereich', () => {
    expect(tageText(samstag, 'lang')).toBe('Samstag');
    expect(tageText(samstag, 'kurz')).toBe('Sa');
  });
});

describe('zeitText', () => {
  it('lässt führende Nullen und volle Stunden weg', () => {
    expect(zeitText(werktags)).toBe('9–17 Uhr');
  });
  it('behält Minuten, die nicht null sind', () => {
    expect(zeitText({ tagVon: 'sonntag', von: '10:30', bis: '16:00' })).toBe('10:30–16 Uhr');
  });
});

describe('Öffnungszeiten', () => {
  it('liefert Zeilen und Kurzform', () => {
    expect(oeffnungszeitZeilen([werktags, samstag], 'lang')).toEqual([
      { tage: 'Montag bis Freitag', zeit: '9–17 Uhr' },
      { tage: 'Samstag', zeit: '11–15 Uhr' },
    ]);
    expect(oeffnungszeitKurz([werktags, samstag])).toEqual(['Mo–Fr 9–17 Uhr', 'Sa 11–15 Uhr']);
  });
});

describe('kontakt', () => {
  it('leitet Verweise und Zeiten aus dem Dokument ab', () => {
    expect(kontakt.telefonHref).toBe('tel:+49201305080');
    expect(kontakt.mailHref).toBe('mailto:kontakt@kwm1924.de');
    expect(kontakt.zeitenKurz).toBe('Mo–Fr 9–17 Uhr, Sa 11–15 Uhr');
    expect(kontakt.zeiten).toEqual(['Mo–Fr 9–17 Uhr', 'Sa 11–15 Uhr', 'sonst nach Vereinbarung']);
    expect(kontakt.adresse).toEqual(['Bullmannaue 19, 45327 Essen', 'auf dem Gelände der Zeche Zollverein']);
  });
});
