import { ANFRAGE_PFAD } from '../src/lib/anfrage';
import { handleAnfrage } from './anfrage';
import { fehler, MELDUNGEN } from './antwort';

// Worker-Code läuft nur für /api/* (assets.run_worker_first in wrangler.jsonc); alles andere liefern die Assets.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === ANFRAGE_PFAD) return handleAnfrage(request, env);
    if (pathname.startsWith('/api/')) return fehler(404, MELDUNGEN.unbekannt);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
