// Lädt die generativen Elemente nur auf Seiten, die einen passenden Platz [data-sig] haben.
// Plätze mit hidden sind vorerst ausgeblendet und werden nicht geladen.
const modules = {
  profil: () => import('./sig-profil.js'),
  drehen: () => import('./sig-drehen.js'),
  logo: () => import('./sig-logo.js'),
  farbskala: () => import('./sig-farbskala.js'),
};

document.querySelectorAll('[data-sig]:not([hidden])').forEach((el) => {
  const load = modules[el.dataset.sig];
  if (load) load().then((m) => m.default(el));
});
