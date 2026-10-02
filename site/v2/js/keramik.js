// Gemeinsame Grundlagen der generativen Elemente: Glasuren der Werkstatt und reproduzierbarer Zufall.

// Glasuren: Rand, Mitte (wo die Glasur sich sammelt), Gewicht für die Auswahl, optional Sprenkel
export const GLAZES = [
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

// Farben des Tons: roher, lederharter und gebrannter Scherben
export const CLAY = { raw: '#B89A76', leather: '#C9B08F', bisque: '#E2D3BC', porcelain: '#EEEAE1' };

// mulberry32: gleicher Startwert, gleiche Folge
export function random(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickGlaze(rand) {
  const total = GLAZES.reduce((a, g) => a + g.w, 0);
  let r = rand() * total;
  for (const g of GLAZES) if ((r -= g.w) <= 0) return g;
  return GLAZES[0];
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
