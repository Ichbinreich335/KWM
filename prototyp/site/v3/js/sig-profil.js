// Signatur: profil – „Keine ist wie die andere“
// Technische Profilzeichnung einer Schale: links die Außenansicht, rechts der Schnitt, dazwischen die Mittelachse.
// Jede Nummer (1–99) bestimmt Form, Maße und Glasur; ein Zufallsstartwert wählt die Nummer.
// Beim Berühren wird die Außenseite von unten nach oben glasiert, der Fuß bleibt roh.
import { CLAY, random, pickGlaze, reducedMotion } from './keramik.js';

const NS = 'http://www.w3.org/2000/svg';
const COUNT = 99;
const SAMPLES = 96;

// Zeichenfläche in Einheiten; Maße der Schale werden hineinskaliert
const VB = { w: 220, h: 160, ground: 146, cx: 104, maxW: 168, maxH: 106 };
const GLAZE_SKIN = 1.3; // Abstand der Glasurlinie zur Scherbenkante, in mm (überhöht, damit sie lesbar bleibt)
const SOFT = 14; // Weichheit der Glasurfront
const PX = { contour: 1.5, thin: 0.8, dim: 0.7 }; // Strichstärken in Bildschirm-Pixeln

const TIMING = { intro: 750, draw: 2100, redraw: 1500, glazeIn: 1500, glazeOut: 800 };
// Anteile der Zeichenzeit, in denen die Linien gezogen werden
const SEG = { axis: [0, 0.3], ground: [0.08, 0.38], contour: [0.22, 0.64], section: [0.5, 0.94], fill: [0.8, 1], dims: [0.86, 1] };

const MIN_HEIGHT = 88; // darunter wird die Zeichnung ausgeblendet, statt die Überschrift zu bedrängen
const MAX_HEIGHT = 240;
const GAP = 24;
const CAPTION_MIN = 200; // schmalste Breite der Beschriftung neben der Zeichnung

const between = (r, a, b) => a + (b - a) * r();
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const f = (v) => v.toFixed(2);
const seg = (p, [a, b]) => easeOut(clamp01((p - a) / (b - a)));

/* ---------- Formen ---------- */
// Maße in Millimetern. c1/c2 sind Anteile der Kurve vom Fußansatz zur Lippe (x: Anteil von Fuß bis Rand, y: Anteil der Wandhöhe).
const FORMS = [
  {
    name: 'Kumme', weight: 30,
    make: (r) => {
      const D = between(r, 128, 172);
      return { D, H: D * between(r, 0.46, 0.6), foot: D * between(r, 0.19, 0.23), fw: between(r, 5, 8), flare: between(r, 0, 2), hf: between(r, 5, 8), t: between(r, 4.5, 7), c1: [0.55, 0], c2: [between(r, 1, 1.04), 0.55], lip: between(r, 0.93, 0.98) };
    },
  },
  {
    name: 'Flache Schale', weight: 22,
    make: (r) => {
      const D = between(r, 168, 208);
      return { D, H: D * between(r, 0.2, 0.3), foot: D * between(r, 0.18, 0.22), fw: between(r, 5, 8), flare: between(r, 0, 2), hf: between(r, 3, 5), t: between(r, 4, 6), c1: [0.5, 0], c2: [between(r, 0.76, 0.86), 0.38], lip: 1 };
    },
  },
  {
    name: 'Teeschale', weight: 20,
    make: (r) => {
      const D = between(r, 92, 112);
      return { D, H: D * between(r, 0.72, 0.9), foot: D * between(r, 0.14, 0.17), fw: between(r, 4, 6), flare: 0, hf: between(r, 4, 6), t: between(r, 3.5, 5), c1: [0.42, 0.12], c2: [0.92, 0.58], lip: 1 };
    },
  },
  {
    name: 'Reisschale', weight: 16,
    make: (r) => {
      const D = between(r, 112, 134);
      const H = D * between(r, 0.52, 0.64);
      return { D, H, foot: D * between(r, 0.2, 0.24), fw: between(r, 5, 7), flare: between(r, 3, 5), hf: H * between(r, 0.18, 0.25), t: between(r, 4, 6), c1: [0.6, 0], c2: [between(r, 1.01, 1.05), 0.5], lip: between(r, 0.95, 0.99) };
    },
  },
  {
    name: 'Kelch', weight: 12,
    make: (r) => {
      const D = between(r, 84, 104);
      const H = D * between(r, 1, 1.28);
      return { D, H, foot: D * between(r, 0.24, 0.3), fw: between(r, 5, 7), flare: between(r, 1, 3), hf: H * between(r, 0.1, 0.14), t: between(r, 3.5, 5), c1: [0.7, 0.05], c2: [between(r, 1.03, 1.08), 0.62], lip: between(r, 0.88, 0.94) };
    },
  },
];

