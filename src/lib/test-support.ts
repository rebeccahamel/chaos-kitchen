// Helpers for the unit tests: load the real lists and recipe files from the project.

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { loadLists } from './lists.ts';
import { createRecipeSchema, type Recipe } from './recipe-schema.ts';

export const lists = loadLists();

const recipesDir = new URL('../content/recipes/', import.meta.url);

/** Raw YAML content of a recipe file, before validation. */
export function readRecipeFile(fileName: string): unknown {
  return yaml.load(readFileSync(new URL(fileName, recipesDir), 'utf8'));
}

/** A recipe file parsed and validated with the real schema. Throws when invalid. */
export function loadRecipe(fileName: string, warnings: string[] = []): Recipe {
  const schema = createRecipeSchema(lists, (message) => warnings.push(message));
  return schema.parse(readRecipeFile(fileName));
}
