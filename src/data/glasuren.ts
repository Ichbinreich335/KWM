// Glasuren der Werkstatt. Keine Preise, kein Bestand, keine Lagerorte.

/** Oberfläche einer Probekachel; steuert das Aussehen der Farbskala */
export type Oberflaeche = 'matt' | 'satin' | 'glanz';

/** Sanity-Typ `glasur`: eine Probekachel der Farbskala (Startseite) mit gemessenen Farbwerten und Probenfoto */
export interface Glasur {
  schluessel: string;
  name: string;
  /** Zusatz unter dem Namen („matt“, „glänzend“); bei der weißen Glasur leer */
  zusatz?: string;
  oberflaeche: Oberflaeche;
  /** Gemessene Farbwerte: Grund, dunkler und hellerer Rand */
  farbe: { grund: string; dunkel: string; hell: string };
  /** Farbe der Beschriftung auf dem Grund */
  schriftfarbe: string;
  /** Farbe der Sprenkel, wenn die Glasur welche trägt */
  sprenkel?: string;
  /** Art der Sprenkel: `korn` helle Flecken im Korn (matt), `eisen` dichte dunkle Sprenkel, `punkte` vereinzelte Eisenpunkte */
  sprenkelart?: 'korn' | 'eisen' | 'punkte';
  /** Glasur liegt in zwei Schichten (glänzende Probe mit sichtbarer Tauchkante) */
  schichten?: boolean;
  /** Startwert des reproduzierbaren Zufalls für die Zeichnung der Probe */
  seed: number;
  /** Pfad des Probenfotos unter `src/assets/img/`, wie ihn `Bild.astro` auflöst */
  probenbild: string;
}

export const glasuren: readonly Glasur[] = [
  {
    schluessel: 'weiss',
    name: 'weiß',
    oberflaeche: 'satin',
    farbe: { grund: '#e2ddcd', dunkel: '#cec6b3', hell: '#ece9db' },
    schriftfarbe: '#1B1815',
    sprenkel: '#9a6a2c',
    sprenkelart: 'punkte',
    seed: 3,
    probenbild: '/img/kwm/weiss.webp',
  },
  {
    schluessel: 'hellgruen-matt',
    name: 'hellgrün',
    zusatz: 'matt',
    oberflaeche: 'matt',
    farbe: { grund: '#cfe0d6', dunkel: '#c1d2c8', hell: '#daeae0' },
    schriftfarbe: '#1B1815',
    seed: 4,
    probenbild: '/img/kwm/hellgruen_matt.webp',
  },
  {
    schluessel: 'hellgruen-glanz',
    name: 'hellgrün',
    zusatz: 'glänzend',
    oberflaeche: 'glanz',
    farbe: { grund: '#94ae9b', dunkel: '#85a593', hell: '#98b29f' },
    schriftfarbe: '#1B1815',
    schichten: true,
    seed: 5,
    probenbild: '/img/kwm/hellgruen_glaenzend.webp',
  },
  {
    schluessel: 'dunkelgruen-glanz',
    name: 'dunkelgrün',
    zusatz: 'glänzend',
    oberflaeche: 'glanz',
    farbe: { grund: '#3f3b22', dunkel: '#3c381f', hell: '#423d23' },
    schriftfarbe: '#F4F1E8',
    seed: 6,
    probenbild: '/img/kwm/dunkelgruen_glaenzend.webp',
  },
  {
    schluessel: 'dunkelgruen-matt',
    name: 'dunkelgrün',
    zusatz: 'matt',
    oberflaeche: 'matt',
    farbe: { grund: '#44462e', dunkel: '#363820', hell: '#64634d' },
    schriftfarbe: '#F4F1E8',
    sprenkel: '#a3a28b',
    sprenkelart: 'korn',
    seed: 7,
    probenbild: '/img/kwm/dunkelgruen_matt.webp',
  },
  {
    schluessel: 'rostbraun',
    name: 'rostbraun',
    oberflaeche: 'satin',
    farbe: { grund: '#8d590a', dunkel: '#864d01', hell: '#916216' },
    schriftfarbe: '#FFFDF6',
    sprenkel: '#6a3a04',
    sprenkelart: 'eisen',
    seed: 8,
    probenbild: '/img/kwm/rostbraun.webp',
  },
];

/**
 * Farben einer Schale der Glasurbühne (Startseite, 99 Schalen): Rand, Mitte (wo sich die Glasur sammelt),
 * Gewicht für die zufällige Auswahl, optional Sprenkel. Kein Sanity-Typ: Die Palette gehört zur Zeichnung.
 */
export interface Schalenglasur {
  name: string;
  rim: string;
  pool: string;
  w: number;
  speckle?: string;
}

