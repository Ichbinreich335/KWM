// Chronik der Werkstatt (Sanity-Typ `chronikEintrag`): Jahr, Titel, Text. Die Seite Werkstatt zeigt sie als Zeitstrahl „Hundert Jahre an der Scheibe“.

export interface ChronikEintrag {
  jahr: string;
  titel: string;
  text: string;
  /** Ergänzung zum Sanity-Modell: kürzere Fassung für den Zeitstrahl der Startseite; Einträge ohne Kurztext erscheinen dort nicht */
  kurztext?: string;
  /** Ergänzung zum Sanity-Modell: gedämpfter Eintrag, die Jahreszahl wird beim Scrollen nicht dunkel (Abschied 2025) */
  leise?: boolean;
}

export const chronik: readonly ChronikEintrag[] = [
  {
    jahr: '1924',
    titel: 'Siedlungswerkstatt',
    text: 'Margarete Krupp realisiert ein Siedlungsvorhaben in der Stadt Essen. Dieses wird nach ihr »Margaretenhöhe« benannt. Die Bauten sollen mit keramischem Schmuck ausgestattet werden. Hermann Kätelhön, ihr künstlerischer Berater, initiiert die Gründung einer Keramikwerkstatt auf dem Gelände und bestimmt Will Lammert zum Leiter der Werkstatt.',
    kurztext:
      'Margarete Krupp realisiert die Siedlung Margaretenhöhe in Essen. Hermann Kätelhön initiiert eine Keramikwerkstatt auf dem Gelände, Leiter wird Will Lammert.',
  },
  {
    jahr: '1925',
    titel: 'Im Handelsregister',
    text: 'Eintragung der »Keramische Werkstatt Margaretenhöhe« in das Handelsregister.',
  },
  {
    jahr: '1927',
    titel: 'Bauhaus im Ruhrgebiet',
    text: 'Johannes Leßmann wird Nachfolger von Will Lammert. Er ist Schüler von Otto Lindig, dem bedeutenden Bauhaus-Keramiker. Die Werkstatt stellt ihr Fertigungsprogramm auf die Herstellung von Serienkeramik um und begründet bei strenger Einhaltung der Formgebungsprinzipien des Bauhauses die Tradition einer Manufaktur für anspruchsvolles Gebrauchsgeschirr. Es ist Leßmanns Verdienst, der Bauhaus-Idee im Ruhrgebiet Breitenwirkung verschafft zu haben.',
    kurztext:
      'Johannes Leßmann, Schüler des Bauhaus-Keramikers Otto Lindig, stellt auf Serienkeramik um – und verschafft der Bauhaus-Idee im Ruhrgebiet Breitenwirkung.',
  },
  {
    jahr: '1933',
    titel: 'Auf Zollverein',
    text: 'Umzug in ein Gebäude der Zeche Zollverein. Krupp scheidet aus der Gesellschaft aus. Neue Gesellschafter sind die Stadt Essen, der Verein für die bergbaulichen Interessen sowie der Verein zur Pflege der Kunst im rheinisch-westfälischen Industriebezirk. Spätere Übernahme der Anteile der Stadt Essen durch die Rheinelbe Bergbau AG.',
    kurztext: 'Umzug in ein Gebäude der Zeche Zollverein.',
  },
  {
    jahr: '1944',
    titel: 'Neue Leitung',
    text: 'Johannes Leßmann fällt im Krieg. Übernahme der Werkstattleitung durch Walburga Külz, die ebenso wie Johannes Leßmann Schülerin Otto Lindigs ist.',
    kurztext: 'Walburga Külz, ebenfalls Schülerin Otto Lindigs, übernimmt die Leitung.',
  },
  {
    jahr: '1953',
    titel: 'Baukeramik',
    text: 'Walburga Külz, die die Werkstatt wieder wirtschaftlich konsolidiert hat, übergibt die Leitung an Helmut Gniesmer, der das Werkstattprogramm wieder vorwiegend auf Baukeramik umstellt.',
    kurztext: 'Helmut Gniesmer stellt das Programm vorwiegend auf Baukeramik um.',
  },
  {
    jahr: '1968',
    titel: 'Ruhrkohle',
    text: 'Durch Übernahme der Rheinelbe Bergbau AG geht die Werkstatt in den Besitz der Ruhrkohle AG (später RAG Aktiengesellschaft) über.',
    kurztext: 'Die Werkstatt geht in den Besitz der Ruhrkohle AG über, später RAG Aktiengesellschaft.',
  },
  {
    jahr: '1986',
    titel: 'Zurück zum Gefäß',
    text: 'Young-Jae Lee und Hildegard Eggemann übernehmen die Leitung der Werkstatt. Wiederaufnahme des Manufakturprogramms mit Serienproduktion eines speziell entworfenen Geschirrs unter Rückbesinnung auf die formalen Grundprinzipien des Bauhauses. Dies wird auch durch die Pressmarke beziehungsweise den Blindstempel deutlich, den die Werkstatterzeugnisse seit 1930 bis heute führen.',
    kurztext:
      'Young-Jae Lee und Hildegard Eggemann übernehmen die Leitung und nehmen das Manufakturprogramm wieder auf.',
  },
  {
    jahr: '1987',
    titel: 'Das Baulager',
    text: 'Umzug der Werkstatt in das Baulager der Zeche Zollverein (Weltkulturerbe).',
    kurztext: 'Umzug in das Baulager der Zeche Zollverein, heute Weltkulturerbe.',
  },
  {
    jahr: '1993',
    titel: 'Die Leitung',
    text: 'Leitung der Werkstatt durch Young-Jae Lee.',
  },
  {
    jahr: '2006',
    titel: 'In eigener Verantwortung',
    text: 'Übernahme der Keramischen Werkstatt Margaretenhöhe GmbH von der RAG Aktiengesellschaft durch Young-Jae Lee. Geschäftsführung Young-Jae Lee.',
    kurztext:
      'Young-Jae Lee übernimmt die Werkstatt von der RAG Aktiengesellschaft und führt sie als Geschäftsführerin.',
  },
  {
    jahr: '2025',
    titel: 'Abschied',
    text: 'Unsere langjährige Mitarbeiterin Hildegard Eggemann (geb. 1949 in Essen) ist nach kurzer Krankheit am 12. Mai 2025 in Essen verstorben.',
    leise: true,
  },
];
