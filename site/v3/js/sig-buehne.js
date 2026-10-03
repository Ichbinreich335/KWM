// Signatur: buehne
// Dieselben Schalen wie im Kosmos, neu aufgestellt je Ausstellung: im Ring, im Kirchenschiff, auf Tischen.
// Sprites werden einmal vorgerendert, pro Bild nur drawImage. Die Schleife läuft nur, solange sich etwas bewegt.
import { random, pickGlaze, reducedMotion, renderBowlSprite } from './keramik.js';

const N = 99;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const SPRING = 55; // Steifigkeit der Feder, 1/s²
const DAMPING = 11.5; // leicht unterdämpft: ein kaum sichtbares Nachfedern
const PLAN_FADE = 0.9; // Sekunden für das Überblenden der Grundrisse
const GALLERY_CAP = 0.07; // größter Schalenradius in der Galerie, Anteil der kürzeren Bühnenseite
const SOON_DAYS = 30; // ab so vielen Tagen vor dem Ende steht „Nur noch bis …“
const DAY = 86400000;
// Linien des Grundrisses: dunkle Tusche auf hellem Grund, helle Linien auf dem Anker
const PALETTES = {
  light: { wall: 'rgba(22, 22, 22, 0.34)', fine: 'rgba(22, 22, 22, 0.17)', table: 'rgba(255, 255, 255, 0.4)', shelf: 'rgba(22, 22, 22, 0.07)', shadow: 'rgba(52, 38, 24, 0.30)', lift: 'rgba(52, 38, 24, 0.5)' },
  dark: { wall: 'rgba(242, 241, 238, 0.34)', fine: 'rgba(242, 241, 238, 0.16)', table: 'rgba(242, 241, 238, 0.05)', shelf: 'rgba(242, 241, 238, 0.08)', shadow: 'rgba(0, 0, 0, 0.6)', lift: 'rgba(0, 0, 0, 0.65)' },
};

const smooth = (dt, rate) => 1 - Math.exp(-dt * rate);

// ---------- Aufstellungen: je Raum Plätze (Mittelpunkte), Schalenradius und Grundriss ----------

const ringLayout = (W, H, pal) => {
  const R = (Math.min(W, H) / 2) * 0.9;
  const ri = R * 0.44, ro = R * 0.96;
  const d = Math.sqrt((Math.PI * (ro * ro - ri * ri)) / N);
  const unit = d * 0.39;
  const rand = random(1924);
  const a2 = (ri + unit) ** 2, b2 = (ro - unit * 1.15) ** 2;
  const slots = Array.from({ length: N }, (_, i) => {
    const dist = Math.sqrt(a2 + ((i + 0.5) / N) * (b2 - a2));
    const theta = i * GOLDEN + (rand() - 0.5) * 0.08;
    return { x: Math.cos(theta) * dist, y: Math.sin(theta) * dist };
  });
  // Plätze liegen nebeneinander auf dem Boden: Überlappungen schrittweise auflösen, im Ring bleiben
  const min = unit * 2.15;
  for (let it = 0; it < 60; it++) {
    for (let p = 0; p < N; p++) {
      for (let q = p + 1; q < N; q++) {
        const A = slots[p], B = slots[q];
        const dx = B.x - A.x, dy = B.y - A.y;
        const dd = Math.hypot(dx, dy) || 0.01;
        if (dd < min) {
          const push = (min - dd) / 2;
          A.x -= (dx / dd) * push; A.y -= (dy / dd) * push;
          B.x += (dx / dd) * push; B.y += (dy / dd) * push;
        }
      }
    }
    slots.forEach((s) => {
      const dd = Math.hypot(s.x, s.y);
      const lo = ri + unit * 1.1, hi = ro - unit * 1.1;
      if (dd < lo || dd > hi) { const k = (dd < lo ? lo : hi) / dd; s.x *= k; s.y *= k; }
    });
  }
  slots.forEach((s) => { s.x += W / 2; s.y += H / 2; });

  const draw = (c) => {
    const m = Math.min(W, H) * 0.02;
    const gap = Math.min(W, H) * 0.1;
    c.strokeStyle = pal.wall;
    c.beginPath();
    c.moveTo(W / 2 - gap, H - m); c.lineTo(m, H - m); c.lineTo(m, m); c.lineTo(W - m, m); c.lineTo(W - m, H - m); c.lineTo(W / 2 + gap, H - m);
    c.stroke();
    c.strokeStyle = pal.fine;
    [ri, ro + unit * 0.4].forEach((r) => { c.beginPath(); c.arc(W / 2, H / 2, r, 0, Math.PI * 2); c.stroke(); });
  };
  return { unit, slots, draw };
};

