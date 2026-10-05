// Menschen der Werkstatt (nicht im Sanity-Modell, Vorschlag: Dokumenttyp `person`)
import type { DatumEintrag } from './typen';

export interface Person {
  name: string;
  rolle: string;
  /** Kurztext statt Lebenslauf */
  text?: string;
  /** Lebenslauf in Jahr-Text-Paaren */
  lebenslauf?: readonly DatumEintrag[];
  link?: { href: string; text: string };
}

export const team: readonly Person[] = [
  {
    name: 'Young-Jae Lee',
    rolle: 'Werkstatt-Leitung',
    text: 'Geboren 1951 in Seoul. Seit 1987 Leitung der Keramischen Werkstatt Margaretenhöhe.',
    link: { href: '/young-jae-lee', text: 'Biografie' },
  },
  {
    name: 'Daniela Glattki',
    rolle: 'Mitarbeiterin seit 2003',
    lebenslauf: [
      { jahr: '1975', text: 'geboren in Malapane, Polen' },
      { jahr: '1996–1999', text: 'Töpferlehre bei Annette Dannhus in Celle' },
      { jahr: '2000–2003', text: 'Fachschule für Keramikgestaltung in Höhr-Grenzhausen' },
      { jahr: '2005', text: 'Meisterprüfung' },
    ],
  },
  {
    name: 'Shoko Ishioka',
    rolle: 'Mitarbeiterin seit 2004',
    lebenslauf: [
      { jahr: '1973', text: 'geboren in Tokyo, Japan' },
      { jahr: '1992–1997', text: 'Studium der Kunstgeschichte bei Takahiko Okada in Tokyo' },
      { jahr: '1997–2003', text: 'Studium der Kunst an der Burg Giebichenstein, Kunsthochschule bei Azade Köker' },
    ],
  },
  {
    name: 'Michael Schmandt',
    rolle: 'Geselle seit 1979',
    lebenslauf: [
      { jahr: '1957', text: 'geboren in Essen' },
      { jahr: '1976', text: 'Ausbildung zum Scheibentöpfer in der Keramischen Werkstatt bei Helmut Gniesmer' },
    ],
  },
  {
    name: 'Claudia Prien',
    rolle: 'Bilanzbuchhalterin seit 2006',
    lebenslauf: [
      { jahr: '1969', text: 'geboren in Moers' },
      {
        jahr: '1988–1991',
        text: 'Ausbildung zur Industriekauffrau und Betriebswirtin (VWA) bei der RAG Aktiengesellschaft in Essen',
      },
      { jahr: '1995', text: 'Abschluss zur staatlich geprüften Bilanzbuchhalterin' },
    ],
  },
];
