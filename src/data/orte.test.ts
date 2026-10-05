import { describe, expect, it } from 'vitest';
import { ausstellungen } from './ausstellungen';
import { galerie, galerien, hausName, kacheln, orte, ortZahlen } from './orte';

const ort = (schluessel: string) => {
  const treffer = orte.find((eintrag) => eintrag.schluessel === schluessel);
  if (!treffer) throw new Error(`Ort fehlt: ${schluessel}`);
  return treffer;
};

describe('ortZahlen', () => {
  it('nennt Zeitraum und Anzahl aus den Auftritten', () => {
    expect(ortZahlen(ort('koeln'))).toEqual({ zeitraum: '2018–2026', anzahl: '7 Ausstellungen' });
  });
  it('nennt bei einem Jahr nur das Jahr und die Einzahl', () => {
    expect(ortZahlen(ort('zuerich'))).toEqual({ zeitraum: '2023', anzahl: '1 Ausstellung' });
  });
});

describe('Verweise', () => {
  it('jede Ausstellung verweist auf einen vorhandenen Ort und eine vorhandene Galerie', () => {
    for (const ausstellung of ausstellungen) {
      expect(
        orte.map((eintrag) => eintrag.schluessel),
        ausstellung.schluessel,
      ).toContain(ausstellung.ort);
      if (ausstellung.galerie) expect(() => galerie(ausstellung.galerie as string)).not.toThrow();
    }
  });
  it('jeder Auftritt und jedes Haus mit Galerie verweist auf einen vorhandenen Eintrag', () => {
    const schluessel = galerien.map((eintrag) => eintrag.schluessel);
    for (const eintrag of orte) {
      for (const auftritt of eintrag.auftritte) if (auftritt.galerie) expect(schluessel).toContain(auftritt.galerie);
      for (const haus of eintrag.haeuser) if ('galerie' in haus) expect(schluessel).toContain(haus.galerie);
    }
  });
  it('der Hausname einer Galerie kommt aus dem Galerie-Eintrag', () => {
    expect(hausName({ galerie: 'karsten-greve' })).toBe('Galerie Karsten Greve');
    expect(hausName({ name: 'Raum 49' })).toBe('Raum 49');
  });
});

describe('kacheln', () => {
  it('führt nur Orte mit Bild, in der Reihenfolge der Seite', () => {
    expect(kacheln.map((eintrag) => eintrag.stadt).slice(0, 3)).toEqual(['Köln', 'München', 'Tokio']);
    expect(kacheln).toHaveLength(13);
  });
});
