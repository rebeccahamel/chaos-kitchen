// Helpers for the unit tests. The tests run on their own copies of a few recipes and of the
// central lists in src/lib/fixtures/, so the household's recipes, people and tags can change or
// be deleted without breaking them (SETUP.md). Only the template is checked against the real lists.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { loadLists } from './lists.ts';
import { createRecipeSchema, type Recipe } from './recipe-schema.ts';

export const lists = loadLists(fileURLToPath(new URL('./fixtures/data/', import.meta.url)));

const recipesDir = new URL('./fixtures/recipes/', import.meta.url);

/** Raw YAML content of a fixture recipe file, before validation. */
export function readRecipeFile(fileName: string): unknown {
  return yaml.load(readFileSync(new URL(fileName, recipesDir), 'utf8'));
}

/** A fixture recipe parsed and validated with the real schema. Throws when invalid. */
export function loadRecipe(fileName: string, warnings: string[] = []): Recipe {
  const schema = createRecipeSchema(lists, (message) => warnings.push(message));
  return schema.parse(readRecipeFile(fileName));
}

/** The real template src/content/recipes/_vorlage.yaml, validated against the real lists in src/data/. */
export function loadRealTemplate(warnings: string[] = []): Recipe {
  const file = new URL('../content/recipes/_vorlage.yaml', import.meta.url);
  const schema = createRecipeSchema(loadLists(), (message) => warnings.push(message));
  return schema.parse(yaml.load(readFileSync(file, 'utf8')));
}
