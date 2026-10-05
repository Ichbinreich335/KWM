// Lebensweg von Young-Jae Lee (Sanity-Typ `lebenswegStation`): Jahr, Ort, Station. Die Startseite zeigt die Auswahl als Zeitstrahl.

export interface LebenswegStation {
  jahr: string;
  ort: string;
  station: string;
}

export const lebensweg: readonly LebenswegStation[] = [
  { jahr: '1951', ort: 'Seoul', station: 'geboren; Studium an der Hochschule für Kunsterziehung' },
  { jahr: '1973', ort: 'Wiesbaden', station: 'Keramik bei Margot Münster, Formgestaltung bei Erwin Schutzbach' },
  { jahr: '1978', ort: 'Sandhausen', station: 'eigene Werkstatt bei Heidelberg' },
  { jahr: '1987', ort: 'Essen', station: 'Leitung der Keramischen Werkstatt Margaretenhöhe' },
  { jahr: '2016', ort: 'Breslau', station: 'Ehrendoktorwürde der Eugeniusz-Geppert-Akademie' },
];
