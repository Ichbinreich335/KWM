import { BRENNTEMPERATUR, grad } from './brenntemperatur';
import { kontakt, oeffnungszeitZeilen } from './kontakt';
import type { Fakt } from './typen';

/** Wie das Manufakturprogramm entsteht */
export const methodenfakten: readonly Fakt[] = [
  { label: 'Masse', wert: 'Westerwälder Steinzeug, auf der Töpferscheibe gedreht' },
  { label: 'Viereckteller', wert: 'Aus Platten über Gipsmodellen geformt' },
  { label: 'Schrühbrand', wert: `Elektroofen, etwa ${grad(BRENNTEMPERATUR.schruehbrand)}` },
  { label: 'Glasurbrand', wert: `Gasofen, ca. ${grad(BRENNTEMPERATUR.glasurbrandGas)}, reduzierende Atmosphäre` },
];

/** Adresse, Öffnungszeiten, Nahverkehr und Kontakt, alles aus `kontakt.ts` */
export const ortsfakten: readonly Fakt[] = [
  { label: 'Adresse', wert: [kontakt.firma, kontakt.anschrift] },
  {
    label: 'Öffnungszeiten',
    wert: [
      ...oeffnungszeitZeilen(kontakt.oeffnungszeiten, 'lang').map(({ tage, zeit }) => `${tage} ${zeit}`),
      `sonst ${kontakt.hinweisZeiten}`,
    ],
  },
  { label: 'Nahverkehr', wert: kontakt.nahverkehr },
  {
    label: 'Kontakt',
    links: [
      { href: kontakt.telefonHref, text: kontakt.telefon },
      { href: kontakt.mailHref, text: kontakt.mail },
    ],
  },
];
