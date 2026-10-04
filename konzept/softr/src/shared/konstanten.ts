// Fachliche Konstanten und Status-Farben. Einzige Quelle für alle Blöcke.

export const PAGE_SIZE = 100;

export const VERFUEGBAR = "verfügbar";
export const RESERVIERT = "reserviert";
export const VERKAUFT = "verkauft";
export const KOMMISSION = "in Kommission";
export const AUSGESTELLT = "ausgestellt";
export const ROHLING = "Rohling";
export const GLASIERT = "glasiert";

// Programme der Werkstatt laut Anfrageformular: Editionen (Nr. 2001 ff.) und Geschirr (Nr. 1 ff.).
export const EDITION_PROGRAMM = "Edition";
export const MANUFAKTUR_PROGRAMM = "Manufakturprogramm";
export const AUSSER_HAUS_ORT = "Außer Haus";

export const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;
