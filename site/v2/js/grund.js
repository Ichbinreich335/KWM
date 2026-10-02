// Grundton-Umschalter für den Farbtest (Entwurf): Creme, Porzellan, Galerie.
// Auswahl per ?grund=… oder Klick; gemerkt wird sie nur im Browser dieser Person.
const TONES = [
  { id: 'creme', name: 'Creme' },
  { id: 'porzellan', name: 'Porzellan' },
  { id: 'galerie', name: 'Galerie' },
];
const KEY = 'kwm-grund';
const root = document.documentElement;
const current = () => root.dataset.grund || 'creme';

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('../css/grund.css', import.meta.url).href;
document.head.append(css);

const panel = document.createElement('div');
panel.className = 'grund';
panel.setAttribute('role', 'group');
panel.setAttribute('aria-label', 'Grundton des Entwurfs');
panel.innerHTML = `<span class="grund__label">Grundton</span>${TONES.map((t) =>
  `<button type="button" class="grund__btn" data-grund="${t.id}" aria-pressed="false"><span class="grund__chip" aria-hidden="true"></span>${t.name}</button>`).join('')}`;

const sync = () => panel.querySelectorAll('.grund__btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grund === current())));

panel.addEventListener('click', (e) => {
  const btn = e.target.closest('.grund__btn');
  if (!btn) return;
  const id = btn.dataset.grund;
  if (id === 'creme') delete root.dataset.grund; else root.dataset.grund = id;
  try { localStorage.setItem(KEY, id); } catch { /* Speicher nicht verfügbar: Auswahl gilt nur für diese Seite */ }
  sync();
});

document.body.append(panel);
sync();
