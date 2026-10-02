// Signatur: logo. Das Logo baut sich beim Scrollen als Konstruktionszeichnung auf.
// Reihenfolge der Töpferin: Grundlinien, Achse, Bogen (gegen den Uhrzeigersinn), Querbalken, M.
// Die Hilfslinien (data-a/data-b im Markup) laufen mit und treten am Ende zurück.
import { reducedMotion } from './keramik.js';

const SCRUB_FACTOR = 0.14;      // Nachlauf: Anteil der Restdistanz pro Frame
const START_AT = 0.96;          // Aufbau beginnt, wenn das Logo so tief im Fenster steht (Anteil Fensterhöhe)
const SPAN = 0.62;              // Scrollstrecke des Aufbaus (Anteil Fensterhöhe)
const GHOST_FROM = 0.86;        // ab hier treten die Hilfslinien zurück
const GHOST_OPACITY = 0.2;
const MAIN_PX = [2.4, 4];       // Strichstärke des Logos in Bildschirm-Pixeln (min, max)
const MAIN_PX_PER_WIDTH = 0.0068;
const HAIR_PX = 1;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export default function init(svg) {
  if (reducedMotion()) return;

  const parts = [...svg.querySelectorAll('[data-a]')].map((el) => {
    const a = Number(el.dataset.a);
    const b = Number(el.dataset.b);
    const grow = el.classList.contains('sig-dash') || el.classList.contains('sig-dot');
    const part = { el, a, b, main: !!el.closest('.sig-main'), sym: 'sym' in el.dataset, grow, len: 0 };
    if (grow) {
      part.x1 = +el.getAttribute('x1'); part.y1 = +el.getAttribute('y1');
      part.x2 = +el.getAttribute('x2'); part.y2 = +el.getAttribute('y2');
    }
    return part;
  });
  const aux = svg.querySelector('.sig-aux');
  const tip = svg.querySelector('.sig-tip');

  let scale = 1;
  let start = 0;
  let end = 1;
  let target = 0;
  let current = -1;
  let running = false;
  let visible = true;

  function measure() {
    const box = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    scale = box.width / vb.width || 1;
    const px = clamp(box.width * MAIN_PX_PER_WIDTH, MAIN_PX[0], MAIN_PX[1]);
    svg.style.setProperty('--sw', (px / scale).toFixed(3));
    svg.style.setProperty('--hw', (HAIR_PX / scale).toFixed(3));
    tip.setAttribute('r', ((px * 1.7) / scale).toFixed(2));
    parts.forEach((p) => { if (!p.grow) p.len = p.el.getTotalLength(); });
    const vh = window.innerHeight;
    const top = box.top + window.scrollY;
    start = top - vh * START_AT;
    const scrollMax = document.documentElement.scrollHeight - vh;
    end = Math.max(start + 80, Math.min(start + vh * SPAN, scrollMax - 6));
  }

  function draw(p) {
    let active = null;
    for (const part of parts) {
      const t = clamp((p - part.a) / (part.b - part.a));
      const { el } = part;
      if (part.grow) {
        const e = easeOut(t);
        el.setAttribute('x2', part.x1 + (part.x2 - part.x1) * e);
        el.setAttribute('y2', part.y1 + (part.y2 - part.y1) * e);
        el.style.opacity = t > 0 ? 1 : 0;
        continue;
      }
      const e = part.main ? easeInOut(t) : t;
      const shown = part.len * e;
      if (part.sym) {
        el.style.strokeDasharray = `${shown} ${part.len}`;
        el.style.strokeDashoffset = -(part.len - shown) / 2;
      } else {
        el.style.strokeDasharray = `${part.len} ${part.len + 1}`;
        el.style.strokeDashoffset = part.len - shown;
      }
      el.style.opacity = t > 0 ? 1 : 0;
      if (part.main && t > 0 && t < 1 && !part.sym) active = { el, shown };
    }
    aux.style.opacity = 1 - (1 - GHOST_OPACITY) * easeInOut(clamp((p - GHOST_FROM) / (1 - GHOST_FROM)));
    if (active) {
      const pt = active.el.getPointAtLength(active.shown);
      tip.setAttribute('cx', pt.x);
      tip.setAttribute('cy', pt.y);
      tip.style.opacity = 1;
    } else {
      tip.style.opacity = 0;
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
