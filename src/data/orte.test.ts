import { describe, expect, it } from 'vitest';
import type { ARCHIV_QUERY_RESULT, ORTE_QUERY_RESULT } from '../sanity/sanity.types';
import type { Ausstellung } from './ausstellungen';
import { auftritteVon, baueOrte, kachelGroesse, ortZahlen, type Ort } from './orte';

const archiv = (teil: Partial<ARCHIV_QUERY_RESULT[number]>): ARCHIV_QUERY_RESULT[number] => ({
  _id: 'archiv-test',
  _type: 'archivEintrag',
  jahr: 2020,
  beginnJahr: null,
  reihenfolge: 10,
  inListe: true,
  titel: null,
  ortszeile: null,
  datum: null,
  link: null,
  haus: null,
  ortId: null,
  galerie: null,
  ...teil,
});

const ausstellung = (teil: Partial<Ausstellung>): Ausstellung =>
  ({
    schluessel: 'a',
    titel: 'Titel',
    haus: 'Haus',
    ort: 'ort-koeln',
    start: '2026-04-23',
    ende: '2026-10-25',
    ...teil,
  }) as Ausstellung;

const ortRoh = (teil: Partial<ORTE_QUERY_RESULT[number]>): ORTE_QUERY_RESULT[number] => ({
  _id: 'ort-koeln',
  _type: 'ort',
  stadt: 'Köln',
  land: 'Deutschland',
  kurztext: null,
  reihenfolge: 1,
  haeuser: ['Museum'],
  bild: null,
  ...teil,
});

describe('auftritteVon: Wortlaut der Liste', () => {
  it('lässt den Kurznamen in Klammern beim Haus einer Ausstellung weg', () => {
    const liste = auftritteVon(
      'ort-koeln',
      [],
      [ausstellung({ haus: 'Museum für Ostasiatische Kunst (MOK)' })],
      '2026-10-05',
    );
    expect(liste[0]?.haus).toBe('Museum für Ostasiatische Kunst');
  });

  it('nimmt das Feld Haus vor dem Galerie-Namen und lässt einen Titel mit dem Galerie-Namen weg', () => {
    const liste = auftritteVon(
      'ort-koeln',
      [
        archiv({
          haus: 'Galerie Udo Adam-Pasquale, Köln-Sülz',
          titel: 'Goldschmiede & Galerie Udo Adam-Pasquale',
          galerie: { _id: 'g', _type: 'galerie', name: 'Galerie Udo Adam-Pasquale' },
          ortId: 'ort-koeln',
        }),
      ],
      [],
      '2026-10-05',
    );
    expect(liste).toEqual([{ jahr: 2020, haus: 'Galerie Udo Adam-Pasquale, Köln-Sülz' }]);
  });
});

describe('auftritteVon', () => {
  const eintraege = [
    archiv({
      _id: 'a1',
      jahr: 2020,
      reihenfolge: 10,
      titel: 'Spinatschalen',
      haus: 'Galerie Karsten Greve',
      ortId: 'ort-koeln',
    }),
    archiv({
      _id: 'a2',
      jahr: 2020,
      reihenfolge: 20,
      titel: 'Buchpräsentation',
      haus: 'Galerie Karsten Greve',
      ortId: 'ort-koeln',
    }),
    archiv({
      _id: 'a3',
      jahr: 2025,
      beginnJahr: 2024,
      reihenfolge: 10,
      titel: 'SCHALEN',
      haus: 'Kirche',
      ortId: 'ort-koeln',
    }),
    archiv({ _id: 'a4', jahr: 2021, reihenfolge: 10, titel: 'Woanders', haus: 'Haus', ortId: 'ort-wien' }),
  ];

  it('zählt nach dem Jahr des Beginns, neueste zuerst, in Listenreihenfolge', () => {
    const auftritte = auftritteVon('ort-koeln', eintraege, [], '2026-10-05');
    expect(auftritte.map((a) => [a.jahr, a.titel])).toEqual([
      [2024, 'SCHALEN'],
      [2020, 'Spinatschalen'],
      [2020, 'Buchpräsentation'],
    ]);
  });
  it('nimmt Ausstellungen mit, aber erst ab ihrem Beginn', () => {
    const kommend = ausstellung({ start: '2026-11-06', ende: '2026-11-08' });
    expect(auftritteVon('ort-koeln', [], [kommend], '2026-10-05')).toEqual([]);
    expect(auftritteVon('ort-koeln', [], [kommend], '2026-11-06')).toHaveLength(1);
  });
  it('stellt Ausstellungen im selben Jahr vor Archiv-Einträge und nennt die Galerie als Haus', () => {
    const laufend = ausstellung({ start: '2020-01-01', galerie: 'Galerie Test' });
    const auftritte = auftritteVon('ort-koeln', eintraege, [laufend], '2026-10-05');
    expect(auftritte[1]).toEqual({ jahr: 2020, haus: 'Galerie Test', titel: 'Titel' });
  });
  it('lässt einen Titel weg, der nur das Haus wiederholt', () => {
    const wiederholt = archiv({ titel: 'Raum 49', haus: 'Raum 49', ortId: 'ort-koeln' });
    expect(auftritteVon('ort-koeln', [wiederholt], [], '2026-10-05')).toEqual([{ jahr: 2020, haus: 'Raum 49' }]);
  });
});

describe('baueOrte', () => {
  it('leitet die Kachelgröße aus der Reihenfolge ab', () => {
    expect(kachelGroesse(1)).toEqual({ gewicht: 'gross', breitAmHandy: false });
    expect(kachelGroesse(3)).toEqual({ gewicht: 'mittel', breitAmHandy: true });
    expect(kachelGroesse(6)).toEqual({ gewicht: 'klein', breitAmHandy: false });
  });
  it('bricht bei fehlenden Pflichtfeldern mit klarer Meldung ab', () => {
    expect(() => baueOrte([ortRoh({ land: '' })], [], [], '2026-10-05')).toThrow(/Ort „Köln“.*Pflicht/);
  });
  it('führt Orte ohne Bild ohne Kachel', () => {
    const [ort] = baueOrte([ortRoh({})], [], [], '2026-10-05');
    expect(ort?.bild).toBeUndefined();
    expect(ort?.haeuser).toEqual(['Museum']);
  });
});

describe('ortZahlen', () => {
  const ort = (jahre: number[]): Ort => ({
    schluessel: 'x',
    stadt: 'X',
    land: 'Y',
    gewicht: 'klein',
    breitAmHandy: false,
    reihenfolge: 1,
    haeuser: [],
    auftritte: jahre.map((jahr) => ({ jahr, haus: 'H' })),
  });
  it('nennt Zeitraum und Anzahl aus den Auftritten', () => {
    expect(ortZahlen(ort([2026, 2024, 2018]))).toEqual({ zeitraum: '2018–2026', anzahl: '3 Ausstellungen' });
  });
  it('nennt bei einem Jahr nur das Jahr und die Einzahl', () => {
    expect(ortZahlen(ort([2023]))).toEqual({ zeitraum: '2023', anzahl: '1 Ausstellung' });
  });
});
