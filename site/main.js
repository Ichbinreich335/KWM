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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

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
  $$('[data-reveal], .journey').forEach((el) => { if (!heroEls.includes(el)) io.observe(el); });
  requestAnimationFrame(() => {
    $('.hero__media')?.classList.add('is-in');
    heroEls.filter((el) => !el.classList.contains('hero__media')).forEach((el, i) => {
      setTimeout(() => el.classList.add('is-in'), 450 + i * 160);
    });
  });

  /* ---------- Scrollgebundene Bewegung: Drehscheiben, Einstiegsbild, Kopfzeile ---------- */
  const wheels = $$('[data-wheel]');
  const heroImg = $('[data-parallax]');
  const masthead = $('[data-masthead]');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (!reduced) {
      wheels.forEach((w) => w.style.setProperty('--rot', `${y * 0.22 * Number(w.dataset.wheel)}deg`));
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
      bar.style.width = `${visible * 100}%`;
      bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - visible) / visible) * 100 : 0}%)`;
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
  const subLinks = $$('.subnav a[href^="#"]');
  if (subLinks.length) {
    const byId = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        subLinks.forEach((a) => a.classList.remove('is-current'));
        byId.get(e.target.id)?.classList.add('is-current');
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

    // Glasuren: Rand, Mitte (wo die Glasur sich sammelt), Gewicht, Sprenkel
    const GLAZES = [
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
    const totalW = GLAZES.reduce((a, g) => a + g.w, 0);

    let seed = 1924;
    const rand = () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pickGlaze = () => {
      let r = rand() * totalW;
      for (const g of GLAZES) { if ((r -= g.w) <= 0) return g; }
      return GLAZES[0];
    };

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

    const shapePath = (c, r, wob) => {
      c.beginPath();
      for (let k = 0; k <= 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        const rr = r * (1 + wob[0] * Math.sin(2 * a + wob[1]) + wob[2] * Math.sin(3 * a + wob[3]));
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        if (k) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath();
    };

    const renderSprite = (b) => {
      const r = b.r * dpr;
      const pad = r * 0.9;
      const size = Math.ceil(r * 2 + pad * 2);
      const cv = document.createElement('canvas');
      cv.width = cv.height = size;
      const c = cv.getContext('2d');
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
          const a = u * Math.PI * 2, d = Math.sqrt(v) * ri * 0.92;
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

      b.sprite = cv;
      b.spriteHalf = size / 2 / dpr;
    };

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
        renderSprite(b);
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
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) start(); else running = false;
    }, { threshold: 0.08 }).observe(stage);
  }
})();
