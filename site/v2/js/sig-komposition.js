// Signatur: komposition
// Die Einfahrt beim Laden läuft in CSS. Hier nur die Parallaxe: das große Bild verschiebt sich
// über die ersten 100vh um höchstens SHIFT_MAX Pixel gegen seinen Rahmen (nur transform, rAF, passive).
const SHIFT_MAX = 24;

export default function init(el) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fig = el.querySelector('.komposition__fig--l');
  if (!fig) return;

  let ticking = false;
  let active = true;

  const update = () => {
    ticking = false;
    const progress = Math.min(Math.max(scrollY / innerHeight, 0), 1);
    fig.style.setProperty('--komp-shift', `${(-progress * SHIFT_MAX).toFixed(1)}px`);
  };
  const onScroll = () => {
    if (!active || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) onScroll();
  }).observe(el);
  addEventListener('scroll', onScroll, { passive: true });
  update();
}
