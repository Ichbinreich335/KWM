#!/usr/bin/env bash
# Prüft die einheitlichen Bausteine (Regeln in einheitlich.mjs). Läuft auch automatisch in build.mjs.
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'import("./pruefung/einheitlich.mjs").then(({ pruefeEinheitlich }) => { const f = pruefeEinheitlich(process.cwd()); if (f.length) { console.error(f.join("\n")); process.exit(1); } console.log("Bausteine einheitlich: Seiten nutzen nur ui.tsx"); })'
