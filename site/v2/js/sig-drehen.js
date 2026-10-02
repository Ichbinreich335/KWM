// Signatur: drehen – Drehen (gegen den Uhrzeigersinn) und Abdrehen (im Uhrzeigersinn)
// als scrollgebundene Werkzeichnung: links Ansicht, rechts Schnitt, daneben die Draufsicht.
// Alles ist eine Funktion des Scrollfortschritts p (0 bis 1); nur die Drehung läuft in Echtzeit.
import { CLAY, random, reducedMotion } from './keramik.js';

/* ---------- Hilfen ---------- */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const clampSigned = (x) => Math.min(1, Math.max(-1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c, alpha = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;
// t > 0 hellt auf, t < 0 dunkelt ab
const tone = (c, t) => (t >= 0 ? mixc(c, WHITE, t) : mixc(c, BLACK, -t));

/* ---------- Form: Maße in Einheiten, 1 = Randradius der fertigen Schale ---------- */
const M = 72; // Stützpunkte entlang der Außenfläche
const QUARTER = Math.PI / 2;
const WENDE_Y = 0.475; // Wendeachse: halbe Höhe der Schale
const WALL_THROWN = 0.14;
const WALL_FINAL = 0.04;
const FOOT = { inner: 0.3, outer: 0.42, recess: 0.06, chamfer: 0.015 };
const FOOT_END = 13; // letzter Stützpunkt der ebenen Standfläche
const JOIN = 31; // ab hier folgt der Fuß der Wand

// Innenfläche als Superellipse: n = 2 Schale, n = 5 fast Zylinder
function innerCurve({ ri, yb, hi, n, flare }) {
  return Array.from({ length: M + 1 }, (_, k) => {
    const t = (k / M) * QUARTER;
    const v = 1 - Math.cos(t) ** (2 / n);
    return [ri * Math.sin(t) ** (2 / n) + flare * v * v, yb + hi * v];
  });
}

function normals(P) {
  return P.map((_, k) => {
    const a = P[Math.max(0, k - 1)], b = P[Math.min(M, k + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    return [ty / l, -tx / l];
  });
}

// Außenfläche = Innenfläche, um die Wandstärke nach außen versetzt; unten glatt auf der Scheibe
function offset(P, thick) {
  const N = normals(P);
  return P.map((p, k) => {
    const d = thick(k / M);
    return [p[0] + N[k][0] * d, Math.max(0, p[1] + N[k][1] * d)];
  });
}

const polygon = (outer, inner) => [...outer, ...inner.slice().reverse()];

const BOWL_IN = innerCurve({ ri: 0.93, yb: 0.14, hi: 0.81, n: 2.3, flare: 0.05 });
const CYL_IN = innerCurve({ ri: 0.52, yb: 0.2, hi: 1.05, n: 5, flare: 0 });
const BOWL_OUT = offset(BOWL_IN, (u) => WALL_THROWN + 0.28 * clamp01(1 - u / 0.45) ** 2);
const CYL_OUT = offset(CYL_IN, (u) => 0.17 + 0.25 * clamp01(1 - u / 0.4) ** 2);
const DOME_RADIUS = 0.8;
const DOME_HEIGHT = 0.78;
const DOME_OUT = Array.from({ length: M + 1 }, (_, k) => {
  if (k <= 14) return [(DOME_RADIUS * k) / 14, 0];
  const a = ((k - 14) / (M - 14)) * QUARTER;
  return [DOME_RADIUS * Math.cos(a), DOME_HEIGHT * Math.sin(a)];
});
const DOME_IN = DOME_OUT.map(() => [0, DOME_HEIGHT]);

// Schlüsselformen des Drehens: Kuppe, hochgezogener Zylinder, geöffnete Schale
const KEYS = [polygon(DOME_OUT, DOME_IN), polygon(CYL_OUT, CYL_IN), polygon(BOWL_OUT, BOWL_IN)];

// Fertige Außenfläche: Standfläche mit Mulde, geschwungener Fuß, dünne Wand
const FINAL_OUT = (() => {
  const wall = offset(BOWL_IN, () => WALL_FINAL);
  const end = wall[JOIN];
  const a = wall[JOIN - 1], b = wall[JOIN + 1];
  const tl = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const tx = (b[0] - a[0]) / tl, ty = (b[1] - a[1]) / tl;
  const p0 = [FOOT.outer, 0], p1 = [FOOT.outer + 0.16, 0];
  const p2 = [end[0] - tx * 0.17, end[1] - ty * 0.17];
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push([(FOOT.inner * i) / 8, FOOT.recess]);
  pts.push([FOOT.inner + FOOT.chamfer, 0]);
  for (let i = 0; i < 4; i++) pts.push([lerp(FOOT.inner + FOOT.chamfer, FOOT.outer, i / 3), 0]);
  for (let k = 14; k <= JOIN; k++) {
    const t = (k - 13) / (JOIN - 13), u = 1 - t;
    const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    pts.push([0, 1].map((j) => w[0] * p0[j] + w[1] * p1[j] + w[2] * p2[j] + w[3] * end[j]));
  }
  return [...pts, ...wall.slice(JOIN + 1)];
})();

// Bogenlänge der fertigen Außenfläche: das Dreheisen wandert mit gleichmäßiger Geschwindigkeit
const ARC = (() => {
  const acc = [0];
  for (let k = 1; k <= M; k++) acc.push(acc[k - 1] + Math.hypot(FINAL_OUT[k][0] - FINAL_OUT[k - 1][0], FINAL_OUT[k][1] - FINAL_OUT[k - 1][1]));
  return acc;
})();
function indexAtArc(c) {
  const target = c * ARC[M];
  let k = 1;
  while (k < M && ARC[k] < target) k++;
  return k - 1 + clamp01((target - ARC[k - 1]) / (ARC[k] - ARC[k - 1] || 1));
}
const pointAt = (path, kf) => {
  const i = Math.min(M - 1, Math.floor(kf)), f = kf - i;
  return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)];
};

/* ---------- Szenenablauf ---------- */
const TIME = {
  throwFrom: 0.03, throwTo: 0.4,
  flipIn: [0.44, 0.52],
  trim: [0.56, 0.88],
  flipOut: [0.9, 0.96],
  phaseTrim: 0.43, phaseDone: 0.89,
};

function stateAt(p) {
  // Drehen: Kuppe, Zylinder, Schale
  const g = clamp01((p - TIME.throwFrom) / (TIME.throwTo - TIME.throwFrom));
  const g1 = smooth(0, 0.5, g), g2 = smooth(0.5, 1, g);
  const shape = KEYS[0].map((pt, i) => {
    const a = [lerp(pt[0], KEYS[1][i][0], g1), lerp(pt[1], KEYS[1][i][1], g1)];
    return [lerp(a[0], KEYS[2][i][0], g2), lerp(a[1], KEYS[2][i][1], g2)];
  });
  // Wenden: kopfüber auf die Scheibe und am Ende wieder zurück
  const q = p < 0.7 ? smooth(...TIME.flipIn, p) : 1 - smooth(...TIME.flipOut, p);
  // Abdrehen: Schnittfortschritt c
  const tc = clamp01((p - TIME.trim[0]) / (TIME.trim[1] - TIME.trim[0]));
  const c = lerp(tc, tc * tc * (3 - 2 * tc), 0.5);
  // Drehung: Richtung und Tempo, an den Wendepunkten steht die Scheibe still
  let dir = -1, speed = 1;
  if (p > 0.38) speed = 1 - smooth(0.38, 0.465, p);
  if (p > 0.465) { dir = 1; speed = smooth(0.465, 0.58, p); }
  if (p > 0.86) speed = 1 - smooth(0.86, 0.94, p);
  const phase = p < TIME.phaseTrim ? 0 : p < TIME.phaseDone ? 1 : 2;
  // Tonfarbe: roh, dann lederhart
  const clay = mixc(rgbOf(CLAY.raw), rgbOf(CLAY.leather), smooth(0.18, 0.5, p));
  const tool = smooth(0.52, 0.57, p) * (1 - smooth(0.87, 0.9, p));
  return { shape, q, c, dir, speed, phase, clay, trimming: p >= 0.52 && p < 0.9, tool };
}

// Außenfläche beim Abdrehen: vorn am Eisen schon fertig, dahinter noch gedreht
function trimmedOuter(c) {
  const kf = indexAtArc(c);
  const cut = lerp(-3, M + 3, kf / M);
  return { kf, outer: BOWL_OUT.map((t, k) => {
    const w = smooth(-3, 3, cut - k);
    return [lerp(t[0], FINAL_OUT[k][0], w), lerp(t[1], FINAL_OUT[k][1], w)];
  }) };
}

/* ---------- Späne ---------- */
const CHIP_COUNT = 72;
const CHIP_AGE = 14; // Schnittfortschritt in Flugzeit
const GRAVITY = 1.5;
const DRAG = 1.1;
const rnd = random(1924);
const CHIPS = Array.from({ length: CHIP_COUNT }, (_, i) => {
  const c = 0.015 + 0.97 * ((i + rnd() * 0.85) / CHIP_COUNT);
  const o = pointAt(FINAL_OUT, indexAtArc(c));
  return {
    c, ox: o[0], oy: 2 * WENDE_Y - o[1], // kopfüber
    size: 0.02 + rnd() * 0.03, turns: 1.1 + rnd() * 1.2,
    vx: 0.25 + rnd() * 0.7, vy: 0.2 + rnd() * 0.75, vt: 0.35 + rnd() * 0.8, vr: 0.1 + rnd() * 0.5,
    spin: (rnd() - 0.5) * 9, ang: rnd() * 6.28, mix: rnd(),
  };
});

/* ---------- Scheibe: Draufsicht-Struktur ---------- */
const HEAD_R = 1.25;
const PAN_R = 1.7;
const TEX_R = 1.3;
const BANDS = 30;
const LIGHT = { dx: -Math.SQRT1_2, dy: -Math.SQRT1_2, up: 0.5, side: 0.86 };

export default function init(el) {
  const still = reducedMotion();
  const scene = el.querySelector('.throw__scene');
  const steps = [...el.querySelectorAll('.throw__step')];
  if (!scene || steps.length !== 3) return;

  // Name und Wortlaut je Schritt: laufender Schritt klappt auf
  steps.forEach((li) => {
    const more = document.createElement('div');
    more.className = 'throw__more';
    const inner = document.createElement('div');
    [...li.querySelectorAll('.throw__dir, .throw__body')].forEach((n) => inner.append(n));
    more.append(inner);
    li.append(more);
  });
  const text = el.querySelector('.throw__steps');
  const bar = document.createElement('div');
  bar.className = 'throw__bar';
  bar.setAttribute('aria-hidden', 'true');
  steps.forEach(() => bar.append(document.createElement('span')));
  text.after(bar);

  const canvas = document.createElement('canvas');
  canvas.className = 'throw__canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Zeichnung einer Schale: Der Ton wird auf der Scheibe hochgezogen, dann kopfüber mit dem Dreheisen abgedreht. Links Ansicht, rechts Schnitt, daneben die Scheibe von oben. Mit den Pfeiltasten lässt sich die Scheibe drehen.');
  scene.append(canvas);
  el.classList.add('is-live');
  if (still) el.classList.add('is-still');
  const ctx = canvas.getContext('2d');

  /* Farben aus dem Seitenton lesen */
  let pal;
  const readPalette = () => {
    const cs = getComputedStyle(document.documentElement);
    const get = (n, fb) => { const v = cs.getPropertyValue(n).trim(); return /^#[0-9a-f]{6}$/i.test(v) ? rgbOf(v) : rgbOf(fb); };
    pal = { ink: get('--ink', '#1B1815'), ink2: get('--ink-2', '#5A554D'), ground: get('--ground-2', '#E8E5DE'), coal: get('--coal', '#121210') };
  };
  readPalette();
  new MutationObserver(readPalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-grund'] });

  /* Größe und Anordnung */
  let W = 0, Hh = 0, dpr = 1, prof = null, disc = null, tex = null;
  const layout = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    W = r.width; Hh = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(Hh * dpr);
    const narrow = W < 560;
    const planShare = narrow ? 0.38 : 0.4;
    const profH = Hh * (1 - planShare);
    // Aufriss: x von -1,25 bis 1,85, y von -0,3 bis 1,5; darunter im Grundriss dieselbe Achse
    const span = narrow ? 2.8 : 3.0;
    const sc = Math.min(W / span, profH / 1.85);
    const ax = (W * 1.25) / span;
    prof = { sc, ax, gy: (profH - 1.8 * sc) / 2 + 1.5 * sc };
    const dRest = Hh - profH;
    const ds = Math.min(dRest - 26, W * 0.55) / (2 * 1.95);
    disc = { ds, cx: Math.min(ax, W - 1.95 * ds - 4), cy: profH + 26 + 1.95 * ds - 8 };
    buildTexture();
    return true;
  };

  // Gedrehte Textur der Oberfläche: Drehrillen, Spiralen, Tonkörnchen. Die Beleuchtung liegt fest darüber.
  const buildTexture = () => {
    const size = Math.ceil(TEX_R * 2 * disc.ds * dpr);
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const t = cv.getContext('2d');
    t.translate(size / 2, size / 2);
    const R = size / 2;
    const r2 = random(77);
    t.lineCap = 'round';
    // Spiralarme, drei Stück
    for (let arm = 0; arm < 3; arm++) {
      for (const [col, off, w] of [['rgba(60,40,22,0.20)', 0, 0.011], ['rgba(255,248,235,0.20)', 0.018, 0.008]]) {
        t.beginPath();
        for (let i = 0; i <= 120; i++) {
          const f = i / 120, a = arm * 2.094 + f * 9.5 + off, rr = R * (0.04 + f * 0.96);
          t[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
        }
        t.strokeStyle = col;
        t.lineWidth = Math.max(0.8, R * w);
        t.stroke();
      }
    }
    // Tonkörnchen
    for (let i = 0; i < 260; i++) {
      const a = r2() * 6.283, d = Math.sqrt(r2()) * R * 0.98, s = (0.4 + r2()) * R * 0.012;
      t.fillStyle = r2() < 0.5 ? 'rgba(70,48,28,0.30)' : 'rgba(255,246,230,0.30)';
      t.beginPath();
      t.arc(Math.cos(a) * d, Math.sin(a) * d, Math.max(0.6, s), 0, 6.283);
      t.fill();
    }
    tex = { cv, half: size / 2 / dpr };
  };

  /* Zustand */
  let p = 0, target = 0, spin = 0, userVel = 0, running = false;
  let last = 0, activeStep = -1;
  let drag = null;

  const readProgress = () => {
    const r = el.getBoundingClientRect();
    const run = el.offsetHeight - canvas.parentElement.parentElement.offsetHeight;
    return run > 0 ? clamp01(-r.top / run) : 0;
  };

  /* ---------- Zeichnen: Profil ---------- */
  const pose = (y, s, lift) => WENDE_Y + (y - WENDE_Y) * s + lift;

  const drawProfile = (S, polyPosed, outerPosed, s, lift) => {
    const { sc, ax, gy } = prof;
    const X = (u) => ax + u * sc;
    const Y = (y) => gy - y * sc;
    const clay = S.clay;
    const ink = pal.ink;

    // Pfanne und Scheibenkopf
    const panY = Y(-0.1);
    ctx.fillStyle = css(tone(pal.ground, -0.1));
    ctx.fillRect(0, panY, W, 0.07 * sc);
    ctx.fillStyle = css(tone(pal.ground, 0.4));
    ctx.fillRect(0, panY - 1, W, 1);
    const hg = ctx.createLinearGradient(0, Y(0), 0, Y(-0.1));
    hg.addColorStop(0, css(tone(pal.coal, 0.22)));
    hg.addColorStop(1, css(pal.coal));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.roundRect(X(-HEAD_R), Y(0), HEAD_R * 2 * sc, 0.1 * sc, 3);
    ctx.fill();
    ctx.fillStyle = css(WHITE, 0.2);
    ctx.fillRect(X(-HEAD_R) + 3, Y(0), HEAD_R * 2 * sc - 6, 1);

    // Schatten der Form auf dem Scheibenkopf, Licht von links
    let rmax = 0;
    polyPosed.forEach((pt) => { rmax = Math.max(rmax, pt[0]); });
    const sh = clamp01(1 - lift / 0.25) * clamp01(Math.abs(s) * 1.4);
    if (sh > 0.01) {
      ctx.save();
      ctx.translate(X(0.16), Y(0));
      ctx.scale(1, 0.1);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, rmax * sc * 1.2);
      sg.addColorStop(0, `rgba(10,8,6,${0.5 * sh})`);
      sg.addColorStop(1, 'rgba(10,8,6,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, rmax * sc * 1.2, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    // Mittellinie
    ctx.save();
    ctx.setLineDash([14, 3, 2, 3]);
    ctx.strokeStyle = css(ink, 0.34);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(0) + 0.5, Y(-0.06));
    ctx.lineTo(X(0) + 0.5, Y(1.52));
    ctx.stroke();
    ctx.restore();

    // Gestrichelt: der Ton, der schon abgetragen wurde
    if (S.trimming || S.phase === 2) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = css(ink, 0.4 * clamp01(S.c * 8));
      ctx.lineWidth = 1;
      ctx.beginPath();
      BOWL_OUT.forEach((pt, k) => { ctx[k ? 'lineTo' : 'moveTo'](X(pt[0]), Y(pose(pt[1], s, lift))); });
      ctx.stroke();
      ctx.restore();
    }

    // Ansicht (links): Zeile für Zeile, jede mit eigener Rundung
    const yTop = Math.max(...outerPosed.map((pt) => pt[1]));
    const yBot = Math.min(...outerPosed.map((pt) => pt[1]));
    const hl = tone(clay, 0.3), mid = clay, dk = tone(clay, -0.26), rim = tone(clay, -0.1);
    const silhouette = [];
    const rowStep = 2 / sc;
    const lastRow = outerPosed.length - 1;
    for (let y = yBot; y <= yTop; y += rowStep) {
      let hw = -1, ny = 0;
      for (let k = 0; k < lastRow; k++) {
        const a = outerPosed[k], b = outerPosed[k + 1];
        if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) {
          const x = lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
          if (x > hw) { hw = x; ny = -(b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1) * Math.sign(s || 1); }
        }
      }
      if (hw <= 0) continue;
      silhouette.push([y, hw]);
      const f = 1 + ny * 0.3;
      const g = ctx.createLinearGradient(X(-hw), 0, X(0), 0);
      g.addColorStop(0, css(tone(rim, (f - 1) * 0.5)));
      g.addColorStop(0.2, css(tone(hl, (f - 1))));
      g.addColorStop(0.55, css(tone(mid, (f - 1))));
      g.addColorStop(1, css(tone(dk, (f - 1))));
      ctx.fillStyle = g;
      ctx.fillRect(X(-hw), Y(y) - 1, hw * sc, 2.6);
    }
    // Drehrillen auf der Ansicht
    if (silhouette.length) {
      ctx.save();
      ctx.beginPath();
      silhouette.forEach(([y, hw], i) => { ctx[i ? 'lineTo' : 'moveTo'](X(-hw), Y(y)); });
      for (let i = silhouette.length - 1; i >= 0; i--) ctx.lineTo(X(0), Y(silhouette[i][0]));
      ctx.closePath();
      ctx.clip();
      const grooveAlpha = 0.5 * (1 - 0.6 * smooth(0.5, 0.8, S.c + (S.phase > 0 ? 0.5 : 0)));
      for (let y = 0.07; y < 1.4; y += 0.075) {
        const yy = Y(y);
        ctx.strokeStyle = `rgba(40,26,14,${0.1 * grooveAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(X(-1.1), yy);
        ctx.quadraticCurveTo(X(-0.55), yy + 0.02 * sc, X(0), yy);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,250,240,${0.22 * grooveAlpha})`;
        ctx.beginPath();
        ctx.moveTo(X(-1.1), yy + 1.5);
        ctx.quadraticCurveTo(X(-0.55), yy + 0.02 * sc + 1.5, X(0), yy + 1.5);
        ctx.stroke();
      }
      ctx.restore();
      // Umriss der Ansicht
      ctx.strokeStyle = css(ink, 0.55);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      outerPosed.forEach((pt, k) => { ctx[k ? 'lineTo' : 'moveTo'](X(-pt[0]), Y(pt[1])); });
      ctx.stroke();
    }

    // Schnitt (rechts): Schnittfläche mit Schraffur und Wandstärke
    const cut = new Path2D();
    polyPosed.forEach((pt, k) => { cut[k ? 'lineTo' : 'moveTo'](X(pt[0]), Y(pt[1])); });
    cut.closePath();
    ctx.fillStyle = css(mixc(clay, [106, 74, 44], 0.2));
    ctx.fill(cut);
    ctx.save();
    ctx.clip(cut);
    ctx.strokeStyle = css([60, 40, 22], 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const hatch = 6;
    for (let d = -Hh; d < W + Hh; d += hatch) { ctx.moveTo(X(0) + d, Y(-0.1)); ctx.lineTo(X(0) + d + 1.6 * sc, Y(-0.1) - 1.6 * sc); }
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = css(ink, 0.85);
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke(cut);
    ctx.lineJoin = 'miter';
  };

  const drawLabels = (a) => {
    if (a < 0.01) return;
    const { sc, ax, gy } = prof;
    const X = (u) => ax + u * sc;
    const Y = (y) => gy - y * sc;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '500 11.5px Jost, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = css(pal.ink2);
    ctx.strokeStyle = css(pal.ink, 0.6);
    ctx.lineWidth = 1;
    // Beschriftung: [Text, Punkt x, Punkt y, Ende x, links?]
    const reach = W < 560 ? 1.13 : 1.3;
    const marks = [['Rand', 0.98, 0.95, reach, false], ['Wand', 0.9, 0.52, reach, false], ['Fuß', -0.47, 0.03, -0.85, true]];
    marks.forEach(([label, x0, y0, x1, left]) => {
      ctx.fillStyle = css(pal.ink, 0.8);
      ctx.beginPath();
      ctx.arc(X(x0), Y(y0), 2.2, 0, 6.283);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(X(x0) + (left ? -3 : 3), Y(y0));
      ctx.lineTo(X(x1), Y(y0));
      ctx.stroke();
      ctx.fillStyle = css(pal.ink);
      ctx.textAlign = left ? 'right' : 'left';
      ctx.fillText(label, X(x1) + (left ? -6 : 6), Y(y0));
    });
    ctx.restore();
  };

  /* Dreheisen im Profil */
  const drawTool = (S, outerPosed) => {
    if (S.tool < 0.01) return;
    const { sc, ax, gy } = prof;
    const X = (u) => ax + u * sc;
    const Y = (y) => gy - y * sc;
    const { kf } = S.cut;
    const k = Math.min(M - 1, Math.max(1, Math.round(kf)));
    const tip = pointAt(outerPosed, kf);
    const a = outerPosed[k - 1], b = outerPosed[k + 1];
    let nx = b[1] - a[1], ny = -(b[0] - a[0]);
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl; ny /= nl;
    if (nx < 0 && Math.abs(nx) > Math.abs(ny)) { nx = -nx; ny = -ny; }
    if (ny < 0) { nx = -nx; ny = -ny; } // nach oben und außen
    let dx = nx * 0.55 + 0.85, dy = ny * 0.55 + 0.1; // Bildschirm: y nach oben
    const dl = Math.hypot(dx, dy);
    dx /= dl; dy /= dl;
    const away = (1 - S.tool) * 1.8;
    const x0 = X(tip[0] + dx * away), y0 = Y(tip[1] + dy * away);
    const sx = dx, sy = -dy; // Bildschirmrichtung
    const px = -sy, py = sx;
    const blade = 0.5 * sc, handle = 0.62 * sc;

    ctx.save();
    ctx.shadowColor = 'rgba(30,20,10,0.28)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 8;
    // Schaft aus Stahl
    ctx.lineCap = 'round';
    const steel = ctx.createLinearGradient(x0 + px * 4, y0 + py * 4, x0 - px * 4, y0 - py * 4);
    steel.addColorStop(0, '#C9CCCB');
    steel.addColorStop(0.5, '#8A8F8E');
    steel.addColorStop(1, '#5B6060');
    ctx.strokeStyle = steel;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + sx * blade, y0 + sy * blade);
    ctx.stroke();
    // Griff aus Holz
    ctx.shadowColor = 'transparent';
    const wood = ctx.createLinearGradient(x0 + sx * blade + px * 7, y0 + sy * blade + py * 7, x0 + sx * blade - px * 7, y0 + sy * blade - py * 7);
    wood.addColorStop(0, '#9A6B42');
    wood.addColorStop(0.45, '#7A4F2E');
    wood.addColorStop(1, '#4A2F1B');
    ctx.strokeStyle = wood;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x0 + sx * blade, y0 + sy * blade);
    ctx.lineTo(x0 + sx * (blade + handle), y0 + sy * (blade + handle));
    ctx.stroke();
    ctx.restore();
    // Schlinge: kleiner Stahlring an der Spitze
    ctx.strokeStyle = '#6E7372';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x0 + sx * 3, y0 + sy * 3, 3.6, 0, 6.283);
    ctx.stroke();
  };

  /* Späne */
  const chipColor = (ch, S, a = 1) => css(mixc(mixc(rgbOf(CLAY.leather), rgbOf(CLAY.porcelain), ch.mix * 0.5), S.clay, 0.35), a);
  const drawCurl = (x, y, size, turns, ang, col, edge) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const f = i / n, th = f * turns * 6.283, rr = size * (0.3 + f * 0.7);
      ctx[i ? 'lineTo' : 'moveTo'](Math.cos(th) * rr, Math.sin(th) * rr * 0.8);
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(2, size * 0.5) + 1.2;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.4, size * 0.5);
    ctx.stroke();
    ctx.restore();
  };

  const floorAt = (x) => (Math.abs(x) < HEAD_R ? 0 : -0.1);
  const drawChipsProfile = (S) => {
    if (S.cut == null && S.c <= 0) return;
    const { sc, ax, gy } = prof;
    const edge = css(tone(S.clay, -0.45), 0.7);
    for (const ch of CHIPS) {
      const age = (S.c - ch.c) * CHIP_AGE;
      if (age <= 0) continue;
      const k = (1 - Math.exp(-DRAG * age)) / DRAG;
      const x = ch.ox + ch.vx * k;
      let y = ch.oy + ch.vy * age - 0.5 * GRAVITY * age * age;
      const fl = floorAt(x) + ch.size * 0.35;
      const landed = y <= fl;
      if (landed) y = fl;
      const ang = ch.ang + ch.spin * Math.min(age, 1.4);
      drawCurl(ax + x * sc, gy - y * sc, ch.size * sc, ch.turns, ang, chipColor(ch, S), edge);
    }
  };

  /* Spänchen, die gerade vom Eisen aufrollen */
  const drawLiveChip = (S, outerPosed) => {
    if (S.tool < 0.5) return;
    const { sc, ax, gy } = prof;
    const tip = pointAt(outerPosed, S.cut.kf);
    const f = (S.c * 36) % 1;
    drawCurl(ax + (tip[0] + 0.03) * sc, gy - (tip[1] + 0.05) * sc, (0.012 + 0.03 * f) * sc, 0.6 + f * 1.6, S.c * 40, chipColor(CHIPS[0], S), css(tone(S.clay, -0.45), 0.7));
  };

  /* ---------- Zeichnen: Draufsicht ---------- */
  const envelope = (poly, rmax) => {
    const out = [];
    for (let j = 0; j <= BANDS; j++) {
      const r = Math.max(1e-4, (j / BANDS) * rmax);
      let best = -Infinity;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        if (a[0] !== b[0] && (a[0] - r) * (b[0] - r) <= 0) best = Math.max(best, lerp(a[1], b[1], (r - a[0]) / (b[0] - a[0])));
      }
      out.push(best === -Infinity ? (out[j - 1] ?? 0) : best);
    }
    return out;
  };

  const ringPath = (r0, r1) => {
    ctx.beginPath();
    ctx.arc(0, 0, r1, 0, 6.283);
    if (r0 > 0.5) { ctx.moveTo(r0, 0); ctx.arc(0, 0, r0, 0, 6.283, true); }
  };

  const drawDisc = (S, polyTop, spinNow) => {
    const { ds, cx, cy } = disc;
    ctx.save();
    ctx.translate(cx, cy);

    // Pfanne
    const pg = ctx.createRadialGradient(0, 0, HEAD_R * ds, 0, 0, PAN_R * ds);
    pg.addColorStop(0, css(tone(pal.ground, -0.2)));
    pg.addColorStop(1, css(tone(pal.ground, -0.07)));
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(0, 0, PAN_R * ds, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = css(pal.ink, 0.22);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Scheibenkopf mit Strichen, die sich mitdrehen
    const hg = ctx.createRadialGradient(-HEAD_R * ds * 0.4, -HEAD_R * ds * 0.4, 0, 0, 0, HEAD_R * ds);
    hg.addColorStop(0, css(tone(pal.coal, 0.2)));
    hg.addColorStop(1, css(pal.coal));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_R * ds, 0, 6.283);
    ctx.fill();
    ctx.save();
    ctx.rotate(spinNow);
    ctx.strokeStyle = 'rgba(236,234,227,0.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * 6.283, long = i % 6 === 0;
      const r0 = HEAD_R * ds * (long ? 0.9 : 0.94), r1 = HEAD_R * ds * 0.985;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    }
    ctx.stroke();
    ctx.fillStyle = css(mixc(rgbOf('#7FA493'), WHITE, 0.15));
    ctx.beginPath();
    ctx.arc(HEAD_R * ds * 0.8, 0, Math.max(2.2, ds * 0.03), 0, 6.283);
    ctx.fill();
    ctx.restore();
    // Glanzstreifen mit Schweif zeigen die Richtung
    const w = Math.abs(S.dirNow) * S.speedNow;
    if (w > 0.05) {
      for (let i = 0; i < 4; i++) {
        const a0 = spinNow * 1.0 + i * 1.571 + 0.5;
        for (let s = 0; s < 6; s++) {
          const t = s / 6;
          ctx.strokeStyle = `rgba(255,255,255,${0.32 * (1 - t) * w})`;
          ctx.lineWidth = Math.max(1.4, ds * 0.022);
          ctx.beginPath();
          const r = HEAD_R * ds * 0.76;
          const aa = a0 - Math.sign(S.dirNow) * t * 0.5 * w, ab = a0 - Math.sign(S.dirNow) * (t + 1 / 6) * 0.5 * w;
          ctx.arc(0, 0, r, Math.min(aa, ab), Math.max(aa, ab));
          ctx.stroke();
        }
      }
    }

    // Form von oben: Höhenprofil in Bänder zerlegt, jedes nach dem Licht von links oben getönt
    const vis = S.discAlpha;
    let rmax = 0;
    polyTop.forEach((pt) => { rmax = Math.max(rmax, pt[0]); });
    const hts = envelope(polyTop, rmax);
    const hmax = Math.max(...hts), hmin = Math.min(...hts);

    // Schatten auf dem Kopf
    if (vis > 0.01) {
      const sg = ctx.createRadialGradient(ds * 0.08, ds * 0.12, rmax * ds * 0.6, ds * 0.1, ds * 0.14, rmax * ds * 1.18);
      sg.addColorStop(0, `rgba(8,6,4,${0.55 * vis})`);
      sg.addColorStop(1, 'rgba(8,6,4,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(ds * 0.1, ds * 0.14, rmax * ds * 1.2, 0, 6.283);
      ctx.fill();
    }

    if (vis > 0.01 && rmax > 0.02) {
      ctx.globalAlpha = vis;
      const dr = (rmax * ds) / BANDS;
      for (let j = 0; j < BANDS; j++) {
        const slope = ((hts[j + 1] - hts[j]) / (rmax / BANDS));
        const nz = 1 / Math.hypot(1, slope);
        const nr = -slope * nz;
        const depth = (hmax - (hts[j] + hts[j + 1]) / 2) / Math.max(0.3, hmax - hmin + 0.4);
        const amb = 1 - 0.2 * clamp01(depth);
        const iLit = nz * LIGHT.up + nr * LIGHT.side;
        const iDark = nz * LIGHT.up - nr * LIGHT.side;
        const col = (i) => css(tone(S.clay, clampSigned(((i - LIGHT.up) / LIGHT.up) * 0.62)), 1);
        const r1 = (j + 1) * dr + 0.4, r0 = j * dr;
        const g = ctx.createLinearGradient(LIGHT.dx * r1, LIGHT.dy * r1, -LIGHT.dx * r1, -LIGHT.dy * r1);
        g.addColorStop(0, col(iLit));
        g.addColorStop(1, col(iDark));
        ringPath(r0, r1);
        ctx.fillStyle = g;
        ctx.fill('evenodd');
        if (amb < 0.999) {
          ringPath(r0, r1);
          ctx.fillStyle = `rgba(30,18,8,${1 - amb})`;
          ctx.fill('evenodd');
        }
      }
      // Drehrillen und Spiralen: die Textur dreht, das Licht bleibt
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, rmax * ds, 0, 6.283);
      ctx.clip();
      ctx.rotate(spinNow);
      ctx.globalAlpha = vis * 0.9;
      ctx.drawImage(tex.cv, -tex.half, -tex.half, tex.half * 2, tex.half * 2);
      ctx.restore();
      ctx.globalAlpha = vis;
      // Glanzlicht auf der Lippe oben links
      if (S.upright) {
        const rl = rmax * ds * 0.965;
        ctx.beginPath();
        ctx.arc(0, 0, rl, Math.PI * 1.05, Math.PI * 1.55);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = Math.max(1, ds * 0.04);
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        // Standfläche des Fußes: heller Ring
        ctx.beginPath();
        ctx.arc(0, 0, ((FOOT.inner + FOOT.outer) / 2) * ds, Math.PI * 1.05, Math.PI * 1.6);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = Math.max(1, (FOOT.outer - FOOT.inner) * ds * 0.6);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(40,26,14,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, rmax * ds, 0, 6.283);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Dreheisen von rechts, an der Schnittstelle
    if (S.tool > 0.01) {
      const rc = pointAt(S.cut.outer, S.cut.kf)[0] * ds;
      const away = (1 - S.tool) * ds * 1.6;
      ctx.save();
      ctx.shadowColor = 'rgba(20,12,6,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 7;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8A8F8E';
      ctx.lineWidth = Math.max(4, ds * 0.07);
      ctx.beginPath();
      ctx.moveTo(rc + away, 0);
      ctx.lineTo(rc + away + ds * 0.55, 0);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#7A4F2E';
      ctx.lineWidth = Math.max(8, ds * 0.14);
      ctx.beginPath();
      ctx.moveTo(rc + away + ds * 0.55, 0);
      ctx.lineTo(rc + away + ds * 1.2, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Späne fliegen tangential vom Schnitt weg
    if (S.c > 0) {
      const edge = css(tone(S.clay, -0.45), 0.7);
      for (const ch of CHIPS) {
        const age = (S.c - ch.c) * CHIP_AGE;
        if (age <= 0) continue;
        const k = (1 - Math.exp(-DRAG * age)) / DRAG;
        const x = (ch.ox + ch.vr * k) * ds, y = ch.vt * k * ds;
        drawCurl(x, y, Math.max(1.6, ch.size * ds * 0.8), ch.turns, ch.ang + ch.spin * Math.min(age, 1.4), chipColor(ch, S), edge);
      }
    }

    // Richtungspfeil um die Scheibe
    const ra = (PAN_R + 0.17) * ds;
    const cw = clamp01((S.dirNow + 1) / 2);
    [[1 - cw, false], [cw, true]].forEach(([alpha, clockwise]) => {
      if (alpha < 0.02 || S.arrowAlpha < 0.02) return;
      ctx.save();
      ctx.globalAlpha = alpha * S.arrowAlpha;
      ctx.strokeStyle = css(pal.ink, 0.7);
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      const a0 = -2.28, a1 = -0.86;
      ctx.beginPath();
      ctx.arc(0, 0, ra, a0, a1);
      ctx.stroke();
      const tipA = clockwise ? a1 : a0;
      const hx = Math.cos(tipA) * ra, hy = Math.sin(tipA) * ra;
      const tx = -Math.sin(tipA) * (clockwise ? 1 : -1), ty = Math.cos(tipA) * (clockwise ? 1 : -1);
      ctx.beginPath();
      for (const sgn of [-1, 1]) {
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - tx * 9 + (-ty) * sgn * 5.5, hy - ty * 9 + tx * sgn * 5.5);
      }
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // Beschriftung der Richtung
    ctx.save();
    ctx.font = '500 11.5px Jost, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = css(pal.ink2);
    const labelY = cy - (PAN_R + 0.17) * ds - 10;
    [['gegen den Uhrzeigersinn', 1 - cw], ['im Uhrzeigersinn', cw]].forEach(([label, alpha]) => {
      if (alpha < 0.02) return;
      ctx.globalAlpha = alpha * S.arrowAlpha;
      ctx.fillText(label, cx, labelY);
    });
    ctx.restore();
  };

  /* ---------- Bild ---------- */
  const draw = () => {
    const S = stateAt(p);
    const lift = 0.3 * Math.sin(Math.PI * S.q);
    const sq = Math.cos(Math.PI * S.q);

    // Form dieses Augenblicks in Zeichnungsmaßen
    let outer, inner;
    S.cut = null;
    if (p < 0.5) {
      outer = S.shape.slice(0, M + 1);
      inner = S.shape.slice(M + 1).reverse();
    } else {
      S.cut = trimmedOuter(S.c);
      outer = S.cut.outer;
      inner = BOWL_IN;
    }
    const poly = [...outer, ...inner.slice().reverse()];
    const yOf = (pt) => [pt[0], pose(pt[1], sq, lift)];
    const polyPosed = poly.map(yOf);
    const outerPosed = outer.map(yOf);
    // Ansicht: die Mulde im Fuß bleibt von der Seite verdeckt
    const ansicht = outer.map((pt, k) => (k <= FOOT_END && S.c > 0 ? [pt[0], 0] : pt)).map(yOf);

    const upright = S.q < 0.5;
    const settled = upright ? poly : poly.map((pt) => [pt[0], 2 * WENDE_Y - pt[1]]);
    S.upright = upright;
    S.discAlpha = Math.abs(sq) ** 0.7;
    S.dirNow = spinDir;
    S.speedNow = spinSpeed;
    S.arrowAlpha = clamp01(spinSpeed * 3) * (1 - smooth(0.9, 0.95, p));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, Hh);
    drawProfile(S, polyPosed, ansicht, sq, lift);
    drawChipsProfile(S);
    drawTool(S, outerPosed);
    drawLiveChip(S, outerPosed);
    drawLabels(smooth(0.93, 0.98, p));
    drawDisc(S, settled, spin);
  };

  /* ---------- Schritte und Lauf ---------- */
  let spinDir = -1, spinSpeed = 1;
  const setStep = (i) => {
    if (i === activeStep) return;
    activeStep = i;
    steps.forEach((li, n) => li.classList.toggle('is-active', n === i));
    [...bar.children].forEach((s, n) => s.classList.toggle('is-on', n <= i));
  };

  const BASE_SPIN = 0.9; // Radiant pro Sekunde
  const frame = (t) => {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    target = readProgress();
    p += (target - p) * (1 - Math.exp(-dt * 8));
    if (Math.abs(target - p) < 0.0004) p = target;
    const st = stateAt(p);
    spinDir = st.dir; spinSpeed = st.speed;
    setStep(st.phase);
    if (!drag) {
      spin += st.dir * st.speed * BASE_SPIN * dt + userVel * dt;
      userVel *= Math.exp(-dt * 2.2);
      if (Math.abs(userVel) < 0.01) userVel = 0;
    }
    draw();
  };

  const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
  const stop = () => { running = false; };

  /* ---------- Zeiger: die Scheibe von Hand drehen ---------- */
  const inDisc = (e) => {
    const r = canvas.getBoundingClientRect();
    return Math.hypot(e.clientX - r.left - disc.cx, e.clientY - r.top - disc.cy) <= PAN_R * disc.ds;
  };
  const angleAt = (e) => {
    const r = canvas.getBoundingClientRect();
    return Math.atan2(e.clientY - r.top - disc.cy, e.clientX - r.left - disc.cx);
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (!inDisc(e)) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { a: angleAt(e), t: e.timeStamp, v: 0 };
    userVel = 0;
    canvas.classList.add('is-grabbing');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) { canvas.classList.toggle('is-grab', disc && inDisc(e)); return; }
    const a = angleAt(e);
    let da = a - drag.a;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    const dtm = Math.max(1, e.timeStamp - drag.t) / 1000;
    drag.v = lerp(drag.v, da / dtm, 0.5);
    spin += da;
    drag.a = a; drag.t = e.timeStamp;
  });
  const release = () => {
    if (!drag) return;
    userVel = Math.max(-14, Math.min(14, drag.v));
    drag = null;
    canvas.classList.remove('is-grabbing');
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => canvas.classList.remove('is-grab'));
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { userVel -= 3; e.preventDefault(); }
    if (e.key === 'ArrowRight') { userVel += 3; e.preventDefault(); }
  });

  /* ---------- Start ---------- */
  const ro = new ResizeObserver(() => { if (layout() && still) drawStill(); });
  ro.observe(canvas);

  function drawStill() {
    p = 1; spinDir = 1; spinSpeed = 0;
    setStep(2);
    draw();
  }

  if (still) {
    steps.forEach((li) => li.classList.add('is-active'));
    bar.remove();
    if (layout()) drawStill();
    return;
  }

  layout();
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: '120px 0px' }).observe(el);
}
