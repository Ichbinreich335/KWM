/** BASIS_URL zeigt die Tests auf eine Vorschau- oder Produktions-URL statt auf wrangler dev. */
export const externeBasis = process.env.BASIS_URL;

export const basisUrl = externeBasis ?? 'http://localhost:8787';

export const seiten = [
  { name: 'start', pfad: '/' },
  { name: 'meisterstuecke', pfad: '/meisterstuecke' },
  { name: 'manufaktur', pfad: '/manufaktur' },
  { name: 'young-jae-lee', pfad: '/young-jae-lee' },
  { name: 'werkstatt', pfad: '/werkstatt' },
  { name: 'aktuelles', pfad: '/aktuelles' },
  { name: 'besuch', pfad: '/besuch' },
  { name: 'impressum', pfad: '/impressum' },
  { name: 'agb', pfad: '/agb' },
  { name: 'versand', pfad: '/versand' },
  { name: 'zahlung', pfad: '/zahlung' },
  { name: 'datenschutz', pfad: '/datenschutz' },
  { name: '404', pfad: '/gibt-es-nicht' },
] as const;
