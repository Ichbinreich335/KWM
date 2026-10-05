// Archiv vergangener Ausstellungen: Die Auswahl seit 2016 kommt als `archivEintrag` aus Sanity, die Gesamtliste seit 1980 steht hier im Code (wie die Chronik).
import { abfrage } from '../sanity/client';
import { ARCHIV_QUERY } from '../sanity/queries';
import type { ARCHIV_QUERY_RESULT } from '../sanity/sanity.types';

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
/** Teaser und Link der Jahresseite gehören zum Jahr, nicht zu einem Eintrag, und stehen deshalb hier */
const JAHRES_INFO: Readonly<Record<string, Pick<ArchivJahr, 'teaser' | 'alle'>>> = {
  '2026': {
    teaser: 'Umbrella, Dänemark · Künstlerzeche Unser Fritz, Herne · Galerie Jahn und Jahn, München',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2026-2/', text: 'Alle Angaben zu 2026' },
  },
  '2025': {
    teaser: 'St. Jakobi, Chemnitz · Galerie Jahn und Jahn, München · Gallery Tokyo',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2025-2/', text: 'Alle Angaben zu 2025' },
  },
  '2024': {
    teaser: '100 Jahre Werkstatt · Hetjens Museum, Düsseldorf · David Nolan Gallery, New York',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2024-2/', text: 'Alle Angaben zu 2024' },
  },
  '2023': {
    teaser: 'MKG Hamburg · Raum 49, Zürich · Blaues Haus, Dießen',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2023/', text: 'Alle Angaben zu 2023' },
  },
  '2022': {
    teaser: 'Pucker Gallery, Boston · Galerie Jahn und Jahn · Gallery Nichinichi, Kyoto',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2022/', text: 'Alle Angaben zu 2022' },
  },
  '2021': {
    teaser: 'Galerie Karsten Greve, St. Moritz · Gallery Damdam, Berlin · Kunsthaus Dresden',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2021/', text: 'Alle Angaben zu 2021' },
  },
  '2020': {
    teaser: 'Spinatschalen, Galerie Karsten Greve, Köln · Galerie Handwerk, München',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2020/', text: 'Alle Angaben zu 2020' },
  },
  '2019': {
    teaser: 'Museum Folkwang, Essen · Kokerei Zollverein · Ha Jung-woong Museum of Art',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2019/', text: 'Alle Angaben zu 2019' },
  },
  '2018': {
    teaser: 'Galerie Karsten Greve, Paris und Köln · Korean Cultural Center, Brüssel',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2018/', text: 'Alle Angaben zu 2018' },
  },
  '2017': {
    teaser: 'Kloster Beuerberg · HfBK Dresden · Shinsegae Gallery, Korea',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/jahr_2017/', text: 'Alle Angaben zu 2017' },
  },
  '2016': {
    teaser: 'Ehrendoktorwürde in Breslau · MAK, Wien · Manggha, Krakau',
    alle: { href: 'https://kwm-1924.de/neuigkeiten/vergangene/2016-2/', text: 'Alle Angaben zu 2016' },
  },
};

type Roh = ARCHIV_QUERY_RESULT[number];

/** Einträge der Liste „Vergangene Ausstellungen“, nach Jahr gruppiert (neueste Jahre zuerst) */
export function baueArchivAuswahl(roh: readonly Roh[]): ArchivJahr[] {
  const nachJahr = new Map<number, ArchivEintrag[]>();
  for (const eintrag of roh) {
    if (eintrag.inListe === false) continue;
    const { jahr, ortszeile, datum } = eintrag;
    const titel = eintrag.titel ?? eintrag.haus;
    if (jahr === null || !titel || !ortszeile) {
      throw new Error(
        `Archiv-Eintrag „${eintrag.titel ?? eintrag._id}“: Jahr, Titel oder Haus und Ort in der Liste fehlen.`,
      );
    }
    const liste = nachJahr.get(jahr) ?? [];
    liste.push({
      titel,
      ort: ortszeile,
      datum: datum ?? '',
      ...(eintrag.link?.text && eintrag.link.url ? { link: { href: eintrag.link.url, text: eintrag.link.text } } : {}),
    });
    nachJahr.set(jahr, liste);
  }
  return [...nachJahr.entries()]
    .sort(([a], [b]) => b - a)
    .map(([jahr, eintraege]) => {
      const info = JAHRES_INFO[String(jahr)];
      if (!info) throw new Error(`Archiv ${jahr}: Teaser und Link der Jahresseite fehlen in src/data/archiv.ts.`);
      return { jahr: String(jahr), ...info, eintraege };
    });
}