function pickForm(r) {
  const total = FORMS.reduce((a, form) => a + form.weight, 0);
  let v = r() * total;
  for (const form of FORMS) if ((v -= form.weight) <= 0) return form;
  return FORMS[0];
}

const bezier = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1],
  ];
};

// Geometrie einer Schale in Millimetern (x: Abstand zur Achse, y: Höhe über der Standfläche)
function buildBowl(n) {
  const r = random(n * 2654435 + 1924);
  const form = pickForm(r);
  const m = form.make(r);
  const R = m.D / 2;
  const x0 = m.foot + m.flare;
  const h = m.H - m.hf;
  const dx = R - x0;
  const p0 = [x0, m.hf];
  const p1 = [x0 + m.c1[0] * dx, m.hf + m.c1[1] * h];
  const p2 = [R * m.c2[0], m.hf + m.c2[1] * h];
  const p3 = [R * m.lip, m.H];
  const outer = Array.from({ length: SAMPLES + 1 }, (_, i) => bezier(p0, p1, p2, p3, i / SAMPLES));

  // Innenkontur: Außenkontur nach innen versetzt, am Boden dicker, am Rand dünner
  const inner = [];
  const normals = [];
  outer.forEach((p, i) => {
    const a = outer[Math.max(0, i - 1)];
    const b = outer[Math.min(SAMPLES, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const k = i / SAMPLES;
    const t = m.t * (1.2 - 0.5 * k);
    normals.push([nx, ny]);
    inner.push([Math.max(0, p[0] + nx * t), p[1] + ny * t]);
  });
  // am Rand auf Lippenhöhe kappen
  while (inner.length > 2 && inner[inner.length - 1][1] > m.H) inner.pop();
  const last = inner[inner.length - 1];
  if (last[1] < m.H) {
    const prev = outer[Math.min(SAMPLES, inner.length)];
    const k = (m.H - last[1]) / Math.max(0.001, prev[1] - last[1]);
    inner.push([last[0] + (prev[0] - last[0]) * Math.min(1, k) * 0.5, m.H]);
  }

  const glaze = pickGlaze(random(n));
  const rmax = Math.max(...outer.map((p) => p[0]));
  const dipMm = m.hf + h * between(r, 0.1, 0.17);
  // Glasurschicht auf dem Schnitt: knapp neben der Wand, innen vollständig, außen oberhalb der Tauchgrenze
  const skin = (p, [nx, ny], d) => [p[0] + nx * d, p[1] + ny * d];
  const innerSkin = inner.map((p, i) => skin(p, normals[Math.min(i, SAMPLES)], GLAZE_SKIN));
  const outerSkin = outer.map((p, i) => skin(p, normals[i], -GLAZE_SKIN)).filter((p) => p[1] >= dipMm + 1);
  return { n, form, glaze, m, R, rmax, outer, inner, innerSkin, outerSkin, dipMm, seed: r };
}

/* ---------- Zeichnung ---------- */
function describe(b) {
  const d = Math.round(b.m.D);
  const hh = Math.round(b.m.H);
  return { d, hh, label: `Profilzeichnung der Schale ${b.n} von ${COUNT}: ${b.form.name}, Außenansicht links, Schnitt rechts, Durchmesser ${d} Millimeter, Höhe ${hh} Millimeter, Glasur ${b.glaze.name}.` };
}

function render(b) {
  const { m, glaze, outer, inner } = b;
  const s = Math.min(VB.maxW / (2 * b.rmax), VB.maxH / m.H);
  const X = (x) => VB.cx + x * s;
  const Y = (y) => VB.ground - y * s;
  const pt = ([x, y], side = 1) => `${f(X(x * side))},${f(Y(y))}`;
  const line = (pts, side = 1) => pts.map((p, i) => `${i ? 'L' : 'M'}${pt(p, side)}`).join('');

  const xo = m.foot; // Fußring außen
  const xi = m.foot - m.fw; // Fußring innen
  const x0 = m.foot + m.flare;
  const lipOut = outer[SAMPLES];
  const lipIn = inner[inner.length - 1];
  const floorY = inner[0][1];
  const top = Y(m.H);

  // Außenansicht (links): Fuß, Wand, Lippe bis zur Achse
  const contour = `M${pt([xo, 0], -1)}L${pt([x0, m.hf], -1)}${line(outer, -1).replace(/^M/, 'L')}L${pt([0, m.H])}`;
  const silhouette = `${contour}L${pt([0, 0])}Z`;

  // Schnitt (rechts): Fußring, Wand, gerundete Lippe, Innenfläche
  const bump = Math.max(0.6, (lipOut[0] - lipIn[0]) * 0.18);
  const rim = `Q${f(X((lipOut[0] + lipIn[0]) / 2))},${f(Y(m.H + bump))} ${pt(lipIn)}`;
  const body = `M${pt([0, m.hf])}L${pt([xi, m.hf])}L${pt([xi, 0])}L${pt([xo, 0])}L${pt([x0, m.hf])}${line(outer).replace(/^M/, 'L')}L${pt(lipOut)}${rim}${line([...inner].reverse()).replace(/^M/, 'L')}L${pt([0, floorY])}`;

  // Glasurgrenze mit leicht unruhigem Tauchrand
  const rnd = b.seed;
  const ph1 = rnd() * 6.28;
  const ph2 = rnd() * 6.28;
  const dipAt = (x) => b.dipMm + 0.9 * (0.6 * Math.sin(x * 0.19 + ph1) + 0.4 * Math.sin(x * 0.47 + ph2));
  const dipPts = [];
  for (let x = -b.rmax - 4; x <= 0.5; x += 2) dipPts.push([x, dipAt(x)]);
  const dipLine = line(dipPts);
  const above = `M${f(X(-b.rmax - 4))},${f(top - 6)}L${f(X(0.5))},${f(top - 6)}${line(dipPts.slice().reverse()).replace(/^M/, 'L')}Z`;

  // Außenfläche des Schnitts oberhalb der Glasurgrenze, Innenfläche ganz
  const yb = Y(b.dipMm);
  const lightX = [X(-b.rmax), X(0)];

  // Sprenkel und Craquelé, reproduzierbar
  let fine = '';
  if (glaze.speckle) {
    const sr = random(b.n * 31 + 7);
    const cnt = Math.round(110 * (s * m.D * s * m.H) / 9000 + 60);
    for (let i = 0; i < cnt; i++) {
      const x = -sr() * b.rmax;
      const y = b.dipMm + sr() * (m.H - b.dipMm);
      fine += `<circle cx="${f(X(x))}" cy="${f(Y(y))}" r="${f(0.35 + sr() * 0.5)}"/>`;
    }
    fine = `<g fill="${glaze.speckle}" opacity="0.85">${fine}</g>`;
  } else if (glaze.name === 'Craquelé') {
    const cr = random(b.n * 17 + 3);
    let d = '';
    for (let i = 0; i < 46; i++) {
      let x = X(-cr() * b.rmax);
      let y = Y(b.dipMm + cr() * (m.H - b.dipMm));
      d += `M${f(x)},${f(y)}`;
      for (let k = 0; k < 3; k++) {
        if (cr() < 0.5) x += (cr() - 0.5) * 12; else y += (cr() - 0.5) * 12;
        d += `L${f(x)},${f(y)}`;
      }
    }
    fine = `<path d="${d}" fill="none" stroke="${glaze.pool}" stroke-opacity="0.55" class="pf-crack"/>`;
  }

  // Lichtstreifen entlang der Wölbung
  const streak = outer.filter((p) => p[1] > b.dipMm + (m.H - b.dipMm) * 0.12 && p[1] < m.H - (m.H - b.dipMm) * 0.1);
  const streakLine = line(streak.map((p) => [p[0] * 0.72, p[1]]), -1);

  // Maßlinien: Durchmesser über der Lippe, Höhe rechts neben der Schale
  const dimY = top - 9;
  const dimX = X(b.rmax) + 12;
  const rmaxPt = outer.reduce((a, p) => (p[0] > a[0] ? p : a), outer[0]);
  const dims =
    `M${f(X(-b.rmax))},${f(dimY - 2.5)}V${f(dimY + 2.5)}M${f(X(b.rmax))},${f(dimY - 2.5)}V${f(dimY + 2.5)}M${f(X(-b.rmax))},${f(dimY)}H${f(X(b.rmax))}` +
    `M${f(X(-b.rmax))},${f(Y(rmaxPt[1]))}V${f(dimY + 3)}M${f(X(b.rmax))},${f(Y(rmaxPt[1]))}V${f(dimY + 3)}` +
    `M${f(dimX - 2.5)},${f(top)}H${f(dimX + 2.5)}M${f(dimX - 2.5)},${f(Y(0))}H${f(dimX + 2.5)}M${f(dimX)},${f(top)}V${f(Y(0))}` +
    `M${f(X(lipOut[0]) + 3)},${f(top)}H${f(dimX - 3)}`;

  const axisTop = dimY - 5;
  const axisBottom = VB.ground + 5;
  const g = glaze;

  const svg = `
<defs>
  <linearGradient id="pf-front" gradientUnits="userSpaceOnUse" x1="0" y1="${f(top - 3 * SOFT)}" x2="0" y2="${f(yb + 3 * SOFT)}">
    <stop offset="0" stop-color="#000"/><stop data-front="a" offset="0" stop-color="#000"/><stop data-front="b" offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff"/>
  </linearGradient>
  <mask id="pf-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB.w}" height="${VB.h}"><rect width="${VB.w}" height="${VB.h}" fill="url(#pf-front)"/></mask>
  <clipPath id="pf-sil"><path d="${silhouette}"/></clipPath>
  <clipPath id="pf-axis"><rect data-axis x="${f(VB.cx - 3)}" y="${f(axisBottom)}" width="6" height="0"/></clipPath>
  <linearGradient id="pf-vert" gradientUnits="userSpaceOnUse" x1="0" y1="${f(top)}" x2="0" y2="${f(yb)}">
    <stop offset="0" stop-color="${g.rim}"/><stop offset="0.5" stop-color="${mix(g.rim, g.pool, 0.5)}"/><stop offset="1" stop-color="${g.pool}"/>
  </linearGradient>
  <linearGradient id="pf-light" gradientUnits="userSpaceOnUse" x1="${f(lightX[0])}" y1="0" x2="${f(lightX[1])}" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.2"/>
    <stop offset="0.07" stop-color="#000" stop-opacity="0"/>
    <stop offset="0.3" stop-color="#fff" stop-opacity="0.4"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.82" stop-color="#000" stop-opacity="0.14"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.32"/>
  </linearGradient>
  <filter id="pf-blur" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="pf-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.7"/></filter>
</defs>
<ellipse class="pf-shadow" cx="${f(X(b.rmax * 0.3))}" cy="${f(VB.ground + 0.8)}" rx="${f(b.rmax * s * 0.95)}" ry="2.2" filter="url(#pf-blur)"/>
<g filter="url(#ink)">
  <g clip-path="url(#pf-sil)">
    <rect class="pf-clay" x="0" y="0" width="${VB.w}" height="${VB.h}" fill="${CLAY.bisque}"/>
    <g mask="url(#pf-mask)">
      <path d="${above}" fill="url(#pf-vert)"/>
      ${fine}
      <path d="${dipLine}" fill="none" stroke="${g.pool}" class="pf-bead"/>
    </g>
    <rect class="pf-light" x="0" y="0" width="${VB.w}" height="${VB.h}" fill="url(#pf-light)"/>
    <g mask="url(#pf-mask)"><path d="${streakLine}" fill="none" class="pf-spec" filter="url(#pf-soft)"/></g>
  </g>
  <path class="pf-fill" d="${body}Z"/>
  <g mask="url(#pf-mask)" fill="none" stroke="${g.rim}" class="pf-glaze-edge">
    <path d="${line(b.innerSkin)}"/>
    <path d="${line(b.outerSkin)}"/>
  </g>
  <g class="pf-lines">
    <path class="pf-ground" pathLength="1" d="M${f(5)},${VB.ground}H${VB.w - 5}"/>
    <g clip-path="url(#pf-axis)"><path class="pf-axis" d="M${VB.cx},${f(axisBottom)}V${f(axisTop)}"/></g>
    <path class="pf-contour" pathLength="1" d="${contour}"/>
    <path class="pf-section" pathLength="1" d="${body}"/>
    <path class="pf-dims" d="${dims}"/>
  </g>
</g>`;
  return { svg, ...describe(b), axis: { top: axisTop, bottom: axisBottom }, yTop: top, yBottom: yb };
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, c, t) => {
  const [p, q] = [hex(a), hex(c)];
  return `#${p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

/* ---------- Baustein ---------- */
export default function init(el) {
  const reduced = reducedMotion();
  const randomNumber = (not) => {
    let nr;
    do nr = 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % COUNT); while (nr === not);
    return nr;
  };

  el.innerHTML = `
    <button class="profil__stage" type="button" aria-pressed="false">
      <svg class="profil__svg" viewBox="0 0 ${VB.w} ${VB.h}" role="img" focusable="false"></svg>
    </button>
    <div class="profil__cap">
      <p class="profil__name" aria-live="polite"></p>
      <p class="profil__dim"></p>
      <button class="profil__more" type="button">Eine andere Schale</button>
    </div>`;
  const stage = el.querySelector('.profil__stage');
  const svg = el.querySelector('.profil__svg');
  const name = el.querySelector('.profil__name');
  const dim = el.querySelector('.profil__dim');
  const more = el.querySelector('.profil__more');

  let bowl;
  let info;
  let nodes;
  let draw = { p: 0, from: 0, dur: 0, running: false };
  let glaze = { q: 0, from: 0, to: 0, t0: 0, dur: 0 };
  let hover = false;
  let pressed = false;
  let focused = false;
  let lastPointer = 'mouse';
  let raf = 0;
  let timer = 0;
  let current = 0;

  const front = (q) => {
    const y1 = info.yTop - 3 * SOFT;
    const y2 = info.yBottom + 3 * SOFT;
    const fy = info.yBottom + SOFT - (info.yBottom - info.yTop + 2 * SOFT) * q;
    const o = (y) => clamp01((y - y1) / (y2 - y1));
    nodes.fa.setAttribute('offset', o(fy - SOFT));
    nodes.fb.setAttribute('offset', o(fy + SOFT));
  };

  const paint = () => {
    const p = draw.p;
    const dash = (node, range) => { node.style.strokeDashoffset = 1 - seg(p, range); };
    dash(nodes.ground, SEG.ground);
    dash(nodes.contour, SEG.contour);
    dash(nodes.section, SEG.section);
    const ax = seg(p, SEG.axis) * (info.axis.bottom - info.axis.top);
    nodes.axis.setAttribute('y', info.axis.bottom - ax);
    nodes.axis.setAttribute('height', ax);
    nodes.fill.style.opacity = seg(p, SEG.fill);
    nodes.dims.style.opacity = seg(p, SEG.dims);
    const q = glaze.q;
    front(q);
    const body = clamp01(q * 5);
    nodes.clay.style.opacity = body;
    nodes.light.style.opacity = body;
    nodes.shadow.style.opacity = body * 0.5;
  };

  const loop = (now) => {
    raf = 0;
    let busy = false;
    if (draw.running) {
      draw.p = clamp01((now - draw.from) / draw.dur);
      if (draw.p >= 1) { draw.running = false; syncGlaze(); } else busy = true;
    }
    if (glaze.dur) {
      const k = clamp01((now - glaze.t0) / glaze.dur);
      glaze.q = glaze.from + (glaze.to - glaze.from) * (glaze.to > glaze.from ? easeInOut(k) : easeOut(k));
      if (k >= 1) glaze.dur = 0; else busy = true;
    }
    paint();
    if (busy) raf = requestAnimationFrame(loop);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function syncGlaze() {
    const to = (hover || pressed || focused) && draw.p >= 1 ? 1 : 0;
    if (to === glaze.to && !glaze.dur) return;
    glaze.from = glaze.q;
    glaze.to = to;
    if (reduced) { glaze.q = to; glaze.dur = 0; paint(); return; }
    glaze.t0 = performance.now();
    glaze.dur = (to ? TIMING.glazeIn : TIMING.glazeOut) * Math.abs(to - glaze.q) || 1;
    wake();
  }

  function startDraw(ms) {
    if (reduced) { draw.p = 1; draw.running = false; paint(); syncGlaze(); return; }
    draw = { p: 0, from: performance.now(), dur: ms, running: true };
    paint();
    wake();
  }

  function show(nr, ms) {
    current = nr;
    bowl = buildBowl(nr);
    const out = render(bowl);
    info = out;
    svg.innerHTML = out.svg;
    svg.setAttribute('aria-label', out.label);
    nodes = {
      ground: svg.querySelector('.pf-ground'),
      contour: svg.querySelector('.pf-contour'),
      section: svg.querySelector('.pf-section'),
      axis: svg.querySelector('[data-axis]'),
      fill: svg.querySelector('.pf-fill'),
      dims: svg.querySelector('.pf-dims'),
      clay: svg.querySelector('.pf-clay'),
      light: svg.querySelector('.pf-light'),
      shadow: svg.querySelector('.pf-shadow'),
      fa: svg.querySelector('[data-front="a"]'),
      fb: svg.querySelector('[data-front="b"]'),
    };
    const nb = '\u00a0'; // geschützte Leerzeichen halten Zahl und Einheit zusammen
    name.textContent = `Schale${nb}${nr}${nb}von${nb}${COUNT}${nb}· ${bowl.glaze.name}`;
    dim.textContent = `${bowl.form.name} · Ø${nb}${out.d} · H${nb}${out.hh}${nb}mm`;
    stage.setAttribute('aria-label', `${out.label} Glasur zeigen`);
    glaze = { q: 0, from: 0, to: 0, t0: 0, dur: 0 };
    layout();
    if (ms) startDraw(ms); else paint();
  }

  // Strichstärken bleiben bei jeder Größe gleich fein
  function layout() {
    const h = svg.getBoundingClientRect().height;
    if (h) svg.style.setProperty('--px', (VB.h / h).toFixed(4));
  }

  // Höhe aus dem freien Platz über der Überschrift
  const hero = el.closest('.hero');
  const title = hero?.querySelector('.hero__title');
  const wide = window.matchMedia('(min-width: 901px)');
  function fit() {
    if (!hero || !title) return;
    if (!wide.matches) { el.style.removeProperty('--profil-h'); el.removeAttribute('data-fit'); layout(); return; }
    const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
    const free = title.getBoundingClientRect().top - el.getBoundingClientRect().top - pad - GAP;
    const byWidth = (el.getBoundingClientRect().width - CAPTION_MIN - parseFloat(getComputedStyle(el).columnGap)) * (VB.h / VB.w);
    const height = Math.min(free, MAX_HEIGHT, byWidth);
    if (height < MIN_HEIGHT) { el.dataset.fit = 'none'; el.style.setProperty('--profil-h', '0px'); return; }
    el.removeAttribute('data-fit');
    el.style.setProperty('--profil-h', `${height.toFixed(0)}px`);
    layout();
  }
  if (hero) {
    new ResizeObserver(fit).observe(hero);
    document.fonts?.ready.then(fit);
  }

  /* Interaktion */
  stage.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; syncGlaze(); } });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hover = false; syncGlaze(); } });
  stage.addEventListener('click', (e) => {
    if (e.detail > 0 && lastPointer === 'mouse') return; // Maus: Glasur folgt dem Hover
    pressed = !pressed;
    stage.setAttribute('aria-pressed', String(pressed));
    syncGlaze();
  });
  stage.addEventListener('focus', () => { focused = stage.matches(':focus-visible'); syncGlaze(); });
  stage.addEventListener('blur', () => { focused = false; syncGlaze(); });
  more.addEventListener('click', () => { clearTimeout(timer); show(randomNumber(current), TIMING.redraw); });

  // erst zeichnen, wenn das Element zu sehen ist; die Überschrift kommt kurz vorher
  show(randomNumber(0), 0);
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    timer = setTimeout(() => startDraw(TIMING.draw), reduced ? 0 : TIMING.intro);
  }, { threshold: 0.2 });
  io.observe(hero ?? el);
}
