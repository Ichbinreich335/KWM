// Signatur: farbskala
// Jedes Band ist eine Glasur-Testkachel: oben der rohe Scherben, darunter die Glasur mit Tauchkante.
// Wird ein Band geöffnet, steigt die Glasur ein Stück höher, wie beim Tauchen.
// Gerechnet wird in „Kachel-Koordinaten“: y läuft vom Scherben (0) zur dicken Glasur (L).
// Mobil liegt die Kachel quer, dann werden die Achsen beim Zeichnen getauscht.
import { CLAY, MOBIL_ABFRAGE, random, reducedMotion, type Rng } from './keramik';

type RGB = readonly [number, number, number];

interface Offscreen {
  c: HTMLCanvasElement;
  x: CanvasRenderingContext2D;
}

/** Eigenschaften je Oberfläche: Flecken, Korn, Glanz (hell/dunkel), Rand zum Scherben, Glanzreflex folgt dem Zeiger */
const OBERFLAECHEN = {
  matt: { blobs: 44, korn: 0.5, glanz: 0.05, glanzDunkel: 0.05, randMix: 0.3, spiegelt: false },
  satin: { blobs: 30, korn: 0.32, glanz: 0.1, glanzDunkel: 0.1, randMix: 0.14, spiegelt: false },
  glanz: { blobs: 30, korn: 0.14, glanz: 0.3, glanzDunkel: 0.16, randMix: 0.14, spiegelt: true },
} as const;
type Oberflaeche = keyof typeof OBERFLAECHEN;
const istOberflaeche = (wert: string | undefined): wert is Oberflaeche => wert !== undefined && wert in OBERFLAECHEN;

interface Kachelglasur {
  grund: RGB;
  dunkel: RGB;
  hell: RGB;
  flaeche: (typeof OBERFLAECHEN)[Oberflaeche];
  layers: boolean;
  seed: number;
  speckle?: RGB;
  speckleKind?: 'korn' | 'eisen' | 'punkte';
}

const sprenkelart = (wert: string | undefined): NonNullable<Kachelglasur['speckleKind']> =>
  wert === 'korn' || wert === 'eisen' ? wert : 'punkte';

interface Welle {
  a: number;
  f: number;
  ph: number;
}

interface Beule {
  x: number;
  w: number;
  h: number;
}

interface Platz {
  width: number;
  height: number;
}

const MAX_DPR = 2;
const OPEN_GROW = 2.6;
const OTHER_GROW = 0.8;
const BAND_COUNT = 6;
const INTRO_STAGGER = 130;
const SPRING = 5.5;
const REST_EDGE = 0.34;
const OPEN_EDGE = 0.2;
// Feuchter Saum über der Tauchkante: einmal mit Weichzeichner vorgezeichnet, je Bild nur verschoben.
// Die Kante schwankt um höchstens 26 px nach oben (Wellen und Beulen), der Weichzeichner reicht etwa 14 px.
const SAUM_OBEN = 48;
const SAUM_HOEHE = 64;
const SAUM_BLUR = 9;

const rgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
/** Dunkle Glasur: helle Schrift, weniger Licht, Sammelschatten unten */
const istDunkel = (c: RGB) => (c[0] + c[1] + c[2]) / 3 < 110;

// feines Korn, einmal erzeugt und überall als Muster verwendet
function grainTile() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  if (!x) return c;
  const img = x.createImageData(128, 128);
  const r = random(41);
  for (let i = 0; i < 128 * 128; i++) {
    const v = r() < 0.5 ? 0 : 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = r() * 70;
  }
  x.putImageData(img, 0, 0);
  return c;
}

function offscreen(w: number, h: number, dpr: number): Offscreen | null {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const x = c.getContext('2d');
  if (!x) return null;
  x.scale(dpr, dpr);
  return { c, x };
}

function fillGrain(x: CanvasRenderingContext2D, w: number, h: number, grain: HTMLCanvasElement, alpha: number) {
  x.save();
  x.globalAlpha = alpha;
  const pattern = x.createPattern(grain, 'repeat');
  if (pattern) x.fillStyle = pattern;
  x.fillRect(0, 0, w, h);
  x.restore();
}

function soft(x: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: RGB, alpha: number) {
  x.save();
  x.translate(cx, cy);
  x.scale(rx, ry);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  x.fillStyle = g;
  x.fillRect(-1, -1, 2, 2);
  x.restore();
}

