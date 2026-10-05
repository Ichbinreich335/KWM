// Fachliche Konstanten und Status-Farben. Einzige Quelle für alle Blöcke.

export const PAGE_SIZE = 100;

export const VERFUEGBAR = "verfügbar";
export const RESERVIERT = "reserviert";
export const VERKAUFT = "verkauft";
export const KOMMISSION = "in Kommission";
export const AUSGESTELLT = "ausgestellt";
// Zustände im Mengenlager, in der Reihenfolge des Werkstattablaufs: roh → Schrühbrand → geschrüht → Glasurbrand → glasiert.
export const ROH = "roh";
export const GESCHRUEHT = "geschrüht";
export const GLASIERT = "glasiert";
export const ZUSTAENDE = [ROH, GESCHRUEHT, GLASIERT];

// Programme der Werkstatt laut Anfrageformular: Editionen (Nr. 2001 ff.) und Geschirr (Nr. 1 ff.).
// In der Datenbank heißt das Geschirr „Manufakturprogramm“, in der App „Geschirr“ (Begriff der Werkstatt).
export const EDITION_PROGRAMM = "Edition";
export const MANUFAKTUR_PROGRAMM = "Manufakturprogramm";
export const GESCHIRR = "Geschirr";

export function serieVon(programm: string): string {
  return programm === MANUFAKTUR_PROGRAMM ? GESCHIRR : programm;
}
export const AUSSER_HAUS_ORT = "Außer Haus";

export const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;
