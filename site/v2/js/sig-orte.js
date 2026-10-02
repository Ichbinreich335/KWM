// Signatur: orte. Ohne Skript zeigt jede Kachel ihre Häuser. Mit Skript öffnet ein Klick einen Detailbereich
// rechts neben der gewählten Kachel, die übrigen Kacheln ordnen sich per FLIP (messen, mit transform gleiten) neu.
import { reducedMotion } from './keramik.js';

const DURATION = 600;
const LEAVE = 360;
const SIZES = ['xl', 'm', 's'];
const COLUMNS = 12;
const WIDE = '(min-width: 900px)';

export default function init(el) {
  const grid = el.querySelector('.orte__grid');
  const tiles = [...grid.querySelectorAll('.orte__tile')];
  const ease = getComputedStyle(el).getPropertyValue('--ease').trim() || 'ease';
  let active = null;
  let leaving = null;

  const panel = document.createElement('li');
  panel.className = 'orte__detail';
  panel.id = 'orte-detail';
  panel.hidden = true;
  panel.innerHTML = `
    <section class="orte__detail-in" aria-labelledby="orte-detail-title" tabindex="-1">
      <header class="orte__detail-head">
        <div>
          <h3 class="orte__detail-title" id="orte-detail-title"></h3>
          <p class="orte__detail-meta"></p>
        </div>
        <button type="button" class="orte__close">Schließen</button>
      </header>
      <ol class="orte__list"></ol>
    </section>`;
  grid.append(panel);
  const body = panel.querySelector('.orte__detail-in');
  const title = panel.querySelector('.orte__detail-title');
  const meta = panel.querySelector('.orte__detail-meta');
  const list = panel.querySelector('.orte__list');
  const close = panel.querySelector('.orte__close');

  const toggles = tiles.map((tile) => {
    const name = tile.querySelector('.orte__name');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'orte__toggle';
    button.textContent = name.textContent;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panel.id);
    name.replaceChildren(button);
    button.addEventListener('click', () => (active === tile ? closeDetail() : openDetail(tile)));
    return button;
  });
  const toggleOf = (tile) => toggles[tiles.indexOf(tile)];

  const sizeOf = (tile) => SIZES.find((s) => tile.classList.contains(`orte__tile--${s}`)) ?? 's';

  const spanOf = (tile) => Number(getComputedStyle(tile).gridColumnStart.replace('span ', '')) || 1;

  // Ordnet die übrigen Kacheln so, dass jede Reihe genau 12 Spalten füllt (früheste passende Auswahl, nur das Ende bleibt offen).
  function packOrder(rest) {
    const ordered = [];
    let pool = rest.slice();
    while (pool.length) {
      const spans = pool.map(spanOf);
      let row = null;
      const search = (from, sum, picked) => {
        if (row) return;
        if (sum === COLUMNS) { row = picked.slice(); return; }
        for (let j = from; j < pool.length && !row; j += 1) {
          if (sum + spans[j] <= COLUMNS) { picked.push(j); search(j + 1, sum + spans[j], picked); picked.pop(); }
        }
      };
      search(0, 0, []);
      const take = row ? row.map((j) => pool[j]) : pool;
      ordered.push(...take);
      pool = pool.filter((t) => !take.includes(t));
    }
    return ordered;
  }

  function arrange(tile) {
    const wide = matchMedia(WIDE).matches;
    tiles.forEach((t) => { t.style.order = ''; });
    if (!tile || !wide) return;
    packOrder(tiles.filter((t) => t !== tile)).forEach((t, i) => { t.style.order = String(i); });
  }

  // FLIP: Positionen vorher messen, Zustand ändern, nachher messen, Differenz als transform ausspielen.
  function reflow(change, anchor) {
    const first = tiles.map((t) => t.getBoundingClientRect());
    const anchorTop = anchor ? anchor.getBoundingClientRect().top : 0;
    change();
    if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - anchorTop, behavior: 'instant' });
    if (reducedMotion()) return;
    tiles.forEach((tile, i) => {
      const last = tile.getBoundingClientRect();
      const dx = first[i].left - last.left;
      const dy = first[i].top - last.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      tile.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: DURATION, easing: ease },
      );
    });
  }

  function fill(tile) {
    const src = tile.querySelector('.orte__shows');
    title.textContent = tile.querySelector('.orte__toggle').textContent;
    meta.textContent = [...tile.querySelectorAll('.orte__meta span')].map((s) => s.textContent).join(' · ');
    list.innerHTML = src.innerHTML;
  }

  function settle(tile) {
    tiles.forEach((t) => {
      const on = t === tile;
      t.classList.toggle('is-active', on);
      toggleOf(t).setAttribute('aria-expanded', String(on));
    });
  }

  function openDetail(tile) {
    const was = active;
    active = tile;
    if (leaving) { leaving.cancel(); leaving = null; panel.classList.remove('is-leaving'); panel.style.cssText = ''; }
    reflow(() => {
      fill(tile);
      settle(tile);
      arrange(tile);
      grid.dataset.open = sizeOf(tile);
      tile.after(panel);
      panel.hidden = false;
    }, tile);
    if (!reducedMotion()) {
      panel.animate(
        [{ opacity: was ? 0.4 : 0, transform: 'translateX(28px)' }, { opacity: 1, transform: 'none' }],
        { duration: DURATION, easing: ease },
      );
    }
    body.focus({ preventScroll: true });
  }

  function closeDetail(returnFocus = true) {
    if (!active) return;
    const tile = active;
    active = null;
    const box = panel.getBoundingClientRect();
    const gridBox = grid.getBoundingClientRect();
    reflow(() => {
      if (!reducedMotion()) {
        panel.classList.add('is-leaving');
        Object.assign(panel.style, {
          top: `${box.top - gridBox.top}px`,
          left: `${box.left - gridBox.left}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        });
      } else {
        panel.hidden = true;
      }
      settle(null);
      arrange(null);
      delete grid.dataset.open;
    }, tile);
    if (!reducedMotion()) {
      const fade = panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LEAVE, easing: ease });
      leaving = fade;
      fade.onfinish = () => {
        leaving = null;
        panel.hidden = true;
        panel.classList.remove('is-leaving');
        panel.style.cssText = '';
      };
    }
    if (returnFocus) toggleOf(tile).focus({ preventScroll: true });
  }

  close.addEventListener('click', () => closeDetail());
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) { e.preventDefault(); closeDetail(); }
  });

  el.classList.add('is-ready');
}