// Geschichteter Scherben: Ton mit Poren, Licht von links
function paintBiscuit(x: CanvasRenderingContext2D, T: number, L: number, grain: HTMLCanvasElement, rand: Rng) {
  const base = rgb(CLAY.bisque);
  const g = x.createLinearGradient(0, 0, T, 0);
  g.addColorStop(0, rgba(mix(base, [255, 250, 240], 0.28), 1));
  g.addColorStop(1, rgba(mix(base, rgb(CLAY.raw), 0.35), 1));
  x.fillStyle = g;
  x.fillRect(0, 0, T, L);
  for (let i = 0; i < 26; i++) {
    soft(
      x,
      rand() * T,
      rand() * L,
      T * (0.2 + rand() * 0.4),
      L * (0.04 + rand() * 0.1),
      rgb(CLAY.raw),
      0.05 + rand() * 0.05,
    );
  }
  fillGrain(x, T, L, grain, 0.55);
  const pores = Math.round((T * L) / 900);
  for (let i = 0; i < pores; i++) {
    x.fillStyle = rgba(rgb(CLAY.raw), 0.18 + rand() * 0.22);
    const s = 0.5 + rand() * 1.1;
    x.fillRect(rand() * T, rand() * L, s, s);
  }
}

// Glasurkörper: nach unten dichter und dunkler, mit Flecken, Korn und Sprenkeln
function paintBody(
  x: CanvasRenderingContext2D,
  T: number,
  L: number,
  glaze: Kachelglasur,
  grain: HTMLCanvasElement,
  rand: Rng,
) {
  const { grund, dunkel, hell, flaeche, speckle } = glaze;
  const g = x.createLinearGradient(0, 0, 0, L);
  g.addColorStop(0, rgba(grund, 1));
  g.addColorStop(0.45, rgba(grund, 1));
  g.addColorStop(1, rgba(dunkel, 1));
  x.fillStyle = g;
  x.fillRect(0, 0, T, L);

  if (glaze.layers) {
    for (let i = 0; i < 7; i++) {
      const y = (i + rand() * 0.7) * (L / 7);
      const h = L * (0.05 + rand() * 0.06);
      const sg = x.createLinearGradient(0, y, 0, y + h);
      const c = i % 2 ? hell : dunkel;
      sg.addColorStop(0, rgba(c, 0));
      sg.addColorStop(0.5, rgba(c, 0.22));
      sg.addColorStop(1, rgba(c, 0));
      x.fillStyle = sg;
      x.fillRect(0, y, T, h);
    }
  }

  const blobs = flaeche.blobs;
  for (let i = 0; i < blobs; i++) {
    const c = rand() < (istDunkel(grund) ? 0.25 : 0.5) ? hell : dunkel;
    soft(x, rand() * T, rand() * L, T * (0.15 + rand() * 0.35), L * (0.03 + rand() * 0.08), c, 0.07 + rand() * 0.08);
  }

  fillGrain(x, T, L, grain, flaeche.korn * (grund[0] + grund[1] + grund[2] < 330 ? 0.6 : 1));

  if (speckle) {
    // Weiß: vereinzelte Eisenpunkte; Rostbraun: dichte dunkle Sprenkel; matt: helle Flecken im Korn
    const spots = glaze.speckleKind !== 'korn';
    const n = spots ? Math.round((T * L) / (glaze.speckleKind === 'eisen' ? 1500 : 6500)) : 0;
    for (let i = 0; i < n; i++) {
      const r = glaze.speckleKind === 'eisen' ? 0.6 + rand() * 1.3 : 0.7 + Math.pow(rand(), 2.2) * 2.4;
      const px = rand() * T;
      const py = rand() * L;
      soft(x, px, py, r * 2.2, r * 2.2, speckle, 0.18);
      x.fillStyle = rgba(speckle, 0.55 + rand() * 0.4);
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
      x.fill();
    }
    if (glaze.speckleKind === 'korn') {
      for (let i = Math.round((T * L) / 220); i > 0; i--) {
        x.fillStyle = rgba(speckle, 0.18 + rand() * 0.3);
        x.fillRect(rand() * T, rand() * L, 0.9, 0.9);
      }
    }
  }
}