// Langhaus mit Mittelschiff, zwei Seitenschiffen, Pfeilerreihen und Apsis. Die lange Achse folgt der längeren Seite.
const naveLayout = (W, H, pal) => {
  const landscape = W >= H;
  const A = landscape ? W : H, B = landscape ? H : W;
  const to = (a, v) => (landscape ? { x: a, y: B / 2 + v } : { x: B / 2 + v, y: a });
  const m = B * 0.05;
  const half = (B - 2 * m) / 2; // halbe Breite des Gebäudes
  const apse = half * 0.4;
  const a0 = m, a1 = A - m - apse; // Langhaus von Eingang bis Chorbogen
  const rowsV = [-0.75, -0.375, -0.125, 0.125, 0.375, 0.75].map((f) => f * half); // zwei Seitenschiffe, vier Reihen im Mittelschiff
  const spV = half * 0.25;
  const cols = Math.max(4, Math.min(Math.floor(N / 6), Math.floor((a1 - a0) / (spV * 0.9))));
  const spA = (a1 - a0) / cols;
  const unit = Math.min(spV, spA) * 0.38;
  const slots = [];
  for (let k = 0; k < cols; k++) rowsV.forEach((v) => slots.push(to(a0 + spA * (k + 0.5), v)));

  const draw = (c) => {
    const p = (a, v) => { const q = to(a, v); return [q.x, q.y]; };
    const gap = half * 0.14;
    c.strokeStyle = pal.wall;
    c.beginPath();
    c.moveTo(...p(a0, -gap)); c.lineTo(...p(a0, -half)); c.lineTo(...p(a1, -half));
    c.moveTo(...p(a0, gap)); c.lineTo(...p(a0, half)); c.lineTo(...p(a1, half));
    for (let k = 0; k <= 24; k++) {
      const t = (k / 24) * Math.PI - Math.PI / 2;
      const [x, y] = p(a1 + Math.cos(t) * apse, Math.sin(t) * half);
      if (k) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.stroke();
    // Arkaden zwischen Mittel- und Seitenschiffen, Pfeiler im Abstand von zwei Jochen
    c.strokeStyle = pal.fine;
    c.beginPath();
    [-1, 1].forEach((side) => { c.moveTo(...p(a0, side * half * 0.5)); c.lineTo(...p(a1, side * half * 0.5)); });
    c.stroke();
    const pw = half * 0.035;
    c.fillStyle = pal.table;
    c.strokeStyle = pal.wall;
    for (let k = 0; k <= cols; k += 2) {
      [-1, 1].forEach((side) => {
        const [x, y] = p(a0 + spA * k, side * half * 0.5);
        c.beginPath(); c.rect(x - pw, y - pw, pw * 2, pw * 2); c.fill(); c.stroke();
      });
    }
  };
  return { unit, slots, draw };
};

// Werkstattraum: Regalboden an der Wand und Tische, auf denen die Schalen in Gruppen stehen
const popupLayout = (W, H, pal) => {
  const portrait = H > W;
  const rects = portrait
    ? [[0.07, 0.06, 0.86, 0.07, 'shelf'], [0.07, 0.2, 0.86, 0.17], [0.07, 0.45, 0.38, 0.2], [0.55, 0.45, 0.38, 0.2], [0.2, 0.74, 0.6, 0.17]]
    : [[0.06, 0.07, 0.88, 0.09, 'shelf'], [0.08, 0.27, 0.36, 0.3], [0.56, 0.27, 0.36, 0.3], [0.2, 0.69, 0.6, 0.22]];
  const abs = rects.map(([x, y, w, h, kind]) => ({ x: x * W, y: y * H, w: w * W, h: h * H, kind }));
  const count = (s) => abs.reduce((n, r) => n + Math.max(1, Math.floor((r.w - s * 0.3) / s)) * Math.max(1, Math.floor((r.h - s * 0.3) / s)), 0);
  let sp = Math.min(W, H) * 0.2;
  while (sp > 18 && count(sp) < 60) sp -= 1;
  const slots = [];
  abs.forEach((r) => {
    const cols = Math.max(1, Math.floor((r.w - sp * 0.3) / sp)), rows = Math.max(1, Math.floor((r.h - sp * 0.3) / sp));
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) slots.push({ x: r.x + r.w / 2 + (i - (cols - 1) / 2) * sp, y: r.y + r.h / 2 + (j - (rows - 1) / 2) * sp });
    }
  });
  slots.length = Math.min(slots.length, N);

  const draw = (c) => {
    const m = Math.min(W, H) * 0.02;
    const gap = Math.min(W, H) * 0.1;
    c.strokeStyle = pal.wall;
    c.beginPath();
    c.moveTo(W / 2 - gap, H - m); c.lineTo(m, H - m); c.lineTo(m, m); c.lineTo(W - m, m); c.lineTo(W - m, H - m); c.lineTo(W / 2 + gap, H - m);
    c.stroke();
    abs.forEach((r) => {
      c.beginPath();
      c.rect(r.x, r.y, r.w, r.h);
      if (r.kind === 'shelf') { c.fillStyle = 'rgba(22, 22, 22, 0.07)'; c.fill(); c.strokeStyle = pal.wall; } else { c.fillStyle = pal.table; c.fill(); c.strokeStyle = pal.fine; }
      c.stroke();
    });
  };
  return { unit: sp * 0.38, slots, draw };
};


