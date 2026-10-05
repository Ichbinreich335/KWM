// Seitenweites Skript (BaseLayout): Menü, Einblendungen beim Scrollen und Kopfzeile.
// Komponenten mit eigenem Verhalten (Chronik, Lebensweg, Sprungleiste, Kosmos, Signaturen) tragen ihr Skript selbst.
(() => {
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
  $$('[data-reveal]').forEach((el) => {
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
})();
