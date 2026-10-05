// Inhalte nur für die Konzeptseiten, aus index.astro (Orte), aktuelles.astro und konzept/CONTENT-FUNDE.md.

interface Vertretung {
  name: string;
  stadt: string;
  /** Seit wann, wörtlich nach CONTENT-FUNDE; leer, wenn nichts belegt ist. */
  seit?: string;
  adresse?: string;
  href: string;
  ausstellungen: { jahr: string; titel: string }[];
}

export const vertretungen: [Vertretung, Vertretung] = [
  {
    name: 'Galerie Jahn und Jahn',
    stadt: 'München',
    seit: 'Ausstellungen laut Künstlerseite der Galerie seit 1988',
    adresse: 'Baaderstraße 56C, 80469 München',
    href: 'https://www.jahnundjahn.com/artists/young-jae-lee',
    ausstellungen: [
      { jahr: '2026', titel: '„Young-Jae Lee“' },
      { jahr: '2025', titel: '„Young-Jae Lee: Keramik“' },
      { jahr: '2022', titel: '„Young-Jae LEE – Spindelvasen und Spinatschalen“' },
    ],
  },
  {
    name: 'Galerie Karsten Greve',
    stadt: 'Köln',
    seit: 'Vertretung seit Anfang 2023',
    href: 'https://galerie-karsten-greve.com/kuenstler/detail/young-jae-lee',
    ausstellungen: [
      { jahr: '2026', titel: '„Kathleen Jacobs / Young‑Jae Lee“, St. Moritz' },
      { jahr: '2020', titel: '„Spinatschalen“' },
      { jahr: '2020', titel: 'Buchpräsentation „Das Grün in den Schalen“' },
      { jahr: '2018', titel: '„Arbeiten in Keramik“' },
    ],
  },
];

/** Häuser je Stadt aus den Orte-Kacheln, ohne die beiden Vertretungen. */
export const weitereHaeuser: { stadt: string; haeuser: string[] }[] = [
  {
    stadt: 'Köln',
    haeuser: ['Museum für Ostasiatische Kunst', 'Kunst-Station Sankt Peter', 'Galerie Udo Adam-Pasquale'],
  },
  { stadt: 'München', haeuser: ['Galerie Handwerk', 'Bayerischer Kunstgewerbeverein'] },
  { stadt: 'Tokio', haeuser: ['Gallery Tokyo', 'LIVING MOTIF'] },
  { stadt: 'Essen', haeuser: ['Museum Folkwang', 'Kokerei Zollverein', 'Kunsthaus Essen'] },
  { stadt: 'Korea', haeuser: ['Gwangju Museum of Art', 'Ha Jung-woong Museum of Art', 'Shinsegae Gallery'] },
  { stadt: 'Boston', haeuser: ['Pucker Gallery'] },
  { stadt: 'Krakau und Breslau', haeuser: ['Manggha Museum', 'Architekturmuseum Breslau', 'Galeria NEON'] },
  { stadt: 'Chemnitz', haeuser: ['Stadtkirche St. Jakobi'] },
  { stadt: 'Bonn', haeuser: ['Galerie Gisela Clement', 'ENTERVENTIONALE'] },
  { stadt: 'New York', haeuser: ['David Nolan Gallery'] },
  { stadt: 'Düsseldorf', haeuser: ['Hetjens-Museum'] },
  { stadt: 'Wien', haeuser: ['MAK – Museum für angewandte Kunst'] },
  { stadt: 'Zürich', haeuser: ['Raum 49'] },
];
