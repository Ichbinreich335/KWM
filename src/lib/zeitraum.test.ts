import { describe, expect, it } from 'vitest';
import { zeitraumKurz, zeitraumMitBis } from './zeitraum';

describe('zeitraumMitBis', () => {
  it('nennt den Monat nur einmal, wenn Start und Ende im selben Monat liegen', () => {
    expect(zeitraumMitBis('2026-11-06', '2026-11-08')).toBe('6. bis 8. November 2026');
  });
  it('nennt beide Monate über eine Monatsgrenze', () => {
    expect(zeitraumMitBis('2026-04-23', '2026-10-25')).toBe('23. April bis 25. Oktober 2026');
  });
  it('nennt über den Jahreswechsel beide Jahre', () => {
    expect(zeitraumMitBis('2026-12-28', '2027-01-03')).toBe('28. Dezember 2026 bis 3. Januar 2027');
  });
  it('nennt auch bei gleichem Monat in zwei Jahren beide Jahre', () => {
    expect(zeitraumMitBis('2026-01-10', '2027-01-08')).toBe('10. Januar 2026 bis 8. Januar 2027');
  });
});

describe('zeitraumKurz', () => {
  it('gibt im selben Monat eine Zeile zurück', () => {
    expect(zeitraumKurz('2026-11-06', '2026-11-08')).toEqual(['6.–8. November 2026']);
  });
  it('bricht über eine Monatsgrenze nach dem Gedankenstrich um', () => {
    expect(zeitraumKurz('2026-08-16', '2026-10-31')).toEqual(['16. August –', '31. Oktober 2026']);
  });
  it('setzt über den Jahreswechsel das Jahr in beide Zeilen', () => {
    expect(zeitraumKurz('2026-12-28', '2027-01-03')).toEqual(['28. Dezember 2026 –', '3. Januar 2027']);
  });
});
