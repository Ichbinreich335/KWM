// Signatur: feuer – eine Schale, vier Glasuren. Wechsel als kurzer Brand: Glühen, dann Abkühlen in die neue Glasur.
import { random, reducedMotion } from './keramik.js';

// Farben aus Glasur-Realität: Honig, Seladon, Kupfergrün, Ochsenblut
const STATES = {
  'eisen-ox': {
    color: 'Gelb bis braun',
    why: 'Eisenoxid, oxidierend: sauerstoffreiche Ofenatmosphäre.',
    label: 'Schale mit honiggelber bis brauner Eisenglasur',
    rim: '#D9BC84', body: '#B98A45', pool: '#8B5C26', deep: '#6A4119',
    mottle: ['#D6A95E', '#7A4D1E'], speck: '#3A2312', specks: 150, pins: 26, edge: '#7A4D1E',
  },
  'eisen-red': {
    color: 'Grün',
    why: 'Eisenoxid, reduzierend: sauerstoffarme Ofenatmosphäre.',
    label: 'Schale mit seladongrüner Eisenglasur und dunklen Eisenpunkten',
    rim: '#CDD9C6', body: '#A3BDA9', pool: '#6F9783', deep: '#4B7566',
    mottle: ['#BFD3C2', '#5E8776'], speck: '#33291F', specks: 120, pins: 30, edge: '#5E5646',
  },
  'kupfer-ox': {
    color: 'Grün',
    why: 'Kupfer, oxidierend: sauerstoffreiche Ofenatmosphäre.',
    label: 'Schale mit kupfergrüner Glasur',
    rim: '#86AB91', body: '#58886B', pool: '#3A6A52', deep: '#244C3A',
    mottle: ['#7FAE90', '#2F5A45'], speck: '#1E3A2D', specks: 18, pins: 20, edge: '#2F5A45',
  },
  'kupfer-red': {
    color: 'Rot',
    why: 'Kupfer, reduzierend: sauerstoffarme Ofenatmosphäre – es schlägt von Grün nach Rot um.',
    label: 'Schale mit ochsenblutroter Kupferglasur',
    rim: '#B9644F', body: '#A23F36', pool: '#741F20', deep: '#4D1217',
    mottle: ['#BE5744', '#4A1621'], speck: '#3A1014', specks: 10, pins: 14, edge: '#5A1A1C',
  },
};
const KEY = (metal, atmo) => `${metal}-${atmo === 'ox' ? 'ox' : 'red'}`;
const GLOW_IN = 500;
const GLOW_OUT = 700;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

const hexA = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

