export const navigation = [
  {
    key: 'meisterstuecke',
    href: '/meisterstuecke',
    name: 'Meisterstücke',
    desc: 'Unikate aus der Hand von Young-Jae Lee',
  },
  {
    key: 'manufaktur',
    href: '/manufaktur',
    name: 'Manufaktur',
    desc: 'Geschirr, in der Werkstatt gedreht und glasiert',
  },
  {
    key: 'young-jae-lee',
    href: '/young-jae-lee',
    name: 'Young-Jae Lee',
    desc: 'Keramikerin, leitet die Werkstatt seit 1987',
  },
  { key: 'werkstatt', href: '/werkstatt', name: 'Werkstatt', desc: 'Seit 1924, Bauhaus-Linie, Team' },
  { key: 'aktuelles', href: '/aktuelles', name: 'Aktuelles', desc: 'Ausstellungen und Termine' },
  { key: 'besuch', href: '/besuch', name: 'Besuch', desc: 'Öffnungszeiten, Anfahrt, Kontakt' },
] as const;

export type NavKey = (typeof navigation)[number]['key'];

export const fussLinks = [
  { href: '/aktuelles', name: 'Aktuelles' },
  { href: '/besuch', name: 'Besuch & Anfahrt' },
  { href: '/zahlung', name: 'Zahlung' },
  { href: '/versand', name: 'Verpackung und Transport' },
  { href: '/agb', name: 'AGB' },
  { href: '/impressum', name: 'Impressum' },
  { href: '/datenschutz', name: 'Datenschutz' },
] as const;
