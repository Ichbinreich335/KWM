import { random, pickGlaze as pickFrom, renderBowlSprite } from './js/keramik.js';

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Menü ---------- */
  const toggle = $('[data-menu-toggle]');
  const nav = $('.nav');
  const setMenu = (open) => {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Schließen' : 'Menü';
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || toggle?.getAttribute('aria-expanded') !== 'true') return;
    setMenu(false);
    toggle.focus();
  });

  /* ---------- Wörter für die Zeilen-Einblendung aufteilen ---------- */
  $$('[data-reveal="words"]').forEach((el) => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.setAttribute('aria-label', text);
    el.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      inner.style.setProperty('--i', i);
      inner.textContent = w;
      outer.appendChild(inner);
      el.append(outer, i < words.length - 1 ? ' ' : '');
    });
  });

  /* ---------- Einblenden beim Scrollen ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  const heroEls = $$('.hero [data-reveal]');
  $$('[data-reveal], .journey, .chronicle__list li').forEach((el) => { if (!heroEls.includes(el)) io.observe(el); });
  requestAnimationFrame(() => {
    $('.hero__media')?.classList.add('is-in');
    heroEls.filter((el) => !el.classList.contains('hero__media')).forEach((el, i) => {
      setTimeout(() => el.classList.add('is-in'), 450 + i * 160);
    });
  });

  /* ---------- Scrollgebundene Bewegung: Einstiegsbild, Kopfzeile ---------- */
  const heroImg = $('[data-parallax]');
  const masthead = $('[data-masthead]');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (!reduced) {
      if (heroImg && y < window.innerHeight * 1.2) heroImg.style.translate = `0 ${y * 0.08}px`;
    }
    if (masthead) {
      const menuOpen = toggle?.getAttribute('aria-expanded') === 'true';
      if (!menuOpen && y > window.innerHeight * 0.9 && y > lastY + 2) masthead.classList.add('is-hidden');
      if (y < lastY - 2) masthead.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- Horizontale Leisten: ziehen, scrollen, Fortschritt ---------- */
  $$('[data-drag]').forEach((track) => {
    const bar = track.closest('section')?.querySelector('[data-drag-progress]');
    const progress = () => {
      if (!bar) return;
      const max = track.scrollWidth - track.clientWidth;
      const visible = Math.min(1, track.clientWidth / track.scrollWidth);
      const travel = max > 0 ? (track.scrollLeft / max) * (1 - visible) * 100 : 0;
      bar.style.transform = `translateX(${travel}%) scaleX(${visible})`;
    };
    track.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress, { passive: true });
    window.addEventListener('load', progress);
    progress();

    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      requestAnimationFrame(() => track.classList.remove('is-dragging'));
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') track.scrollBy({ left: 360, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -360, behavior: 'smooth' });
    });
  });

  /* ---------- Sprungleiste der Unterseiten: aktuellen Abschnitt markieren ---------- */
  const subnav = $('.subnav');
  const subLinks = $$('.subnav a[href^="#"]');
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

    const byId = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const current = e.isIntersecting && byId.get(e.target.id);
        if (!current) return;
        subLinks.forEach((a) => {
          a.classList.toggle('is-current', a === current);
          if (a === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        // aktiven Eintrag in die Mitte der Leiste holen
        const left = current.offsetLeft - (subnav.clientWidth - current.offsetWidth) / 2;
        subnav.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) sio.observe(el); });
  }

  /* ---------- Kosmos: 99 Schalen von oben, im Ring um eine leere Mitte ---------- */
  const stage = $('[data-cosmos]');
  if (stage) {
    const canvas = $('canvas', stage);
    const ctx = canvas.getContext('2d');
    const readout = $('[data-cosmos-readout]');
    const N = 99;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));

    const rand = random(1924);
    const pickGlaze = () => pickFrom(rand);

    // Feste Eigenschaften jeder Schale, unabhängig von der Bühnengröße
    const bowls = Array.from({ length: N }, (_, i) => ({
      i,
      glaze: pickGlaze(),
      size: 0.8 + rand() * 0.32,
      jitter: (rand() - 0.5) * 0.08,
      wob: [rand() * 0.02 + 0.008, rand() * 6.28, rand() * 0.016 + 0.006, rand() * 6.28],
      rings: 2 + Math.floor(rand() * 3),
      speckles: Array.from({ length: 6 + Math.floor(rand() * 16) }, () => [rand(), rand(), rand()]),
      x: 0, y: 0, r: 0, lift: 0, px: 0, py: 0, sprite: null, spriteHalf: 0,
    }));

    let S = 0, dpr = 1, rot = 0, startedAt = 0, running = false;
    let pointer = null, hovered = -1, lastT = 0;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      S = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(S * dpr);
      const R = S / 2;
      const ri = R * 0.44, ro = R * 0.96;
      const d = Math.sqrt((Math.PI * (ro * ro - ri * ri)) / N);
      const base = d * 0.39;
      const a2 = (ri + base) ** 2, b2 = (ro - base * 1.15) ** 2;
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
            const A = bowls[p], B = bowls[q];
            const dx = B.hx - A.hx, dy = B.hy - A.hy;
            const d = Math.hypot(dx, dy) || 0.01;
            const min = (A.r + B.r) * 1.12;
            if (d < min) {
              const push = (min - d) / 2;
              A.hx -= (dx / d) * push; A.hy -= (dy / d) * push;
              B.hx += (dx / d) * push; B.hy += (dy / d) * push;
            }
          }
        }
        bowls.forEach((b) => {
          const d = Math.hypot(b.hx, b.hy);
          const lo = ri + b.r * 1.1, hi = ro - b.r * 1.1;
          if (d < lo || d > hi) { const k = (d < lo ? lo : hi) / d; b.hx *= k; b.hy *= k; }
        });
      }
      bowls.forEach((b) => {
        b.dist = Math.hypot(b.hx, b.hy);
        b.theta = Math.atan2(b.hy, b.hx);
        ({ sprite: b.sprite, half: b.spriteHalf } = renderBowlSprite(b, dpr));
      });
    };

    const frame = (t) => {
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
        let tx = 0, ty = 0;
        if (pointer && !reduced) {
          const dx = b.x - pointer.x, dy = b.y - pointer.y;
          const dd = Math.hypot(dx, dy);
          if (dd < reach && dd > 0.01 && b.i !== hovered) {
            const f = (1 - dd / reach) ** 2 * b.r * 0.55;
            tx = (dx / dd) * f; ty = (dy / dd) * f;
          }
        }
        const k = reduced ? 1 : 0.14;
        b.px += (tx - b.px) * k;
        b.py += (ty - b.py) * k;
        b.lift += ((b.i === hovered ? 1 : 0) - b.lift) * (reduced ? 1 : 0.16);
      });

      bowls.slice().sort((p, q) => p.lift - q.lift).forEach((b) => {
        const appear = reduced ? 1 : Math.min(1, Math.max(0, (t - startedAt - b.i * 16) / 800));
        if (appear <= 0) return;
        const e = 1 - (1 - appear) ** 3;
        const scale = (1 + (1 - e) * 0.18) * (1 + b.lift * 0.14);
        const half = b.spriteHalf * scale;
        ctx.globalAlpha = e;
        ctx.drawImage(b.sprite, b.x + b.px - half, b.y + b.py - half - (1 - e) * b.r * 0.5 - b.lift * b.r * 0.12, half * 2, half * 2);
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastT = 0;
      if (!startedAt) startedAt = performance.now();
      requestAnimationFrame(frame);
    };

    const hit = (x, y) => {
      let best = -1, bestD = Infinity;
      bowls.forEach((b) => {
        const d = Math.hypot(b.x + b.px - x, b.y + b.py - y);
        if (d < b.r * 1.05 && d < bestD) { best = b.i; bestD = d; }
      });
      return best;
    };
    const setHover = (i) => {
      hovered = i;
      readout.textContent = i >= 0 ? `Schale ${i + 1} · ${bowls[i].glaze.name}` : '99 Schalen';
      canvas.style.cursor = i >= 0 ? 'pointer' : 'default';
    };
    const track = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      setHover(hit(pointer.x, pointer.y));
    };
    canvas.addEventListener('pointermove', track);
    canvas.addEventListener('pointerdown', track);
    canvas.addEventListener('pointerleave', () => { pointer = null; setHover(-1); });

    layout();
    let rz;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 150); }, { passive: true });
    // Wird der Kosmos über das Entwurf-Panel eingeblendet, fehlt ihm noch die Größe
    document.addEventListener('kwm:varianten', () => { if (!S) layout(); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) start(); else running = false;
    }, { threshold: 0.08 }).observe(stage);
  }
})();
