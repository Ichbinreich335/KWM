// Signatur: orte. Ohne Skript sind alle Häuser sichtbar. Mit Skript öffnen Zeiger, Fokus und Tippen die Liste einer Kachel.
export default function init(el) {
  const tiles = [...el.querySelectorAll('.orte__tile')];
  const set = (tile, open) => {
    tile.classList.toggle('is-open', open);
    tile.querySelector('.orte__toggle').setAttribute('aria-expanded', String(open));
  };
  const closeOthers = (keep) => tiles.forEach((t) => t !== keep && set(t, false));

  tiles.forEach((tile, i) => {
    const name = tile.querySelector('.orte__name');
    const list = tile.querySelector('.orte__houses');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'orte__toggle';
    button.textContent = name.textContent;
    button.setAttribute('aria-expanded', 'false');
    list.id = `orte-haeuser-${i}`;
    button.setAttribute('aria-controls', list.id);
    name.replaceChildren(button);

    tile.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') { closeOthers(tile); set(tile, true); }
    });
    tile.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && document.activeElement !== button) set(tile, false);
    });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) { closeOthers(tile); set(tile, true); } });
    button.addEventListener('blur', () => set(tile, false));
    button.addEventListener('click', (e) => {
      if (e.pointerType === 'mouse') return;
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeOthers(tile);
      set(tile, open);
    });
  });

  el.classList.add('is-ready');
}
