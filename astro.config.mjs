// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';

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
  // 404 und Datenschutz (noindex) gehören nicht in die Sitemap
  integrations: [sitemap({ filter: (seite) => !/\/(404|datenschutz)$/.test(seite) })],
  // aktuelles.astro → dist/aktuelles.html, von Cloudflare als /aktuelles ausgeliefert
  build: { format: 'file', inlineStylesheets: 'never' },
  trailingSlash: 'never',
  // Build-Variablen, gelesen über astro:env in src/lib/umgebung.ts (Werte nur beim Build, nichts davon ist geheim)
  env: {
    schema: {
      // Öffentlicher Site-Key des Turnstile-Widgets; ohne Angabe gilt der Testschlüssel „immer gültig“
      PUBLIC_TURNSTILE_SITEKEY: envField.string({ context: 'server', access: 'public', optional: true }),
      // Setzt Workers Builds bei jedem Build (Cloudflare-Doku „Build configuration“)
      WORKERS_CI: envField.string({ context: 'server', access: 'public', optional: true }),
      WORKERS_CI_BRANCH: envField.string({ context: 'server', access: 'public', optional: true }),
      // Branch der Produktion; ohne Angabe main
      PRODUKTIONS_BRANCH: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
  // CSP als <meta> mit Hashes der gebündelten Skripte und Styles (Astro). frame-ancestors steht in public/_headers.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        // Turnstile-Widget: lädt erst beim Antippen eines Formularfeldes
        'frame-src https://challenges.cloudflare.com',
        "object-src 'none'",
      ],
      // Kopf-Skript in BaseLayout.astro (is:inline); tests/sicherheit.spec.ts rechnet den Hash nach
      scriptDirective: {
        resources: ["'self'", 'https://challenges.cloudflare.com'],
        hashes: ['sha256-bzycTj6gg2/wtgss/NQeh2E42eImIs6BuefgIDZCIRI='],
      },
    },
  },
  // Globale Stile für die responsiven Bilder (max-width bei constrained)
  image: { responsiveStyles: true },
  // Verschobene Regeln behalten ihre Spezifität: 'where' erhöht sie nicht (Standard 'attribute' addiert +1)
  scopedStyleStrategy: 'where',
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
      // Keine Skripte im HTML: Kleine Komponenten-Skripte (Custom Elements) würden sonst inline stehen, das braucht später eine CSP-Ausnahme
      assetsInlineLimit: 0,
      rolldownOptions: {
        output: {
          // Eigene Chunks, damit die Reihenfolge Grundstile, Seiten-CSS, Signaturen im HTML erhalten bleibt (Signaturen: die Hüllen Sig* und InquiryForm)
          codeSplitting: {
            groups: [
              {
                name: 'signaturen',
                test: /\/src\/components\/(Sig[^/]+|InquiryForm)\.astro\?astro&type=style/,
              },
              {
                name: 'basis',
                test: /\/src\/styles\/(basis|global|pages)\.css|\/src\/components\/[^/]+\.astro\?astro&type=style|virtual:astro:image-styles\.css/,
              },
            ],
          },
        },
      },
    },
  },
});
