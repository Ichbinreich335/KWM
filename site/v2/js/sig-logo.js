// Signatur: logo. Das Logo zeichnet sich beim Scrollen selbst, ohne Hilfslinien.
// Reihenfolge der Töpferin: Grundlinien, Achse, Bogen (gegen den Uhrzeigersinn), Querbalken, M.
// Jeder Strich trägt seinen Abschnitt des Scrollwegs in data-a und data-b (0 bis 1).
import { reducedMotion } from './keramik.js';

const SCRUB_FACTOR = 0.14;      // Nachlauf: Anteil der Restdistanz pro Frame
const START_AT = 0.96;          // Aufbau beginnt, wenn das Logo so tief im Fenster steht (Anteil Fensterhöhe)
const SPAN = 0.62;              // Scrollstrecke des Aufbaus (Anteil Fensterhöhe)
const MAIN_PX = [2.4, 4];       // Strichstärke des Logos in Bildschirm-Pixeln (min, max)
const MAIN_PX_PER_WIDTH = 0.0068;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export default function init(svg) {
  if (reducedMotion()) return;

  const parts = [...svg.querySelectorAll('[data-a]')].map((el) => ({
    el,
    a: Number(el.dataset.a),
    b: Number(el.dataset.b),
    sym: 'sym' in el.dataset,
    len: 0,
  }));

  let start = 0;
  let end = 1;
  let target = 0;
  let current = -1;
  let running = false;
  let visible = true;

  function measure() {
    const box = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = box.width / vb.width || 1;
    const px = clamp(box.width * MAIN_PX_PER_WIDTH, MAIN_PX[0], MAIN_PX[1]);
    svg.style.setProperty('--sw', (px / scale).toFixed(3));
    parts.forEach((p) => { p.len = p.el.getTotalLength(); });
    const vh = window.innerHeight;
    start = box.top + window.scrollY - vh * START_AT;
    const scrollMax = document.documentElement.scrollHeight - vh;
    end = Math.max(start + 80, Math.min(start + vh * SPAN, scrollMax - 6));
  }

  function draw(p) {
    for (const part of parts) {
      const t = clamp((p - part.a) / (part.b - part.a));
      const shown = part.len * easeInOut(t);
      const { el } = part;
      if (part.sym) {
        el.style.strokeDasharray = `${shown} ${part.len}`;
        el.style.strokeDashoffset = -(part.len - shown) / 2;
      } else {
        el.style.strokeDasharray = `${part.len} ${part.len + 1}`;
        el.style.strokeDashoffset = part.len - shown;
      }
      el.style.opacity = t > 0 ? 1 : 0;
    }
  }

  function frame() {
    current += (target - current) * SCRUB_FACTOR;
    if (Math.abs(target - current) < 0.0005) current = target;
    draw(current);
    running = current !== target;
    if (running) requestAnimationFrame(frame);
  }

  function update() {
    target = clamp((window.scrollY - start) / (end - start));
    if (current < 0) current = target;
    if (!running && visible) { running = true; requestAnimationFrame(frame); }
  }

  measure();
  svg.classList.add('is-live');
  update();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) update();
  }, { rootMargin: '20% 0px' }).observe(svg);
  window.addEventListener('scroll', () => { if (visible) update(); }, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
  window.addEventListener('load', () => { measure(); update(); });
}