// Galerie: zwei Räume mit Durchgang, in jedem Raum stehen wenige Schalen einzeln auf Sockeln
const galerieLayout = (W, H, pal) => {
  const portrait = H > W;
  const m = Math.min(W, H) * 0.04;
  const wall = Math.min(W, H) * 0.02;
  const rooms = portrait
    ? [[wall, wall, W - 2 * wall, (H - 2 * wall) / 2], [wall, H / 2, W - 2 * wall, (H - 2 * wall) / 2]]
    : [[wall, wall, (W - 2 * wall) / 2, H - 2 * wall], [W / 2, wall, (W - 2 * wall) / 2, H - 2 * wall]];
  const cols = portrait ? 3 : 2, rows = portrait ? 2 : 3;
  const slots = [];
  let cell = Infinity;
  const plinths = [];
  rooms.forEach(([x, y, w, h]) => {
    const iw = w - 2 * m, ih = h - 2 * m;
    cell = Math.min(cell, iw / cols, ih / rows);
  });
  const side = cell * 0.68;
  rooms.forEach(([x, y, w, h]) => {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const px = x + w / 2 + (i - (cols - 1) / 2) * cell, py = y + h / 2 + (j - (rows - 1) / 2) * cell;
        slots.push({ x: px, y: py });
        plinths.push([px - side / 2, py - side / 2]);
      }
    }
  });
  const door = Math.min(W, H) * 0.16;

  const draw = (c) => {
    c.strokeStyle = pal.wall;
    c.beginPath();
    c.rect(wall, wall, W - 2 * wall, H - 2 * wall);
    // Trennwand mit Durchgang in der Mitte
    if (portrait) {
      c.moveTo(wall, H / 2); c.lineTo(W / 2 - door / 2, H / 2);
      c.moveTo(W / 2 + door / 2, H / 2); c.lineTo(W - wall, H / 2);
    } else {
      c.moveTo(W / 2, wall); c.lineTo(W / 2, H / 2 - door / 2);
      c.moveTo(W / 2, H / 2 + door / 2); c.lineTo(W / 2, H - wall);
    }
    c.stroke();
    c.fillStyle = pal.table;
    c.strokeStyle = pal.fine;
    plinths.forEach(([x, y]) => { c.beginPath(); c.rect(x, y, side, side); c.fill(); c.stroke(); });
  };
  return { unit: Math.min(side * 0.4, Math.min(W, H) * GALLERY_CAP), slots, draw };
};

