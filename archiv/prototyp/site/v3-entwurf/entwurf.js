// KWM – Entwurf V3: Menü, ruhiges Einblenden geladener Bilder, Kosmos (einmal gezeichnet), Logo im Fuß.
(() => {
  const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menü auf Tablet und Handy ---------- */
  const knopf = document.querySelector('[data-menue]');
  const nav = document.getElementById('navigation');
  if (knopf && nav) {
    const setze = (offen) => {
      knopf.setAttribute('aria-expanded', String(offen));
      knopf.textContent = offen ? 'Schließen' : 'Menü';
      nav.classList.toggle('ist-offen', offen);
      document.body.style.overflow = offen ? 'hidden' : '';
    };
    knopf.addEventListener('click', () => setze(knopf.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setze(false); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', () => setze(false));
  }

  /* ---------- Bilder: erst zeigen, wenn sie da sind; bis dahin steht die Sockelfläche ---------- */
  document.querySelectorAll('.bild img').forEach((img) => {
    const zeige = () => img.classList.add('ist-geladen');
    if (img.complete && img.naturalWidth) zeige();
    else {
      img.addEventListener('load', zeige, { once: true });
      img.addEventListener('error', zeige, { once: true });
    }
  });

  /* ---------- Kosmos: 99 Schalen im Ring um eine leere Mitte ---------- */
  const kosmos = document.querySelector('[data-kosmos]');
  if (kosmos) {
    const leinwand = kosmos.querySelector('canvas');
    const ctx = leinwand.getContext('2d');
    const anzeige = kosmos.querySelector('[data-kosmos-glasur]');
    const grundtext = anzeige.textContent;

    // Glasuren der Werkstatt: Rand, Mitte (wo die Glasur sich sammelt), Gewicht, optional Sprenkel
    const GLASUREN = [
      { name: 'Seladon', rand: '#C3D2C4', mitte: '#7FA493', w: 16 },
      { name: 'Hellblau', rand: '#CBD9DD', mitte: '#8DAFB9', w: 11 },
      { name: 'Weiß', rand: '#EEEAE1', mitte: '#D3CCBE', w: 13 },
      { name: 'Craquelé', rand: '#DDD8CA', mitte: '#BAB19D', w: 6 },
      { name: 'Dunkelgrün', rand: '#56725F', mitte: '#2D4739', w: 8 },
      { name: 'Rostbraun', rand: '#A2623F', mitte: '#6C3522', w: 9 },
      { name: 'Eisenbraun', rand: '#77533C', mitte: '#3E2A1D', w: 8 },
      { name: 'Schwarz, gesprenkelt', rand: '#4A4744', mitte: '#23211F', w: 5, sprenkel: '#D9D2C4' },
      { name: 'Seladon, gesprenkelt', rand: '#BCCDC0', mitte: '#86A797', w: 6, sprenkel: '#3A3530' },
      { name: 'Rosé', rand: '#D9BDB5', mitte: '#B98E86', w: 4 },
      { name: 'Kupferrot', rand: '#A8413A', mitte: '#6E1F1C', w: 3 },
    ];
    const ANZAHL = 99;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const INNEN = 0.24;
    const AUSSEN = 0.485;

    // reproduzierbarer Zufall: jede Besucherin sieht denselben Kosmos
    const zufall = ((startwert) => {
      let s = startwert | 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })(1924);
    const gesamt = GLASUREN.reduce((a, g) => a + g.w, 0);
    const waehle = () => {
      let r = zufall() * gesamt;
      for (const g of GLASUREN) if ((r -= g.w) <= 0) return g;
      return GLASUREN[0];
    };

    const schalen = Array.from({ length: ANZAHL }, (_, i) => ({
      nr: i + 1,
      glasur: waehle(),
      groesse: 0.82 + zufall() * 0.3,
      versatz: [(zufall() - 0.5) * 0.012, (zufall() - 0.5) * 0.012],
      form: [zufall() * 0.02 + 0.008, zufall() * 6.28, zufall() * 0.016 + 0.006, zufall() * 6.28],
      rillen: 2 + Math.floor(zufall() * 3),
      sprenkel: Array.from({ length: 6 + Math.floor(zufall() * 16) }, () => [zufall(), zufall(), zufall()]),
      x: 0, y: 0, r: 0, bild: null, halb: 0,
    }));

    const umriss = (c, r, f) => {
      c.beginPath();
      for (let k = 0; k <= 48; k++) {
        const a = (k / 48) * Math.PI * 2;
        const rr = r * (1 + f[0] * Math.sin(2 * a + f[1]) + f[2] * Math.sin(3 * a + f[3]));
        if (k) c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.closePath();
    };

    // Jede Schale wird einmal als kleines Bild vorgerendert, danach nur noch kopiert
    const rendere = (s, dpr) => {
      const r = s.r * dpr;
      const kante = Math.ceil(r * 2.4);
      const cv = document.createElement('canvas');
      cv.width = cv.height = kante;
      const c = cv.getContext('2d');
      c.translate(kante / 2, kante / 2);
      const g = s.glasur;

      umriss(c, r, s.form);
      c.fillStyle = g.rand;
      c.fill();
      const lippe = c.createLinearGradient(-r, -r, r, r);
      lippe.addColorStop(0, 'rgba(255,255,255,0.30)');
      lippe.addColorStop(0.55, 'rgba(255,255,255,0)');
      lippe.addColorStop(1, 'rgba(0,0,0,0.22)');
      c.fillStyle = lippe;
      c.fill();

      const ri = r * 0.86;
      c.save();
      umriss(c, ri, s.form);
      c.clip();
      c.fillStyle = g.rand;
      c.fillRect(-r, -r, r * 2, r * 2);
      const wand = c.createLinearGradient(-ri, -ri, ri, ri);
      wand.addColorStop(0, 'rgba(0,0,0,0.28)');
      wand.addColorStop(0.5, 'rgba(0,0,0,0.02)');
      wand.addColorStop(1, 'rgba(255,255,255,0.2)');
      c.fillStyle = wand;
      c.fillRect(-r, -r, r * 2, r * 2);
      const see = c.createRadialGradient(ri * 0.06, ri * 0.08, 0, 0, 0, ri * 0.78);
      see.addColorStop(0, g.mitte);
      see.addColorStop(0.55, `${g.mitte}B0`);
      see.addColorStop(1, `${g.mitte}00`);
      c.fillStyle = see;
      c.fillRect(-r, -r, r * 2, r * 2);
      c.lineWidth = Math.max(0.6, r * 0.018);
      for (let k = 1; k <= s.rillen; k++) {
        c.strokeStyle = k % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
        c.beginPath();
        c.arc(0, 0, ri * (0.28 + k * 0.16), 0, Math.PI * 2);
        c.stroke();
      }
      if (g.sprenkel) {
        c.fillStyle = g.sprenkel;
        s.sprenkel.forEach(([u, v, w]) => {
          const a = u * Math.PI * 2, d = Math.sqrt(v) * ri * 0.92;
          c.globalAlpha = 0.55 + w * 0.4;
          c.beginPath();
          c.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * (0.03 + w * 0.05), r * (0.02 + w * 0.035), a, 0, Math.PI * 2);
          c.fill();
        });
        c.globalAlpha = 1;
      }
      c.restore();
      c.beginPath();
      c.arc(0, 0, r * 0.93, Math.PI * 1.05, Math.PI * 1.55);
      c.strokeStyle = 'rgba(255,255,255,0.5)';
      c.lineWidth = Math.max(0.8, r * 0.045);
      c.lineCap = 'round';
      c.stroke();

      s.bild = cv;
      s.halb = kante / 2 / dpr;
    };

    let seite = 0;
    let aktiv = -1;

    const zeichne = () => {
      const dpr = leinwand.width / seite;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, seite, seite);
      schalen.forEach((s, i) => {
        const hoch = i === aktiv ? 1.18 : 1;
        const h = s.halb * hoch;
        ctx.globalAlpha = aktiv === -1 || i === aktiv ? 1 : 0.55;
        ctx.drawImage(s.bild, s.x - h, s.y - h, h * 2, h * 2);
      });
      ctx.globalAlpha = 1;
    };

    const baue = () => {
      const breite = Math.round(kosmos.getBoundingClientRect().width);
      if (!breite || breite === seite) return;
      seite = breite;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      leinwand.width = leinwand.height = Math.round(seite * dpr);
      const flaeche = (AUSSEN * AUSSEN - INNEN * INNEN) * 0.62 / ANZAHL;
      const basis = Math.sqrt(flaeche) * seite;
      schalen.forEach((s, i) => {
        const t = (i + 0.5) / ANZAHL;
        const radius = Math.sqrt(INNEN * INNEN + t * (AUSSEN * AUSSEN - INNEN * INNEN)) * seite * 0.97;
        const winkel = i * GOLDEN;
        s.r = basis * s.groesse;
        s.x = seite / 2 + Math.cos(winkel) * radius + s.versatz[0] * seite;
        s.y = seite / 2 + Math.sin(winkel) * radius + s.versatz[1] * seite;
        rendere(s, dpr);
      });
      zeichne();
      kosmos.classList.add('ist-bereit');
    };

    let geplant = false;
    const spaeter = (fn) => {
      if (geplant) return;
      geplant = true;
      requestAnimationFrame(() => { geplant = false; fn(); });
    };

    const zeige = (e) => {
      const box = leinwand.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      let treffer = -1, best = Infinity;
      schalen.forEach((s, i) => {
        const d = Math.hypot(s.x - x, s.y - y);
        if (d < s.r * 1.1 && d < best) { best = d; treffer = i; }
      });
      if (treffer === aktiv) return;
      aktiv = treffer;
      anzeige.textContent = treffer === -1 ? grundtext : `Schale ${schalen[treffer].nr} von 99 · ${schalen[treffer].glasur.name}`;
      spaeter(zeichne);
    };

    leinwand.addEventListener('pointermove', zeige);
    leinwand.addEventListener('pointerdown', zeige);
    leinwand.addEventListener('pointerleave', () => {
      aktiv = -1;
      anzeige.textContent = grundtext;
      spaeter(zeichne);
    });

    new ResizeObserver(() => spaeter(baue)).observe(kosmos);
  }

  /* ---------- Logo im Fuß: einmal zeichnen, wenn es ins Bild kommt ---------- */
  const logo = document.querySelector('[data-logo]');
  if (logo) {
    if (reduziert || !('IntersectionObserver' in window)) logo.classList.add('ist-gezeichnet');
    else {
      const io = new IntersectionObserver((eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) {
          logo.classList.add('ist-gezeichnet');
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(logo);
    }
  }
})();
