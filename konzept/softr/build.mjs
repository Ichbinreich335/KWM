// Erzeugt die hochladbaren Block-Dateien in blocks/ aus src/blocks/ und der gemeinsamen Bibliothek src/shared/.
// Softr kompiliert jeden Block als einzelne Datei. Darum werden die gemeinsamen Bauteile hier eingesetzt,
// und zwar nur die, die der Block (direkt oder indirekt) benutzt.
// Aufruf: node konzept/softr/build.mjs   Prüfung ohne Schreiben: node konzept/softr/build.mjs --check
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pruefeEinheitlich } from "./pruefung/einheitlich.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src", "blocks");
const SHARED = join(ROOT, "src", "shared");
const OUT = join(ROOT, "blocks");
const SHARED_ORDER = ["konstanten.ts", "daten.ts", "mengen.ts", "ui.tsx"];
const CHECK = process.argv.includes("--check");

const IMPORT_RE = /^import\s+([\s\S]*?)\s+from\s+"([^"]+)";\n/gm;

function parseImports(code) {
  const imports = [];
  const body = code.replace(IMPORT_RE, (_, spec, from) => {
    imports.push({ spec: spec.trim(), from });
    return "";
  });
  return { imports, body };
}

function namedSpecs(spec) {
  const m = spec.match(/\{([\s\S]*)\}/);
  const names = m ? m[1].split(",").map((s) => s.trim().replace(/^type\s+/, "")).filter(Boolean) : [];
  const def = spec.replace(/\{[\s\S]*\}/, "").replace(/,/g, "").trim();
  return { names, def: def || null };
}

// Zerlegt eine gemeinsame Datei in Deklarationen der obersten Ebene (mit vorangehenden Kommentaren).
function parseShared(file) {
  const { imports, body } = parseImports(readFileSync(join(SHARED, file), "utf8"));
  const lines = body.split("\n");
  const DECL_RE = /^(?:export\s+)?(?:async\s+function|function|const|type)\s+([A-Za-z_][A-Za-z0-9_]*)/;
  // Beginn jeder Deklaration, einschließlich direkt darüber stehender Kommentarzeilen.
  const starts = [];
  lines.forEach((line, i) => {
    const m = line.match(DECL_RE);
    if (!m) return;
    let from = i;
    while (from > 0 && lines[from - 1].startsWith("//")) from--;
    starts.push({ name: m[1], from });
  });
  const decls = starts.map((s, k) => {
    const to = k + 1 < starts.length ? starts[k + 1].from : lines.length;
    const code = lines
      .slice(s.from, to)
      .map((l) => l.replace(/^export\s+/, ""))
      .join("\n")
      .trimEnd();
    return { name: s.name, code };
  });
  return { file, imports: imports.filter((i) => !i.from.startsWith("../shared/")), decls };
}

const shared = SHARED_ORDER.map(parseShared);
const allDecls = shared.flatMap((s) => s.decls);
const byName = new Map(allDecls.map((d) => [d.name, d]));
// Für die Suche nach benutzten Namen zählen nur Code-Zeichen: Zeichenketten in "…" und Kommentare werden ausgeblendet,
// sonst zöge z. B. ein Kommentar mit dem Wort „Badge“ einen unnötigen Import nach sich.
const codeOnly = (code) =>
  code
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
const uses = (code, name) => new RegExp(`(?<![A-Za-z0-9_.])${name}(?![A-Za-z0-9_])`).test(codeOnly(code));

function build(file) {
  const src = readFileSync(join(SRC, file), "utf8");
  const { imports, body } = parseImports(src);
  const wanted = new Set();
  for (const i of imports.filter((i) => i.from.startsWith("../shared/"))) {
    for (const n of namedSpecs(i.spec).names) {
      if (!byName.has(n)) throw new Error(`${file}: „${n}“ gibt es in src/shared nicht.`);
      wanted.add(n);
    }
  }
  // Abhängigkeiten innerhalb der Bibliothek auflösen.
  let grew = true;
  while (grew) {
    grew = false;
    for (const n of [...wanted]) {
      for (const d of allDecls) {
        if (!wanted.has(d.name) && uses(byName.get(n).code, d.name)) {
          wanted.add(d.name);
          grew = true;
        }
      }
    }
  }
  const picked = allDecls.filter((d) => wanted.has(d.name));
  const sharedCode = picked.map((d, i) => (i === 0 ? "" : !d.code.includes("\n") && !picked[i - 1].code.includes("\n") ? "\n" : "\n\n") + d.code).join("");
  const code = `${sharedCode}\n\n${body.trim()}\n`;

  // Externe Importe zusammenführen und auf tatsächlich benutzte Namen kürzen.
  const ext = new Map();
  for (const i of [...imports.filter((i) => !i.from.startsWith("../shared/")), ...shared.flatMap((s) => s.imports)]) {
    const { names, def } = namedSpecs(i.spec);
    const entry = ext.get(i.from) ?? { names: new Set(), def: null };
    names.forEach((n) => entry.names.add(n));
    if (def) entry.def = def;
    ext.set(i.from, entry);
  }
  const importLines = [];
  for (const [from, { names, def }] of ext) {
    const used = [...names].filter((n) => uses(code, n)).sort((a, b) => a.localeCompare(b));
    const d = def && uses(code, def) ? def : null;
    if (!used.length && !d) continue;
    const parts = [d, used.length ? `{ ${used.join(", ")} }` : null].filter(Boolean).join(", ");
    importLines.push(`import ${parts} from "${from}";`);
  }
  const header = `// Generiert von konzept/softr/build.mjs aus src/blocks/${file} und src/shared/. Nicht von Hand ändern.\n`;
  return `${header}${importLines.join("\n")}\n\n${code}`;
}

const verstoesse = pruefeEinheitlich(ROOT);
if (verstoesse.length) {
  console.error(`Build abgebrochen: ${verstoesse.length} Verstöße gegen die einheitlichen Bausteine\n${verstoesse.join("\n")}`);
  process.exit(1);
}

let changed = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".tsx"))) {
  const out = build(file);
  const target = join(OUT, file);
  const before = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (before !== out) {
    changed++;
    if (CHECK) console.log(`veraltet: blocks/${file}`);
    else {
      writeFileSync(target, out);
      console.log(`geschrieben: blocks/${file}`);
    }
  }
}
if (CHECK && changed) process.exit(1);
if (!changed) console.log("alle Blöcke aktuell");
