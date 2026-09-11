import type { TagCategory } from './types.ts';

/** Label for a tag id, or the id itself when unknown (cannot happen after validation). */
export function tagLabel(categories: TagCategory[], id: string): string {
  for (const category of categories) {
    const tag = category.tags.find((t) => t.id === id);
    if (tag) return tag.label;
  }
  return id;
}