export const schalenglasuren: readonly [Schalenglasur, ...Schalenglasur[]] = [
  { name: 'Seladon', rim: '#C3D2C4', pool: '#7FA493', w: 16 },
  { name: 'Hellblau', rim: '#CBD9DD', pool: '#8DAFB9', w: 11 },
  { name: 'Weiß', rim: '#EEEAE1', pool: '#D3CCBE', w: 13 },
  { name: 'Craquelé', rim: '#DDD8CA', pool: '#BAB19D', w: 6 },
  { name: 'Dunkelgrün', rim: '#56725F', pool: '#2D4739', w: 8 },
  { name: 'Rostbraun', rim: '#A2623F', pool: '#6C3522', w: 9 },
  { name: 'Eisenbraun', rim: '#77533C', pool: '#3E2A1D', w: 8 },
  { name: 'Schwarz gesprenkelt', rim: '#4A4744', pool: '#23211F', w: 5, speckle: '#D9D2C4' },
  { name: 'Seladon gesprenkelt', rim: '#BCCDC0', pool: '#86A797', w: 6, speckle: '#3A3530' },
  { name: 'Rosé', rim: '#D9BDB5', pool: '#B98E86', w: 4 },
  { name: 'Kupferrot', rim: '#A8413A', pool: '#6E1F1C', w: 3 },
];

/** Gruppe einer Probe auf der Glasurbühne der Manufaktur-Seite */
export type Probengruppe = 'Geschirr' | 'Edition';

/**
 * Glasurprobe der Glasurbühne (Seite Manufaktur): Knopf mit Probenfoto, daneben die Bühne in Farbe und Foto.
 * Sanity-Typ `glasur`, dort mit Gruppe als Zuordnung zum Programm; die Farben der Bühne weichen leicht
 * von den Farbwerten der Farbskala ab, das ist bewusst so.
 */
export interface Glasurprobe {
  name: string;
  /** Text unter dem Namen auf der Bühne, z. B. „Geschirr · matt“ */
  meta: string;
  gruppe: Probengruppe;
  /** Grundfarbe der Bühne */
  farbe: string;
  /** Pfad des Probenfotos unter `src/assets/img/`, wie ihn `Bild.astro` auflöst */
  probenbild: string;
  /** Glanzlicht auf der Bühne */
  glanz?: boolean;
  /** Bühne mit heller Schrift */
  dunkel?: boolean;
}

export const glasurproben: readonly Glasurprobe[] = [
  { name: 'weiß', meta: 'Geschirr', gruppe: 'Geschirr', farbe: '#e1dccc', probenbild: '/img/kwm/weiss.webp' },
  {
    name: 'hellgrün matt',
    meta: 'Geschirr · matt',
    gruppe: 'Geschirr',
    farbe: '#cfe0d5',
    probenbild: '/img/kwm/hellgruen_matt.webp',
  },
  {
    name: 'hellgrün glänzend',
    meta: 'Geschirr · glänzend',
    gruppe: 'Geschirr',
    farbe: '#92ad9b',
    probenbild: '/img/kwm/hellgruen_glaenzend.webp',
    glanz: true,
  },
  {
    name: 'dunkelgrün glänzend',
    meta: 'Geschirr · glänzend',
    gruppe: 'Geschirr',
    farbe: '#3f3b22',
    probenbild: '/img/kwm/dunkelgruen_glaenzend.webp',
    glanz: true,
    dunkel: true,
  },
  {
    name: 'dunkelgrün matt',
    meta: 'Geschirr · matt',
    gruppe: 'Geschirr',
    farbe: '#474931',
    probenbild: '/img/kwm/dunkelgruen_matt.webp',
    dunkel: true,
  },
  {
    name: 'rostbraun',
    meta: 'Geschirr',
    gruppe: 'Geschirr',
    farbe: '#8c580a',
    probenbild: '/img/kwm/rostbraun.webp',
    dunkel: true,
  },
  {
    name: 'hellblau',
    meta: 'Edition',
    gruppe: 'Edition',
    farbe: '#75857a',
    probenbild: '/img/kwm/hellblau.webp',
    dunkel: true,
  },
  {
    name: 'weiß',
    meta: 'Edition · Craquelé',
    gruppe: 'Edition',
    farbe: '#c3bcaf',
    probenbild: '/img/kwm/craquele_weiss.webp',
  },
  {
    name: 'hellgrün',
    meta: 'Edition · Craquelé',
    gruppe: 'Edition',
    farbe: '#848d7a',
    probenbild: '/img/kwm/craquele_hellgruen.webp',
    dunkel: true,
  },
  {
    name: 'dunkelgrün',
    meta: 'Edition · Craquelé',
    gruppe: 'Edition',
    farbe: '#5a6251',
    probenbild: '/img/kwm/craquele_dunkelgruen.webp',
    dunkel: true,
  },
];

/** Wirkung eines Metalloxids je Ofenatmosphäre (Seite Werkstatt, Abschnitt „Wie die Glasur ihre Farbe bekommt“) */
export interface Ofenfarbe {
  /** Bestimmt die Farbprobe (Klasse `swatch--<schluessel>` in der Signatur Feuer) */
  schluessel: 'eisenoxid-oxidierend' | 'eisenoxid-reduzierend' | 'kupfer-oxidierend' | 'kupfer-reduzierend';
  text: string;
}

export const ofenfarben: readonly Ofenfarbe[] = [
  {
    schluessel: 'eisenoxid-oxidierend',
    text: 'Eisenoxid, oxidierend: färbt gelb bis braun – sauerstoffreiche Ofenatmosphäre.',
  },
  {
    schluessel: 'eisenoxid-reduzierend',
    text: 'Eisenoxid, reduzierend: färbt grün – sauerstoffarme Ofenatmosphäre.',
  },
  { schluessel: 'kupfer-oxidierend', text: 'Kupfer, oxidierend: grün.' },
  { schluessel: 'kupfer-reduzierend', text: 'Kupfer, reduzierend: rot.' },
];
