// Lädt die generativen Elemente nur, wenn ihr Platz [data-sig] sichtbar ist.
// Ausgeblendete Elemente (hidden) werden nicht geladen.
const modules = {
  profil: () => import('./sig-profil.js'),
  drehen: () => import('./sig-drehen.js'),
  logo: () => import('./sig-logo.js'),
  farbskala: () => import('./sig-farbskala.js'),
  orte: () => import('./sig-orte.js'),
  buehne: () => import('./sig-buehne.js'),
  feuer: () => import('./sig-feuer.js'),
  komposition: () => import('./sig-komposition.js'),
  sticky: () => import('./sig-sticky.js'),
  aktuell: () => import('./sig-aktuell.js'),
  anfrage: () => import('./sig-anfrage.js'),
};
const started = new WeakSet();

const run = () => {
  document.querySelectorAll('[data-sig]:not([hidden])').forEach((el) => {
    const load = modules[el.dataset.sig];
    if (!load || started.has(el)) return;
    started.add(el);
    load().then((m) => m.default(el));
  });
};

run();
