// Signatur: orte. Ohne Skript zeigt jede Kachel ihre Häuser. Mit Skript klappt ein Klick auf die Kachel
// einen Detailbereich in voller Breite direkt unter der Reihe der Kachel auf (Akkordeon). Die Kacheln behalten
// ihre Reihenfolge, nur die Reihen darunter rutschen nach unten.
import { reducedMotion } from './keramik.js';

const DURATION = 500;
const ROW_TOLERANCE = 2;
const REVEAL_MARGIN = 16;
const REVEAL_HEAD = 170;

export default function init(el) {
  const grid = el.querySelector('.orte__grid');
  const tiles = [...grid.querySelectorAll('.orte__tile')];
  let active = null;
  let current = null;
  let holdFrame = 0;
  let serial = 0;

  const tip = el.querySelector('[data-orte-tip]');
  if (tip) {
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        tip.classList.add('is-in');
        seen.disconnect();
      },
      { threshold: 0.15 },
    );
    seen.observe(grid);
  }

  const buttons = new Map();
  tiles.forEach((tile) => {
    const name = tile.querySelector('.orte__name');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'orte__toggle';
    button.textContent = name.textContent;
    button.setAttribute('aria-expanded', 'false');
    name.replaceChildren(button);
    button.addEventListener('click', () => (active === tile ? closeDetail() : openDetail(tile)));
    buttons.set(tile, button);
  });

  function createPanel(tile) {
    serial += 1;
    const id = `orte-detail-${serial}`;
    const panel = document.createElement('li');
    panel.className = 'orte__detail';
    panel.id = id;
    panel.innerHTML = `
      <div class="orte__detail-clip">
        <section class="orte__detail-in" aria-labelledby="${id}-title" tabindex="-1">
          <header class="orte__detail-head">
            <div>
              <h3 class="orte__detail-title" id="${id}-title"></h3>
              <p class="orte__detail-meta"></p>
            </div>
            <button type="button" class="orte__close">Schließen</button>
          </header>
          <ol class="orte__list"></ol>
        </section>
      </div>`;
    panel.querySelector('.orte__detail-title').textContent = buttons.get(tile).textContent;
    panel.querySelector('.orte__detail-meta').textContent = [...tile.querySelectorAll('.orte__meta span')]
      .map((s) => s.textContent)
      .join(' · ');
    panel.querySelector('.orte__list').innerHTML = tile.querySelector('.orte__shows').innerHTML;
    panel.querySelector('.orte__close').addEventListener('click', () => closeDetail());
    return panel;
  }

  // Letzte Kachel der Reihe, in der die gewählte Kachel steht. Der Detailbereich wird dahinter eingefügt.
  function lastOfRow(tile) {
    const top = tile.getBoundingClientRect().top;
    const row = tiles.filter((t) => Math.abs(t.getBoundingClientRect().top - top) < ROW_TOLERANCE);
    return row[row.length - 1];
  }

  function place(panel, tile) {
    panel.remove();
    const anchor = lastOfRow(tile);
    anchor.after(panel);
  }

  function retire(panel) {
    if (!panel.isConnected) return;
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    if (reducedMotion()) {
      panel.remove();
      return;
    }
    const done = () => panel.remove();
    panel.addEventListener('transitionend', (e) => {
      if (e.target === panel && e.propertyName === 'grid-template-rows') done();
    });
    setTimeout(done, DURATION + 150);
    panel.classList.remove('is-open');
  }

  // Hält die Kachel an ihrer Stelle im Fenster, während ein Detailbereich darüber zuklappt.
  function hold(tile) {
    cancelAnimationFrame(holdFrame);
    const top = tile.getBoundingClientRect().top;
    const end = performance.now() + DURATION + 100;
    const stop = () => {
      cancelAnimationFrame(holdFrame);
      holdFrame = 0;
    };
    const step = (now) => {
      const delta = tile.getBoundingClientRect().top - top;
      if (Math.abs(delta) > 0.25) window.scrollBy({ top: delta, behavior: 'instant' });
      holdFrame = now < end ? requestAnimationFrame(step) : 0;
    };
    ['wheel', 'touchmove'].forEach((type) => addEventListener(type, stop, { once: true, passive: true }));
    holdFrame = requestAnimationFrame(step);
  }

  // Scrollt nur so weit sanft nach, dass der Kopf des neuen Detailbereichs sichtbar ist; sonst bleibt die Seite stehen.
  function reveal(panel, tile) {
    const bottom = panel.getBoundingClientRect().top + REVEAL_HEAD;
    const need = bottom - (innerHeight - REVEAL_MARGIN);
    const room = tile.getBoundingClientRect().top - REVEAL_MARGIN;
    const by = Math.min(need, room);
    if (by > 1) window.scrollBy({ top: by, behavior: reducedMotion() ? 'instant' : 'smooth' });
  }

  function settle(tile) {
    tiles.forEach((t) => {
      const on = t === tile;
      const button = buttons.get(t);
      t.classList.toggle('is-active', on);
      button.setAttribute('aria-expanded', String(on));
      if (on) button.setAttribute('aria-controls', current.id);
      else button.removeAttribute('aria-controls');
    });
  }

  function openDetail(tile) {
    const previous = current;
    const above = Boolean(previous && previous.compareDocumentPosition(tile) & Node.DOCUMENT_POSITION_FOLLOWING);
    const top = tile.getBoundingClientRect().top;
    active = tile;
    tip?.classList.add('is-done');
    current = createPanel(tile);
    place(current, tile);
    settle(tile);
    if (previous) retire(previous);
    if (above && !reducedMotion()) hold(tile);
    else if (above) window.scrollBy({ top: tile.getBoundingClientRect().top - top, behavior: 'instant' });
    void current.offsetHeight;
    current.classList.add('is-open');
    current.querySelector('.orte__detail-in').focus({ preventScroll: true });
    if (!above) reveal(current, tile);
  }

  function closeDetail(returnFocus = true) {
    if (!active) return;
    const tile = active;
    active = null;
    retire(current);
    current = null;
    settle(null);
    if (returnFocus) buttons.get(tile).focus({ preventScroll: true });
  }

  let resizeFrame = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!active) return;
      place(current, active);
    });
  });

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) {
      e.preventDefault();
      closeDetail();
    }
  });

  // Fokusring im Detailbereich nur, wenn zuletzt die Tastatur bedient wurde.
  addEventListener('keydown', () => el.classList.add('is-keys'), true);
  addEventListener('pointerdown', () => el.classList.remove('is-keys'), true);

  el.classList.add('is-ready');
}
