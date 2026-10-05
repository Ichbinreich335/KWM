// Texte, Veröffentlichungen und Literatur über Young-Jae Lee und die Werkstatt (Sanity-Typ `text`)

/** Essay aus einem Katalog oder Buch, online und als PDF zu lesen */
export interface Text {
  titel: string;
  untertitel?: string;
  autor: string;
  /** Zitat aus dem Text */
  auszug?: string;
  /** Link zum Text auf der bisherigen Website */
  online?: string;
  pdf?: string;
}

/** Literaturangabe: Titel mit Angabe zu Herausgeber, Ort und Jahr */
export interface Publikation {
  titel: string;
  angabe: string;
}

/** Bericht oder Gespräch über die Werkstatt, ganz als Link */
export interface Veroeffentlichung {
  titel: string;
  angabe: string;
  href: string;
  linkText: string;
}

const WAGNER = 'Thomas Wagner';
/** Titel des Katalogtextes laut konzept/CONTENT-FUNDE.md 2.6 (mit Fragezeichen) */
const AUFGEHOBENE_ZEIT = 'Die aufgehobene Zeit?';
/** Quellenangabe unter Zitaten aus diesem Text */
export const wagnerQuelle = `${WAGNER}, »${AUFGEHOBENE_ZEIT}«`;

export const texte: readonly Text[] = [
  {
    titel: 'Gespannte Lebendigkeit',
    autor: 'Barbara Catoir',
    auszug:
      '„Young-Jae Lees Gefäße nehmen einen geheimnisvollen Dialog mit der spätgotischen Emporenkirche Sankt Peter auf.“',
    online: 'https://kwm-1924.de/gespannte-lebendigkeit/',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/catoir.pdf',
  },
  {
    titel: 'Gefäße drehen, Gefäße betrachten, Gefäße benützen',
    autor: 'Gisela Jahn',
    untertitel: 'Über die Schalen- und Vasenserien von Young-Jae Lee',
    auszug:
      '„Viele hundert Schalen hat Young-Jae Lee gedreht. In letzter Zeit sind es sich verhalten öffnende Schalen, manche wie ein Blütenkelch, andere trichterförmig.“',
    online:
      'https://kwm-1924.de/gefaesse-drehen-geefaesse-betrachten-gefaesse-benuetzenueber-die-schalen-und-vasenserien-von-young-jae-lee/',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/jahn.pdf',
  },
  {
    titel: '»Wie erlange ich Erkenntnis der Liebe?«',
    autor: 'P. Friedhelm Mennekes S. J.',
    untertitel: 'Künstlerische und mystische Aspekte der Devotion',
    auszug: '„Devotion, … das heißt die Verehrung oder auch die Kunst der Hingabe …“',
    online:
      'https://kwm-1924.de/wie-erlange-ich-erkenntnis-der-liebekuenstlerische-und-mystische-aspekte-der-devotion/',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/mennekes.pdf',
  },
  {
    titel: 'Young-Jae Lee – Die Töpferin',
    autor: 'Prof. Dr. Willibald Veit',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/veit.pdf',
  },
  {
    titel: AUFGEHOBENE_ZEIT,
    autor: WAGNER,
    untertitel: 'Elf Bemerkungen zu eintausendeinhundertundelf Schalen von Young-Jae Lee',
    auszug: '„Immer sind es Schalen, und doch ist keine wie die andere.“',
    online:
      'https://kwm-1924.de/die-aufgehobene-zeitelf-bemerkungen-zu-eintausendeinhundertundelf-schalen-von-young-jae-lee/',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/wagner_zeit-1.pdf',
  },
  {
    titel: 'Galaxie 333',
    autor: 'Thomas Wagner',
    untertitel: 'Anmerkungen zu den Schalen von Young-Jae Lee',
    auszug:
      '„Young-Jae Lees Vasen und Schalen sind immer ästhetisches Objekt und Gebrauchsgegenstand, Gefäß und Skulptur.“',
    online: 'https://kwm-1924.de/galaxie-333-anmerkungen-zu-den-schalen-von-young-jae-lee/',
    pdf: 'https://kwm-1924.de/wp-content/uploads/2023/08/wagner_333.pdf',
  },
];

