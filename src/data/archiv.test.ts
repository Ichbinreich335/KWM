import { describe, expect, it } from 'vitest';
import type { ARCHIV_QUERY_RESULT } from '../sanity/sanity.types';
import { baueArchivAuswahl } from './archiv';

const eintrag = (teil: Partial<ARCHIV_QUERY_RESULT[number]>): ARCHIV_QUERY_RESULT[number] => ({
  _id: 'archiv-test',
  _type: 'archivEintrag',
  jahr: 2025,
  beginnJahr: null,
  reihenfolge: 10,
  inListe: true,
  titel: 'Titel',
  ortszeile: 'Ort, Stadt',
  datum: '1.–2. Mai',
  link: null,
  haus: null,
  ortId: null,
  galerie: null,
  ...teil,
});

describe('baueArchivAuswahl', () => {
  it('gruppiert nach Jahr, neueste zuerst, und setzt Teaser und Jahreslink dazu', () => {
    const jahre = baueArchivAuswahl([
      eintrag({ jahr: 2024 }),
      eintrag({ jahr: 2025 }),
      eintrag({ jahr: 2025, titel: 'Zwei' }),
    ]);
    expect(jahre.map((jahr) => [jahr.jahr, jahr.eintraege.length])).toEqual([
      ['2025', 2],
      ['2024', 1],
    ]);
    expect(jahre[0]?.alle.text).toBe('Alle Angaben zu 2025');
  });
  it('lässt Einträge weg, die nur für die Orte zählen', () => {
    expect(baueArchivAuswahl([eintrag({ inListe: false })])).toEqual([]);
  });
  it('nimmt das Haus als Titel, wenn der Titel fehlt', () => {
    expect(baueArchivAuswahl([eintrag({ titel: null, haus: 'Gallery Tokyo' })])[0]?.eintraege[0]?.titel).toBe(
      'Gallery Tokyo',
    );
  });
  it('bricht bei unvollständigen Einträgen mit klarer Meldung ab', () => {
    expect(() => baueArchivAuswahl([eintrag({ ortszeile: null })])).toThrow(/Archiv-Eintrag „Titel“/);
  });
});
