import { describe, expect, it } from 'vitest';
import { BRENNTEMPERATUR, grad } from './brenntemperatur';
import { angabeText, katalog, stueckBezeichnung } from './werke';
import { SCHMALES_LEERZEICHEN } from '../lib/zeichen';

describe('grad', () => {
  it('hält Zahl und Einheit mit dem schmalen geschützten Leerzeichen zusammen', () => {
    expect(grad(1300)).toBe('1300\u202F°C');
    expect(grad(BRENNTEMPERATUR.schruehbrand)).toContain(SCHMALES_LEERZEICHEN);
  });
});

describe('angabeText', () => {
  it('trennt die Teile mit Mittelpunkt und lässt fehlende aus', () => {
    expect(angabeText({ masse: 'H 10 cm', glasur: 'Feldspat-Glasur', jahr: '2004' })).toBe(
      'H 10 cm · Feldspat-Glasur · 2004',
    );
  });
  it('stellt den Ort vor das Jahr', () => {
    expect(angabeText({ masse: 'H 10 cm', ort: 'Essen', jahr: '2006' })).toBe('H 10 cm · Essen 2006');
  });
  it('gibt den Brand mit schmalem Leerzeichen vor °C aus', () => {
    expect(angabeText({ brand: `Holzofen ${grad(1260)} · Reduktion` })).toBe('Holzofen 1260\u202F°C · Reduktion');
  });
  it('gibt für eine leere Angabe einen leeren Text', () => {
    expect(angabeText({})).toBe('');
  });
});

describe('stueckBezeichnung', () => {
  it('fasst Titel und Angaben zusammen, mehrere Zeilen mit Semikolon', () => {
    const werk = katalog.find((eintrag) => eintrag.angaben.length > 1);
    expect(werk).toBeDefined();
    if (!werk) return;
    const text = stueckBezeichnung(werk);
    expect(text.startsWith(`${werk.titel} (`)).toBe(true);
    expect(text.split('; ')).toHaveLength(werk.angaben.length);
  });
  it('ersetzt das schmale Leerzeichen durch ein normales, damit das Formularfeld sauber bleibt', () => {
    const mitBrand = katalog.find((eintrag) => eintrag.angaben.some((angabe) => angabe.brand?.includes('°C')));
    expect(mitBrand).toBeDefined();
    if (!mitBrand) return;
    const text = stueckBezeichnung(mitBrand);
    expect(text).not.toContain(SCHMALES_LEERZEICHEN);
    expect(text).toMatch(/\d{4} °C/);
  });
});
