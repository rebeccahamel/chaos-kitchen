// Search normalisation (SPEC.md §6.1): case-insensitive, umlauts and their
// transliterations match each other. Used at build time for the card data and in the browser.

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();
}

/** true when every word of the query occurs in the (already normalised) haystack. */
export function matchesSearch(normalizedHaystack: string, query: string): boolean {
  const words = normalizeForSearch(query).split(' ').filter(Boolean);
  return words.every((word) => normalizedHaystack.includes(word));
}
