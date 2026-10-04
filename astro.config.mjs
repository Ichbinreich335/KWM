// @ts-check
import { defineConfig } from 'astro/config';

// Statische Website, kein Adapter: Cloudflare liefert dist/ als Static Assets aus.
export default defineConfig({
  site: 'https://kwm-1924.de',
  output: 'static',
  // aktuelles.astro → dist/aktuelles.html, von Cloudflare als /aktuelles ausgeliefert
  build: { format: 'file' },
  trailingSlash: 'never',
  // Astro 7 entfernt sonst Leerzeichen zwischen Inline-Elementen (Standard 'jsx')
  compressHTML: true,
});