// Licht von links oben über die ganze Kachel; dunkle Glasuren sammeln sich zudem unten (das trägt die helle
// Beschriftung). Beides ändert sich beim Tauchen nicht und liegt deshalb schon in den vorgezeichneten Flächen.
function paintLicht(x: CanvasRenderingContext2D, T: number, L: number, dark: boolean, tiefe: boolean) {
  if (tiefe && dark) {
    const sg = x.createLinearGradient(0, L - 120, 0, L);
    sg.addColorStop(0, 'rgba(20, 12, 4, 0)');
    sg.addColorStop(1, 'rgba(20, 12, 4, 0.2)');
    x.fillStyle = sg;
    x.fillRect(0, L - 120, T, 120);
  }
  const lg = x.createLinearGradient(0, 0, T, 0);
  lg.addColorStop(0, `rgba(255,255,255,${dark ? 0.04 : 0.1})`);
  lg.addColorStop(0.5, 'rgba(255,255,255,0)');
  lg.addColorStop(1, 'rgba(0,0,0,0.09)');
  x.fillStyle = lg;
  x.fillRect(0, 0, T, L);
}

// Farb-Attribute der Kachel: fehlt eines, ist das Markup falsch (wie bisher bricht das Skript dann ab)
const datum = (d: DOMStringMap, key: string) => {
  const v = d[key];
  if (v === undefined) throw new TypeError(`data-${key} fehlt am Band`);
  return v;
};

class Tile {
  el: HTMLElement;
  index: number;
  grain: HTMLCanvasElement;
  glaze: Kachelglasur;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  p = 0;
  target = 0;
  mx = 0.3;
  mxTarget = 0.3;
  dirty = true;
  visible = 0;
  horizontal = false;
  dpr = 1;
  L = 0;
  T = 0;
  hi = 0;
  rest = 0;
  p0 = 0;
  bisc: Offscreen | null = null;
  body: Offscreen | null = null;
  saum: Offscreen | null = null;
  wave: Welle[] = [];
  bumps: Beule[] = [];

