export type Ziel = 'prototyp' | 'astro';

export const ziel: Ziel = process.env.ZIEL === 'prototyp' ? 'prototyp' : 'astro';

/** BASIS_URL zeigt die Tests auf eine Vorschau- oder Produktions-URL statt auf wrangler dev. */
export const externeBasis = process.env.BASIS_URL;

export const basisUrl: Record<Ziel, string> = {
  prototyp: 'http://localhost:4392',
  astro: externeBasis ?? 'http://localhost:8787',
};

export const seiten = [
  { name: 'start', prototyp: '/v3/index.html', astro: '/' },
  { name: 'meisterstuecke', prototyp: '/v3/meisterstuecke.html', astro: '/meisterstuecke' },
  { name: 'manufaktur', prototyp: '/v3/manufaktur.html', astro: '/manufaktur' },
  { name: 'young-jae-lee', prototyp: '/v3/young-jae-lee.html', astro: '/young-jae-lee' },
  { name: 'werkstatt', prototyp: '/v3/werkstatt.html', astro: '/werkstatt' },
  { name: 'aktuelles', prototyp: '/v3/aktuelles.html', astro: '/aktuelles' },
  { name: 'besuch', prototyp: '/v3/besuch.html', astro: '/besuch' },
  { name: 'impressum', prototyp: '/v3/impressum.html', astro: '/impressum' },
  { name: 'agb', prototyp: '/v3/agb.html', astro: '/agb' },
  { name: 'versand', prototyp: '/v3/versand.html', astro: '/versand' },
  { name: 'zahlung', prototyp: '/v3/zahlung.html', astro: '/zahlung' },
  { name: 'datenschutz', prototyp: '/v3/datenschutz.html', astro: '/datenschutz' },
  { name: '404', prototyp: '/v3/404.html', astro: '/gibt-es-nicht' },
] as const;

export type Seite = (typeof seiten)[number];
