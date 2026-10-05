// Archiv vergangener Ausstellungen. Beides sind künftig `ausstellung`-Dokumente (Sanity-Typ `ausstellung`); bis Sanity Teil 2 stehen sie hier als Auswahl und als Gesamtliste.

/** Eintrag der Auswahl auf der Seite Aktuelles: Titel, Ort und Zeitraum innerhalb des Jahres */
export interface ArchivEintrag {
  titel: string;
  ort: string;
  /** Zeitraum ohne Jahr, wie die Seite ihn zeigt, z. B. „7. März – 24. Mai“ */
  datum: string;
  link?: { href: string; text: string };
}

export interface ArchivJahr {
  jahr: string;
  /** Orte der Ausstellungen in einer Zeile, sichtbar im geschlossenen Zustand */
  teaser: string;
  eintraege: readonly ArchivEintrag[];
  /** Link zur vollständigen Jahresseite */
  alle: { href: string; text: string };
}

/** Gesamtliste seit 1980: Jahr mit freien Zeilen aus Titel, Haus und Stadt */
export interface AusstellungsJahr {
  jahr: string;
  eintraege: readonly string[];
}

export const vergangene: readonly ArchivJahr[] = [
  {
    jahr: '2026',
    teaser: 'Umbrella, Dänemark · Künstlerzeche Unser Fritz, Herne · Galerie Jahn und Jahn, München',
    eintraege: [
      {
        titel: '„Young-Jae Lee – Schalen“',
        ort: 'Umbrella, west coast exhibitions, Nørre Nebel, Dänemark',
        datum: '7. März – 24. Mai',
      },
      {
        titel: 'Mode, Taschen, Keramik und Licht im Dialog',
        ort: 'No Nonsense – Pop-up-Store, Köln',
        datum: '28.–30. Mai',
      },
      {
        titel: '„Stille Gäste“',
        ort: 'Künstlerzeche Unser Fritz, Herne',
        datum: '13. Juni – 5. Juli',
      },
      {
        titel: '„Young-Jae Lee“',
        ort: 'Galerie Jahn und Jahn GmbH, Baaderstraße 56C, 80469 München',
        datum: '14. Juli – 12. September',
        link: { href: 'https://www.jahnundjahn.com/', text: 'jahnundjahn.com' },
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2026-2/', text: 'Alle Angaben zu 2026' },
  },
  {
    jahr: '2025',
    teaser: 'St. Jakobi, Chemnitz · Galerie Jahn und Jahn, München · Gallery Tokyo',
    eintraege: [
      {
        titel: 'Weihnachtsausstellung 2025',
        ort: 'in der Werkstatt, mit Christine Atmer de Reig (Keramik), Vivien Reig Atmer (Schmuck) und Masami Takeuchi (Kintsugi)',
        datum: '22. November – 23. Dezember',
      },
      {
        titel: '„OPEN House“ – Future Heritage. Das Erbe von Morgen',
        ort: 'Festival in Essen',
        datum: '6.–7. September',
      },
      {
        titel: '„Lee Young-Jae“',
        ort: 'Gallery Tokyo, Japan',
        datum: '21.–26. Juni',
      },
      {
        titel: '„100 + 1 Übungsstücke“',
        ort: 'Ausstellung',
        datum: '2.–30. Juni',
      },
      {
        titel: '„Young-Jae Lee: Keramik“',
        ort: 'Galerie Jahn und Jahn, München',
        datum: '14. März – 26. April',
      },
      {
        titel: '„Young-Jae Lee: Vasen“',
        ort: 'St. Jakobi, Chemnitz – verlängert bis Ende 2025',
        datum: 'ab 9. März',
      },
      {
        titel: '„Young-Jae Lee: SCHALEN“',
        ort: 'Stadtkirche St. Jakobi, Chemnitz',
        datum: '29. August 2024 – 2. März 2025',
      },
      {
        titel: 'Messe „Ambiente“',
        ort: 'Messe Frankfurt, Halle 3.1, Stand A60',
        datum: '7.–11. Februar',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2025-2/', text: 'Alle Angaben zu 2025' },
  },
  {
    jahr: '2024',
    teaser: '100 Jahre Werkstatt · Hetjens-Museum, Düsseldorf · David Nolan Gallery, New York',
    eintraege: [
      {
        titel: '„Weihnachtsausstellung – Editionen“',
        ort: 'in der Werkstatt',
        datum: '30. November – 23. Dezember',
      },
      {
        titel: '„Young-Jae Lee – Forms from the Earth“',
        ort: 'David Nolan Gallery, New York, USA',
        datum: '1. November – 21. Dezember',
      },
      {
        titel: '„TEE“',
        ort: 'Galerie Metzger, Johannesberg',
        datum: '27. Oktober – 17. November',
      },
      {
        titel: '„100 Jahre Keramische Werkstatt Margaretenhöhe – Young-Jae Lee im Hetjens“',
        ort: 'Hetjens-Museum, Düsseldorf',
        datum: '16. Mai – 1. September',
      },
      {
        titel: 'Bayerischer Kunstgewerbeverein',
        ort: 'München',
        datum: '17. Mai – 29. Juni',
      },
      {
        titel: 'Dießener Töpfermarkt',
        ort: 'Dießen',
        datum: '9.–12. Mai',
      },
      {
        titel: '„50 Jahre – 50 Schätze“',
        ort: 'Museum für Ostasiatische Kunst, Köln',
        datum: '19. Januar – 29. September',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2024-2/', text: 'Alle Angaben zu 2024' },
  },
  {
    jahr: '2023',
    teaser: 'MKG Hamburg · Raum 49, Zürich · Blaues Haus, Dießen',
    eintraege: [
      {
        titel: '„CONTEMPORARY CRAFT – Young-Jae Lee“',
        ort: 'Museum für Kunst und Gewerbe Hamburg (MKG)',
        datum: '23. November 2022 – 23. April 2023',
      },
      {
        titel: '„Gefäße – retrospektiv“ – Young-Jae Lee',
        ort: '„Blaues Haus“, Dießen am Ammersee',
        datum: '',
      },
      {
        titel: 'Raum 49',
        ort: 'Zürich, Vernissage am 30. März 2023',
        datum: '',
      },
      {
        titel: 'Goldschmiede & Galerie Udo Adam-Pasquale',
        ort: 'Köln-Sülz',
        datum: '25. März – 13. Mai',
      },
      {
        titel: 'Gallery Tokyo',
        ort: 'Tokio',
        datum: '1.–5. Mai',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2023/', text: 'Alle Angaben zu 2023' },
  },
  {
    jahr: '2022',
    teaser: 'Pucker Gallery, Boston · Galerie Jahn und Jahn · Gallery Nichinichi, Kyoto',
    eintraege: [
      {
        titel: 'Yui Tombana – Zeichnungen',
        ort: 'eine Ausstellung in unserer Werkstatt',
        datum: '2.–29. Juli',
      },
      {
        titel: '„HOME! 3/5 Identitäten“',
        ort: 'Kunsthaus Essen',
        datum: '4. März – 3. April',
      },
      {
        titel: '„Young-Jae LEE – Spindelvasen und Spinatschalen“',
        ort: 'Galerie Jahn und Jahn, München',
        datum: '28. Januar – 12. März',
      },
      {
        titel: '„Hope / Hoffnung – Works by Young-Jae Lee“',
        ort: 'Pucker Gallery, Boston',
        datum: '15. Januar – 27. Februar',
      },
      {
        titel: '„Young-Jae LEE – Vessels are Sculpture“',
        ort: 'Gallery Nichinichi, Kyoto, Japan',
        datum: '3.–24. Januar',
      },
      {
        titel: '„WIR. Bilder für eine neue Kunst des Zusammenlebens“',
        ort: 'Große Kunstschau Worpswede',
        datum: '20. Juni 2021 – 6. März 2022',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2022/', text: 'Alle Angaben zu 2022' },
  },
  {
    jahr: '2021',
    teaser: 'Galerie Karsten Greve, St. Moritz · Gallery Damdam, Berlin · Kunsthaus Dresden',
    eintraege: [
      {
        titel: 'Weihnachtsausstellung in der Keramischen Werkstatt',
        ort: 'mit Schmuck von Karin Kolster-Kelly und Ulrika Mertens',
        datum: '6. November – 23. Dezember',
      },
      {
        titel: '„Young-Jae Lee – In collaboration with KDK“',
        ort: 'Gallery Damdam, Berlin',
        datum: '17. September – 13. November',
      },
      {
        titel: '„Young-Jae Lee – Gefässe“',
        ort: 'Galerie Karsten Greve, St. Moritz',
        datum: '10. September – 30. Oktober',
      },
      {
        titel: '„Viereckig“',
        ort: 'Galerie Banki, Kashiwa, Japan',
        datum: '11.–25. September',
      },
      {
        titel: 'Gallery Tokyo',
        ort: 'Tokio',
        datum: '2.–6. April',
      },
      {
        titel: '„1000°“',
        ort: 'Kunsthaus Dresden, Städtische Galerie für Gegenwartskunst',
        datum: '',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2021/', text: 'Alle Angaben zu 2021' },
  },
  {
    jahr: '2020',
    teaser: 'Spinatschalen, Galerie Karsten Greve, Köln · Galerie Handwerk, München',
    eintraege: [
      {
        titel: '„Spinatschalen“',
        ort: 'Galerie Karsten Greve, Köln',
        datum: '19. Juni – 29. August',
      },
      {
        titel: 'Buchpräsentation „Das Grün in den Schalen“',
        ort: 'in Anwesenheit der Künstlerin, Galerie Karsten Greve, Köln',
        datum: '21. August',
      },
      {
        titel: '„es grünt“',
        ort: 'Galerie Handwerk, München',
        datum: '18. Juni – 1. August',
      },
      {
        titel: '„ENTERVENTIONALE #2020“',
        ort: 'Ausstellungsparcours in Bonn',
        datum: '14. Januar – 1. März',
      },
      {
        titel: '„Schönheit !?“',
        ort: 'Galerie Gisela Clement, Bonn',
        datum: '13. November 2019 – 23. Januar 2020',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2020/', text: 'Alle Angaben zu 2020' },
  },
  {
    jahr: '2019',
    teaser: 'Museum Folkwang, Essen · Kokerei Zollverein · Ha Jung-woong Museum of Art',
    eintraege: [
      {
        titel: '„Young-Jae Lee: Emptying, Filling and Emptying“',
        ort: 'Ha Jung-woong Museum of Art – An Encounter between the Spirit of Bauhaus and Korean Ceramic Art',
        datum: '16. Oktober – 8. Dezember',
      },
      {
        titel: 'Buchvorstellung und Installation',
        ort: 'Kunstraum Alexander Bürkle, Freiburg',
        datum: '30. September',
      },
      {
        titel: '„Fine Choices 2019 Featuring Young-Jae Lee“',
        ort: 'Pucker Gallery, Boston',
        datum: '27. Juli – 1. September',
      },
      {
        titel: '„Young-Jae Lee: MATERIAL ZU FORM – Körper zu Körper“',
        ort: 'Mischanlage Kokerei Zollverein, UNESCO-Welterbe Zollverein',
        datum: '24. Mai – 14. Juli',
      },
      {
        titel: 'Young-Jae Lee',
        ort: 'Museum Folkwang, Essen',
        datum: '23. Mai – 4. August',
      },
      {
        titel: '„WerkKunst – Gefäße von Young-Jae Lee“',
        ort: 'Dommuseum Hildesheim',
        datum: '9. März – 24. April',
      },
      {
        titel: '„Who’s afraid of Bauhaus?“',
        ort: 'Museum Ratingen',
        datum: '15. Februar – 12. Mai',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2019/', text: 'Alle Angaben zu 2019' },
  },
  {
    jahr: '2018',
    teaser: 'Galerie Karsten Greve, Paris und Köln · Korean Cultural Center, Brüssel',
    eintraege: [
      {
        titel: 'Weihnachten',
        ort: 'in der Keramischen Werkstatt',
        datum: '3. November – 23. Dezember',
      },
      {
        titel: '„Young-Jae Lee – Ceramics“',
        ort: 'Korean Cultural Center, Brüssel',
        datum: '8. März – 28. April',
      },
      {
        titel: '„Young-Jae Lee – Céramique“',
        ort: 'Galerie Karsten Greve, Paris',
        datum: '1. März – 14. April',
      },
      {
        titel: '„Arbeiten in Keramik“',
        ort: 'Galerie Karsten Greve, Köln',
        datum: '13. Januar – 24. Februar',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2018/', text: 'Alle Angaben zu 2018' },
  },
  {
    jahr: '2017',
    teaser: 'Kloster Beuerberg · HfBK Dresden · Shinsegae Gallery, Korea',
    eintraege: [
      {
        titel: 'Shinsegae Gallery',
        ort: 'Daegu, Incheon, Busan, Korea',
        datum: 'Herbst 2017',
      },
      {
        titel: 'Gallery Kan',
        ort: 'Fukushima, Japan',
        datum: '1.–11. September',
      },
      {
        titel: '„HINGABE“ – Gefäße von Young-Jae Lee',
        ort: 'Gartenpavillon des Klosters Beuerberg, Diözesanmuseum Freising',
        datum: '27. Mai – 3. Oktober',
      },
      {
        titel: 'Gallery Tokyo',
        ort: 'Tokio, Japan',
        datum: '21.–25. Juli',
      },
      {
        titel: 'Young-Jae Lee „Gefäße“',
        ort: 'Oktogon der Hochschule für Bildende Künste Dresden',
        datum: '3. Mai – 25. Juni',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2017/', text: 'Alle Angaben zu 2017' },
  },
  {
    jahr: '2016',
    teaser: 'Ehrendoktorwürde in Breslau · MAK, Wien · Manggha, Krakau',
    eintraege: [
      {
        titel: '„Gefäße der Keramischen Werkstatt“',
        ort: 'LIVING MOTIF, Tokio',
        datum: '16. September – 16. Oktober',
      },
      {
        titel: '„WITNESS TO AN ANCIENT TRUTH“',
        ort: 'Pucker Gallery, Boston',
        datum: '23. Juli – 4. September',
      },
      {
        titel: '„NICHT SCHÖN“',
        ort: 'Vasen von und mit Young-Jae Lee, MAK – Österreichisches Museum für angewandte Kunst, Wien',
        datum: '13. April – 26. Juni',
      },
      {
        titel: '„Young-Jae Lee Schalen“',
        ort: 'Manggha – Museum der Japanischen Kunst & Technik, Krakau',
        datum: '9. April – 14. August',
      },
      {
        titel: '„Young-Jae Lee – Gefäße“',
        ort: 'Architekturmuseum Breslau',
        datum: '5. April – 9. Mai',
      },
      {
        titel: 'Verleihung der Ehrendoktorwürde an Young-Jae Lee',
        ort: 'Eugeniusz-Geppert-Akademie der Schönen Künste, Breslau',
        datum: '4. April',
      },
      {
        titel: '„Das Geschirr der KWM“',
        ort: 'Gallery Nichinichi, Kyoto',
        datum: '26. Februar – 6. März',
      },
    ],
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2016-2/', text: 'Alle Angaben zu 2016' },
  },
];

export const ausstellungsarchiv: readonly AusstellungsJahr[] = [
  {
    jahr: '1980',
    eintraege: ['Galerie Dr. Vehring, Syke', 'Galerie Haus Kunen, Recklinghausen', 'Kleine Galerie, Ludwigsburg'],
  },
  {
    jahr: '1981',
    eintraege: [
      'Galerie Hennig, Darmstadt',
      'Forum der VHS, Leverkusen',
      'Galerie im Roten Haus, Veronika Ellwanger, Lenzkirch',
    ],
  },
  {
    jahr: '1982',
    eintraege: ['La Galleria, Marianne Henkel, Frankfurt/Main', 'Galerie Böwig, Hannover', 'Peter Hagenah, Otterndorf'],
  },
  {
    jahr: '1983',
    eintraege: ['Galerie Suk, Seoul, Korea', 'Schloss Clemenswerth, Sögel'],
  },
  {
    jahr: '1984',
    eintraege: [
      'Galerie L, Hamburg',
      'Galerie im Roten Haus, Veronika Ellwanger, Lenzkirch',
      'Keramik heute, Hetjens-Museum, Düsseldorf',
    ],
  },
  {
    jahr: '1985',
    eintraege: ['Forum der VHS, Leverkusen'],
  },
  {
    jahr: '1986',
    eintraege: ['Internationale Keramik, Seoul, Korea', 'Als Gast der Gruppe 83 in Schweden'],
  },
  {
    jahr: '1987',
    eintraege: ['Als Gast der Gruppe 83 in Faenza, Italien', 'Galerie Haus Kunen, Recklinghausen'],
  },
  {
    jahr: '1988',
    eintraege: [
      'Als Gast der Gruppe 83, Zeitgenössische Keramik aus der BRD, in Erfurt, Magdeburg und Leipzig; bis zum 15.01.1989 im Museum, Bad Hersfeld',
      'Gedok, Gruppe angewandte Kunst, Köln',
      'La Galleria, Marianne Henkel, Frankfurt/Main',
    ],
  },
  {
    jahr: '1989',
    eintraege: [
      'Sonderausstellung 10 Jahre Meister der Keramik im Forum der VHS, Leverkusen',
      'Muffendorfer Keramikgalerie, Muffendorf',
      'Galerie für Kunsthandwerk, Mia Temmes, Würzburg',
      'Gedok, Gruppe angewandte Kunst, Köln',
      'Galerie im Roten Haus, Veronika Ellwanger, Lenzkirch',
    ],
  },
  {
    jahr: '1990',
    eintraege: [
      'Zeitgenössische Keramik aus Belgien, Luxemburg, den Niederlanden und Nordrhein-Westfalen, Frechen',
      'Galerie L, Hamburg',
    ],
  },
  {
    jahr: '1991',
    eintraege: ['»Deutsche Keramische Kunst der Gegenwart«, Keramion, Frechen'],
  },
  {
    jahr: '1992',
    eintraege: [
      'Gruppenausstellung mit Görge Holt und Horst Kerstan, Akasaka Green Gallery, Tokio, Japan',
      'Galerie Fred Jahn, Stuttgart',
      'Charlotte Hennig, Darmstadt',
    ],
  },
  {
    jahr: '1993',
    eintraege: [
      'Galerie An Farina, Köln',
      'Galerie Rhomberg, Innsbruck, Österreich',
      'Triennale Kunst aus Ton, »Wege«, Kloster unserer lieben Frauen, Magdeburg',
    ],
  },
  {
    jahr: '1994',
    eintraege: [
      'Keramion, Frechen',
      'Peter Hagenah, Otterndorf',
      'Rosenthal-Studio, Hamburg',
      'Galerie beim Roten Turm, Sommerhausen',
    ],
  },
  {
    jahr: '1995',
    eintraege: [
      'Schleswig-Holsteinisches Landesmuseum, Cismar',
      'Galerie Franke, Stuttgart',
      'Galerie Müller-Brunert, Köln',
      'Galerie Helga Malten, Dortmund',
      'Keramik-Galerie Hilde Holstein, Bremen',
      'Museum für Kunst und Gewerbe, Hamburg',
    ],
  },
  {
    jahr: '1996',
    eintraege: [
      'Museum für Ostasiatische Kunst, Berlin',
      'Galerie Pels-Leusden, Villa Grisebach, Berlin',
      'Museum für Ostasiatische Kunst, Köln',
      'Galerie Hellhof, Kronberg',
      'Auktionshaus Lempertz, Köln',
      'Galerie Konrad Mönter, Meerbusch',
      'La Galleria, Marianne Henkel, Frankfurt/Main',
      'Akamanma, Fujioka, Gunma, Japan',
    ],
  },
  {
    jahr: '1997',
    eintraege: [
      'Galerie Ursula Rosenhauer, Göttingen',
      'Museum für Stadtgeschichte und Volkskunde, Heppenheim',
      'Galerie im Roten Haus, Veronika Ellwanger, Lenzkirch',
      'Galerie Rhomberg, Innsbruck',
      '»Form 97«, Frankfurt/Main und Schwäbisch Gmünd',
      'Keramion, Frechen',
      'Weinberg Contemporary Art, San Francisco, USA',
      'Nichinichi (Harajuku Box Office), Tokio, Japan',
      'Galerie Yabuki, Okayama, Japan',
      'Nichinichi (Werkstatt Toyabo), Monzen, Ishikawa, Japan',
      'Tour Road Livings Galerie, Kobe, Japan',
      'Meiso Galerie, Sendai, Japan',
    ],
  },
  {
    jahr: '1998',
    eintraege: [
      'Galerie Hellhof, Kronberg',
      'Craft Design for the Global Village, Florenz, Italien',
      'Galerie Helga Malten, Dortmund',
      'Galerie AnnTon, Wasserschloss Klaffenbach, Chemnitz',
      'Nichinichi (Tsuta Salon), Tokio, Japan',
      'Werkstatt Nin, Ibara, Okayama, Japan',
      'Nichinichi (Free Space Roji), Kyoto, Japan',
      'Atelier Rinka, Kochi, Japan',
      'Galerie Shinsakura, Toyama, Japan',
    ],
  },
  {
    jahr: '1999',
    eintraege: [
      'Galerie Goutez, Mihara, Hiroshima, Japan',
      'The Road Livings Gallery Nakayamate, Kobe, Japan',
      'Nichinichi (Matsuya) Kyoto, Japan',
      'Nichinichi (Tsuta Salon), Tokio, Japan',
      'Galerie Momogusa, Tajimi, Gifu, Japan',
      'Mingei Kawanoya, Shimonoseki, Japan',
      'Galerie Azusa, Fujisawa, Japan',
      'Galerie Shinsakura, Toyama, Japan',
      'RAG AG, Hauptverwaltung, Essen',
      'Museum für Ostasiatische Kunst, Köln',
      'Saarland Museum, Saarbrücken',
    ],
  },
  {
    jahr: '2000',
    eintraege: [
      'Keramion, Frechen',
      'Rietberg Museum, Zürich',
      'Nichinichi (Yoshioka Someji), Tokio, Japan',
      'Nichinichi (Space Miki), Kurashiki, Japan',
      'Nichinichi (Free Space Roji), Kyoto, Japan',
      'Meiso Galerie, Sendai, Japan',
      'Berger Bücherstube, Frankfurt/Main',
    ],
  },
  {
    jahr: '2001',
    eintraege: [
      'Galerie Hundertmark, Bonn',
      'Galerie Helga Malten, Dortmund',
      'Galerie Rosemarie Jäger, Hochheim',
      'Kunstraum Falkenstein, Hamburg',
      'Akademia Sztuk Pięknych, Breslau, Polen',
      'Keramikgalerie Margret Faita, Hameln',
      'Werkkunstgalerie Mia Temmes, Würzburg',
      'Galerie Rosenhauer, Göttingen',
    ],
  },
  {
    jahr: '2002',
    eintraege: [
      'Kunst-Station Sankt Peter, Köln',
      'Werkkunstgalerie Mia Temmes, Würzburg',
      'Galerie Claudia Delank, Köln',
      'Schloss Moyland, Kleve',
      'Tendence lifestyle, Frankfurt',
      'Galerie Hyundai, Seoul, Korea',
      'Art Cologne, Köln',
    ],
  },
  {
    jahr: '2003',
    eintraege: [
      'Galerie Fahnemann, Berlin',
      'Galerie Forum, Mainz',
      'Pung, Göttingen',
      'Ostasien Galerie Werner Wahlen, Frankfurt/Main',
    ],
  },
  {
    jahr: '2004',
    eintraege: [
      'Galerie im Fürstenhof, Neumünster',
      'Schloss Morsbroich, Leverkusen',
      'Galerie für angewandte Kunst, München',
      'Galerie Orfeo, Köln',
      'Bayerischer Kunstgewerbeverein, München',
      'Berger Bücherstube, Frankfurt/Main',
      'LaJoya Atelier, Palma de Mallorca',
      'Galerie Handwerk, Koblenz',
      'Galerie Riedmiller, Bad Grönenbach-Thal',
      'Galerie im Gewölbe Monika Meißner-Ludwig, Schweinfurt',
    ],
  },
  {
    jahr: '2005',
    eintraege: [
      'Berger Bücherstube, Frankfurt/Main',
      'Galerie Silke Finke, Borken-Burlo',
      'Rosenthal Studio-Haus, Hamburg',
      'Jürgen Lehl, Marunouchi Tokio, Japan',
      'Museum für Kunst und Gewerbe, Hamburg',
      'Galerie Johannes von Geymüller, Essen',
      'Bad Homburger Herbstsalon, Bad Homburg',
      'Haus Harig, Hannover',
      'Seit 2005 Werkkunstgalerie Sylvia Ueberle, Würzburg',
    ],
  },
  {
    jahr: '2006',
    eintraege: [
      'Gallery Tokyo, Tokio, Japan',
      'Galerie Lumen, Paris',
      'Jürgen Lehl, Kobe, Obihiro, Shizuoka und Hakata, Japan',
      'Galerie Momogusa, Tajimi, Japan',
      'Galerie Umeya, Fukuoka, Japan',
      'Galerie Han, Yamanashi, Japan',
      'Galerie Utsuwa Nanohana, Odawara, Japan',
      'Galerie FUDOKI, Tokio, Japan',
      'design: palette auf Zollverein, Essen',
      'Ulrike Kohrt-Sinner, Huck-Beifang-Haus, Burgsteinfurt',
      'Pinakothek der Moderne, München',
    ],
  },
  {
    jahr: '2007',
    eintraege: [
      'Bayerischer Kunstgewerbeverein, München',
      'Galerie Handwerk, München',
      'Jürgen Lehl, Tokio, Japan',
      'Töpfermarkt in Dießen am Ammersee',
      'Galerie Fred Jahn, München',
      'Casa camilla, Arqua Petrarca, Italien',
      'Akagi san u.co., Osaka, Japan',
      'Galerie Sawa, Kagoshima, Tokio, Japan',
      'Elmar Weinmayr, Tokio, Japan',
      'Manufaktum Landesausstellung im NRW-Forum, Düsseldorf',
      'Tendence lifestyle, Frankfurt/Main',
      'Elke Dröscher, Kunstraum Falkenstein, Hamburg',
      'Rosemarie Jäger, Galerie im Kelterhaus, Hochheim',
      'KOO NEWYORK, New York, USA',
      'Form und Design, Dortmund',
      'Museum für Kunst und Gewerbe, Hamburg',
      'Galerie Fred Jahn, München',
    ],
  },
  {
    jahr: '2008',
    eintraege: [
      'Handwerksmuseum Deggendorf',
      'Galerie Margareta Friesen, Dresden',
      'Galerie für Angewandte Kunst, München',
      'Berger Bücherstube, Frankfurt/Main',
      'Töpfermarkt in Dießen am Ammersee',
      'Töpfermarkt, Frechen',
      'Kunsthandwerkermarkt, Düsseldorf',
      'Töpfermarkt, Bonn',
      'Ausstellung in den Crusoe Hallen, Bremen',
      'Messe Frankfurt »The design annual«',
      'Format, Augsburg',
      'Galerie Ulm, Königstein',
      'Goethe-Institut, Seoul, Korea',
      'Pinakothek der Moderne (1+1=1), München',
      'Museum BOZAR, Brüssel',
      'Gallery Tokyo, Tokio, Japan',
      'Quico, Tokio, Japan',
    ],
  },
  {
    jahr: '2009',
    eintraege: [
      'Galerie DKM, Duisburg',
      'Elmar Weinmayr, Tokio, Japan',
      'Töpfermarkt in Frechen',
      'Töpfermarkt in Dießen am Ammersee',
      'Töpfermarkt in Bonn',
      'MANIDESIGN, Neapel, Italien',
      'Galerie Nichinichi, Tokio, Japan',
      'Jürgen Lehl, Tokio, Japan',
      'Hofwerkstattgalerie, Essen',
      'Rheinisches Landesmuseum Trier',
      'Galerie Handwerk Koblenz',
      'Schloss Hohenlimburg',
      'Galerie Elke Dröscher, Hamburg',
    ],
  },
  {
    jahr: '2010',
    eintraege: [
      'Kunstverein Heinsberg',
      'Töpfermarkt in Dießen am Ammersee',
      'Designmarkt »Handverlesen«, Zollverein-Gelände, Essen',
      'Messe »EUNIQUE arts & craft 2010«, Karlsruhe',
      'Altana Kulturstiftung im Sinclair-Haus, Bad Homburg',
      'Shinsegae Gallery, Busan / Seoul / Kwang Ju, Korea',
      'Style-Hug Gallery, Tokio, Japan',
      'Fowler-Museum, UCLA, Los Angeles',
    ],
  },
  {
    jahr: '2011',
    eintraege: [
      'Gallery Khan, Koriyama, Japan',
      'Galeria Sztuki Współczesnej BWA w Katowicach, Katowice, Polen',
      'Gallery Tokyo, Tokio, Japan',
      'Forum am Schillerplatz, Wien',
      'Museum für Asiatische Kunst, Berlin',
      'Keramische Werkstatt Margaretenhöhe, Essen',
      'new designshop AANNEX, Berlin',
      'Gallery Fudoki, Tokio, Japan',
      'M6, Annette Tietenberg, Braunschweig',
      'Gallery Kan, Koriyama, Japan',
      'Alexander Ochs Galleries, Berlin',
      'Looshaus, Wien',
    ],
  },
  {
    jahr: '2012',
    eintraege: [
      'Galerie Uhn, Königstein',
      'Pucker Gallery, Boston (MA)',
      'Hajime Gallery, Kumamoto, Japan',
      'Gallery Hase, Nagoya Aichi, Japan',
      'Zeche Zollverein',
      'tendence, Frankfurt am Main',
      'Quico, Tokio',
      'Meditations Biennale, Poznań, Polen',
      'Jürgen Lehl, Tokio, Japan',
      'koubou IKUKO, Okayama, Japan',
    ],
  },
  {
    jahr: '2013',
    eintraege: [
      'LWL-Industriemuseum, Schiffshebewerk Henrichenburg, Waltrop',
      'Emil-Schumacher-Museum Hagen',
      'Kunststation St. Stephanskirche, Bamberg',
      'Galerie Uhn, Königstein',
      'Quico, Tokio',
      '2014',
      '„Young-Jae Lee – Keramische Gefäße“, Lippische Gesellschaft für Kunst e. V., Schloß Detmold',
      '„Young-Jae Lee: Große Schalen – und Tee-Utensilien aus der Keramischen Werkstatt Margaretenhöhe“, Sonderausstellung: Galerie Fred Jahn, Residenz, München',
      '„Universality of the Essential – Ceramics by Young Jae Lee“, Pucker Gallery, Boston (MA)',
    ],
  },
  {
    jahr: '2015',
    eintraege: ['Galerie K. Netuschil, Darmstadt'],
  },
  {
    jahr: '2016',
    eintraege: [
      '„WITNESS TO AN ANCIENT TRUTH“, Pucker Gallery, Boston, USA',
      '„Augenblicke“, Galerie Jahn, München',
      '„NICHT SCHÖN“, Österreichisches Museum für angewandte Kunst / Gegenwartskunst, Wien, Österreich',
      '„Young-Jae Lee – Bowls“, Manggha Museum of Japanese Art and Technology, Krakau, Polen',
      '„Young-Jae Lee – Vessels“, Museum of Architecture, Breslau, Polen',
      '„Keramische Werkstatt Margaretenhöhe – Young-Jae Lee“, Galeria NEON, Breslau, Polen',
    ],
  },
  {
    jahr: '2017',
    eintraege: [
      'Shinsegae Gallery, Daegu, Gwangju, Incheon, Busan, Korea',
      'Gallery Kan, Fukushima, Japan',
      'Gallery Tokyo, Tokio, Japan',
      '„Hingabe – Gefäße von Young-Jae Lee“, Gartenpavillon des Klosters Beuerberg des Diözesanmuseums Freising',
    ],
  },
  {
    jahr: '2018',
    eintraege: [
      '„Œuvres en céramique – Young-Jae Lee“, Galerie Karsten Greve, Paris, Frankreich',
      '„Young-Jae Lee – Ceramics“, Korean Cultural Center, Brüssel, Belgien',
      '„Arbeiten in Keramik – Young-Jae Lee“, Galerie Karsten Greve, Köln',
    ],
  },
  {
    jahr: '2019',
    eintraege: [
      '„Werkkunst Keramiken von Young-Jae Lee“, Dommuseum, Hildesheim',
      '„Young-Jae Lee“, Museum Folkwang, Essen',
      'Gallery Tokyo, Tokio, Japan',
      '„Young-Jae Lee – Emptying, Filling and Emptying“, Gwangju Museum of Art',
      'Ha Jung-woong Museum of Art, Gwangju, Korea',
    ],
  },
  {
    jahr: '2020',
    eintraege: ['„Young-Jae Lee Spinatschalen“, Galerie Greve, Köln'],
  },
  {
    jahr: '2021',
    eintraege: ['„Gefäße“, Galerie Karsten Greve, St. Moritz, Schweiz'],
  },
  {
    jahr: '2022',
    eintraege: [
      '„SIEBEN MAL SIEBEN“, Kunst-Station Sankt Peter, Köln',
      '„Contemporary Craft Young-Jae Lee“, Museum für Kunst & Gewerbe, Hamburg',
    ],
  },
  {
    jahr: '2023',
    eintraege: ['„Gefäße retrospektiv“, Kulturforum Blaues Haus, Dießen am Ammersee'],
  },
  {
    jahr: '2024',
    eintraege: [
      '„Young-Jae Lee – Forms from the Earth“, David Nolan Gallery, New York, USA',
      '„Young-Jae Lee: SCHALEN“, Stadtkirche St. Jakobi, Chemnitz',
      '„100 Jahre Keramische Werkstatt Margaretenhöhe – Young-Jae Lee im Hetjens“, Hetjens-Museum, Düsseldorf',
    ],
  },
  {
    jahr: '2025',
    eintraege: [
      '„Young-Jae Lee: SCHALEN“, Stadtkirche St. Jakobi, Chemnitz',
      '„Young-Jae Lee: Keramik“, Galerie Jahn und Jahn, München',
    ],
  },
  {
    jahr: '2026',
    eintraege: [
      '„Stille Gäste“, Künstlerzeche Unser Fritz 2/3, Herne',
      '„99 Schalen – ein Kosmos“, Museum für Ostasiatische Kunst (MOK), Köln',
      '„Young-Jae Lee – Schalen“, Umbrella, Nørre Nebel, Dänemark',
    ],
  },
];
