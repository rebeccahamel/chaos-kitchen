// Site-wide constants and URL helpers. Every internal link goes through url() so the
// base path (/chaos-kitchen/) is always respected (SPEC.md §8).

export const SITE_NAME = 'CHAOS KITCHEN';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** url('rezept/x/') → '/chaos-kitchen/rezept/x/', url() → '/chaos-kitchen/' */
export function url(path = ''): string {
  return `${base}/${path.replace(/^\//, '')}`;
}

export function recipeUrl(slug: string): string {
  return url(`rezept/${slug}/`);
}