export async function ladeArchivAuswahl(): Promise<readonly ArchivJahr[]> {
  const jahre = baueArchivAuswahl(await abfrage<ARCHIV_QUERY_RESULT>('Archiv', ARCHIV_QUERY));
  if (jahre.length === 0) throw new Error('Keine Archiv-Einträge gefunden: Die Seite Aktuelles braucht die Liste.');
  return jahre;
}

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
      'Keramik heute, Hetjensmuseum, Düsseldorf',
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
      'Gruppenausstellung mit Görge Holt und Horst Kerstan, Akasaka Green Gallery, Tokyo, Japan',
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
      'Nichinichi (Harajuku Box Office), Tokyo, Japan',
      'Galerie Yabuki, Okayama, Japan',
      'Nichinichi (Werkstatt Toyabo), Monzen, Ishiokawa, Japan',
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
      'Nichinichi (Tsuta Salon), Tokyo, Japan',
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
      'Nichinichi (Tsuta Salon), Tokyo, Japan',
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
      'Nichinichi (Yoshioka Someji), Tokyo, Japan',
      'Nichinichi (Space Miki), Kurashiki, Japan',
      'Nichinichi (Free Space Roji), Kyoto, Japan',
      'Maiso Galerie, Sendai, Japan',
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
      'Akademia Sztuk Pieknych, Wroctaw, Polen',
      'Keramikgalerie Margret Faita, Hameln',
      'Werkkunstgalerie Mia Temmes, Würzburg',
      'Galerie Rosenhauer, Göttingen',
    ],
  },
  {
    jahr: '2002',
    eintraege: [
      'Kunststation St. Peter, Köln',
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
      'Jürgen Lehl, Marunouchi Tokyo, Japan',
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
      'Gallery Tokyo, Tokyo, Japan',
      'Galerie Lumen, Paris',
      'Jürgen Lehl, Kobe, Obihiro, Shizuoka und Hakata, Japan',
      'Galerie Momogusa, Tajimi, Japan',
      'Galerie Umeya, Fukuoka, Japan',
      'Galerie Han, Yamonashi, Japan',
      'Galerie Utsuwa Nanohana, Odawara, Japan',
      'Galerie FUDOKI, Tokyo, Japan',
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
      'Jürgen Lehl, Tokyo, Japan',
      'Töpfermarkt in Dießen am Ammersee',
      'Galerie Fred Jahn, München',
      'Casa camilla, Arqua Petrarca, Italien',
      'Akagi san u.co., Osaka, Japan',
      'Galerie Sawa, Kagoshima, Tokyo, Japan',
      'Elmar Weinmayr, Tokyo, Japan',
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
      'Gallery Tokyo, Tokyo, Japan',
      'Quico, Tokyo, Japan',
    ],
  },
  {
    jahr: '2009',
    eintraege: [
      'Galerie DKM, Duisburg',
      'Elmar Weinmayr, Tokyo, Japan',
      'Töpfermarkt in Frechen',
      'Töpfermarkt in Dießen am Ammersee',
      'Töpfermarkt in Bonn',
      'MANIDESIGN, Neapel, Italien',
      'Galerie Nichinichi, Tokyo, Japan',
      'Jürgen Lehl, Tokyo, Japan',
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
      'Shinsagae Gallery, Busan / Seoul / Kwang Ju, Korea',
      'Style-Hug Gallery, Tokyo, Japan',
      'Fowler-Museum, UCLA, Los Angeles',
    ],
  },
  {
    jahr: '2011',
    eintraege: [
      'Gallery Khan, Koriyama, Japan',
      'Galeria Sztuki Współczesnej BWA w Katowicach, Katowice, Polen',
      'Gallery Tokyo, Tokyo, Japan',
      'Forum am Schillerplatz, Wien',
      'Museum für Asiatische Kunst, Berlin',
      'Keramische Werkstatt Margaretenhöhe, Essen',
      'new designshop AANNEX, Berlin',
      'Gallery Fudoki, Tokyo, Japan',
      'M6, Annete Tietenberg, Braunschweig',
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
      'Quico, Tokyo',
      'Meditations Biennale, Poznań, Polen',
      'Jurgen Lehl, Tokyo, Japan',
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
      'Quico, Tokyo',
      '2014',
      '„Young-Jae Lee – Keramische Gefäße“, Lippische Gesellschaft für Kunst eV, Schloß Detmold',
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
      '„Witness to an Ancient Truth“, Pucker Gallery, Boston, U.S.A.',
      '„Augenblicke“, Galerie Jahn, München',
      '„Nicht schön“, Österreichisches Museum für angewandte Kunst / Gegenwartkunst, Wien, Österreich',
      '„Young-Jae Lee – Bowls“, Manggha Museum of Japanese Art and Technology, Kraków, Polen',
      '„Young-Jae Lee – Vessels“, Museum of Architecture, Wrocław, Polen',
      '„Keramische Werkstatt Margaretenhöhe – Young-Jae Lee“, Galeria NEON, Wrocław, Polen',
    ],
  },
  {
    jahr: '2017',
    eintraege: [
      'Shinsegae Gallery, Daegu, Gwangju, Incheon, Busan, Korea',
      'Gallery Kan, Fukushima, Japan',
      'Gallery Tokyo, Tokyo, Japan',
      '„Hingabe – Gefäße von Young-Jae Lee“, Gartenpavillon des Klosters Beuerberg des Diözesanmuseums Freising',
    ],
  },
  {
    jahr: '2018',
    eintraege: [
      '„Œuvres en céramique – Young-Jae Lee“, Galerie Karsten Greve, Paris, Frankreich',
      '„Young-Jae Lee – Ceramics“, Centre Culturel Coréen, Brüssel, Belgien',
      '„Arbeiten in Keramik – Young-Jae Lee“, Galerie Karsten Greve, Köln',
    ],
  },
  {
    jahr: '2019',
    eintraege: [
      '„Werkkunst Keramiken von Young-Jae Lee“, Dommuseum, Hildesheim',
      '„Young-Jae Lee“, Museum Folkwang, Essen',
      'Gallery Tokyo, Tokyo, Japan',
      '„Young-Jae Lee – Emptying, Filling, and Emptying“, Gwanju Museum of Art',
      'Ha Jung-woong Museum of Art, Gwanju, Korea',
    ],
  },
  {
    jahr: '2020',
    eintraege: ['„Young-Jae Lee Spinatschalen“, Galerie Greve, Köln'],
  },
  {
    jahr: '2021',
    eintraege: ['„Gefäße“, Gallerie Greve, St. Moritz, Schweiz'],
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
    eintraege: ['„Gefäße retrospektiv“, Kulturforum Blaue Haus, Diessen am Ammersee'],
  },
  {
    jahr: '2024',
    eintraege: [
      '„Young-Jae Lee – Forms from the Earth“, David Nolan Gallery, New York, USA',
      '„Young-Jae Lee: SCHALEN“, Stadtkirche St. Jakobi, Chemnitz',
      '„100 Jahre Keramische Werkstatt Margaretenhöhe – Young-Jae Lee im Hetjens“, Hetjens Museum, Düsseldorf',
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
      '„99 Schalen – ein Kosmos“, Museum für ostasiatische Kunst (MOK), Köln',
      '„Young-Jae Lee – Schalen“, Umbrella, Norre Nebel, Dänemark',
    ],
  },
];
