import type { DatumEintrag, Fakt } from './typen';

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

/** Kurzfakten zum Manufakturprogramm auf der Startseite */
export const kurzfakten: readonly Fakt[] = [
  { label: 'Masse', wert: 'Westerwälder Steinzeug, auf der Töpferscheibe gedreht' },
  { label: 'Schrühbrand', wert: 'Elektroofen, etwa 950 °C' },
  { label: 'Glasurbrand', wert: 'Gasofen, ca. 1300 °C, reduzierende Atmosphäre' },
  { label: 'Programm', wert: 'Vom Teller bis zum Krug, dazu die Edition mit Vasen, Pflanzgefäßen und Dosen' },
  { label: 'Gebrauch', wert: 'Alle Stücke sind spülmaschinenfest' },
];
