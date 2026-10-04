// Signatur: sticky – gegenläufiger Parallax des Fotos (höchstens ±5 % der Bildhöhe, nur transform).
// Das Festhalten des Textes ist reines CSS (position: sticky), hier steckt nur die Feinheit.
// Porträt und Feuer: Text haftet (CSS). Feuer-Variante „wandernd“: der Text wandert per transform über das Bild.
import { reducedMotion } from './keramik.js';

const MAX_SHIFT = 5; // Prozent der Bildhöhe
// Feuer (Variante „wandernd“): Mitte des Textblocks wandert von 65 % auf 25 % der Bildhöhe, mobil nur die halbe Strecke
const TEXT_FROM = 0.65;
const TEXT_TO = 0.25;
const MOBILE_TRAVEL = 0.5;

export default function init(el) {
  if (reducedMotion()) return;
  const img = el.querySelector('.sticky-bild__img');
  if (!img) return;

  const feuer = el.classList.contains('sticky-bild--feuer');
  const text = el.querySelector('.sticky-bild__text');
  const narrow = window.matchMedia('(max-width: 900px)');
  const root = document.documentElement;
  const travel = () => feuer && root.dataset.feuertext === 'wandernd';
  let start = 0; // Feuer: Textstart und -ende in px über der Bildoberkante, Abstand zum Rand eingerechnet
  let end = 0;
  const measure = () => {
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
    if (travel()) {
      el.style.setProperty('--feuer-y', `${(start + (end - start) * progress).toFixed(1)}px`);
    }
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  const relayout = () => { measure(); request(); };

  if (text && feuer) {
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
