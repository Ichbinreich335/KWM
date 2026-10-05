import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { glasuren } from './glasuren';

// Die Farbskala setzt Grund- und Schriftfarbe über Klassen statt `style`-Attribut (CSP);
// die Werte stehen im Stil der Komponente und müssen zu den Daten passen.
describe('SigFarbskala', () => {
  const css = readFileSync(new URL('../components/SigFarbskala.astro', import.meta.url), 'utf8').toLowerCase();
  it.each(glasuren)('Klasse für $schluessel trägt Grund- und Schriftfarbe der Daten', (glasur) => {
    const regel = new RegExp(`\\.scale__band--${glasur.schluessel}\\s*\\{[^}]*\\}`).exec(css)?.[0] ?? '';
    expect(regel).toContain(`--c: ${glasur.farbe.grund.toLowerCase()};`);
    expect(regel).toContain(`--t: ${glasur.schriftfarbe.toLowerCase()};`);
  });
  it('jede Glasur mit Sprenkeln nennt deren Art, keine ohne Sprenkel', () => {
    for (const glasur of glasuren)
      expect(Boolean(glasur.sprenkelart), glasur.schluessel).toBe(Boolean(glasur.sprenkel));
  });
});
