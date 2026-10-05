import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// Worker-Tests laufen in der Workers-Laufzeit (workerd). Versand, Rate Limit und Turnstile werden pro Test ersetzt.
export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
  test: { include: ['worker/**/*.test.ts'] },
});
