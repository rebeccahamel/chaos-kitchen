// @ts-check
import { defineConfig } from 'astro/config';
import { dataChecks } from './src/lib/build-checks.ts';

// The site lives on the custom domain https://chaos-kitchen.com/ (SPEC.md §8), served from the
// root, so no `base` is set. Internal links still go through url() in src/lib/site.ts, which
// respects import.meta.env.BASE_URL, so a base path could be reintroduced without touching pages.
export default defineConfig({
  site: 'https://chaos-kitchen.com',
  integrations: [dataChecks()],
});
