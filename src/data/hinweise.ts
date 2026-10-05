// Hinweise unter „Aktuell“ (Sanity-Typ `hinweis`): erscheinen nur zwischen `von` und `bis`

export interface Hinweis {
  text: string;
  /** Erster und letzter Tag der Anzeige, `JJJJ-MM-TT`, jeweils einschließlich */
  von: string;
  bis: string;
}

export const hinweise: readonly Hinweis[] = [
  {
    text: 'Am Samstag, 3. Oktober 2026 bleibt die Werkstatt geschlossen. Ab Montag, 5. Oktober sind wir wieder wie gewohnt für Sie da.',
    von: '2026-10-01',
    bis: '2026-10-04',
  },
];
