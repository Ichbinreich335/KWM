// Signatur: orte. Ohne Skript zeigt jede Kachel ihre Häuser. Mit Skript klappt ein Klick auf die Kachel
// einen Detailbereich in voller Breite direkt unter der Reihe der Kachel auf (Akkordeon). Die Kacheln behalten
// ihre Reihenfolge, nur die Reihen darunter rutschen nach unten.
import { reducedMotion } from './keramik';

const DURATION = 500;
const ROW_TOLERANCE = 2;
const REVEAL_MARGIN = 16;
const REVEAL_HEAD = 170;

export default function init(host: Element) {
  if (!(host instanceof HTMLElement)) return;
  const el = host;
  const grid = el.querySelector('.orte__grid');
  if (!grid) return;
  const tiles = [...grid.querySelectorAll<HTMLElement>('.orte__tile')];
  let active: HTMLElement | null = null;
  let current: HTMLElement | null = null;
  let holdFrame = 0;
  let serial = 0;

  const tip = el.querySelector('[data-orte-tip]');
  if (tip) {
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        tip.classList.add('is-in');
        seen.disconnect();
      },
      { threshold: 0.15 },
    );
    seen.observe(grid);
  }

  const buttons = new Map<HTMLElement, HTMLButtonElement>();
  tiles.forEach((tile) => {
    const name = tile.querySelector('.orte__name');
    if (!name) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'orte__toggle';
    button.textContent = name.textContent;
    button.setAttribute('aria-expanded', 'false');
    name.replaceChildren(button);
    button.addEventListener('click', () => (active === tile ? closeDetail() : openDetail(tile)));
    buttons.set(tile, button);
  });

  function createPanel(tile: HTMLElement) {
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
    const title = panel.querySelector('.orte__detail-title');
    const meta = panel.querySelector('.orte__detail-meta');
    const list = panel.querySelector('.orte__list');
    const shows = tile.querySelector('.orte__shows');
    if (!title || !meta || !list || !shows) return panel;
    title.textContent = buttons.get(tile)?.textContent ?? '';
    meta.textContent = [...tile.querySelectorAll('.orte__meta span')].map((s) => s.textContent).join(' · ');
    list.innerHTML = shows.innerHTML;
    panel.querySelector('.orte__close')?.addEventListener('click', () => closeDetail());
    return panel;
  }

  // Letzte Kachel der Reihe, in der die gewählte Kachel steht. Der Detailbereich wird dahinter eingefügt.
  function lastOfRow(tile: HTMLElement) {
    const top = tile.getBoundingClientRect().top;
    const row = tiles.filter((t) => Math.abs(t.getBoundingClientRect().top - top) < ROW_TOLERANCE);
    return row.at(-1) ?? tile;
  }

  function place(panel: HTMLElement, tile: HTMLElement) {
    panel.remove();
    const anchor = lastOfRow(tile);
    anchor.after(panel);
  }

  function retire(panel: HTMLElement) {
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
  function hold(tile: HTMLElement) {
    cancelAnimationFrame(holdFrame);
    const top = tile.getBoundingClientRect().top;
    const end = performance.now() + DURATION + 100;
    const stop = () => {
      cancelAnimationFrame(holdFrame);
      holdFrame = 0;
    };
    const step = (now: number) => {
      const delta = tile.getBoundingClientRect().top - top;
      if (Math.abs(delta) > 0.25) window.scrollBy({ top: delta, behavior: 'instant' });
      holdFrame = now < end ? requestAnimationFrame(step) : 0;
    };
    ['wheel', 'touchmove'].forEach((type) => addEventListener(type, stop, { once: true, passive: true }));
    holdFrame = requestAnimationFrame(step);
  }

  // Scrollt nur so weit sanft nach, dass der Kopf des neuen Detailbereichs sichtbar ist; sonst bleibt die Seite stehen.
  function reveal(panel: HTMLElement, tile: HTMLElement) {
    const bottom = panel.getBoundingClientRect().top + REVEAL_HEAD;
    const need = bottom - (innerHeight - REVEAL_MARGIN);
    const room = tile.getBoundingClientRect().top - REVEAL_MARGIN;
    const by = Math.min(need, room);
    if (by > 1) window.scrollBy({ top: by, behavior: reducedMotion() ? 'instant' : 'smooth' });
  }

  function settle(tile: HTMLElement | null) {
    tiles.forEach((t) => {
      const on = t === tile;
      const button = buttons.get(t);
      if (!button) return;
      t.classList.toggle('is-active', on);
      button.setAttribute('aria-expanded', String(on));
      if (on && current) button.setAttribute('aria-controls', current.id);
      else button.removeAttribute('aria-controls');
    });
  }

  function openDetail(tile: HTMLElement) {
    const previous = current;
    const above = Boolean(previous && previous.compareDocumentPosition(tile) & Node.DOCUMENT_POSITION_FOLLOWING);
    const top = tile.getBoundingClientRect().top;
    active = tile;
    tip?.classList.add('is-done');
    const panel = createPanel(tile);
    current = panel;
    place(panel, tile);
    settle(tile);
    if (previous) retire(previous);
    if (above && !reducedMotion()) hold(tile);
    else if (above) window.scrollBy({ top: tile.getBoundingClientRect().top - top, behavior: 'instant' });
    void panel.offsetHeight;
    panel.classList.add('is-open');
    panel.querySelector<HTMLElement>('.orte__detail-in')?.focus({ preventScroll: true });
    if (!above) reveal(panel, tile);
  }

  function closeDetail(returnFocus = true) {
    if (!active) return;
    const tile = active;
    active = null;
    if (current) retire(current);
    current = null;
    settle(null);
    if (returnFocus) buttons.get(tile)?.focus({ preventScroll: true });
  }

  let resizeFrame = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!active || !current) return;
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
