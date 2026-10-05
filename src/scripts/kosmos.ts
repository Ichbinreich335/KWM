// Kosmos der Startseite: 99 Schalen von oben, im Ring um eine leere Mitte. Die Schalen drehen sich langsam,
// weichen dem Zeiger aus und heben sich an, wenn er eine trifft; die Mitte nennt Nummer und Glasur.
import { pickGlaze as pickFrom, random, reducedMotion, renderBowlSprite, type Schale } from './keramik';

/** Schale im Kosmos: feste Eigenschaften, Lage im Ring und Animationszustand. */
interface Bowl extends Schale {
  i: number;
  size: number;
  jitter: number;
  x: number;
  y: number;
  lift: number;
  px: number;
  py: number;
  hx: number;
  hy: number;
  dist: number;
  theta: number;
  sprite: HTMLCanvasElement | null;
  spriteHalf: number;
}

/** Zeichnet den Kosmos in die Bühne (Canvas und Anzeige darin); `signal` beendet Beobachter und Schleife. */
export function zeichneKosmos(stage: HTMLElement, signal: AbortSignal): void {
  const reduced = reducedMotion();
  const canvas = stage.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const readout = stage.querySelector('[data-cosmos-readout]');
  const N = 99;
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  const rand = random(1924);
  const pickGlaze = () => pickFrom(rand);

  // Feste Eigenschaften jeder Schale, unabhängig von der Bühnengröße
  const bowls = Array.from({ length: N }, (_, i): Bowl => ({
    i,
    glaze: pickGlaze(),
    size: 0.8 + rand() * 0.32,
    jitter: (rand() - 0.5) * 0.08,
    wob: [rand() * 0.02 + 0.008, rand() * 6.28, rand() * 0.016 + 0.006, rand() * 6.28],
    rings: 2 + Math.floor(rand() * 3),
    speckles: Array.from({ length: 6 + Math.floor(rand() * 16) }, () => [rand(), rand(), rand()]),
    x: 0,
    y: 0,
    r: 0,
    lift: 0,
    px: 0,
    py: 0,
    hx: 0,
    hy: 0,
    dist: 0,
    theta: 0,
    sprite: null,
    spriteHalf: 0,
  }));

  let S = 0,
    dpr = 1,
    looping = false,
    rot = 0,
    startedAt = 0,
    running = false;
  let pointer: { x: number; y: number } | null = null,
    hovered = -1,
    lastT = 0;

  const layout = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    // Gleiche Größe und Auflösung: nichts neu bauen (iOS meldet resize schon beim Ein- und Ausblenden der Adressleiste)
    if (rect.width === S && nextDpr === dpr) return;
    S = rect.width;
    dpr = nextDpr;
    canvas.width = Math.round(S * dpr);
    canvas.height = Math.round(S * dpr);
    const R = S / 2;
    const ri = R * 0.44,
      ro = R * 0.96;
    const d = Math.sqrt((Math.PI * (ro * ro - ri * ri)) / N);
    const base = d * 0.39;
    const a2 = (ri + base) ** 2,
      b2 = (ro - base * 1.15) ** 2;
    bowls.forEach((b) => {
      const dist = Math.sqrt(a2 + ((b.i + 0.5) / N) * (b2 - a2));
      const theta = b.i * GOLDEN + b.jitter;
      b.r = base * b.size;
      b.hx = Math.cos(theta) * dist;
      b.hy = Math.sin(theta) * dist;
    });
    // Schalen liegen nebeneinander auf dem Boden: Überlappungen schrittweise auflösen, im Ring bleiben
    for (let it = 0; it < 60; it++) {
      for (let p = 0; p < N; p++) {
        for (let q = p + 1; q < N; q++) {
          const A = bowls[p],
            B = bowls[q];
          if (!A || !B) continue;
          const dx = B.hx - A.hx,
            dy = B.hy - A.hy;
          const d = Math.hypot(dx, dy) || 0.01;
          const min = (A.r + B.r) * 1.12;
          if (d < min) {
            const push = (min - d) / 2;
            A.hx -= (dx / d) * push;
            A.hy -= (dy / d) * push;
            B.hx += (dx / d) * push;
            B.hy += (dy / d) * push;
          }
        }
      }
      bowls.forEach((b) => {
        const d = Math.hypot(b.hx, b.hy);
        const lo = ri + b.r * 1.1,
          hi = ro - b.r * 1.1;
        if (d < lo || d > hi) {
          const k = (d < lo ? lo : hi) / d;
          b.hx *= k;
          b.hy *= k;
        }
      });
    }
    bowls.forEach((b) => {
      b.dist = Math.hypot(b.hx, b.hy);
      b.theta = Math.atan2(b.hy, b.hx);
      const rendered = renderBowlSprite(b, dpr);
      if (rendered) ({ sprite: b.sprite, half: b.spriteHalf } = rendered);
    });
    redraw();
  };

  // Ohne reduzierte Bewegung läuft die Schleife; sonst und bei verborgenem Tab zeichnet nur ein einzelner Frame auf Anlass
  const schedule = () => {
    if (looping) return;
    looping = true;
    requestAnimationFrame(frame);
  };
  const redraw = () => {
    if (running) schedule();
  };

  const frame = (t: number) => {
    looping = false;
    if (!running) return;
    const dt = Math.min(64, t - (lastT || t));
    lastT = t;
    if (!reduced) rot += dt * 0.000018;
    const R = S / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);

    // Positionen, Ausweichen um den Zeiger, Anheben der berührten Schale
    const reach = S * 0.11;
    bowls.forEach((b) => {
      const a = b.theta + rot;
      b.x = R + Math.cos(a) * b.dist;
      b.y = R + Math.sin(a) * b.dist;
      let tx = 0,
        ty = 0;
      if (pointer && !reduced) {
        const dx = b.x - pointer.x,
          dy = b.y - pointer.y;
        const dd = Math.hypot(dx, dy);
        if (dd < reach && dd > 0.01 && b.i !== hovered) {
          const f = (1 - dd / reach) ** 2 * b.r * 0.55;
          tx = (dx / dd) * f;
          ty = (dy / dd) * f;
        }
      }
      const k = reduced ? 1 : 0.14;
      b.px += (tx - b.px) * k;
      b.py += (ty - b.py) * k;
      b.lift += ((b.i === hovered ? 1 : 0) - b.lift) * (reduced ? 1 : 0.16);
    });

    bowls
      .slice()
      .sort((p, q) => p.lift - q.lift)
      .forEach((b) => {
        const appear = reduced ? 1 : Math.min(1, Math.max(0, (t - startedAt - b.i * 16) / 800));
        if (appear <= 0 || !b.sprite) return;
        const e = 1 - (1 - appear) ** 3;
        const scale = (1 + (1 - e) * 0.18) * (1 + b.lift * 0.14);
        const half = b.spriteHalf * scale;
        ctx.globalAlpha = e;
        ctx.drawImage(
          b.sprite,
          b.x + b.px - half,
          b.y + b.py - half - (1 - e) * b.r * 0.5 - b.lift * b.r * 0.12,
          half * 2,
          half * 2,
        );
      });
    ctx.globalAlpha = 1;
    if (!reduced && !document.hidden) schedule();
  };

  const start = () => {
    if (running) return;
    running = true;
    lastT = 0;
    if (!startedAt) startedAt = performance.now();
    schedule();
  };

  const hit = (x: number, y: number) => {
    let best = -1,
      bestD = Infinity;
    bowls.forEach((b) => {
      const d = Math.hypot(b.x + b.px - x, b.y + b.py - y);
      if (d < b.r * 1.05 && d < bestD) {
        best = b.i;
        bestD = d;
      }
    });
    return best;
  };
  const setHover = (i: number) => {
    hovered = i;
    const bowl = bowls[i];
    if (readout) readout.textContent = bowl ? `Schale ${i + 1} · ${bowl.glaze.name}` : '99 Schalen';
    canvas.style.cursor = i >= 0 ? 'pointer' : 'default';
    redraw();
  };
  const track = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    setHover(hit(pointer.x, pointer.y));
  };
  canvas.addEventListener('pointermove', track);
  canvas.addEventListener('pointerdown', track);
  canvas.addEventListener('pointerleave', () => {
    pointer = null;
    setHover(-1);
  });

  layout();
  let rz: number | undefined;
  const groesse = new ResizeObserver(() => {
    clearTimeout(rz);
    rz = window.setTimeout(layout, 150);
  });
  groesse.observe(canvas);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) redraw();
    },
    { signal },
  );
  const sichtbar = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting) start();
      else running = false;
    },
    { threshold: 0.08 },
  );
  sichtbar.observe(stage);
  signal.addEventListener('abort', () => {
    groesse.disconnect();
    sichtbar.disconnect();
    running = false;
  });
}
