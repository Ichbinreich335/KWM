// Einmalig: wandelt prototyp/src/v3/<seite>.html in src/pages/<seite>.astro (Rohfassung, danach von Hand prüfen).
// Aufruf: node prototyp/tools/zu-astro.mjs impressum agb …
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const quelle = (name) => readFileSync(join(root, 'prototyp/src/v3', `${name}.html`), 'utf8');

const seitenPfad = (datei) => (datei === 'index' ? '/' : `/${datei}`);
const entities = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const attr = (s) => s.replaceAll('"', '&quot;');

const pfade = (html) =>
  html
    .replaceAll('../img/', '/img/')
    .replace(/(href=")([a-z0-9-]+)\.html([?#][^"]*)?"/g, (_, a, seite, rest = '') => `${a}${seitenPfad(seite)}${rest}"`);

const kommentare = (html) => html.replace(/<!--(?!\s*@include)([\s\S]*?)-->/g, (_, t) => `{/*${t}*/}`);

function umwandeln(name) {
  let html = quelle(name);
  const kopf = JSON.parse(html.match(/<!-- @include head (\{.*?\}) -->/)[1]);
  const nav = html.match(/<!-- @include header \{"nav": "([\w-]+)"\} -->/)?.[1];
  const komponenten = new Set();

  html = html
    .replace(/<!-- @include (head|header|footer)\b.*?-->\n?/g, '')
    .replace(/<!-- @include anfrage-form -->/g, () => (komponenten.add('InquiryForm'), '<InquiryForm />'))
    .replace(/<!-- @include anfrage-band (\{.*?\}) -->/g, (_, json) => {
      komponenten.add('InquiryBand');
      const p = JSON.parse(json);
      const stueck = p.query ? decodeURIComponent(p.query.replace('?stueck=', '')) : '';
      const hinweis = pfade((p.hinweis ?? '').replaceAll("'", '"'));
      const props = `text="${attr(entities(p.text))}"${stueck ? ` stueck="${attr(stueck)}"` : ''}`;
      return hinweis ? `<InquiryBand ${props}>${hinweis}</InquiryBand>` : `<InquiryBand ${props} />`;
    });
  html = kommentare(pfade(html)).trim();

  const importe = [`import BaseLayout from '../layouts/BaseLayout.astro';`, ...[...komponenten].map((k) => `import ${k} from '../components/${k}.astro';`)];
  const layoutProps = [
    `title="${attr(kopf.title)}"`,
    `description="${attr(kopf.description)}"`,
    `bodyClass="${kopf.bodyClass}"`,
    nav ? `nav="${nav}"` : '',
  ].filter(Boolean).join(' ');
  const extra = kopf.extra ? `  <Fragment slot="head">${pfade(kopf.extra).replaceAll('href="css/', 'href="/css/')}</Fragment>\n` : '';

  const astro = `---\n${importe.join('\n')}\n---\n\n<BaseLayout ${layoutProps}>\n${extra}${html}\n</BaseLayout>\n`;
  writeFileSync(join(root, 'src/pages', `${name}.astro`), astro);
  console.log(`geschrieben src/pages/${name}.astro`);
}

process.argv.slice(2).forEach(umwandeln);
