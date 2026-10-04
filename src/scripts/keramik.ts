// Gemeinsame Grundlagen der generativen Elemente: Glasuren der Werkstatt und reproduzierbarer Zufall.

// Glasuren: Rand, Mitte (wo die Glasur sich sammelt), Gewicht für die Auswahl, optional Sprenkel
export interface Glasur {
  name: string;
  rim: string;
  pool: string;
  w: number;
  speckle?: string;
}

export type Rng = () => number;

/** Parameter einer Schale für `renderBowlSprite`. */
export interface Schale {
  r: number;
  glaze: Glasur;
  wob: readonly [number, number, number, number];
  rings: number;
  speckles: readonly (readonly [number, number, number])[];
}

export const GLAZES: readonly [Glasur, ...Glasur[]] = [
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

// Farben des Tons: roher und gebrannter Scherben
export const CLAY = { raw: '#B89A76', bisque: '#E2D3BC' };

// mulberry32: gleicher Startwert, gleiche Folge
export function random(seed: number): Rng {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickGlaze(rand: Rng): Glasur {
  const total = GLAZES.reduce((a, g) => a + g.w, 0);
  let r = rand() * total;
  for (const g of GLAZES) if ((r -= g.w) <= 0) return g;
  return GLAZES[0];
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Umriss einer leicht unregelmäßigen Schale um den Ursprung
const shapePath = (c: CanvasRenderingContext2D, r: number, wob: Schale['wob']) => {
  c.beginPath();
  for (let k = 0; k <= 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    const rr = r * (1 + wob[0] * Math.sin(2 * a + wob[1]) + wob[2] * Math.sin(3 * a + wob[3]));
    const x = Math.cos(a) * rr,
      y = Math.sin(a) * rr;
    if (k) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.closePath();
};

// Rendert eine Schale von oben als Sprite (Licht links oben, weicher Schatten).
// b: { r (CSS-Pixel), glaze, wob, rings, speckles }. Gibt die Leinwand und ihre halbe Kantenlänge in CSS-Pixeln zurück.
// Der Schatten ist ein warmes Braun auf hellem Grund.
export const renderBowlSprite = (b: Schale, dpr: number) => {
  const r = b.r * dpr;
  const pad = r * 0.9;
  const size = Math.ceil(r * 2 + pad * 2);
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d');
  if (!c) return null;
  c.translate(size / 2, size / 2);
  const g = b.glaze;

  // Schatten auf dem Boden, Licht von links oben
  c.save();
  c.shadowColor = 'rgba(52, 38, 24, 0.30)';
  c.shadowBlur = r * 0.45;
  c.shadowOffsetX = r * 0.14;
  c.shadowOffsetY = r * 0.22;
  shapePath(c, r, b.wob);
  c.fillStyle = g.rim;
  c.fill();
  c.restore();

  // Lippe: oben links heller, unten rechts dunkler
  const lip = c.createLinearGradient(-r, -r, r, r);
  lip.addColorStop(0, 'rgba(255,255,255,0.28)');
  lip.addColorStop(0.55, 'rgba(255,255,255,0)');
  lip.addColorStop(1, 'rgba(0,0,0,0.16)');
  shapePath(c, r, b.wob);
  c.fillStyle = lip;
  c.fill();

  // Innenraum: nahe Wand im Schatten, ferne Wand im Licht, Glasur sammelt sich in der Mitte
  const ri = r * 0.86;
  c.save();
  shapePath(c, ri, b.wob);
  c.clip();
  c.fillStyle = g.rim;
  c.fillRect(-r, -r, r * 2, r * 2);
  const wall = c.createLinearGradient(-ri, -ri, ri, ri);
  wall.addColorStop(0, 'rgba(0,0,0,0.26)');
  wall.addColorStop(0.5, 'rgba(0,0,0,0.02)');
  wall.addColorStop(1, 'rgba(255,255,255,0.22)');
  c.fillStyle = wall;
  c.fillRect(-r, -r, r * 2, r * 2);
  const pool = c.createRadialGradient(ri * 0.06, ri * 0.08, 0, 0, 0, ri * 0.78);
  pool.addColorStop(0, g.pool);
  pool.addColorStop(0.55, `${g.pool}B0`);
  pool.addColorStop(1, `${g.pool}00`);
  c.fillStyle = pool;
  c.fillRect(-r, -r, r * 2, r * 2);
  // Drehrillen
  c.lineWidth = Math.max(0.6, r * 0.018);
  for (let k = 1; k <= b.rings; k++) {
    c.strokeStyle = k % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
    c.beginPath();
    c.arc(0, 0, ri * (0.28 + k * 0.16), 0, Math.PI * 2);
    c.stroke();
  }
  // Sprenkel
  if (g.speckle) {
    c.fillStyle = g.speckle;
    b.speckles.forEach(([u, v, s]) => {
      const a = u * Math.PI * 2,
        d = Math.sqrt(v) * ri * 0.92;
      c.globalAlpha = 0.55 + s * 0.4;
      c.beginPath();
      c.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * (0.03 + s * 0.05), r * (0.02 + s * 0.035), a, 0, Math.PI * 2);
      c.fill();
    });
    c.globalAlpha = 1;
  }
  c.restore();

  // Innenkante der Lippe und Glanzlicht
  shapePath(c, ri, b.wob);
  c.strokeStyle = 'rgba(0,0,0,0.18)';
  c.lineWidth = Math.max(0.6, r * 0.022);
  c.stroke();
  c.beginPath();
  c.arc(0, 0, r * 0.93, Math.PI * 1.05, Math.PI * 1.55);
  c.strokeStyle = 'rgba(255,255,255,0.55)';
  c.lineWidth = Math.max(0.8, r * 0.045);
  c.lineCap = 'round';
  c.stroke();

  return { sprite: cv, half: size / 2 / dpr };
};