const LAYOUTS = { mok: ringLayout, wesel: naveLayout, greve: galerieLayout, popup: popupLayout };

// ---------- Status aus den Daten ----------

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const day = (iso) => new Date(`${iso}T00:00:00`);
const dayLabel = (d) => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;

// Gibt Zustand, Kurzform für die Tabelle und die Statuszeile über dem großen Datum zurück
const statusOf = (start, end, now = new Date()) => {
  const s = day(start), e = day(end);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < s) return { state: 'soon', cell: 'Demnächst', line: `Demnächst · ab ${dayLabel(s)}` };
  if (today > e) return { state: 'past', cell: 'Beendet', line: 'Beendet' };
  if ((e - today) / DAY < SOON_DAYS) return { state: 'live', cell: `Nur noch bis ${dayLabel(e)}`, line: `Läuft · nur noch bis ${dayLabel(e)}` };
  return { state: 'live', cell: 'Läuft', line: `Läuft · bis ${dayLabel(e)}` };
};

// Zeilen der Termin-Tabelle werden zu Reitern: Link wird Schaltfläche, Status wird aus dem Datum berechnet
function buildRows(list, shows) {
  const rows = [...list.querySelectorAll('.buehne__row')];
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-orientation', 'vertical');
  return shows.map((s) => {
    const row = rows.find((r) => r.dataset.show === s.dataset.show);
    const link = row.querySelector('.buehne__link');
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'buehne__link';
    tab.id = `buehne-tab-${s.dataset.show}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', s.id);
    tab.append(...link.childNodes);
    link.replaceWith(tab);
    row.setAttribute('role', 'presentation');
    const st = statusOf(row.dataset.start, row.dataset.end);
    const cell = tab.querySelector('.buehne__c-status');
    cell.textContent = st.cell;
    cell.dataset.state = st.state;
    s.querySelector('.buehne__status').textContent = st.line;
    s.setAttribute('role', 'tabpanel');
    s.setAttribute('aria-labelledby', tab.id);
    return tab;
  });
}

function buildTabs(container, shows) {
  return shows.map((s) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'buehne__tab';
    tab.id = `buehne-tab-${s.dataset.show}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', s.id);
    ['date', 'name', 'ort'].forEach((k) => {
      const span = document.createElement('span');
      span.className = `buehne__${k}`;
      span.textContent = s.querySelector(`.buehne__${k}`).textContent;
      tab.append(span);
    });
    s.setAttribute('role', 'tabpanel');
    s.setAttribute('aria-labelledby', tab.id);
    container.append(tab);
    return tab;
  });
}

// ---------- Initialisierung ----------

