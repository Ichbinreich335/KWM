import type { Fakt } from './typen';

/** Wie das Manufakturprogramm entsteht */
export const methodenfakten: readonly Fakt[] = [
  { label: 'Masse', wert: 'Westerwälder Steinzeug, auf der Töpferscheibe gedreht' },
  { label: 'Viereckteller', wert: 'Aus Platten über Gipsmodellen geformt' },
  { label: 'Schrühbrand', wert: 'Elektroofen, etwa 950 °C' },
  { label: 'Glasurbrand', wert: 'Gasofen, ca. 1300 °C, reduzierende Atmosphäre' },
];

/** Adresse, Öffnungszeiten, Nahverkehr und Kontakt (Kontaktdaten wandern in D4 nach `kontakt.ts`) */
export const ortsfakten: readonly Fakt[] = [
  { label: 'Adresse', wert: ['Keramische Werkstatt Margaretenhöhe GmbH', 'Bullmannaue 19, 45327 Essen'] },
  {
    label: 'Öffnungszeiten',
    wert: ['Montag bis Freitag 9–17 Uhr', 'Samstag 11–15 Uhr', 'ansonsten nach Vereinbarung'],
  },
  { label: 'Nahverkehr', wert: 'Haltestelle Katernberg Süd' },
  {
    label: 'Kontakt',
    links: [
      { href: 'tel:+49201305080', text: '+49 201 30 50 80' },
      { href: 'mailto:kontakt@kwm1924.de', text: 'kontakt@kwm1924.de' },
    ],
  },
];
