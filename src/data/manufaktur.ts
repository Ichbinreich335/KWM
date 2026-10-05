import type { DatumEintrag } from './typen';

/** Arbeitsweise der Manufaktur: Stichwort links, Erklärung rechts */
export const arbeitsweise: readonly DatumEintrag[] = [
  {
    jahr: 'Masse',
    text: 'Westerwälder Steinzeugmasse, auf der Töpferscheibe gedreht. Die Viereckteller werden aus Platten über Gipsmodellen geformt.',
  },
  { jahr: '950 °C', text: 'Schrühbrand im Elektroofen.' },
  {
    jahr: '1300 °C',
    text: 'Glasurbrand im Gasofen in reduzierender Atmosphäre – für matte bis glänzende Oberflächen und aufeinander abgestimmte Farben.',
  },
  { jahr: 'Umwelt', text: 'Es werden ausschließlich umweltschonende Materialien und Fertigungsverfahren angewendet.' },
  { jahr: 'Gebrauch', text: 'Alle Stücke sind spülmaschinenfest.' },
];
