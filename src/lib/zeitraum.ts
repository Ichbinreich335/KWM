import { MONATE, tagAusIso } from './status';

interface Teile {
  tag: number;
  monat: string;
  monatNr: number;
  jahr: number;
}

function teile(iso: string): Teile {
  const datum = tagAusIso(iso);
  return {
    tag: datum.getDate(),
    monat: MONATE[datum.getMonth()] ?? '',
    monatNr: datum.getMonth(),
    jahr: datum.getFullYear(),
  };
}

/**
 * „6. bis 8. November 2026“, über Monatsgrenzen „23. April bis 25. Oktober 2026“. Das Jahr steht nur am Ende,
 * außer der Zeitraum geht über den Jahreswechsel: „28. Dezember 2026 bis 3. Januar 2027“.
 */
export function zeitraumMitBis(start: string, ende: string): string {
  const von = teile(start);
  const bis = teile(ende);
  const gleichesJahr = von.jahr === bis.jahr;
  const anfang =
    gleichesJahr && von.monatNr === bis.monatNr
      ? `${von.tag}.`
      : `${von.tag}. ${von.monat}${gleichesJahr ? '' : ` ${von.jahr}`}`;
  return `${anfang} bis ${bis.tag}. ${bis.monat} ${bis.jahr}`;
}

/**
 * Kurzform mit Gedankenstrich als Zeilen: im selben Monat eine Zeile „6.–8. November 2026“,
 * sonst zwei Zeilen „23. April –“ und „25. Oktober 2026“; über den Jahreswechsel trägt auch die erste Zeile das Jahr.
 */
export function zeitraumKurz(start: string, ende: string): string[] {
  const von = teile(start);
  const bis = teile(ende);
  if (von.monatNr === bis.monatNr && von.jahr === bis.jahr) return [`${von.tag}.–${bis.tag}. ${bis.monat} ${bis.jahr}`];
  const vonJahr = von.jahr === bis.jahr ? '' : ` ${von.jahr}`;
  return [`${von.tag}. ${von.monat}${vonJahr} –`, `${bis.tag}. ${bis.monat} ${bis.jahr}`];
}
