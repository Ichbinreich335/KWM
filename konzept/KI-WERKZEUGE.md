# KI-Werkzeuge für Folge-Sessions (MCP-Server und Skills)

Ziel: Jede Session arbeitet mit der aktuellen Doku statt mit dem Trainingswissen.

## MCP-Server (in `.mcp.json` im Repo-Root eingetragen)

| Server | URL | Zweck | Anmeldung |
|---|---|---|---|
| Astro Docs | `https://mcp.docs.astro.build/mcp` | Offizielle, aktuelle Astro-Doku | keine |
| Cloudflare Docs | `https://docs.mcp.cloudflare.com/mcp` | Cloudflare-Doku | OAuth |
| Cloudflare Bindings | `https://bindings.mcp.cloudflare.com/mcp` | Workers, KV, R2, D1 im eigenen Konto | OAuth (Cloudflare-Konto) |
| Cloudflare Builds | `https://builds.mcp.cloudflare.com/mcp` | Workers Builds: Status, Logs | OAuth |
| Sanity | `https://mcp.sanity.io` | Inhalte, Schema, Releases, Bilder im Sanity-Projekt (40+ Tools) | OAuth oder Token. Alternative: `npx sanity@latest mcp configure` |

## Baserow MCP (bewusst nicht in `.mcp.json`)

Baserow hat einen offiziellen, eingebauten MCP-Server **pro Workspace**. Einrichtung: in Baserow unter **Meine Einstellungen → MCP Server → Endpoint erstellen**, Workspace wählen, „Claude“ wählen. Die erzeugte URL ist **wie ein Passwort**, sie gewährt vollen Schreibzugriff. Deshalb kommt sie **nicht ins Repo**, sondern lokal per `claude mcp add --transport http baserow <URL>` (Scope user/local).
Verfügbare Tools: Datenbanken und Tabellen auflisten, Schema lesen, Zeilen lesen, anlegen, ändern, löschen. Doku: <https://baserow.io/user-docs/mcp-server>, <https://baserow.io/user-docs/claude-mcp>

## Installierte Skills (`.agents/skills`, für Claude Code verlinkt nach `.claude/skills`)

- **Cloudflare** (`cloudflare/skills`): `cloudflare`, `wrangler`, `workers-best-practices`, `web-perf`, `turnstile-spin` (Bot-Schutz für das Anfrageformular). Wer will, kann zusätzlich das komplette Plugin installieren: `/plugin marketplace add cloudflare/skills`.
- **Sanity** (`sanity-io/agent-toolkit`): `sanity-best-practices` (inkl. Astro, Webhooks, Visual Editing), `content-modeling-best-practices`, `portable-text-serialization` (Ausgabe von Rich Text in Astro), `seo-aeo-best-practices`.
- **Matt Pocock** (`mattpocock/skills`): u. a. `grilling`, `prototype`, `research`, `tdd`, `code-review`.
- Astro hat (Stand der Recherche) kein eigenes Skill-Paket, nur den Docs-MCP und die Seite <https://docs.astro.build/en/guides/build-with-ai/>.

Aktualisieren: `npx skills update -p`.
