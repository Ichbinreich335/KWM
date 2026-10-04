#!/usr/bin/env bash
# Prüft, dass alle Blöcke die gemeinsamen Bausteine nutzen: eine Rahmenfarbe (LINE), eine Box (PANEL_CLASS).
# Treffer bedeuten: Rahmen oder Box wurde von Hand gebaut und weicht dann optisch ab.
# Ausgenommen: Fehlermeldungen (rot), Status-Badges (Statusfarbe) und der Chip-Grundbaustein (Farbe je Zustand).
set -euo pipefail
cd "$(dirname "$0")/../src"
treffer=$(grep -rn -E 'border-input|border-border|rounded-lg border bg-card|"[^"]*rounded-(md|lg) border[ "][^"]*"' blocks shared --include=*.tsx | grep -v -E 'const PANEL_CLASS|const CHIP_BASE|STATUS_BADGE|border-destructive' || true)
if [ -n "$treffer" ]; then
  echo "Rahmen ohne gemeinsamen Baustein (LINE / PANEL_CLASS):"
  echo "$treffer"
  exit 1
fi
echo "Rahmen einheitlich: alle über LINE bzw. PANEL_CLASS"
