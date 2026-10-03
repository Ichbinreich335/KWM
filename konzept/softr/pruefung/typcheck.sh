#!/usr/bin/env bash
# Prüft die erzeugten Softr-Blöcke mit TypeScript (strict, ohne ungenutzte Variablen).
# Softr-eigene Module (@/lib/…, @/components/…) werden als Platzhalter eingesetzt.
# Aufruf aus dem Repo-Root: bash konzept/softr/pruefung/typcheck.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WORK="${TMPDIR:-/tmp}/kwm-softr-typcheck"
mkdir -p "$WORK/blocks" "$WORK/stubs"
cd "$WORK"
[ -d node_modules/typescript ] || npm i -s typescript@5 @types/react@18 >/dev/null
rm -f blocks/*.tsx
for f in "$ROOT"/konzept/softr/blocks/*.tsx; do
  grep -q "Generiert von konzept/softr/build.mjs" "$f" && cp "$f" blocks/
done
python3 - <<'EOF'
import re, glob, collections
mods = collections.defaultdict(set)
for f in glob.glob("blocks/*.tsx"):
    for spec, mod in re.findall(r'^import \{([^}]*)\} from "([^"]+)";', open(f).read(), re.M):
        if mod != "react":
            mods[mod].update(n.strip() for n in spec.split(",") if n.strip())
open("stubs/softr.d.ts", "w").write("\n".join(
    f'declare module "{m}" {{ ' + " ".join(f"export const {n}: any;" for n in sorted(ns)) + " }" for m, ns in mods.items()) + "\n")
EOF
cat > tsconfig.json <<'EOF'
{ "compilerOptions": { "strict": true, "noImplicitAny": false, "jsx": "react-jsx", "target": "es2022", "module": "esnext", "moduleResolution": "bundler", "noEmit": true, "skipLibCheck": true, "noUnusedLocals": true, "noUnusedParameters": true, "lib": ["es2023", "dom", "dom.iterable"], "types": ["react"] },
  "include": ["stubs/*.d.ts", "blocks/*.tsx"] }
EOF
npx tsc -p . && echo "Typprüfung ohne Fehler: $(ls blocks | tr '\n' ' ')"
