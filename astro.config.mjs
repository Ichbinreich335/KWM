// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Unicode-Bereiche der beiden Teilmengen: Der Browser lädt nur die Datei, deren Zeichen auf der Seite vorkommen.
/** @type {Record<'latin' | 'latin-ext', [string, ...string[]]>} */
const unicodeBereiche = {
  latin: [
    'U+0000-00FF',
    'U+0131',
    'U+0152-0153',
    'U+02BB-02BC',
    'U+02C6',
    'U+02DA',
    'U+02DC',
    'U+0304',
    'U+0308',
    'U+0329',
    'U+2000-206F',
    'U+20AC',
    'U+2122',
    'U+2191',
    'U+2193',
    'U+2212',
    'U+2215',
    'U+FEFF',
    'U+FFFD',
  ],
  'latin-ext': [
    'U+0100-02BA',
    'U+02BD-02C5',
    'U+02C7-02CC',
    'U+02CE-02D7',
    'U+02DD-02FF',
    'U+0304',
    'U+0308',
    'U+0329',
    'U+1D00-1DBF',
    'U+1E00-1E9F',
    'U+1EF2-1EFF',
    'U+2020',
    'U+20A0-20AB',
    'U+20AD-20C0',
    'U+2113',
    'U+2C60-2C7F',
    'U+A720-A7FF',
  ],
};

/**
 * Zwei Varianten einer selbst gehosteten Schrift: zuerst latin, dann latin-ext.
 * Die Reihenfolge ist verbindlich, das Layout lädt die erste Datei vor (siehe BaseLayout.astro).
 * @param {string} datei Dateiname ohne Teilmenge und Endung, z. B. 'jost-normal'
 * @param {string} weight
 * @param {'normal' | 'italic'} style
 */
const varianten = (datei, weight, style) => {
  /** @param {'latin' | 'latin-ext'} teilmenge */
  const variante = (teilmenge) => ({
    weight,
    style,
    src: /** @type {[string]} */ ([`./src/assets/fonts/${datei}-${teilmenge}.woff2`]),
    unicodeRange: unicodeBereiche[teilmenge],
    display: /** @type {const} */ ('swap'),
  });
  return /** @type {[ReturnType<typeof variante>, ReturnType<typeof variante>]} */ ([
    variante('latin'),
    variante('latin-ext'),
  ]);
};

// Statische Website, kein Adapter: Cloudflare liefert dist/ als Static Assets aus.
export default defineConfig({
  site: 'https://kwm-1924.de',
  output: 'static',
  // aktuelles.astro → dist/aktuelles.html, von Cloudflare als /aktuelles ausgeliefert
  build: { format: 'file', inlineStylesheets: 'never' },
  trailingSlash: 'never',
  // Globale Stile für die responsiven Bilder (max-width bei constrained)
  image: { responsiveStyles: true },
  // Astro 7 entfernt sonst Leerzeichen zwischen Inline-Elementen (Standard 'jsx')
  compressHTML: true,
  // Selbst gehostete Schriften (SIL Open Font License), Ersatzschriften über `fallbacks`
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Jost',
      cssVariable: '--font-jost',
      fallbacks: ['Futura', 'system-ui', 'sans-serif'],
      options: { variants: varianten('jost-normal', '300 500', 'normal') },
    },
    {
      provider: fontProviders.local(),
      name: 'Libre Caslon Display',
      cssVariable: '--font-caslon-display',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: varianten('libre-caslon-display-normal', '400', 'normal') },
    },
    {
      provider: fontProviders.local(),
      name: 'Libre Caslon Text',
      cssVariable: '--font-caslon-text',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          ...varianten('libre-caslon-text-normal', '400', 'normal'),
          ...varianten('libre-caslon-text-italic', '400', 'italic'),
        ],
      },
    },
  ],
  vite: {
    build: {
      rolldownOptions: {
        output: {
          // Eigene Chunks, damit die Reihenfolge Grundstile, Seiten-CSS, Signaturen im HTML erhalten bleibt
          codeSplitting: {
            groups: [
              { name: 'signaturen', test: /\/src\/styles\/signaturen\// },
              {
                name: 'basis',
                test: /\/src\/styles\/(basis|global|pages|expander)\.css|virtual:astro:image-styles\.css/,
              },
            ],
          },
        },
      },
    },
  },
});
