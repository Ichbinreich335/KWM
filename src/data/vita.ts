// Lebensdaten, Ausstellungsauswahl und Auszeichnungen als Jahr-Text-Paare (Zeilen mit Umbruch als Liste)
import type { DatumEintrag } from './typen';

export const biografie: readonly DatumEintrag[] = [
  { jahr: '1951', text: 'Geboren in Seoul' },
  { jahr: '1968–72', text: 'Studium an der Hochschule für Kunsterziehung in Seoul' },
  { jahr: '1972–73', text: 'Praktikum bei Christine Tappermann in Wallrabenstein' },
  {
    jahr: '1973–78',
    text: 'Studium der Keramik bei Margot Münster und der Formgestaltung bei Erwin Schutzbach an der Fachhochschule Wiesbaden',
  },
  { jahr: '1976–77', text: 'Praktikum bei Ralf Busz in Friedrichsfeld' },
  { jahr: '1978–87', text: 'Eigene Werkstatt in Sandhausen bei Heidelberg' },
  { jahr: '1984–87', text: 'Künstlerisch-wissenschaftliche Mitarbeiterin an der Gesamthochschule Kassel' },
  { jahr: 'seit 1987', text: 'Leitung der Keramischen Werkstatt Margaretenhöhe GmbH, Essen' },
  {
    jahr: '2015',
    text: 'Gastprofessur (Sommersemester) an der Abteilung für Keramik des Kollegs für Kunst und Design an der EWHA Womans University in Seoul, Korea',
  },
  { jahr: '2016', text: 'Ehrendoktorwürde der Eugeniusz-Geppert-Akademie der Schönen Künste in Breslau' },
];

export const ausstellungsauswahl: readonly DatumEintrag[] = [
  {
    jahr: '2026',
    text: [
      '„Stille Gäste“, Künstlerzeche Unser Fritz 2/3, Herne',
      '„99 Schalen – ein Kosmos“, Museum für Ostasiatische Kunst (MOK), Köln',
      '„Young-Jae Lee – Schalen“, Umbrella, Nørre Nebel, Dänemark',
    ],
  },
  {
    jahr: '2025',
    text: [
      '„Young-Jae Lee: SCHALEN“, Stadtkirche St. Jakobi, Chemnitz',
      '„Young-Jae Lee: Keramik“, Galerie Jahn und Jahn, München',
    ],
  },
  {
    jahr: '2024',
    text: [
      '„Young-Jae Lee – Forms from the Earth“, David Nolan Gallery, New York, USA',
      '„Young-Jae Lee: SCHALEN“, Stadtkirche St. Jakobi, Chemnitz',
      '„100 Jahre Keramische Werkstatt Margaretenhöhe – Young-Jae Lee im Hetjens“, Hetjens-Museum, Düsseldorf',
    ],
  },
  { jahr: '2023', text: '„Gefäße retrospektiv“, Kulturforum Blaues Haus, Dießen am Ammersee' },
  {
    jahr: '2022',
    text: [
      '„SIEBEN MAL SIEBEN“, Kunst-Station Sankt Peter, Köln',
      '„Contemporary Craft Young-Jae Lee“, Museum für Kunst & Gewerbe, Hamburg',
    ],
  },
  { jahr: '2021', text: '„Gefäße“, Galerie Greve, St. Moritz, Schweiz' },
  { jahr: '2020', text: '„Young-Jae Lee Spinatschalen“, Galerie Greve, Köln' },
  {
    jahr: '2019',
    text: [
      '„Werkkunst Keramiken von Young-Jae Lee“, Dommuseum, Hildesheim',
      '„Young-Jae Lee“, Museum Folkwang, Essen',
      'Gallery Tokyo, Tokio, Japan',
      '„Young-Jae Lee – Emptying, Filling and Emptying“, Gwangju Museum of Art, Ha Jung-woong Museum of Art, Gwangju, Korea',
    ],
  },
  {
    jahr: '2018',
    text: [
      '„Œuvres en céramique – Young-Jae Lee“, Galerie Karsten Greve, Paris, Frankreich',
      '„Young-Jae Lee – Ceramics“, Korean Cultural Center, Brüssel, Belgien',
      '„Arbeiten in Keramik – Young-Jae Lee“, Galerie Karsten Greve, Köln',
    ],
  },
  {
    jahr: '2017',
    text: [
      'Shinsegae Gallery, Daegu, Gwangju, Incheon, Busan, Korea',
      'Gallery Kan, Fukushima, Japan',
      'Gallery Tokyo, Tokio, Japan',
      '„Hingabe – Gefäße von Young-Jae Lee“, Gartenpavillon des Klosters Beuerberg des Diözesanmuseums Freising',
    ],
  },
  {
    jahr: '2016',
    text: [
      '„WITNESS TO AN ANCIENT TRUTH“, Pucker Gallery, Boston, USA',
      '„Augenblicke“, Galerie Jahn, München',
      '„NICHT SCHÖN“, Österreichisches Museum für angewandte Kunst / Gegenwartskunst, Wien, Österreich',
      '„Young-Jae Lee – Bowls“, Manggha Museum of Japanese Art and Technology, Krakau, Polen',
      '„Young-Jae Lee – Vessels“, Museum of Architecture, Breslau, Polen',
      '„Keramische Werkstatt Margaretenhöhe – Young-Jae Lee“, Galeria NEON, Breslau, Polen',
    ],
  },
];

export const auszeichnungen: readonly DatumEintrag[] = [
  { jahr: '1980', text: '1. Preis der Frechener Kulturstiftung' },
  { jahr: '1981', text: '2. Preis des Richard-Bampi-Preises zur Förderung junger Keramiker, Osnabrück' },
  { jahr: '1989', text: 'Goldmedaille des Bayerischen Staatspreises' },
  {
    jahr: '2016',
    text: 'Verleihung der Ehrendoktorwürde (Doktorat honoris causa) der Eugeniusz-Geppert-Akademie der Schönen Künste in Breslau',
  },
];

export const werkstattAuszeichnungen: readonly DatumEintrag[] = [
  { jahr: '1997', text: 'Hessischer Staatspreis, 1. Preis' },
  {
    jahr: '2001',
    text: [
      'Bayerischer Staatspreis für Gestaltung, 1. Preis',
      'Dießener Keramikpreis, 1. Preis',
      'Käuferpreis les Must de scènes d’intérieur, September, Messe Maison & Objet, Paris',
    ],
  },
  { jahr: '2005', text: 'Hessischer Staatspreis, 1. Preis' },
];
