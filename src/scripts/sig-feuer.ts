// Signatur: feuer – eine Schale, vier Glasuren. Alle Zustände teilen exakt dieselbe Form; der Wechsel blendet nur die Glasurfarbe über und lässt die Schale kurz glühen.
import { random, reducedMotion } from './keramik';

type Metal = 'eisen' | 'kupfer';
type Atmo = 'ox' | 'red';
const ZUSTAND_KEYS = ['eisen-ox', 'eisen-red', 'kupfer-ox', 'kupfer-red'] as const;
type ZustandKey = (typeof ZUSTAND_KEYS)[number];

interface Auswahl {
  metal: Metal;
  atmo: Atmo;
}

interface Zustand {
  color: string;
  why: string;
  label: string;
  rim: string;
  body: string;
  pool: string;
  deep: string;
  mottle: readonly [string, string];
  speck: string;
  specks: number;
  pins: number;
  edge: string;
}

interface Schalenbild {
  cv: HTMLCanvasElement;
  R: number;
}

// Farben aus Glasur-Realität: Honig, Seladon, Kupfergrün, Ochsenblut
const STATES: Record<ZustandKey, Zustand> = {
  'eisen-ox': {
    color: 'Gelb bis braun',
    why: 'Eisenoxid, oxidierend: sauerstoffreiche Ofenatmosphäre.',
    label: 'Schale mit honiggelber bis brauner Eisenglasur',
    rim: '#D9BC84',
    body: '#B98A45',
    pool: '#8B5C26',
    deep: '#6A4119',
    mottle: ['#D6A95E', '#7A4D1E'],
    speck: '#3A2312',
    specks: 150,
    pins: 26,
    edge: '#7A4D1E',
  },
  'eisen-red': {
    color: 'Grün',
    why: 'Eisenoxid, reduzierend: sauerstoffarme Ofenatmosphäre.',
    label: 'Schale mit seladongrüner Eisenglasur und dunklen Eisenpunkten',
    rim: '#CDD9C6',
    body: '#A3BDA9',
    pool: '#6F9783',
    deep: '#4B7566',
    mottle: ['#BFD3C2', '#5E8776'],
    speck: '#33291F',
    specks: 120,
    pins: 30,
    edge: '#5E5646',
  },
  'kupfer-ox': {
    color: 'Grün',
    why: 'Kupfer, oxidierend: sauerstoffreiche Ofenatmosphäre.',
    label: 'Schale mit kupfergrüner Glasur',
    rim: '#86AB91',
    body: '#58886B',
    pool: '#3A6A52',
    deep: '#244C3A',
    mottle: ['#7FAE90', '#2F5A45'],
    speck: '#1E3A2D',
    specks: 18,
    pins: 20,
    edge: '#2F5A45',
  },
  'kupfer-red': {
    color: 'Rot',
    why: 'Kupfer, reduzierend: sauerstoffarme Ofenatmosphäre – es schlägt von Grün nach Rot um.',
    label: 'Schale mit ochsenblutroter Kupferglasur',
    rim: '#B9644F',
    body: '#A23F36',
    pool: '#741F20',
    deep: '#4D1217',
    mottle: ['#BE5744', '#4A1621'],
    speck: '#3A1014',
    specks: 10,
    pins: 14,
    edge: '#5A1A1C',
  },
};
const KEY = (metal: Metal, atmo: Atmo): ZustandKey => `${metal}-${atmo}`;
const BLEND_MS = 1300;
const GLOW_CHASE_MS = 260;
const SEED = 1924;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

const hexA = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;

