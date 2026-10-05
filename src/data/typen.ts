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

/**
 * Bild aus den Inhalten: Pfad, Alternativtext und gegebenenfalls Bildunterschrift (wie das Bildfeld in Sanity).
 * Maße kommen aus den Bilddaten; wie groß es erscheint und wie es lädt (`sizes`, `widths`, Priorität), legt die Komponente fest.
 */
export interface Foto {
  /** Pfad unter `src/assets/img/`, wie ihn `Bild.astro` auflöst */
  src: string;
  alt: string;
  unterschrift?: string;
}

/** Angabe der `FactsList`: Bezeichnung mit Wert; der Wert ist eine Zeile oder mehrere Zeilen mit Umbruch, dazu optional Links */
export interface Fakt {
  label: string;
  wert?: string | readonly string[];
  links?: readonly { href: string; text: string }[];
}

/** Ein Fach des Regals: Foto der Warengruppe mit Beschriftung darunter */
export interface Regalfach {
  bild: Foto;
  beschriftung: string;
}
