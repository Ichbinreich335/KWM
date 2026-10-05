import { describe, expect, it } from 'vitest';
import { hinweisSichtbar, statusText, tagAusIso } from './status';

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

describe('statusText über den Jahreswechsel', () => {
  const winterStart = tagAusIso('2026-12-20');
  const winterEnde = tagAusIso('2027-01-10');
  const winter = (heute: string) => statusText(winterStart, winterEnde, tagAusIso(heute));
  it('läuft am Silvestertag und am Neujahrstag', () => {
    expect(winter('2026-12-31')).toBe('Läuft · bis 10. Januar');
    expect(winter('2027-01-01')).toBe('Läuft · bis 10. Januar');
  });
  it('kündigt vor dem Start an und meldet nach dem Ende als beendet', () => {
    expect(winter('2026-12-19')).toBe('Ab 20. Dezember');
    expect(winter('2027-01-11')).toBe('Beendet am 10. Januar');
  });
});

describe('hinweisSichtbar', () => {
  const von = tagAusIso('2026-12-30');
  const bis = tagAusIso('2027-01-02');
  const sichtbar = (heute: string) => hinweisSichtbar(von, bis, tagAusIso(heute));
  it('zeigt den Hinweis von `von` bis `bis`, beide Tage eingeschlossen', () => {
    expect(sichtbar('2026-12-30')).toBe(true);
    expect(sichtbar('2026-12-31')).toBe(true);
    expect(sichtbar('2027-01-02')).toBe(true);
  });
  it('blendet ihn davor und danach aus, auch über den Jahreswechsel', () => {
    expect(sichtbar('2026-12-29')).toBe(false);
    expect(sichtbar('2027-01-03')).toBe(false);
  });
  it('blendet ihn bei ungültigem Datum aus', () => {
    expect(hinweisSichtbar(tagAusIso('kaputt'), bis, tagAusIso('2026-12-31'))).toBe(false);
  });
});

describe('tagAusIso', () => {
  it('liefert bei ungültiger Eingabe ein ungültiges Datum', () => {
    expect(Number.isNaN(tagAusIso('kaputt').getTime())).toBe(true);
  });
});