// Schale von oben, Licht von links oben. Alles in Einheiten des Radius R.
// part 'shadow': nur der Schattenwurf (für alle Zustände gleich), part 'bowl': die Schale ohne Schatten.
// Form und Verteilung der Marmorierung hängen nur vom Seed ab, nie vom Zustand.
function renderBowl(S: number, dpr: number, g: Zustand, part: 'shadow' | 'bowl'): Schalenbild | null {
  const rand = random(SEED);
  const randSpecks = random(SEED + 1);
  const randPins = random(SEED + 2);
  const px = Math.round(S * dpr);
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const c = cv.getContext('2d');
  if (!c) return null;
  c.scale(dpr, dpr);
  c.translate(S / 2, S / 2);
  const R = S * 0.39;
  const wob: readonly [number, number, number, number, number, number] = [
    0.012,
    rand() * 6.28,
    0.008,
    rand() * 6.28,
    0.005,
    rand() * 6.28,
  ];
  const shape = (r: number) => {
    c.beginPath();
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      const rr =
        r *
        (1 + wob[0] * Math.sin(2 * a + wob[1]) + wob[2] * Math.sin(3 * a + wob[3]) + wob[4] * Math.sin(5 * a + wob[5]));
      const x = Math.cos(a) * rr,
        y = Math.sin(a) * rr;
      if (k) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.closePath();
  };
  const ri = R * 0.9;

  if (part === 'shadow') {
    c.shadowColor = 'rgba(0,0,0,0.6)';
    c.shadowBlur = R * 0.28;
    c.shadowOffsetX = R * 0.1;
    c.shadowOffsetY = R * 0.16;
    shape(R);
    c.fillStyle = '#000';
    c.fill();
    return { cv, R };
  }

  // Rand: dünne Glasur, der Scherben scheint durch; oben links im Licht
  shape(R);
  c.fillStyle = g.rim;
  c.fill();
  const lip = c.createLinearGradient(-R, -R, R, R);
  lip.addColorStop(0, 'rgba(255,255,255,0.34)');
  lip.addColorStop(0.5, 'rgba(255,255,255,0.02)');
  lip.addColorStop(1, 'rgba(0,0,0,0.22)');
  c.fillStyle = lip;
  c.fill();
  // dunkle Eisenkante außen
  shape(R * 0.994);
  c.strokeStyle = hexA(g.edge, 0.45);
  c.lineWidth = Math.max(1, R * 0.008);
  c.stroke();

  // Innenraum
  c.save();
  shape(ri);
  c.clip();
  c.fillStyle = g.body;
  c.fillRect(-R, -R, R * 2, R * 2);

  // Glasur sammelt sich in der Mitte: weicher Pool, darin eine tiefere Mulde
  const pool = c.createRadialGradient(R * 0.04, R * 0.06, 0, 0, 0, ri * 0.92);
  pool.addColorStop(0, g.deep);
  pool.addColorStop(0.28, hexA(g.pool, 0.95));
  pool.addColorStop(0.62, hexA(g.pool, 0.55));
  pool.addColorStop(1, hexA(g.pool, 0));
  c.fillStyle = pool;
  c.fillRect(-R, -R, R * 2, R * 2);

  // Marmorierung: weiche Flecken, dichter zur Mitte
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.pow(rand(), 0.8) * ri * 0.95;
    const r = R * (0.05 + rand() * 0.22);
    const col = i % 2 ? g.mottle[1] : g.mottle[0];
    const x = Math.cos(a) * d,
      y = Math.sin(a) * d;
    const b = c.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, hexA(col, 0.1 + rand() * 0.16));
    b.addColorStop(1, hexA(col, 0));
    c.fillStyle = b;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Drehrillen: feine Kreise, auf der Lichtseite hell, auf der Schattenseite dunkel
  const grooveCount = 9;
  for (let k = 0; k < grooveCount; k++) {
    const r = ri * (0.18 + (k / grooveCount) * 0.78) * (1 + (rand() - 0.5) * 0.02);
    const gr = c.createLinearGradient(-r, -r, r, r);
    gr.addColorStop(0, 'rgba(0,0,0,0.13)');
    gr.addColorStop(0.5, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(255,255,255,0.16)');
    c.strokeStyle = gr;
    c.lineWidth = Math.max(0.7, R * (0.006 + rand() * 0.008));
    c.beginPath();
    c.arc(rand() * 0.8 - 0.4, rand() * 0.8 - 0.4, r, 0, Math.PI * 2);
    c.stroke();
  }

  // Wand: ferne Wand (unten rechts) im Licht, nahe Wand (oben links) im Schatten
  const wall = c.createLinearGradient(-ri, -ri, ri, ri);
  wall.addColorStop(0, 'rgba(0,0,0,0.34)');
  wall.addColorStop(0.45, 'rgba(0,0,0,0.02)');
  wall.addColorStop(1, 'rgba(255,255,255,0.26)');
  c.fillStyle = wall;
  c.fillRect(-R, -R, R * 2, R * 2);
  const vignette = c.createRadialGradient(0, 0, ri * 0.55, 0, 0, ri);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
  c.fillStyle = vignette;
  c.fillRect(-R, -R, R * 2, R * 2);

  // dünnere Glasur am Rand
  const thin = c.createRadialGradient(0, 0, ri * 0.8, 0, 0, ri);
  thin.addColorStop(0, hexA(g.rim, 0));
  thin.addColorStop(1, hexA(g.rim, 0.6));
  c.fillStyle = thin;
  c.fillRect(-R, -R, R * 2, R * 2);

  // Eisenpunkte und Sprenkel
  for (let i = 0; i < g.specks; i++) {
    const a = randSpecks() * Math.PI * 2;
    const d = Math.sqrt(randSpecks()) * ri * 0.97;
    const s = randSpecks();
    c.globalAlpha = 0.35 + s * 0.6;
    c.fillStyle = g.speck;
    c.beginPath();
    c.ellipse(
      Math.cos(a) * d,
      Math.sin(a) * d,
      R * (0.004 + s * s * 0.016),
      R * (0.004 + s * s * 0.012),
      randSpecks() * 3,
      0,
      Math.PI * 2,
    );
    c.fill();
  }
  // Nadelstiche: winzige helle Punkte mit dunklem Hof
  for (let i = 0; i < g.pins; i++) {
    const a = randPins() * Math.PI * 2;
    const d = Math.sqrt(randPins()) * ri * 0.9;
    const x = Math.cos(a) * d,
      y = Math.sin(a) * d;
    c.globalAlpha = 0.5;
    c.fillStyle = 'rgba(0,0,0,0.5)';
    c.beginPath();
    c.arc(x, y, R * 0.006, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath();
    c.arc(x - R * 0.002, y - R * 0.002, R * 0.0025, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;

  // Glanzlicht der Glasur auf der fernen Wand
  const sheen = c.createRadialGradient(ri * 0.42, ri * 0.46, 0, ri * 0.42, ri * 0.46, ri * 0.4);
  sheen.addColorStop(0, 'rgba(255,255,255,0.2)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sheen;
  c.fillRect(-R, -R, R * 2, R * 2);
  c.restore();

  // Innenkante: Schatten unter der Lippe, dann Lichtkante
  shape(ri);
  c.strokeStyle = 'rgba(0,0,0,0.3)';
  c.lineWidth = Math.max(1, R * 0.016);
  c.stroke();
  c.beginPath();
  c.arc(0, 0, ri * 1.03, Math.PI * 0.62, Math.PI * 1.02);
  c.strokeStyle = 'rgba(255,255,255,0.1)';
  c.lineWidth = Math.max(1, R * 0.012);
  c.stroke();

  // Glanzlicht auf der Lippe, oben links
  c.beginPath();
  c.arc(0, 0, R * 0.955, Math.PI * 1.06, Math.PI * 1.56);
  c.strokeStyle = 'rgba(255,255,255,0.6)';
  c.lineWidth = Math.max(1, R * 0.034);
  c.lineCap = 'round';
  c.stroke();
  c.beginPath();
  c.arc(0, 0, R * 0.955, Math.PI * 1.18, Math.PI * 1.34);
  c.strokeStyle = 'rgba(255,255,255,0.55)';
  c.lineWidth = Math.max(1, R * 0.016);
  c.stroke();

  return { cv, R };
}

export default function init(el: Element) {
  const list = el.querySelector('.feuer-farben__list');
  const intro = [...el.querySelectorAll('.feuer-farben__title, .feuer-farben__intro')];
  if (!list || el.querySelector('canvas')) return;

  const reduced = reducedMotion();
  const sel: Auswahl = { metal: 'eisen', atmo: 'ox' };

  const stage = document.createElement('div');
  stage.className = 'feuer-farben__stage';
  const canvas = document.createElement('canvas');
  canvas.className = 'feuer-farben__canvas';
  canvas.setAttribute('role', 'img');
  stage.append(canvas);

  const makeGroup = <K extends keyof Auswahl>(
    name: string,
    options: readonly (readonly [Auswahl[K], string])[],
    key: K,
  ) => {
    const group = document.createElement('div');
    group.className = 'feuer-farben__group';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', name);
    options.forEach(([value, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'feuer-farben__btn';
      b.textContent = label;
      b.dataset.value = value;
      b.setAttribute('aria-pressed', String(sel[key] === value));
      b.addEventListener('click', () => {
        if (sel[key] === value) return;
        sel[key] = value;
        group.querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        change();
      });
      group.append(b);
    });
    return group;
  };
  const controls = document.createElement('div');
  controls.className = 'feuer-farben__controls';
  controls.append(
    makeGroup(
      'Färbendes Oxid',
      [
        ['eisen', 'Eisen'],
        ['kupfer', 'Kupfer'],
      ],
      'metal',
    ),
    makeGroup(
      'Ofenatmosphäre',
      [
        ['ox', 'oxidierend'],
        ['red', 'reduzierend'],
      ],
      'atmo',
    ),
  );

  const result = document.createElement('p');
  result.className = 'feuer-farben__result';
  result.setAttribute('aria-live', 'polite');
  const colorLine = document.createElement('span');
  colorLine.className = 'feuer-farben__color';
  const whyLine = document.createElement('span');
  whyLine.className = 'feuer-farben__why';
  result.append(colorLine, whyLine);

  const note = document.createElement('p');
  note.className = 'feuer-farben__note';
  note.textContent = 'Holzofen · 9–10 Stunden · bis 1300 °C';

  el.replaceChildren(...intro, stage, controls, result, note);

  let S = 0,
    dpr = 1,
    ctx: CanvasRenderingContext2D | null = null;
  const sprites: Partial<Record<ZustandKey, Schalenbild | null>> = {};
  let shadow: Schalenbild | null = null;
  let base: ZustandKey | HTMLCanvasElement = KEY(sel.metal, sel.atmo); // Schale, die gerade ganz sichtbar ist (Bild oder Schnappschuss)
  let target: ZustandKey | null = null; // Zielzustand eines laufenden Wechsels
  let progress = 0,
    glowAmt = 0,
    last = 0,
    raf = 0;
  const snaps: HTMLCanvasElement[] = [];
  let snapIndex = 0;

  const bowl = (key: ZustandKey) => (sprites[key] ??= renderBowl(S, dpr, STATES[key], 'bowl'));
  const layerOf = (src: ZustandKey | HTMLCanvasElement) => (typeof src === 'string' ? (bowl(src)?.cv ?? null) : src);

  const text = () => {
    const st = STATES[KEY(sel.metal, sel.atmo)];
    colorLine.textContent = st.color;
    whyLine.textContent = st.why;
    canvas.setAttribute('aria-label', st.label);
  };

  const glow = (c: CanvasRenderingContext2D, R: number, amount: number) => {
    if (amount <= 0.001) return;
    c.save();
    c.globalCompositeOperation = 'lighter';
    // Wärme vom Rand her, innen bleibt die Glasur sichtbar
    const halo = c.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.3);
    halo.addColorStop(0, 'rgba(255,110,40,0)');
    halo.addColorStop(0.55, `rgba(255,120,45,${0.14 * amount})`);
    halo.addColorStop(0.76, `rgba(255,150,60,${0.38 * amount})`);
    halo.addColorStop(0.82, `rgba(255,140,50,${0.38 * amount})`);
    halo.addColorStop(1, 'rgba(255,90,30,0)');
    c.fillStyle = halo;
    c.fillRect(-S / 2, -S / 2, S, S);
    c.fillStyle = `rgba(255,95,25,${0.11 * amount})`;
    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };

  // Schatten, Schale, darüber die Zielschale mit wachsender Deckkraft, dann das Glühen. Die Form ist in allen Lagen identisch.
  const paint = () => {
    if (!ctx || !shadow) return;
    ctx.clearRect(-S / 2, -S / 2, S, S);
    ctx.drawImage(shadow.cv, -S / 2, -S / 2, S, S);
    const baseLayer = layerOf(base);
    if (baseLayer) ctx.drawImage(baseLayer, -S / 2, -S / 2, S, S);
    if (target && progress > 0) {
      const targetBowl = bowl(target);
      ctx.globalAlpha = ease(progress);
      if (targetBowl) ctx.drawImage(targetBowl.cv, -S / 2, -S / 2, S, S);
      ctx.globalAlpha = 1;
    }
    glow(ctx, shadow.R, glowAmt);
  };

  // Hält die aktuell sichtbare Mischung als eigene Schale fest, damit ein neuer Klick mitten im Wechsel ohne Sprung weiterblendet.
  // Zwei Puffer im Wechsel, weil die neue Mischung auch aus dem vorigen Schnappschuss entstehen kann.
  const freeze = (to: ZustandKey) => {
    snapIndex = 1 - snapIndex;
    const cv = (snaps[snapIndex] ??= document.createElement('canvas'));
    cv.width = cv.height = Math.round(S * dpr);
    const c = cv.getContext('2d');
    if (!c) return cv;
    const baseLayer = layerOf(base);
    if (baseLayer) c.drawImage(baseLayer, 0, 0);
    c.globalAlpha = ease(progress);
    const targetBowl = bowl(to);
    if (targetBowl) c.drawImage(targetBowl.cv, 0, 0);
    return cv;
  };

  const frame = (now: number) => {
    const dt = Math.min(now - last, 64);
    last = now;
    if (target) progress = Math.min(1, progress + dt / BLEND_MS);
    glowAmt += ((target && progress < 0.5 ? 1 : 0) - glowAmt) * (1 - Math.exp(-dt / GLOW_CHASE_MS));
    paint();
    if (target && progress >= 1) {
      base = target;
      target = null;
      progress = 0;
      paint();
    }
    if (target || glowAmt > 0.004) {
      raf = requestAnimationFrame(frame);
    } else {
      glowAmt = 0;
      raf = 0;
      paint();
    }
  };

  const change = () => {
    text();
    const next = KEY(sel.metal, sel.atmo);
    if (!S) return;
    if (reduced) {
      base = next;
      target = null;
      progress = 0;
      glowAmt = 0;
      paint();
      return;
    }
    if (next === target) return;
    if (target) base = freeze(target);
    target = next;
    progress = 0;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const layout = () => {
    const w = Math.round(stage.getBoundingClientRect().width);
    if (!w || w === S) return;
    S = w;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(S * dpr);
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, (S * dpr) / 2, (S * dpr) / 2);
    for (const k of ZUSTAND_KEYS) delete sprites[k];
    shadow = renderBowl(S, dpr, STATES['eisen-ox'], 'shadow');
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    target = null;
    progress = 0;
    glowAmt = 0;
    base = KEY(sel.metal, sel.atmo);
    paint();
    // die übrigen Endzustände in Leerlaufzeit vorrendern
    ZUSTAND_KEYS.filter((k) => k !== base).forEach((k, i) => setTimeout(() => bowl(k), 300 + i * 250));
  };

  text();
  layout();
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  }).observe(stage);
}
