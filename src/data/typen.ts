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
  /** Ergänzende Angabe; die Kurzfassung am Handy lässt sie weg */
  ergaenzend?: boolean;
}

export interface BildAngabe {
  /** Pfad unter `src/assets/img/`, wie ihn `Bild.astro` auflöst */
  src: string;
  breite: number;
  hoehe: number;
  alt: string;
  /** Breiten der srcset-Kandidaten; gehört mit `sizes` zusammen */
  widths?: readonly number[];
  sizes?: string;
}

/** Ein Fach des Regals: Foto der Warengruppe mit Beschriftung darunter */
export interface Regalfach {
  bild: BildAngabe;
  beschriftung: string;
  /** `prioritaet`: Bild im ersten Bildschirm (hohe Priorität); `sofort`: nicht verzögert laden */
  laden: 'prioritaet' | 'sofort';
}
