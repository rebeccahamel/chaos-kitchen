// Content collections (SPEC.md §2, §7). Astro validates every recipe file
// against this schema at build time and fails the build on the first problem.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { loadLists } from './lib/lists.ts';
import { createRecipeSchema } from './lib/recipe-schema.ts';

const lists = loadLists();

const recipes = defineCollection({
  // every .yaml file directly in src/content/recipes/, except files starting with "_"
  loader: glob({ pattern: '[^_]*.yaml', base: './src/content/recipes' }),
  schema: createRecipeSchema(lists),
});

export const collections = { recipes };
