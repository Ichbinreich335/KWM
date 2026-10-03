// Signatur: aktuell. Status je Ausstellung aus dem Datum, Details klappen ohne Unterseite auf (immer nur eine offen).
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const parseDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const formatDay = (date) => `${date.getDate()}. ${MONTHS[date.getMonth()]}`;

function statusText(start, end, today) {
  if (today < start) return `Ab ${formatDay(start)}`;
  if (today > end) return `Beendet am ${formatDay(end)}`;
  return `Läuft · bis ${formatDay(end)}`;
}

export default function init(el) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  el.querySelectorAll('.aktuell__item[data-start]').forEach((item) => {
    item.querySelector('[data-status]').textContent = statusText(parseDay(item.dataset.start), parseDay(item.dataset.end), today);
  });
  // Hinweis: nur sichtbar zwischen data-start und data-end (inklusive)
  el.querySelectorAll('.aktuell__note').forEach((note) => {
    note.hidden = today < parseDay(note.dataset.start) || today > parseDay(note.dataset.end);
  });

  const items = [...el.querySelectorAll('.aktuell__item')].filter((item) => item.querySelector('[data-more]'));
  const set = (item, open) => {
    const button = item.querySelector('[data-more]');
    item.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('[data-label]').textContent = open ? 'Weniger anzeigen' : 'Mehr zur Ausstellung';
  };

  items.forEach((item) => {
    item.querySelector('[data-more]').addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => set(other, other === item && open));
    });
  });
  el.classList.add('is-ready');
}
