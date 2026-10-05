// Signatur: aktuell. Status je Ausstellung aus dem Datum, Details klappen ohne Unterseite auf (immer nur eine offen).
import { statusText, tagAusIso } from './status';

export default function init(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  el.querySelectorAll<HTMLElement>('.aktuell__item[data-start]').forEach((item) => {
    const { start, end } = item.dataset;
    const status = item.querySelector('[data-status]');
    if (!start || !end || !status) return;
    status.textContent = statusText(tagAusIso(start), tagAusIso(end), today);
  });
  // Hinweis: nur sichtbar zwischen data-start und data-end (inklusive)
  el.querySelectorAll<HTMLElement>('.aktuell__note').forEach((note) => {
    const { start, end } = note.dataset;
    if (!start || !end) return;
    note.hidden = today < tagAusIso(start) || today > tagAusIso(end);
  });

  const items = [...el.querySelectorAll<HTMLElement>('.aktuell__item')].filter((item) =>
    item.querySelector('[data-more]'),
  );
  const set = (item: HTMLElement, open: boolean) => {
    const button = item.querySelector('[data-more]');
    item.classList.toggle('is-open', open);
    if (!button) return;
    button.setAttribute('aria-expanded', String(open));
    const label = button.querySelector<HTMLElement>('[data-label]');
    if (label) label.textContent = open ? 'Weniger anzeigen' : (label.dataset.label ?? '');
  };

  items.forEach((item) => {
    item.querySelector('[data-more]')?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => set(other, other === item && open));
    });
  });
  el.classList.add('is-ready');
}
