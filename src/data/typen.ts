/** Jahr-Text-Paar der `DateList`: Jahreszahl oder Stichwort links, ein Text oder mehrere Zeilen rechts */
export interface DatumEintrag {
  jahr: string;
  text: string | readonly string[];
}

/** Arbeitsschritt: Stichwort mit Erklärung */
export interface Schritt {
  titel: string;
  text: string;
}

/** Angabe der `FactsList`: Bezeichnung mit Wert; der Wert ist eine Zeile oder mehrere Zeilen mit Umbruch, dazu optional Links */
export interface Fakt {
  label: string;
  wert?: string | readonly string[];
  links?: readonly { href: string; text: string }[];
}
