// Site-wide constants and URL helpers. Every internal link goes through url() so the base
// path from astro.config.mjs is always respected (SPEC.md §8). Currently there is none: the
// site is served from the root of chaos-kitchen.com.

export const SITE_NAME = 'CHAOS KITCHEN';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** url('rezept/x/') → '/rezept/x/', url() → '/'; with a base path both get it as prefix */
export function url(path = ''): string {
  return `${base}/${path.replace(/^\//, '')}`;
}

export function recipeUrl(slug: string): string {
  return url(`rezept/${slug}/`);
}
