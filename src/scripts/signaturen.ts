// Lädt die generativen Elemente: je Platz [data-sig] das passende Modul.
type Signatur = { default: (el: HTMLElement) => void };

const modules: Record<string, () => Promise<Signatur>> = {
  logo: () => import('./sig-logo'),
  farbskala: () => import('./sig-farbskala'),
  orte: () => import('./sig-orte'),
  feuer: () => import('./sig-feuer'),
  sticky: () => import('./sig-sticky'),
  aktuell: () => import('./sig-aktuell'),
  anfrage: () => import('./sig-anfrage'),
};

document.querySelectorAll<HTMLElement>('[data-sig]').forEach((el) => {
  const key = el.dataset['sig'];
  const load = key ? modules[key] : undefined;
  if (load) load().then((m) => m.default(el));
});
