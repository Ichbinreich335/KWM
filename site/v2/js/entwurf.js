// Entwurf-Panel: Varianten der Seite vergleichen (Grundton, Einstieg, Elemente).
// Elemente tragen data-variant="schlüssel:wert …" und werden passend ein- oder ausgeblendet.
// Auswahl per URL (?werk=orte) oder Klick; gemerkt nur in diesem Browser.
// global: gilt auf allen Seiten; sonst nur zeigen, wenn die Seite Elemente mit diesem Schlüssel hat
const GROUPS = [
  { key: 'grund', label: 'Grundton', global: true, options: [['galerie', 'Galerie'], ['porzellan', 'Porzellan'], ['creme', 'Creme']] },
  { key: 'einstieg', label: 'Einstieg', options: [['foto', 'Foto'], ['wortbild', 'Wort und Bild']] },
  { key: 'werk', label: 'Nach der Werkschau', options: [['orte', 'Orte'], ['drehen', 'Drehen'], ['aus', 'Nichts']] },
  { key: 'kosmos', label: 'Ausstellung', options: [['buehne', 'Bühne'], ['klassisch', 'Kosmos']] },
  { key: 'feuer', label: 'Feuer', options: [['zwei-farben', 'Zwei Farben'], ['liste', 'Liste']] },
  { key: 'profil', label: 'Schale im Einstieg', options: [['aus', 'Aus'], ['an', 'An']] },
];
// Startseite: neue Fassung (index.html) oder vorherige (start-vorher.html)
const HOME = { neu: 'index.html', vorher: 'start-vorher.html' };
const page = location.pathname.split('/').pop() || 'index.html';
const isHome = Object.values(HOME).includes(page);
const KEY = 'kwm-entwurf';
const root = document.documentElement;

const read = () => {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { /* Speicher nicht verfügbar */ }
  const params = new URLSearchParams(location.search);
  return Object.fromEntries(GROUPS.map((g) => [g.key, params.get(g.key) || saved[g.key] || g.options[0][0]]));
};
const state = read();

const apply = () => {
  GROUPS.forEach((g) => { root.dataset[g.key] = state[g.key]; });
  document.querySelectorAll('[data-variant]').forEach((el) => {
    const rules = el.dataset.variant.split(/\s+/).map((r) => r.split(':'));
    el.hidden = !rules.every(([k, v]) => state[k] === v);
  });
  document.dispatchEvent(new CustomEvent('kwm:varianten'));
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* nur für diese Seite */ }
};

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('../css/entwurf.css', import.meta.url).href;
document.head.append(css);

const panel = document.createElement('div');
panel.className = 'entwurf';
const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'entwurf__toggle';
toggle.textContent = 'Entwurf: Varianten';
toggle.setAttribute('aria-expanded', 'false');
toggle.setAttribute('aria-controls', 'entwurf-optionen');
const body = document.createElement('div');
body.className = 'entwurf__body';
body.id = 'entwurf-optionen';
body.hidden = true;
const relevant = (g) => g.global || document.querySelector(`[data-variant*="${g.key}:"]`);
if (isHome) {
  const row = document.createElement('div');
  row.className = 'entwurf__group';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Startseite');
  row.innerHTML = '<span class="entwurf__label">Startseite</span>';
  [['neu', 'Neu'], ['vorher', 'Vorher']].forEach(([value, name]) => {
    const a = document.createElement('a');
    a.className = 'entwurf__opt';
    a.href = HOME[value] + location.search;
    a.textContent = name;
    a.setAttribute('aria-current', String(HOME[value] === page));
    row.append(a);
  });
  body.append(row);
}
GROUPS.filter(relevant).forEach((g) => {
  const row = document.createElement('div');
  row.className = 'entwurf__group';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', g.label);
  const label = document.createElement('span');
  label.className = 'entwurf__label';
  label.textContent = g.label;
  row.append(label);
  g.options.forEach(([value, name]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'entwurf__opt';
    b.dataset.key = g.key;
    b.dataset.value = value;
    b.textContent = name;
    row.append(b);
  });
  body.append(row);
});
panel.append(body, toggle);

const sync = () => body.querySelectorAll('.entwurf__opt').forEach((b) => b.setAttribute('aria-pressed', String(state[b.dataset.key] === b.dataset.value)));
const open = (on) => { body.hidden = !on; toggle.setAttribute('aria-expanded', String(on)); };

toggle.addEventListener('click', () => open(body.hidden));
body.addEventListener('click', (e) => {
  const b = e.target.closest('.entwurf__opt');
  if (!b) return;
  state[b.dataset.key] = b.dataset.value;
  apply();
  sync();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !body.hidden) { open(false); toggle.focus(); } });

apply();
document.body.append(panel);
sync();
