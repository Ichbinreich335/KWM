/** Dokumenttypen, die es nur als feste Einzeldokumente gibt. */
export const EINZELNE_DOKUMENTE = new Set(['seite', 'werkstatt']);

/** Feste IDs der Seiten-Einträge, wie sie die Website später abfragt. */
export const SEITEN = [
  { id: 'startseite', titel: 'Startseite' },
  { id: 'aktuelles', titel: 'Aktuelles' },
  { id: 'meisterstuecke', titel: 'Meisterstücke' },
  { id: 'manufaktur', titel: 'Manufakturprogramm' },
  { id: 'young-jae-lee', titel: 'Young-Jae Lee' },
  { id: 'werkstatt', titel: 'Die Werkstatt' },
  { id: 'besuch', titel: 'Besuch' },
] as const;

/** Feste ID des Werkstatt-Dokuments (Kontakt und Öffnungszeiten). */
export const WERKSTATT_ID = 'werkstatt-kontakt';
