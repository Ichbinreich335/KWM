// Lädt die generativen Elemente: je Platz [data-sig] das passende Modul.
type Signatur = { default: (el: Element) => void };

const modules: Record<string, () => Promise<Signatur>> = {
  logo: () => import('./sig-logo'),
  farbskala: () => import('./sig-farbskala'),
  feuer: () => import('./sig-feuer'),
  sticky: () => import('./sig-sticky'),
  aktuell: () => import('./sig-aktuell'),
  anfrage: () => import('./sig-anfrage'),
};

document.querySelectorAll('[data-sig]').forEach((el) => {
  const key = el.getAttribute('data-sig');
  const load = key ? modules[key] : undefined;
  if (load) load().then((m) => m.default(el));
});