export default function init(el) {
  const shows = [...el.querySelectorAll('.buehne__show')];
  const tabsEl = el.querySelector('.buehne__tabs');
  const rowsEl = el.querySelector('.buehne__rows');
  const stage = el.querySelector('.buehne__stage');
  const floor = el.querySelector('.buehne__floor');
  const readout = el.querySelector('.buehne__readout');
  if (!shows.length || !(tabsEl || rowsEl) || !stage || !floor) return;
  const reduced = reducedMotion();
  const pal = el.classList.contains('buehne--anker') ? PALETTES.dark : PALETTES.light;

  const planCv = document.createElement('canvas');
  planCv.className = 'buehne__plan';
  planCv.setAttribute('aria-hidden', 'true');
  const cv = document.createElement('canvas');
  cv.className = 'buehne__canvas';
  cv.setAttribute('role', 'img');
  floor.append(planCv, cv);
  const planCtx = planCv.getContext('2d');
  const ctx = cv.getContext('2d');

  const rand = random(1924);
  const bowls = Array.from({ length: N }, (_, i) => ({
    i,
    glaze: pickGlaze(rand),
    size: 0.8 + rand() * 0.32,
    jitter: (rand() - 0.5) * 0.08,
    wob: [rand() * 0.02 + 0.008, rand() * 6.28, rand() * 0.016 + 0.006, rand() * 6.28],
    rings: 2 + Math.floor(rand() * 3),
    speckles: Array.from({ length: 6 + Math.floor(rand() * 16) }, () => [rand(), rand(), rand()]),
    sprite: null, spriteHalf: 0, r: 0,
    x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, delay: 0, f: 1, ft: 1,
    present: true, alpha: 0, sc: 1.15, z: 0, px: 0, py: 0, lift: 0,
  }));
  // weicher Schatten für abgehobene Schalen
  const shadow = document.createElement('canvas');
  shadow.width = shadow.height = 64;
  const sc2 = shadow.getContext('2d');
  const sg = sc2.createRadialGradient(32, 32, 0, 32, 32, 32);
  sg.addColorStop(0, pal.lift);
  sg.addColorStop(1, pal.lift.replace(/[\d.]+\)$/, '0)'));
  sc2.fillStyle = sg;
  sc2.fillRect(0, 0, 64, 64);

  let W = 0, H = 0, dpr = 1, U = 1;
  let layouts = null, current = shows[0].dataset.show, previous = null, planT = 1;
  let running = false, visible = false, raf = 0, lastT = 0;
  let pointer = null, hovered = -1, built = false;
  const sweepRand = random(77);

  const place = (key, animate) => {
    const L = layouts[key];
    // Plätze den Schalen zuordnen: kürzeste Wege zuerst, überzählige Schalen bleiben stehen und verblassen
    const pairs = [];
    bowls.forEach((b) => L.slots.forEach((s, k) => pairs.push([(b.x - s.x) ** 2 + (b.y - s.y) ** 2, b.i, k])));
    pairs.sort((p, q) => p[0] - q[0]);
    const usedB = new Set(), usedS = new Set();
    bowls.forEach((b) => { b.present = false; });
    pairs.forEach(([, bi, k]) => {
      if (usedB.has(bi) || usedS.has(k)) return;
      usedB.add(bi); usedS.add(k);
      const b = bowls[bi];
      b.present = true; b.tx = L.slots[k].x; b.ty = L.slots[k].y;
    });
    bowls.forEach((b) => {
      b.ft = L.unit / U;
      if (animate) {
        b.delay = b.present ? 30 + ((b.tx / W + 0.3 * (b.ty / H)) / 1.3) * 320 + sweepRand() * 140 : sweepRand() * 260;
      } else {
        if (b.present) { b.x = b.tx; b.y = b.ty; }
        b.vx = b.vy = 0; b.delay = 0; b.z = 0; b.f = b.ft;
        b.alpha = b.present ? 1 : 0; b.sc = b.present ? 1 : 0.82;
      }
    });
  };

  const drawPlan = () => {
    planCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    planCtx.clearRect(0, 0, W, H);
    planCtx.lineWidth = 1;
    planCtx.lineJoin = 'round';
    if (previous && planT < 1) {
      planCtx.globalAlpha = 1 - planT;
      layouts[previous].draw(planCtx);
    }
    planCtx.globalAlpha = previous ? planT : 1;
    layouts[current].draw(planCtx);
    planCtx.globalAlpha = 1;
  };

  const layout = () => {
    const rect = cv.getBoundingClientRect();
    if (!rect.width) return;
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    [cv, planCv].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    layouts = Object.fromEntries(shows.map((x) => [x.dataset.show, LAYOUTS[x.dataset.show](W, H, pal)]));
    U = Math.max(...Object.values(layouts).map((l) => l.unit));
    bowls.forEach((b) => {
      ({ sprite: b.sprite, half: b.spriteHalf } = renderBowlSprite({ ...b, r: U * b.size }, dpr, pal.shadow));
    });
    if (!built) {
      built = true;
      // erster Aufbau: Schale i auf Platz i, danach kommen sie gestaffelt herein
      layouts[current].slots.forEach((s, k) => { bowls[k].x = bowls[k].tx = s.x; bowls[k].y = bowls[k].ty = s.y; });
      bowls.forEach((b) => { b.f = b.ft = layouts[current].unit / U; b.delay = reduced ? 0 : b.i * 14; b.alpha = reduced ? 1 : 0; b.sc = reduced ? 1 : 1.15; });
    } else {
      place(current, false);
    }
    planT = 1; previous = null;
    drawPlan();
    wake();
  };

  const frame = (t) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
    lastT = t;
    let busy = false;
    const k9 = smooth(dt, 9);
    const ref = Math.min(W, H) * 0.2;
    const reach = Math.min(W, H) * 0.11;

    if (planT < 1) {
      planT = Math.min(1, planT + dt / PLAN_FADE);
      drawPlan();
      if (planT < 1) busy = true; else previous = null;
    }

    bowls.forEach((b) => {
      b.r = b.f * U * b.size;
      if (b.delay > 0) { b.delay -= dt * 1000; busy = true; return; }
      // Flug: gedämpfte Feder auf den neuen Platz
      const n = Math.ceil(dt * 90) || 1, h = dt / n;
      for (let s = 0; s < n; s++) {
        b.vx += (SPRING * (b.tx - b.x) - DAMPING * b.vx) * h;
        b.vy += (SPRING * (b.ty - b.y) - DAMPING * b.vy) * h;
        b.x += b.vx * h; b.y += b.vy * h;
      }
      const dist = Math.hypot(b.tx - b.x, b.ty - b.y);
      if (dist < 0.1 && Math.hypot(b.vx, b.vy) < 1) { b.x = b.tx; b.y = b.ty; b.vx = b.vy = 0; } else busy = true;
      // Anheben im Flug, sinkt beim Ankommen wieder ab
      const zt = b.present ? Math.min(1, dist / ref) ** 0.8 : 0;
      b.z += (zt - b.z) * smooth(dt, 7);
      if (b.z < 0.004 && zt === 0) b.z = 0; else busy = true;
      const at = b.present ? 1 : 0, st = b.present ? 1 : 0.82;
      b.alpha += (at - b.alpha) * smooth(dt, b.present ? 4 : 5);
      b.sc += (st - b.sc) * smooth(dt, 5);
      b.f += (b.ft - b.f) * smooth(dt, 4);
      if (Math.abs(b.ft - b.f) < 0.002) b.f = b.ft; else busy = true;
      if (Math.abs(at - b.alpha) < 0.004) b.alpha = at; else busy = true;
      if (Math.abs(st - b.sc) < 0.004) b.sc = st; else busy = true;
    });

    // Ausweichen um den Zeiger, Anheben der berührten Schale
    bowls.forEach((b) => {
      let tx = 0, ty = 0;
      if (pointer && !reduced && b.present) {
        const dx = b.x - pointer.x, dy = b.y - pointer.y;
        const dd = Math.hypot(dx, dy);
        if (dd < reach && dd > 0.01 && b.i !== hovered) {
          const f = (1 - dd / reach) ** 2 * b.r * 0.55;
          tx = (dx / dd) * f; ty = (dy / dd) * f;
        }
      }
      b.px += (tx - b.px) * k9; b.py += (ty - b.py) * k9;
      b.lift += ((b.i === hovered ? 1 : 0) - b.lift) * (reduced ? 1 : smooth(dt, 10));
      if (Math.abs(b.px) + Math.abs(b.py) < 0.02 && !tx && !ty) { b.px = b.py = 0; } else busy = true;
      if (Math.abs(b.lift - (b.i === hovered ? 1 : 0)) < 0.004) b.lift = b.i === hovered ? 1 : 0; else busy = true;
    });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = 'high';
    const order = bowls.filter((b) => b.alpha > 0.01).sort((p, q) => (p.z + p.lift) - (q.z + q.lift));
    order.forEach((b) => {
      const e = reduced ? 1 : b.alpha;
      const up = b.z * 0.55 + b.lift * 0.12;
      const gx = b.x + b.px, gy = b.y + b.py;
      if (b.z > 0.02) {
        const sh = b.r * 2.7 * (1 + 0.45 * b.z) * b.sc;
        ctx.globalAlpha = 0.3 * b.z * e;
        ctx.drawImage(shadow, gx + b.r * 0.22 - sh / 2, gy + b.r * 0.3 - sh / 2, sh, sh);
      }
      const half = b.spriteHalf * b.f * b.sc * (1 + b.z * 0.12) * (1 + b.lift * 0.14);
      ctx.globalAlpha = e;
      ctx.drawImage(b.sprite, gx - half, gy - half - up * b.r, half * 2, half * 2);
    });
    ctx.globalAlpha = 1;

    if (busy || pointer) raf = requestAnimationFrame(frame); else { running = false; lastT = 0; }
  };

  function wake() {
    if (running || !visible || !layouts) return;
    running = true;
    lastT = 0;
    raf = requestAnimationFrame(frame);
  }

  // ---------- Zeiger ----------
  const hit = (x, y) => {
    let best = -1, bestD = Infinity;
    bowls.forEach((b) => {
      if (!b.present || b.alpha < 0.5) return;
      const d = Math.hypot(b.x + b.px - x, b.y + b.py - y);
      if (d < b.r * 1.05 && d < bestD) { best = b.i; bestD = d; }
    });
    return best;
  };
  const showReadout = () => {
    const show = shows.find((s) => s.dataset.show === current);
    readout.textContent = hovered >= 0 ? `Schale ${hovered + 1} · ${bowls[hovered].glaze.name}` : show.dataset.readout;
    cv.style.cursor = hovered >= 0 ? 'pointer' : 'default';
  };
  const track = (e) => {
    const r = cv.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    hovered = hit(pointer.x, pointer.y);
    showReadout();
    wake();
  };
  cv.addEventListener('pointermove', track);
  cv.addEventListener('pointerdown', track);
  cv.addEventListener('pointerleave', () => { pointer = null; hovered = -1; showReadout(); wake(); });

  // ---------- Auswahl ----------
  // Tabelle (Anker): jede Zeile ist eine Auswahl. Ältere Einbindung (Fläche): Reiter aus den Angaben der Ausstellungen.
  const tabs = rowsEl ? buildRows(rowsEl, shows) : buildTabs(tabsEl, shows);

  const select = (key, { focus = false, animate = true } = {}) => {
    const changed = key !== current;
    tabs.forEach((tab, i) => {
      const on = shows[i].dataset.show === key;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      shows[i].hidden = !on;
      if (on && focus) tab.focus();
    });
    const show = shows.find((s) => s.dataset.show === key);
    cv.setAttribute('aria-label', show.dataset.aria);
    if (!changed) { showReadout(); return; }
    previous = current; current = key; hovered = -1;
    showReadout();
    if (!layouts) return;
    const go = animate && !reduced;
    place(key, go);
    planT = go ? 0 : 1;
    if (!go) previous = null;
    drawPlan();
    wake();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(shows[i].dataset.show));
    tab.addEventListener('keydown', (e) => {
      const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(shows[(next + tabs.length) % tabs.length].dataset.show, { focus: true });
    });
  });

  if (tabsEl) tabsEl.hidden = false;
  stage.hidden = false;
  el.classList.add('is-enhanced');
  select(current, { animate: false });

  layout();
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 150); }, { passive: true });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake(); else { running = false; cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: 0.08 }).observe(stage);
}
