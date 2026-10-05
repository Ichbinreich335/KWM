import { describe, expect, it } from 'vitest';
import { edition, geschirr } from './manufaktur';
import { katalog, werkschau } from './werke';

const werkMasse = [...katalog, ...werkschau].flatMap((werk) =>
  werk.angaben.flatMap((angabe) => (angabe.masse ? angabe.masse.split(' · ') : [])),
);
const teilMasse = [...geschirr, ...edition]
  .flatMap((gruppe) => gruppe.saetze)
  .flatMap((satz) => satz.teile)
  .map((teil) => teil.masse)
  .filter(Boolean);

describe('Maßangaben', () => {
  it('schreiben den Durchmesser mit Ø, nie mit D', () => {
    for (const masse of [...werkMasse, ...teilMasse]) expect(masse).not.toMatch(/\bD\b/);
  });
  it('nennen Höhe und Durchmesser als „H … × Ø … cm“', () => {
    for (const masse of werkMasse) expect(masse).toMatch(/^H (ca\. )?[\d,]+( × Ø (ca\. )?[\d,]+)? cm$/);
  });
  it('lassen keine überflüssige Nachkommastelle „,0“ stehen', () => {
    for (const masse of [...werkMasse, ...teilMasse]) expect(masse).not.toMatch(/\d,0\b/);
  });
});