  constructor(el: HTMLElement, index: number, grain: HTMLCanvasElement) {
    this.el = el;
    this.index = index;
    this.grain = grain;
    const d = el.dataset;
    const glaze: Kachelglasur = {
      grund: rgb(datum(d, 'grund')),
      dunkel: rgb(datum(d, 'dunkel')),
      hell: rgb(datum(d, 'hell')),
      flaeche: OBERFLAECHEN[istOberflaeche(d.finish) ? d.finish : 'satin'],
      layers: 'schichten' in d,
      seed: Number(d.seed),
    };
    if (d.speckle) {
      glaze.speckle = rgb(d.speckle);
      glaze.speckleKind = sprenkelart(d.speckleKind);
    }
    this.glaze = glaze;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'scale__cv';
    this.canvas.setAttribute('aria-hidden', 'true');
    el.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  // Maße neu aufnehmen: T = Dicke der Kachel (fest auf die größte Weite), L = Länge
  layout(horizontal: boolean, box: Platz, dpr: number) {
    const share = OPEN_GROW / (OPEN_GROW + OTHER_GROW * (BAND_COUNT - 1));
    this.horizontal = horizontal;
    this.dpr = dpr;
    this.L = Math.round(horizontal ? box.width : box.height);
    const slots = horizontal ? box.height : box.width;
    this.T = Math.ceil(slots * share) + 4;
    const cssW = horizontal ? this.L : this.T;
    const cssH = horizontal ? this.T : this.L;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.ceil(cssW * dpr);
    this.canvas.height = Math.ceil(cssH * dpr);
    this.hi = Math.max(this.L * OPEN_EDGE, horizontal ? 112 : 132);
    this.rest = Math.max(this.L * REST_EDGE, horizontal ? 104 : 148);
    this.p0 = (this.L - this.rest) / (this.L - this.hi);

    const rand = random(this.glaze.seed * 977 + 13);
    const dark = istDunkel(this.glaze.grund);
    this.bisc = offscreen(this.T, this.L, dpr);
    if (this.bisc) {
      paintBiscuit(this.bisc.x, this.T, this.L, this.grain, rand);
      paintLicht(this.bisc.x, this.T, this.L, dark, false);
    }
    this.body = offscreen(this.T, this.L, dpr);
    if (this.body) {
      paintBody(this.body.x, this.T, this.L, this.glaze, this.grain, rand);
      paintLicht(this.body.x, this.T, this.L, dark, true);
    }

    const r = random(this.glaze.seed * 31 + 5);
    this.wave = [0, 1, 2].map(() => ({ a: 1 + r() * 2.2, f: 0.012 + r() * 0.03, ph: r() * 6.28 }));
    this.bumps = [0, 1].map(() => ({ x: r() * this.T, w: 8 + r() * 14, h: 3 + r() * 5 }));

    // Der Scherben saugt, direkt über der Kante wird er feucht und dunkler. Die Kante verschiebt sich beim Tauchen
    // nur senkrecht, deshalb reicht ein vorgezeichneter Saum (shadowBlur je Bild war der teuerste Schritt).
    this.saum = offscreen(this.T, SAUM_HOEHE, dpr);
    if (this.saum) {
      const { x } = this.saum;
      x.shadowColor = 'rgba(78, 52, 24, 0.4)';
      x.shadowBlur = SAUM_BLUR * dpr;
      x.fillStyle = rgba(this.glaze.grund, 1);
      this.edgePath(x, SAUM_OBEN);
      x.fill();
    }
    this.dirty = true;
  }

  edgeAt(x: number, e: number) {
    let y = e;
    for (const w of this.wave) y += w.a * Math.sin(x * w.f * 6.28 + w.ph);
    for (const b of this.bumps) y -= b.h * Math.exp(-((x - b.x) ** 2) / (2 * b.w * b.w));
    return y;
  }

  edgePath(ctx: CanvasRenderingContext2D, e: number) {
    ctx.beginPath();
    ctx.moveTo(0, this.edgeAt(0, e));
    for (let x = 3; x < this.T; x += 3) ctx.lineTo(x, this.edgeAt(x, e));
    ctx.lineTo(this.T, this.edgeAt(this.T, e));
    ctx.lineTo(this.T, this.L + 4);
    ctx.lineTo(0, this.L + 4);
    ctx.closePath();
  }

  draw() {
    const { ctx, bisc, body, T, L, glaze, dpr } = this;
    if (!ctx || !bisc || !body) return;
    this.visible = this.horizontal ? this.el.clientHeight : this.el.clientWidth;
    const e = this.L - this.p * (this.L - this.hi);
    const swap = this.horizontal;
    ctx.setTransform(swap ? 0 : dpr, swap ? dpr : 0, swap ? dpr : 0, swap ? 0 : dpr, 0, 0);
    ctx.clearRect(0, 0, T, L);
    ctx.drawImage(bisc.c, 0, 0, T, L);
    if (this.p <= 0.001) {
      this.dirty = false;
      return;
    }

    const light = glaze.flaeche.spiegelt;
    const dark = istDunkel(glaze.grund);

    if (this.saum) ctx.drawImage(this.saum.c, 0, e - SAUM_OBEN, T, SAUM_HOEHE);

    ctx.save();
    this.edgePath(ctx, e);
    ctx.clip();
    ctx.drawImage(body.c, 0, 0, T, L);

    // Dünn an der Kante: der Scherben scheint durch, die Glasur wird heller
    const span = Math.min(60, (L - e) * 0.5);
    if (span > 4) {
      const g = ctx.createLinearGradient(0, e - 6, 0, e + span);
      g.addColorStop(0, rgba(mix(glaze.hell, rgb(CLAY.bisque), glaze.flaeche.randMix), dark ? 0.3 : 0.75));
      g.addColorStop(1, rgba(glaze.hell, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, e - 8, T, span + 8);
    }

    // Weicher Glanz: breites Band plus Fenster-Reflex, folgt dem Zeiger
    const sheen = dark ? glaze.flaeche.glanzDunkel : glaze.flaeche.glanz;
    const reach = L - e;
    const vis = Math.min(T, this.visible);
    if (reach > 20) {
      const gx = vis * (0.12 + this.mx * 0.4);
      const g = ctx.createLinearGradient(gx - vis * 0.45, e, gx + vis * 0.45, e + reach * 0.9);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(255,255,255,${sheen * (dark ? 0.3 : 0.55)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, e, T, reach);
      if (light) {
        const cx = vis * (0.2 + this.mx * 0.3);
        soft(ctx, cx, e + reach * 0.3, Math.max(8, vis * 0.07), reach * 0.24, [255, 255, 255], sheen * 1.3);
        soft(
          ctx,
          cx - 1,
          e + reach * 0.22,
          Math.max(3, vis * 0.022),
          reach * 0.1,
          [255, 255, 255],
          Math.min(0.85, sheen * 2.2),
        );
      }
    }
    ctx.restore();

    // Wulst an der Tauchkante: oben hell, darunter ein weicher Schatten
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, this.edgeAt(0, e));
    for (let x = 3; x <= T; x += 3) ctx.lineTo(x, this.edgeAt(x, e));
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = 'rgba(30, 22, 12, 0.14)';
    ctx.translate(0, 2.4);
    ctx.stroke();
    ctx.translate(0, -2.4);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(255,255,255,${light ? 0.5 : 0.26})`;
    ctx.stroke();
    ctx.restore();

    this.dirty = false;
  }

  step(dt: number) {
    const k = 1 - Math.exp(-dt * SPRING);
    const pPrev = this.p;
    this.p += (this.target - this.p) * k;
    if (Math.abs(this.target - this.p) < 0.0008) this.p = this.target;
    const mxPrev = this.mx;
    this.mx += (this.mxTarget - this.mx) * (1 - Math.exp(-dt * 8));
    if (Math.abs(this.mxTarget - this.mx) < 0.001) this.mx = this.mxTarget;
    if (this.p !== pPrev || (this.mx !== mxPrev && this.glaze.flaeche.spiegelt)) this.dirty = true;
    return this.p !== this.target || this.mx !== this.mxTarget;
  }
}

export default function init(el: Element) {
  const bands = [...el.querySelectorAll<HTMLElement>('.scale__band')];
  const [firstBand] = bands;
  if (!firstBand) return;
  const reduced = reducedMotion();
  const grain = grainTile();
  const tiles = bands.map((b, i) => new Tile(b, i, grain));
  const narrow = window.matchMedia(MOBIL_ABFRAGE);
  let pinned = -1;
  let hovered = -1;
  let focused = -1;
  let raf = 0;
  let last = 0;
  let introDone = false;

  const active = () => (hovered >= 0 ? hovered : focused >= 0 ? focused : pinned);

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    let moving = false;
    for (const t of tiles) {
      if (t.step(dt)) moving = true;
      if (t.dirty) t.draw();
    }
    raf = moving ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const apply = () => {
    const a = active();
    el.classList.toggle('has-open', a >= 0);
    tiles.forEach((t, i) => {
      t.el.classList.toggle('is-open', i === a);
      t.el.setAttribute('aria-pressed', String(i === pinned));
      t.target = i === a ? 1 : t.p0;
      if (!introDone) return;
      if (reduced) {
        t.p = t.target;
        t.dirty = true;
      }
    });
    wake();
  };

  const build = () => {
    const box = el.getBoundingClientRect();
    const first = firstBand.getBoundingClientRect();
    const horizontal = narrow.matches;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const slot = horizontal
      ? { width: first.width, height: box.height }
      : { width: box.width - 2 * parseFloat(getComputedStyle(el).paddingLeft), height: first.height };
    tiles.forEach((t) => {
      t.layout(horizontal, slot, dpr);
      if (introDone) {
        t.p = t.target = t.p0;
      }
    });
    if (introDone) apply();
    wake();
  };

  el.classList.add('is-live');
  build();
  tiles.forEach((t) => {
    t.target = 0;
    t.p = 0;
  });
  tiles.forEach((t) => t.draw());

  bands.forEach((b, i) => {
    b.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') {
        hovered = i;
        apply();
      }
    });
    b.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && hovered === i) {
        hovered = -1;
        apply();
      }
    });
    b.addEventListener('focus', () => {
      if (b.matches(':focus-visible')) {
        focused = i;
        apply();
      }
    });
    b.addEventListener('blur', () => {
      if (focused === i) {
        focused = -1;
        apply();
      }
    });
    b.addEventListener('click', () => {
      pinned = pinned === i ? -1 : i;
      apply();
    });
  });

  // Einstieg: die Proben werden nacheinander getaucht, sobald die Skala im Bild ist
  const start = () => {
    introDone = true;
    tiles.forEach((t, i) => {
      const go = () => {
        t.target = t.p0;
        wake();
        if (i === tiles.length - 1) setTimeout(() => el.classList.add('is-ready'), 700);
      };
      if (reduced) {
        t.p = t.p0;
        t.target = t.p0;
        t.dirty = true;
        el.classList.add('is-ready');
      } else setTimeout(go, i * INTRO_STAGGER);
    });
    if (reduced) wake();
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      start();
    },
    { threshold: 0.25 },
  );
  io.observe(el);

  const size = { w: el.clientWidth, h: el.clientHeight };
  let resizeFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (el.clientWidth === size.w && el.clientHeight === size.h) return;
      size.w = el.clientWidth;
      size.h = el.clientHeight;
      build();
    });
  }).observe(el);
}
