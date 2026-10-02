# KWM – Arbeitsregeln für Agenten

Website und Lager-App der Keramischen Werkstatt Margaretenhöhe. Aktuelle Entscheidungen stehen in `konzept/UEBERGABE.md`, Abschnitt 0. Er hat Vorrang vor allem anderen.

## Grundregel: erst Doku, dann Code
- Vor jeder Änderung an Astro, Cloudflare, Sanity oder Softr zuerst den passenden **MCP-Server** oder **Skill** befragen. Nicht aus dem Gedächtnis arbeiten, denn die APIs ändern sich schnell.
  - Astro: MCP `astro-docs`
  - Cloudflare: MCP `cloudflare-docs` sowie die Skills `wrangler`, `workers-best-practices`, `cloudflare`
  - Sanity: MCP `sanity` sowie die Skills `sanity-best-practices`, `content-modeling-best-practices`, `portable-text-serialization`
  - Softr: MCP `softr`
  - Baserow (nur Reserve): MCP pro Workspace, URL ist geheim und gehört nicht ins Repo, siehe `konzept/KI-WERKZEUGE.md`
- Ist ein MCP nicht erreichbar (z. B. Netzwerksperre in Cloud-Sessions), das melden und die offizielle Doku-Seite nennen. Nicht raten.

## Arbeitsweise
- Klein und überprüfbar: ein Thema pro Branch oder PR, mit Vorschau-Deploy auf Cloudflare, bevor etwas live geht.
- Website bleibt **statisch** (Astro, kein SSR). Inhalte kommen aus Sanity, der Neubau läuft über den Cloudflare Deploy Hook.
- Kein Eigenbau für das Lager, solange Softr oder Baserow die Anforderungen erfüllen.
- Geheimnisse (Tokens, Deploy-Hook-URLs, MCP-URLs mit Schlüssel) kommen nie ins Repo, sondern in Umgebungsvariablen oder Secrets.
- Interne Preise und Lagerorte dürfen nie im Website-Build landen. Dort nur freigegebene Felder abfragen.
- Offene Designfragen mit dem Skill `grilling` klären. Für UI-Ideen den Skill `prototype` nutzen.
- Sprache für Nutzertexte und Commits: Deutsch.

## Codequalität (Ziel: produktionsreif, nicht „vibe-coded“)
- Astro + TypeScript (strict). Klare Struktur: `layouts/`, `components/`, `pages/`, Inhalte aus Sanity.
- Keine toten Dateien, keine auskommentierten Blöcke, keine Debug-Reste, keine Magic Numbers im Markup. CSS über bestehende Variablen.
- Vor jedem Merge muss `npm run check` grün sein: Format, Lint, `astro check` und Build. CI prüft dasselbe.
- Kleine, beschreibend benannte Commits. README aktuell halten (Start, Deploy, wo liegt was).
- Vor dem Merge den Skill `code-review` ausführen. Bei Server-Code (Formular-Worker) zusätzlich `security-review`.
- Architektur, Umbauten und Reviews mit dem stärksten verfügbaren Modell. Einfache Recherche darf delegiert werden.
