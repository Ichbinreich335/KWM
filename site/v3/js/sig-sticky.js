// Signatur: sticky – gegenläufiger Parallax des Fotos (höchstens ±5 % der Bildhöhe, nur transform).
// Das Festhalten des Textes ist reines CSS (position: sticky), hier steckt nur die Feinheit.
import { reducedMotion } from './keramik.js';

const MAX_SHIFT = 5; // Prozent der Bildhöhe

export default function init(el) {
  if (reducedMotion()) return;
  const img = el.querySelector('.sticky-bild__img');
  if (!img) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const { top, height } = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0, sobald der Abschnitt unten ins Bild kommt, 1, sobald er oben hinausläuft
    const progress = Math.min(1, Math.max(0, (vh - top) / (vh + height)));
    el.style.setProperty('--sticky-shift', `${((progress - 0.5) * 2 * MAX_SHIFT).toFixed(2)}%`);
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };

  const visibility = new IntersectionObserver(([entry]) => {
    const method = entry.isIntersecting ? 'addEventListener' : 'removeEventListener';
    window[method]('scroll', request, { passive: true });
    window[method]('resize', request, { passive: true });
    if (entry.isIntersecting) request();
  });
  visibility.observe(el);
}
