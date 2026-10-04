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
      rollupOptions: {
        output: {
          // Eigene Chunks, damit die Reihenfolge Grundstile, Seiten-CSS, Signaturen im HTML erhalten bleibt
          manualChunks(id) {
            if (id.includes('/src/styles/signaturen/')) return 'signaturen';
            if (/\/src\/styles\/(basis|global|pages|expander)\.css/.test(id)) return 'basis';
            return undefined;
          },
        },
      },
    },
  },
});
