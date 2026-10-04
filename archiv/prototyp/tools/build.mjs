// Setzt die Seiten aus src/ mit den gemeinsamen Partials zusammen und schreibt sie nach site/.
// Design V2 und V3 liegen parallel in src/v2/ und src/v3/ (eigene Partials) und werden nach site/v2/ bzw. site/v3/ gebaut.
// Einbindung im Template: <!-- @include name {"key": "wert"} -->  → src/partials/name.html, {{key}} wird ersetzt.
// Der Schlüssel "nav" markiert den aktiven Navigationspunkt.
import { readFileSync, writeFileSync, readdirSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'site');
const versions = [
  { from: src, to: out },
  { from: join(src, 'v2'), to: join(out, 'v2') },
  { from: join(src, 'v3'), to: join(out, 'v3') },
];

function render(template, dir) {
  const partial = (name) => readFileSync(join(dir, 'partials', `${name}.html`), 'utf8');
  return template.replace(/<!--\s*@include\s+([\w-]+)\s*(\{.*?\})?\s*-->/g, (_, name, json) => {
    const vars = json ? JSON.parse(json) : {};
    let html = partial(name).replace(/\{\{(\w+)\}\}/g, (__, key) => vars[key] ?? '');
    if (vars.nav) html = html.replace(`data-nav="${vars.nav}"`, `data-nav="${vars.nav}" aria-current="page"`);
    return html;
  });
}

// Namen mit Bindestrich dürfen nicht am Bindestrich umbrechen (DESIGN.md, Typografie).
// Nur Fließtext wird umhüllt, nie Attribute, <title> oder Skripte.
function protectNames(html) {
  let skip = false;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<(title|script|style)\b/i.test(part)) skip = true;
        else if (/^<\/(title|script|style)\b/i.test(part)) skip = false;
        return part;
      }
      return skip ? part : part.replace(/Young-Jae/g, '<span class="nobr">Young-Jae</span>');
    })
    .join('');
}

function build() {
  for (const { from, to } of versions) {
    const pages = readdirSync(from).filter((f) => f.endsWith('.html'));
    const isV2 = to.endsWith('v2');
    for (const page of pages) {
      const html = render(readFileSync(join(from, page), 'utf8'), from);
      writeFileSync(join(to, page), isV2 ? protectNames(html) : html);
    }
    console.log(`gebaut ${to.slice(root.length + 1)}/: ${pages.join(', ')}`);
  }
}

build();
if (process.argv.includes('--watch')) {
  watch(src, { recursive: true }, (_, file) => { if (file?.endsWith('.html')) build(); });
  console.log('beobachte src/ …');
}
