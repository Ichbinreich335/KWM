/** Jahr-Text-Paar der `DateList`: Jahreszahl oder Stichwort links, ein Text oder mehrere Zeilen rechts */
export interface DatumEintrag {
  jahr: string;
  text: string | readonly string[];
}
