// Lädt die generativen Elemente nur auf Seiten, die einen passenden Platz [data-sig] haben.
const modules = {
  profil: () => import('./sig-profil.js'),
  drehen: () => import('./sig-drehen.js'),
  logo: () => import('./sig-logo.js'),
  farbskala: () => import('./sig-farbskala.js'),
};

document.querySelectorAll('[data-sig]').forEach((el) => {
  const load = modules[el.dataset.sig];
  if (load) load().then((m) => m.default(el));
});
