import { heuteTag, hinweisSichtbar, tagAusIso } from '../lib/status';
import { MOBIL_ABFRAGE, random, pickGlaze as pickFrom, reducedMotion, renderBowlSprite, type Schale } from './keramik';

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

(() => {
  const reduced = reducedMotion();
  // Der Typ-Parameter legt nur fest, welchen Elementtyp der Selektor liefert; er prüft ihn nicht (Standardweg von querySelector<T>)
  const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document): T | null => c.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document): T[] => [
    ...c.querySelectorAll<T>(s),
  ];

  /* ---------- Menü ---------- */
  const toggle = $('[data-menu-toggle]');
  const nav = $('.nav');
  const setMenu = (open: boolean) => {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('.menu-toggle__label');
    if (label) label.textContent = open ? 'Schließen' : 'Menü';
    nav?.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    // Offenes Menü deckt die Seite: Fokus und Screenreader bleiben im Menü
    $$('main, footer, .skip').forEach((el) => {
      el.inert = open;
    });
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || toggle?.getAttribute('aria-expanded') !== 'true') return;
    setMenu(false);
    toggle.focus();
  });

  /* ---------- Datumsgebundene Angaben ausblenden, sobald sie vorbei sind ---------- */
  const heute = heuteTag();
  $$('#kosmos [data-start]').forEach((el) => {
    const { start, end } = el.dataset;
    if (start && end) el.hidden = !hinweisSichtbar(tagAusIso(start), tagAusIso(end), heute);
  });

  /* ---------- Wörter für die Zeilen-Einblendung aufteilen ---------- */
  $$('[data-reveal="words"]').forEach((el) => {
    const gebaut = $$('.w > span', el);
    if (gebaut.length) {
      // Wort-Spans stehen schon im HTML (Woerter.astro): nur die Staffelung setzen
      gebaut.forEach((inner, i) => inner.style.setProperty('--i', String(i)));
      return;
    }
    const text = (el.textContent ?? '').trim();
    const words = text.split(/\s+/);
    const readable = document.createElement('span');
    readable.className = 'visually-hidden';
    readable.textContent = text;
    el.textContent = '';
    el.append(readable);
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      inner.style.setProperty('--i', String(i));
      inner.textContent = w;
      outer.appendChild(inner);
      el.append(outer, i < words.length - 1 ? ' ' : '');
    });
  });

  /* ---------- Einblenden beim Scrollen ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  const heroEls = $$('.hero [data-reveal]');
  $$('[data-reveal], .chronicle__list li').forEach((el) => {
    if (!heroEls.includes(el)) io.observe(el);
  });
  requestAnimationFrame(() => {
    $('.hero__media')?.classList.add('is-in');
    heroEls
      .filter((el) => !el.classList.contains('hero__media'))
      .forEach((el, i) => {
        setTimeout(() => el.classList.add('is-in'), 450 + i * 160);
      });
  });
  // Erst jetzt ist die Einblendung scharf: bricht das Skript vorher ab, greift die CSS-Sicherung (global.css)
  document.documentElement.classList.add('js-ready');

  /* ---------- Wischreihen: nur dort Tabstopp, wo sie wirklich scrollen (Handy), nicht am Desktop ---------- */
  const wischreihen = $$('.journey, .chronicle__list');
  const wischbar = () =>
    wischreihen.forEach((reihe) => {
      if (reihe.scrollWidth > reihe.clientWidth) reihe.setAttribute('tabindex', '0');
      else reihe.removeAttribute('tabindex');
    });
  wischbar();
  addEventListener('resize', wischbar, { passive: true });

  /* ---------- Chronik: Linie zeichnet sich strikt nacheinander an die Lesehöhe gebunden, jeder Punkt füllt sich, wenn sie ihn erreicht ---------- */
  const chronicle = $('.chronicle__list');
  if (chronicle) {
    const items = $$('li', chronicle);
    const READ_LINE = 0.62;
    const SWIPE_EDGE = 8; // Punkt füllt sich, sobald seine Karte so weit in die Wischleiste ragt (px)
    const SWIPE_VISIBLE = 0.9; // Wischleiste zählt als sichtbar, wenn ihre Oberkante über dieser Bildschirmhöhe liegt
    const swipe = window.matchMedia(MOBIL_ABFRAGE);
    let framed = false;
    const paint = () => {
      framed = false;
      if (swipe.matches) {
        const box = chronicle.getBoundingClientRect();
        const shown = box.top < innerHeight * SWIPE_VISIBLE;
        items.forEach((li) =>
          li.classList.toggle('is-on', shown && li.getBoundingClientRect().left < box.right - SWIPE_EDGE),
        );
        return;
      }
      const line = innerHeight * READ_LINE;
      const first = chronicle.firstElementChild;
      if (!first) return;
      const dotY = parseFloat(getComputedStyle(first, '::before').top) + 5.5;
      items.forEach((li) => {
        const box = li.getBoundingClientRect();
        li.classList.toggle('is-on', line >= box.top + dotY);
        if (!reduced && li !== items[items.length - 1])
          li.style.setProperty('--seg', Math.min(1, Math.max(0, (line - (box.top + dotY)) / box.height)).toFixed(3));
      });
    };
    const schedule = () => {
      if (!framed) {
        framed = true;
        requestAnimationFrame(paint);
      }
    };
    if (reduced) {
      items.forEach((li) => li.classList.add('is-on'));
    } else {
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      chronicle.addEventListener('scroll', schedule, { passive: true });
      paint();
    }
  }

  /* ---------- Lebensweg: Die Linie füllt sich beim Scrollen ---------- */
  const track = $('[data-journey-track]');
  const line = track && $('.journey', track);
  if (track && line && !reduced) {
    const stops = $$('li', line);
    const END_AT = 0.35; // Linie ist voll, wenn der Strahl so weit oben im Bild steht (Anteil der Bildhöhe)
    const END_MOBILE = 0.7; // mobil senkrecht: voll, sobald das Ende des Strahls hier steht
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    // Wo die Mitte jedes Punktes auf der Linie liegt (0 bis 1), waagerecht oder senkrecht
    let offsets: number[] = [];
    const measure = () => {
      const [first, second] = stops;
      if (!first || !second) return false;
      const vertical = second.offsetTop > first.offsetTop + 4;
      const rail = getComputedStyle(line, '::before');
      const dot = getComputedStyle(first, '::before');
      const size = parseFloat(dot.width);
      const start = parseFloat(vertical ? rail.top : rail.left);
      const length = parseFloat(vertical ? rail.height : rail.width);
      offsets = stops.map(
        (li) => ((vertical ? li.offsetTop + parseFloat(dot.top) : li.offsetLeft) + size / 2 - start) / length,
      );
      return vertical;
    };
    const setProgress = (p: number) => {
      line.style.setProperty('--p', Math.max(0, p).toFixed(4));
      stops.forEach((li, i) => li.classList.toggle('is-on', p >= (offsets[i] ?? Infinity)));
    };

    let queued = 0;
    let vertical = measure();
    const update = () => {
      queued = 0;
      const { top, height } = line.getBoundingClientRect();
      const vh = window.innerHeight;
      // Beginn, sobald der Strahl unten ins Bild kommt; voll bei 35 % von oben (mobil: wenn sein Ende bei 70 % steht)
      const span = vertical ? vh * (1 - END_MOBILE) + height : vh * (1 - END_AT);
      setProgress(clamp01((vh - top) / span));
    };
    const request = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    const relayout = () => {
      vertical = measure();
      request();
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', relayout, { passive: true });
  }

  /* ---------- Scrollgebundene Bewegung: Kopfzeile ---------- */
  const masthead = $('[data-masthead]');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (masthead) {
      const menuOpen = toggle?.getAttribute('aria-expanded') === 'true';
      const hidden = masthead.classList.contains('is-hidden');
      if (!menuOpen && !hidden && y > window.innerHeight * 0.9 && y > lastY + 2) masthead.classList.add('is-hidden');
      if (hidden && y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );

  /* ---------- Sprungleiste der Unterseiten: aktuellen Abschnitt markieren ---------- */
  const subnav = $('.subnav');
  const subLinks = $$<HTMLAnchorElement>('.subnav a[href^="#"]');
  if (subnav) {
    // Randausblendung, wenn die Leiste seitlich weiterläuft
    const fade = () => {
      const max = subnav.scrollWidth - subnav.clientWidth;
      const parts = [];
      if (max > 1 && subnav.scrollLeft > 1) parts.push('start');
      if (max > 1 && subnav.scrollLeft < max - 1) parts.push('end');
      subnav.dataset.more = parts.join(' ');
    };
    subnav.addEventListener('scroll', fade, { passive: true });
    window.addEventListener('resize', fade, { passive: true });
    fade();

    const byId = new Map(
      subLinks.map((a): [string, HTMLAnchorElement] => [(a.getAttribute('href') ?? '').slice(1), a]),
    );
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const current = e.isIntersecting && byId.get(e.target.id);
          if (!current) return;
          subLinks.forEach((a) => {
            a.classList.toggle('is-current', a === current);
            if (a === current) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
          // aktiven Eintrag in die Mitte der Leiste holen
          const left = current.offsetLeft - (subnav.clientWidth - current.offsetWidth) / 2;
          subnav.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
        });
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    byId.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) sio.observe(el);
    });
  }

  /* ---------- Kosmos: 99 Schalen von oben, im Ring um eine leere Mitte ---------- */
  $$('[data-cosmos]').forEach((stage) => {
    const canvas = $('canvas', stage);
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const readout = $('[data-cosmos-readout]', stage);
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
    new ResizeObserver(() => {
      clearTimeout(rz);
      rz = window.setTimeout(layout, 150);
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) redraw();
    });
    new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) start();
        else running = false;
      },
      { threshold: 0.08 },
    ).observe(stage);
  });
})();
