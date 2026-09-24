// Setzt die Seiten aus src/ mit den gemeinsamen Partials zusammen und schreibt sie nach site/.
// Einbindung im Template: <!-- @include name {"key": "wert"} -->  → src/partials/name.html, {{key}} wird ersetzt.
// Der Schlüssel "nav" markiert den aktiven Navigationspunkt.
import { readFileSync, writeFileSync, readdirSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'site');

const partial = (name) => readFileSync(join(src, 'partials', `${name}.html`), 'utf8');

function render(template) {
  return template.replace(/<!--\s*@include\s+([\w-]+)\s*(\{.*?\})?\s*-->/g, (_, name, json) => {
    const vars = json ? JSON.parse(json) : {};
    let html = partial(name).replace(/\{\{(\w+)\}\}/g, (__, key) => vars[key] ?? '');
    if (vars.nav) html = html.replace(`data-nav="${vars.nav}"`, `data-nav="${vars.nav}" aria-current="page"`);
    return html;
  });
}

function build() {
  const pages = readdirSync(src).filter((f) => f.endsWith('.html'));
  for (const page of pages) writeFileSync(join(out, page), render(readFileSync(join(src, page), 'utf8')));
  console.log(`gebaut: ${pages.join(', ')}`);
}

build();
if (process.argv.includes('--watch')) {
  watch(src, { recursive: true }, (_, file) => { if (file?.endsWith('.html')) build(); });
  console.log('beobachte src/ …');
}
