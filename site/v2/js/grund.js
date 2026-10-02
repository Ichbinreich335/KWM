// Grundton-Umschalter für den Farbtest (Entwurf): Galerie (Standard), Porzellan, Creme.
// Eingeklappt nur ein kleiner Knopf; Auswahl per ?grund=… oder Klick, gemerkt nur in diesem Browser.
const TONES = [
  { id: 'galerie', name: 'Galerie' },
  { id: 'porzellan', name: 'Porzellan' },
  { id: 'creme', name: 'Creme' },
];
const KEY = 'kwm-grund';
const root = document.documentElement;
const current = () => TONES.find((t) => t.id === (root.dataset.grund || 'galerie')) || TONES[0];

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('../css/grund.css', import.meta.url).href;
document.head.append(css);

const panel = document.createElement('div');
panel.className = 'grund';
const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'grund__toggle';
toggle.setAttribute('aria-expanded', 'false');
toggle.setAttribute('aria-controls', 'grund-optionen');
const list = document.createElement('div');
list.className = 'grund__list';
list.id = 'grund-optionen';
list.setAttribute('role', 'group');
list.setAttribute('aria-label', 'Grundton des Entwurfs');
list.hidden = true;
TONES.forEach((t) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'grund__btn';
  b.dataset.grund = t.id;
  b.innerHTML = '<span class="grund__chip" aria-hidden="true"></span>';
  b.append(t.name);
  list.append(b);
});
panel.append(list, toggle);

const sync = () => {
  const tone = current();
  toggle.innerHTML = '<span class="grund__chip" aria-hidden="true"></span>';
  toggle.dataset.grund = tone.id;
  toggle.append(`Grundton: ${tone.name}`);
  list.querySelectorAll('.grund__btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grund === tone.id)));
};
const open = (state) => { list.hidden = !state; toggle.setAttribute('aria-expanded', String(state)); };

toggle.addEventListener('click', () => open(list.hidden));
list.addEventListener('click', (e) => {
  const btn = e.target.closest('.grund__btn');
  if (!btn) return;
  const id = btn.dataset.grund;
  if (id === 'galerie') delete root.dataset.grund; else root.dataset.grund = id;
  try { localStorage.setItem(KEY, id); } catch { /* Speicher nicht verfügbar: Auswahl gilt nur für diese Seite */ }
  sync();
  open(false);
  toggle.focus();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !list.hidden) { open(false); toggle.focus(); } });

document.body.append(panel);
sync();
