// Lädt die generativen Elemente: je Platz [data-sig] das passende Modul.
const modules = {
  logo: () => import('./sig-logo.js'),
  farbskala: () => import('./sig-farbskala.js'),
  orte: () => import('./sig-orte.js'),
  feuer: () => import('./sig-feuer.js'),
  sticky: () => import('./sig-sticky.js'),
  aktuell: () => import('./sig-aktuell.js'),
  anfrage: () => import('./sig-anfrage.js'),
};

document.querySelectorAll('[data-sig]').forEach((el) => {
  const load = modules[el.dataset.sig];
  if (load) load().then((m) => m.default(el));
});
