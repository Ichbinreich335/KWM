import { describe, expect, it } from 'vitest';
import { statusText, tagAusIso } from './status';

const start = tagAusIso('2026-08-16');
const ende = tagAusIso('2026-10-31');
const status = (heute: string) => statusText(start, ende, tagAusIso(heute));

describe('statusText', () => {
  it('kündigt eine kommende Ausstellung an', () => {
    expect(status('2026-08-15')).toBe('Ab 16. August');
  });
  it('zählt Starttag und Endtag als laufend', () => {
    expect(status('2026-08-16')).toBe('Läuft · bis 31. Oktober');
    expect(status('2026-10-31')).toBe('Läuft · bis 31. Oktober');
  });
  it('meldet eine vergangene Ausstellung als beendet', () => {
    expect(status('2026-11-01')).toBe('Beendet am 31. Oktober');
  });
  it('nutzt die Umlaut-Monate', () => {
    expect(statusText(tagAusIso('2026-03-02'), tagAusIso('2026-03-09'), tagAusIso('2026-03-01'))).toBe('Ab 2. März');
  });
});

describe('tagAusIso', () => {
  it('liefert bei ungültiger Eingabe ein ungültiges Datum', () => {
    expect(Number.isNaN(tagAusIso('kaputt').getTime())).toBe(true);
  });
});
