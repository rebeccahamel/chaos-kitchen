// Consolidated shopping list for several recipes (MEAL_PLANNER.md §14, SPEC.md §6.9).
// Pure functions, also used in the browser: the homepage merges the ticked recipes on the fly,
// the hidden week pages carry the same list as JSON-LD for Bring!.

import type { Amount, Ingredient, UnitDef } from './types.ts';
import { findUnit } from './units.ts';
import { normalizeForSearch } from './search.ts';
import { ingredientLine } from './structured-data.ts';

/** Ingredients of one recipe, already flattened (see flattenIngredients in recipe.ts). */
export type IngredientList = Ingredient[];

/** "zwiebel|" for counted items, "knoblauch|Zehe" with the unit's singular; singular and plural merge. */
function mergeKey(ingredient: Ingredient, units: UnitDef[]): string {
  const unit = ingredient.unit ? (findUnit(units, ingredient.unit)?.unit ?? ingredient.unit) : '';
  return `${normalizeForSearch(ingredient.name)}|${unit}`;
}

function asRange(amount: Amount): [number, number] {
  return Array.isArray(amount) ? amount : [amount, amount];
}

/** Adds two amounts; a range plus a number widens the range: [1, 2] + 1 = [2, 3]. */
export function addAmounts(a: Amount | undefined, b: Amount | undefined): Amount | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  const [aMin, aMax] = asRange(a);
  const [bMin, bMax] = asRange(b);
  const min = Number((aMin + bMin).toFixed(4));
  const max = Number((aMax + bMax).toFixed(4));
  return min === max ? min : [min, max];
}

/**
 * Merges the ingredients of several recipes into one list, at each recipe's base yield.
 * Same name (case and umlauts ignored) and same unit add up; notes are dropped because they
 * belong to one recipe; an item is optional only when it is optional everywhere; the order is
 * the order of first appearance. Ids are made from the merge key and unique in the result.
 */
export function consolidateIngredients(lists: IngredientList[], units: UnitDef[]): Ingredient[] {
  const merged = new Map<string, Ingredient>();
  for (const list of lists) {
    for (const ingredient of list) {
      const key = mergeKey(ingredient, units);
      const existing = merged.get(key);
      if (!existing) {
        const { note: _note, ...rest } = ingredient;
        merged.set(key, { ...rest, id: key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'zutat' });
        continue;
      }
      merged.set(key, {
        ...existing,
        amount: addAmounts(existing.amount, ingredient.amount),
        plural: existing.plural ?? ingredient.plural,
        optional: existing.optional === true && ingredient.optional === true ? true : undefined,
        whole: existing.whole || ingredient.whole ? true : undefined,
      });
    }
  }
  return [...merged.values()];
}

/**
 * Names that appear with different units across the recipes and therefore stay separate lines
 * ("Minze" once without unit, once in Bund). Each entry: name plus the units, for a build warning.
 */
export function unmergedNames(lists: IngredientList[], units: UnitDef[]): { name: string; units: string[] }[] {
  const byName = new Map<string, { name: string; units: Set<string> }>();
  for (const list of lists) {
    for (const ingredient of list) {
      const [name, unit] = mergeKey(ingredient, units).split('|');
      const entry = byName.get(name) ?? { name: ingredient.name, units: new Set<string>() };
      entry.units.add(unit === '' ? 'ohne Einheit' : unit);
      byName.set(name, entry);
    }
  }
  return [...byName.values()].filter((entry) => entry.units.size > 1).map((entry) => ({ name: entry.name, units: [...entry.units] }));
}

/** The merged list as plain schema.org lines ("300 g Basmatireis"), the format Bring! reads. */
export function shoppingLines(lists: IngredientList[], units: UnitDef[]): string[] {
  return consolidateIngredients(lists, units).map((ingredient) => ingredientLine(ingredient, units));
}

/**
 * A selection of the plan's recipes as a string of 0 and 1 in plan order, e.g. "1011":
 * the first, third and fourth recipe are ticked. This is the address of the hidden week page.
 */
export function selectionMask(selected: boolean[]): string {
  return selected.map((on) => (on ? '1' : '0')).join('');
}

/** Every non-empty selection of n recipes, "0…01" to "1…1": the hidden pages the build creates. */
export function allSelectionMasks(count: number): string[] {
  const masks: string[] = [];
  for (let bits = 1; bits < 2 ** count; bits += 1) masks.push(bits.toString(2).padStart(count, '0'));
  return masks;
}

/** The recipes a mask ticks, in plan order. Undefined when the mask does not fit the plan. */
export function selectedByMask<T>(mask: string, recipes: T[]): T[] | undefined {
  if (mask.length !== recipes.length || !/^[01]+$/.test(mask) || !mask.includes('1')) return undefined;
  return recipes.filter((_, index) => mask[index] === '1');
}

export interface WeekListInfo {
  /** "Wochenplan 28. September – 2. Oktober" */
  name: string;
  description: string;
  /** absolute URL of the hidden page itself */
  url: string;
  /** absolute URL of a picture, when the week has one */
  image?: string;
}

/**
 * schema.org Recipe data for a hidden week page: one "recipe" whose ingredients are the merged
 * list of the selected recipes. Bring! imports it as one shopping list (SPEC.md §6.8).
 */
export function weekListJsonLd(info: WeekListInfo, lists: IngredientList[], units: UnitDef[]): Record<string, unknown> {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: info.name,
    description: info.description,
    url: info.url,
  };
  if (info.image) data.image = info.image;
  data.recipeIngredient = shoppingLines(lists, units);
  return data;
}
