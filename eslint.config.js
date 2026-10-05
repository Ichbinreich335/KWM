import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/',
      'studio/',
      '.astro/',
      'public/',
      'archiv/',
      'konzept/',
      'keramik/',
      '.shots/',
      'tests/__screens__/',
      'test-results/',
      'playwright-report/',
      '.wrangler/',
      '.agents/',
      '.claude/',
      '.superpowers/',
      '.impeccable/',
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