// Schale von oben, Licht von links oben. Alles in Einheiten des Radius R.
function renderBowl(S, dpr, g, seed) {
  const rand = random(seed);
  const px = Math.round(S * dpr);
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const c = cv.getContext('2d');
  c.scale(dpr, dpr);
  c.translate(S / 2, S / 2);
  const R = S * 0.39;
  const wob = [0.012, rand() * 6.28, 0.008, rand() * 6.28, 0.005, rand() * 6.28];
  const shape = (r) => {
    c.beginPath();
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      const rr = r * (1 + wob[0] * Math.sin(2 * a + wob[1]) + wob[2] * Math.sin(3 * a + wob[3]) + wob[4] * Math.sin(5 * a + wob[5]));
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      if (k) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
  };
  const ri = R * 0.9;

  // Schatten auf der Fläche
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)';
  c.shadowBlur = R * 0.28;
  c.shadowOffsetX = R * 0.1;
  c.shadowOffsetY = R * 0.16;
  shape(R);
  c.fillStyle = g.rim;
  c.fill();
  c.restore();

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
    const col = g.mottle[i % g.mottle.length];
    const x = Math.cos(a) * d, y = Math.sin(a) * d;
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
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * ri * 0.97;
    const s = rand();
    c.globalAlpha = 0.35 + s * 0.6;
    c.fillStyle = g.speck;
    c.beginPath();
    c.ellipse(Math.cos(a) * d, Math.sin(a) * d, R * (0.004 + s * s * 0.016), R * (0.004 + s * s * 0.012), rand() * 3, 0, Math.PI * 2);
    c.fill();
  }
  // Nadelstiche: winzige helle Punkte mit dunklem Hof
  for (let i = 0; i < g.pins; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * ri * 0.9;
    const x = Math.cos(a) * d, y = Math.sin(a) * d;
    c.globalAlpha = 0.5;
    c.fillStyle = 'rgba(0,0,0,0.5)';
    c.beginPath(); c.arc(x, y, R * 0.006, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath(); c.arc(x - R * 0.002, y - R * 0.002, R * 0.0025, 0, Math.PI * 2); c.fill();
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

export default function init(el) {
  const list = el.querySelector('.feuer-farben__list');
  const title = el.querySelector('.feuer-farben__title');
  if (!list || el.querySelector('canvas')) return;

  const reduced = reducedMotion();
  const sel = { metal: 'eisen', atmo: 'ox' };

  const stage = document.createElement('div');
  stage.className = 'feuer-farben__stage';
  const canvas = document.createElement('canvas');
  canvas.className = 'feuer-farben__canvas';
  canvas.setAttribute('role', 'img');
  stage.append(canvas);

  const makeGroup = (name, options, key) => {
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
    makeGroup('Färbendes Oxid', [['eisen', 'Eisen'], ['kupfer', 'Kupfer']], 'metal'),
    makeGroup('Ofenatmosphäre', [['ox', 'oxidierend'], ['red', 'reduzierend']], 'atmo'),
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

  el.replaceChildren(...(title ? [title] : []), stage, controls, result, note);

  let S = 0, dpr = 1, ctx = null;
  const sprites = {};
  let current = KEY(sel.metal, sel.atmo);
  let from = null, to = null, startAt = 0, raf = 0;

  const sprite = (key) => (sprites[key] ??= renderBowl(S, dpr, STATES[key], 1924 + Object.keys(STATES).indexOf(key) * 7));

  const text = () => {
    const st = STATES[KEY(sel.metal, sel.atmo)];
    colorLine.textContent = st.color;
    whyLine.textContent = st.why;
    canvas.setAttribute('aria-label', st.label);
  };

  const glow = (b, amount) => {
    if (amount <= 0.001) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Wärme vom Rand her, innen bleibt die Glasur sichtbar
    const R = b.R;
    const halo = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.3);
    halo.addColorStop(0, 'rgba(255,110,40,0)');
    halo.addColorStop(0.55, `rgba(255,120,45,${0.14 * amount})`);
    halo.addColorStop(0.76, `rgba(255,150,60,${0.38 * amount})`);
    halo.addColorStop(0.82, `rgba(255,140,50,${0.38 * amount})`);
    halo.addColorStop(1, 'rgba(255,90,30,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(-S / 2, -S / 2, S, S);
    ctx.fillStyle = `rgba(255,95,25,${0.11 * amount})`;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const paint = (a, bKey, mix, glowAmount) => {
    ctx.clearRect(-S / 2, -S / 2, S, S);
    const A = sprite(a);
    ctx.drawImage(A.cv, -S / 2, -S / 2, S, S);
    if (bKey && mix > 0) {
      ctx.globalAlpha = mix;
      ctx.drawImage(sprite(bKey).cv, -S / 2, -S / 2, S, S);
      ctx.globalAlpha = 1;
    }
    glow(A, glowAmount);
  };

  const frame = (now) => {
    const t = now - startAt;
    if (t >= GLOW_IN + GLOW_OUT) {
      current = to; from = to = null; raf = 0;
      paint(current, null, 0, 0);
      return;
    }
    if (t < GLOW_IN) {
      paint(from, null, 0, ease(t / GLOW_IN));
    } else {
      const u = (t - GLOW_IN) / GLOW_OUT;
      paint(from, to, ease(u), Math.pow(1 - u, 1.6));
    }
    raf = requestAnimationFrame(frame);
  };

  const change = () => {
    text();
    const next = KEY(sel.metal, sel.atmo);
    if (reduced || !S) {
      current = next; from = to = null;
      if (S) paint(current, null, 0, 0);
      return;
    }
    if (raf) cancelAnimationFrame(raf);
    from = to ?? current;
    to = next;
    startAt = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const layout = () => {
    const w = Math.round(stage.getBoundingClientRect().width);
    if (!w || w === S) return;
    S = w;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(S * dpr);
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, (S * dpr) / 2, (S * dpr) / 2);
    Object.keys(sprites).forEach((k) => delete sprites[k]);
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    from = to = null;
    current = KEY(sel.metal, sel.atmo);
    paint(current, null, 0, 0);
    // die übrigen Endzustände in Leerlaufzeit vorrendern
    Object.keys(STATES).filter((k) => k !== current).forEach((k, i) => setTimeout(() => sprite(k), 300 + i * 250));
  };

  text();
  layout();
  let resizeTimer = 0;
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 150); }).observe(stage);
}
