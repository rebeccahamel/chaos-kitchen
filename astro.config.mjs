// @ts-check
import { defineConfig } from 'astro/config';
import { dataChecks } from './src/lib/build-checks.ts';

// Project site on GitHub Pages (SPEC.md §8): https://rebeccahamel.github.io/chaos-kitchen/
// `base` is the repository name. Every internal link must be built with import.meta.env.BASE_URL.
export default defineConfig({
  site: 'https://rebeccahamel.github.io',
  base: '/chaos-kitchen',
  integrations: [dataChecks()],
});