export const publikationen: readonly Publikation[] = [
  { titel: 'Young-Jae Lee – das Grün in den Schalen', angabe: 'hrsg. Museum Folkwang, Essen 2020' },
  {
    titel: 'Günter Figal, Einfachheit. Über eine Schale von Young-Jae Lee / Simplicity. On a bowl by Young-Jae Lee',
    angabe: 'Freiburg i. Br. 2014',
  },
  {
    titel: 'Young-Jae Lee und Emil Schumacher',
    angabe: 'hrsg. von Ulrich Schumacher und Rouven Lotz, Ausst.-Kat. Emil Schumacher Museum Hagen, Bönen 2013',
  },
  {
    titel: 'Vessels. Installationen von Young-Jae Lee',
    angabe: 'hrsg. von Arnulf Siebeneicker, Ausst.-Kat. LWL-Industriemuseum Schiffshebewerk Henrichenburg, Essen 2013',
  },
  {
    titel: 'Young-Jae Lee. Formen aus der Erde',
    angabe:
      'hrsg. von ALTANA Kulturstiftung, Andrea Firmenich, Johannes Janssen, Ausst.-Kat. Museum Sinclair-Haus Bad Homburg, Köln 2010',
  },
  { titel: 'Reinhard Krause, Wo aus Braunrot Jadegrün wird', angabe: 'In: AD. Architectural Digest, Nr. 100, 06/09' },
  {
    titel: 'Philipp Meier, Schönheit des Einfachen',
    angabe: 'In: Neue Zürcher Zeitung / NZZ am Sonntag, Z – Die schönen Seiten, 10/08',
  },
  { titel: 'Young-Jae Lee, Spindelvasen', angabe: 'Ausst.-Kat. Pinakothek der Moderne, München 2008' },
  {
    titel: 'Young-Jae Lee, 1111 Schalen',
    angabe: 'hrsg. von Reinhold Baumstark, Bayerische Staatsgemäldesammlungen, München 2006',
  },
  {
    titel: 'Young-Jae Lee – Gefäße',
    angabe: 'hrsg. Gerhard Finckh / RAG Aktiengesellschaft, Ausst.-Kat. Museum Morsbroich Leverkusen, Leverkusen 2004',
  },
  {
    titel: 'Young-Jae Lee',
    angabe: 'hrsg. von Victoria Scheinler und Kurt Danch, Ausst.-Kat. Kunststation St. Peter Köln, Köln 2002',
  },
  { titel: 'Keramische Werkstatt Margaretenhöhe 1924–1999', angabe: 'München 1999' },
  {
    titel: 'Young-Jae Lee, Keramiken 1975–1995',
    angabe:
      'Ausst.-Kat. Museum für Ostasiatische Kunst, Staatliche Museen zu Berlin Preußischer Kulturbesitz; Museum für Ostasiatische Kunst Köln, München 1996',
  },
  { titel: 'Keramik des 20. Jahrhunderts: Sammlung Welle', angabe: 'hrsg. von Ekkart Klinge, Köln 1996' },
  {
    titel: 'Koreanische Keramik in Deutschland: Young-Jae Lee, Si-Sook Kang, Kap-Sun Hwang',
    angabe: 'Ausst.-Kat. Schleswig-Holsteinisches Landesmuseum Kloster Cismar, Schleswig 1995',
  },
  {
    titel: 'Zeitgenössisches deutsches Kunsthandwerk, Triennale 1994',
    angabe: 'Ausst.-Kat. Museum für Kunsthandwerk Frankfurt am Main, Frankfurt am Main 1994',
  },
  {
    titel: 'Zeitgenössisches deutsches und finnisches Kunsthandwerk, Triennale 1987/88',
    angabe: 'Ausst.-Kat. Museum für Kunsthandwerk Frankfurt am Main, Frankfurt am Main 1987',
  },
  { titel: 'Deutsche Keramik heute', angabe: 'hrsg. von Ekkart Klinge, Düsseldorf 1984' },
  {
    titel: 'Zeitgenössisches deutsches und niederländisches Kunsthandwerk, Triennale 1981',
    angabe: 'Ausst.-Kat. Museum für Kunsthandwerk Frankfurt, Frankfurt am Main 1981',
  },
];

export const veroeffentlichungen: readonly Veroeffentlichung[] = [
  {
    titel: '„Der Ruf des Bauhaus“',
    angabe: 'Interview bei Urbanana · von Ilona Marx · 25. Januar 2023',
    href: 'https://urbanana.de/de/keramische-werkstatt-margaretenhoehe-der-ruf-des-bauhaus/',
    linkText: 'Interview lesen',
  },
  {
    titel: '„Vom Stolz, eine Töpferin zu sein“',
    angabe: 'Handwerkskammer Düsseldorf, Geschäftsbericht „Werkstatt 2019“ zum Schwerpunkt „In Frauenhand“',
    href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2019/',
    linkText: 'Zum Hinweis im Archiv',
  },
];
