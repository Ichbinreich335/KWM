// Signatur: sticky – gegenläufiger Parallax des Fotos (höchstens ±5 % der Bildhöhe, nur transform).
// Das Festhalten des Textes ist reines CSS (position: sticky), hier steckt nur die Feinheit.
// Porträt: der Text wandert über das Bild. Feuer: Text haftet (CSS); Variante „wandernd“ wie beim Porträt per transform.
import { reducedMotion } from './keramik.js';

const MAX_SHIFT = 5; // Prozent der Bildhöhe
// Porträt: Oberkante des Textes wandert von 20 % auf 70 % der Bildhöhe (nie über den Rand); Weg über den Scroll durch den Abschnitt
const PORTRAIT_FROM = 0.2;
const PORTRAIT_TO = 0.7;
const PORTRAIT_EDGE = 24; // px Mindestabstand zur Unterkante
// Feuer (Variante „wandernd“): Mitte des Textblocks wandert von 65 % auf 25 % der Bildhöhe, mobil nur die halbe Strecke
const TEXT_FROM = 0.65;
const TEXT_TO = 0.25;
const MOBILE_TRAVEL = 0.5;

export default function init(el) {
  if (reducedMotion()) return;
  const img = el.querySelector('.sticky-bild__img');
  if (!img) return;

  const portrait = el.classList.contains('sticky-bild--portrait');
  const feuer = el.classList.contains('sticky-bild--feuer');
  const text = el.querySelector('.sticky-bild__text');
  const narrow = window.matchMedia('(max-width: 900px)');
  const root = document.documentElement;
  const travel = () => feuer && root.dataset.feuertext === 'wandernd';
  let start = 0; // Feuer: Textstart und -ende in px über der Bildoberkante, Abstand zum Rand eingerechnet
  let end = 0;
  let reach = 0; // Porträt: Textweg in px
  const measure = () => {
    if (portrait) {
      const h = el.offsetHeight;
      reach = Math.max(0, Math.min(h * PORTRAIT_TO, h - text.offsetHeight - PORTRAIT_EDGE) - h * PORTRAIT_FROM);
      return;
    }
    el.classList.toggle('is-travel', travel());
    if (!travel()) { el.style.removeProperty('--feuer-y'); return; }
    const h = el.offsetHeight;
    const own = text.offsetHeight;
    const edge = text.offsetTop;
    const clampTop = (top) => Math.min(h - edge - own, Math.max(edge, top));
    start = clampTop(h * TEXT_FROM - own / 2);
    end = clampTop(h * TEXT_TO - own / 2);
    if (narrow.matches) end = start + (end - start) * MOBILE_TRAVEL;
    start -= edge;
    end -= edge;
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    const { top, height } = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0, sobald der Abschnitt unten ins Bild kommt, 1, sobald er oben hinausläuft
    const progress = Math.min(1, Math.max(0, (vh - top) / (vh + height)));
    el.style.setProperty('--sticky-shift', `${((progress - 0.5) * 2 * MAX_SHIFT).toFixed(2)}%`);
    if (portrait) {
      // Text läuft, solange das Bild den Schirm füllt: von 80 % der Bildschirmhöhe bis das Bild nur noch 20 % darüber ragt
      const run = Math.min(1, Math.max(0, (vh * 0.8 - top) / (height + vh * 0.6)));
      el.style.setProperty('--text-y', `${(reach * run).toFixed(1)}px`);
    } else if (travel()) {
      el.style.setProperty('--feuer-y', `${(start + (end - start) * progress).toFixed(1)}px`);
    }
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  const relayout = () => { measure(); request(); };

  if (text && (portrait || feuer)) {
    measure();
    document.fonts?.ready.then(relayout);
    window.addEventListener('resize', relayout, { passive: true });
    if (feuer) document.addEventListener('kwm:varianten', relayout);
  }
  const visibility = new IntersectionObserver(([entry]) => {
    const method = entry.isIntersecting ? 'addEventListener' : 'removeEventListener';
    window[method]('scroll', request, { passive: true });
    window[method]('resize', request, { passive: true });
    if (entry.isIntersecting) request();
  });
  visibility.observe(el);
}
