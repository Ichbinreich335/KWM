// Signatur: aktuell. Status je Ausstellung aus dem Datum, Details klappen ohne Unterseite auf (immer nur eine offen).
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) return new Date(NaN);
  return new Date(y, m - 1, d);
};
const formatDay = (date: Date) => `${date.getDate()}. ${MONTHS[date.getMonth()]}`;

function statusText(start: Date, end: Date, today: Date) {
  if (today < start) return `Ab ${formatDay(start)}`;
  if (today > end) return `Beendet am ${formatDay(end)}`;
  return `Läuft · bis ${formatDay(end)}`;
}

export default function init(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  el.querySelectorAll<HTMLElement>('.aktuell__item[data-start]').forEach((item) => {
    const { start, end } = item.dataset;
    const status = item.querySelector('[data-status]');
    if (!start || !end || !status) return;
    status.textContent = statusText(parseDay(start), parseDay(end), today);
  });
  // Hinweis: nur sichtbar zwischen data-start und data-end (inklusive)
  el.querySelectorAll<HTMLElement>('.aktuell__note').forEach((note) => {
    const { start, end } = note.dataset;
    if (!start || !end) return;
    note.hidden = today < parseDay(start) || today > parseDay(end);
  });

  const items = [...el.querySelectorAll<HTMLElement>('.aktuell__item')].filter((item) =>
    item.querySelector('[data-more]'),
  );
  const set = (item: HTMLElement, open: boolean) => {
    const button = item.querySelector('[data-more]');
    item.classList.toggle('is-open', open);
    if (!button) return;
    button.setAttribute('aria-expanded', String(open));
    const label = button.querySelector('[data-label]');
    if (label) label.textContent = open ? 'Weniger anzeigen' : 'Mehr zur Ausstellung';
  };

  items.forEach((item) => {
    item.querySelector('[data-more]')?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => set(other, other === item && open));
    });
  });
  el.classList.add('is-ready');
}
