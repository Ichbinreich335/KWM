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

/** „6. bis 8. November 2026“, über Monatsgrenzen „23. April bis 25. Oktober 2026“ (Jahr nur am Ende, wenn beide gleich sind). */
export function zeitraumMitBis(start: string, ende: string): string {
  const von = teile(start);
  const bis = teile(ende);
  const anfang = von.monatNr === bis.monatNr && von.jahr === bis.jahr ? `${von.tag}.` : `${von.tag}. ${von.monat}`;
  return `${anfang} bis ${bis.tag}. ${bis.monat} ${bis.jahr}`;
}

/**
 * Kurzform mit Gedankenstrich als Zeilen: im selben Monat eine Zeile „6.–8. November 2026“,
 * sonst zwei Zeilen „23. April –“ und „25. Oktober 2026“.
 */
export function zeitraumKurz(start: string, ende: string): string[] {
  const von = teile(start);
  const bis = teile(ende);
  if (von.monatNr === bis.monatNr && von.jahr === bis.jahr) return [`${von.tag}.–${bis.tag}. ${bis.monat} ${bis.jahr}`];
  return [`${von.tag}. ${von.monat} –`, `${bis.tag}. ${bis.monat} ${bis.jahr}`];
}
