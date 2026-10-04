// @ts-check
import { defineConfig } from 'astro/config';

// Statische Website, kein Adapter: Cloudflare liefert dist/ als Static Assets aus.
export default defineConfig({
  site: 'https://kwm-1924.de',
  output: 'static',
  // aktuelles.astro → dist/aktuelles.html, von Cloudflare als /aktuelles ausgeliefert
  build: { format: 'file', inlineStylesheets: 'never' },
  trailingSlash: 'never',
  // Astro 7 entfernt sonst Leerzeichen zwischen Inline-Elementen (Standard 'jsx')
  compressHTML: true,
  vite: {
    build: {
      rolldownOptions: {
        output: {
          // Eigene Chunks, damit die Reihenfolge Grundstile, Seiten-CSS, Signaturen im HTML erhalten bleibt
          codeSplitting: {
            groups: [
              { name: 'signaturen', test: /\/src\/styles\/signaturen\// },
              { name: 'basis', test: /\/src\/styles\/(basis|global|pages|expander)\.css/ },
            ],
          },
        },
      },
    },
  },
});
